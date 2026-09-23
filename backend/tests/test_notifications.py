import pytest
from fastapi.testclient import TestClient
from app.models.notification import Notification

def get_auth_header(client: TestClient, email: str = "user1@example.com", username: str = "user1"):
    res = client.post("/api/users", json={
        "user": {"username": username, "email": email, "password": "password123"}
    })
    if res.status_code != 201:
        res = client.post("/api/users/login", json={
            "user": {"email": email, "password": "password123"}
        })
    token = res.json()["user"]["token"]
    return {"Authorization": f"Token {token}"}, token

def test_follow_triggers_notification(client: TestClient):
    headers1, token1 = get_auth_header(client, "alice@example.com", "alice")
    headers2, token2 = get_auth_header(client, "bob@example.com", "bob")

    # Bob follows Alice
    res = client.post("/api/profiles/alice/follow", headers=headers2)
    assert res.status_code == 200

    # Alice checks notifications
    res_notif = client.get("/api/notifications", headers=headers1)
    assert res_notif.status_code == 200
    data = res_notif.json()
    assert data["unread_count"] == 1
    assert len(data["notifications"]) == 1
    assert data["notifications"][0]["type"] == "follow"
    assert data["notifications"][0]["actor"]["username"] == "bob"

def test_comment_triggers_notification_and_suppresses_self_action(client: TestClient):
    headers_author, _ = get_auth_header(client, "author@example.com", "author")
    headers_commenter, _ = get_auth_header(client, "commenter@example.com", "commenter")

    # Author creates article
    art_res = client.post("/api/articles", json={
        "article": {
            "title": "Test Article",
            "description": "Desc",
            "body": "Body text"
        }
    }, headers=headers_author)
    assert art_res.status_code == 201
    slug = art_res.json()["article"]["slug"]

    # Commenter comments on author's article
    com_res = client.post(f"/api/articles/{slug}/comments", json={
        "comment": {"body": "Great article!"}
    }, headers=headers_commenter)
    assert com_res.status_code == 201

    # Author checks notifications
    notif_res = client.get("/api/notifications", headers=headers_author)
    assert notif_res.status_code == 200
    data = notif_res.json()
    assert data["unread_count"] == 1
    assert data["notifications"][0]["type"] == "comment"
    assert data["notifications"][0]["article"]["slug"] == slug

    # Author comments on own article -> should NOT create notification
    client.post(f"/api/articles/{slug}/comments", json={
        "comment": {"body": "My own reply"}
    }, headers=headers_author)

    notif_res2 = client.get("/api/notifications", headers=headers_author)
    assert notif_res2.json()["unread_count"] == 1  # Unchanged count

def test_favorite_triggers_notification(client: TestClient):
    headers_author, _ = get_auth_header(client, "author2@example.com", "author2")
    headers_fan, _ = get_auth_header(client, "fan@example.com", "fan")

    art_res = client.post("/api/articles", json={
        "article": {
            "title": "Fan Favorite",
            "description": "Desc",
            "body": "Body text"
        }
    }, headers=headers_author)
    slug = art_res.json()["article"]["slug"]

    # Fan favorites author's article
    fav_res = client.post(f"/api/articles/{slug}/favorite", headers=headers_fan)
    assert fav_res.status_code == 200

    notif_res = client.get("/api/notifications", headers=headers_author)
    data = notif_res.json()
    assert data["unread_count"] == 1
    assert data["notifications"][0]["type"] == "favorite"
    assert data["notifications"][0]["actor"]["username"] == "fan"

def test_mark_as_read_and_mark_all_read(client: TestClient):
    headers_recipient, _ = get_auth_header(client, "recip@example.com", "recip")
    headers_actor, _ = get_auth_header(client, "act@example.com", "act")

    # Generate 2 notifications via follow & favorite
    client.post("/api/profiles/recip/follow", headers=headers_actor)
    
    art_res = client.post("/api/articles", json={
        "article": {"title": "Recip Article", "description": "d", "body": "b"}
    }, headers=headers_recipient)
    slug = art_res.json()["article"]["slug"]
    client.post(f"/api/articles/{slug}/favorite", headers=headers_actor)

    notif_res = client.get("/api/notifications", headers=headers_recipient)
    data = notif_res.json()
    assert data["unread_count"] == 2
    first_id = data["notifications"][0]["id"]

    # Mark single notification as read
    read_res = client.post(f"/api/notifications/{first_id}/read", headers=headers_recipient)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    notif_res2 = client.get("/api/notifications", headers=headers_recipient)
    assert notif_res2.json()["unread_count"] == 1

    # Mark all as read
    all_res = client.post("/api/notifications/read-all", headers=headers_recipient)
    assert all_res.status_code == 200

    notif_res3 = client.get("/api/notifications", headers=headers_recipient)
    assert notif_res3.json()["unread_count"] == 0

def test_websocket_notifications(client: TestClient):
    headers_user, token_user = get_auth_header(client, "wsuser@example.com", "wsuser")
    headers_follower, _ = get_auth_header(client, "wsfollower@example.com", "wsfollower")

    # Connect to websocket endpoint with token query param
    with client.websocket_connect(f"/ws/notifications?token={token_user}") as websocket:
        # Trigger follow event in parallel/sync
        client.post("/api/profiles/wsuser/follow", headers=headers_follower)

        # Receive real-time push message
        data = websocket.receive_json()
        assert data["type"] == "follow"
        assert data["actor"]["username"] == "wsfollower"
        assert data["is_read"] is False
