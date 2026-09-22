def test_get_profile(client):
    client.post("/api/users", json={
        "user": {"username": "jane", "email": "jane@example.com", "password": "password123"}
    })
    res = client.get("/api/profiles/jane")
    assert res.status_code == 200
    assert res.json()["profile"]["username"] == "jane"
    assert res.json()["profile"]["following"] is False

def test_follow_and_unfollow_user(client):
    # Register user 1
    u1 = client.post("/api/users", json={
        "user": {"username": "user1", "email": "u1@example.com", "password": "password123"}
    }).json()
    token1 = u1["user"]["token"]

    # Register user 2
    client.post("/api/users", json={
        "user": {"username": "user2", "email": "u2@example.com", "password": "password123"}
    })

    # User 1 follows User 2
    res = client.post("/api/profiles/user2/follow", headers={"Authorization": f"Token {token1}"})
    assert res.status_code == 200
    assert res.json()["profile"]["following"] is True

    # User 1 unfollows User 2
    res_unfollow = client.delete("/api/profiles/user2/follow", headers={"Authorization": f"Token {token1}"})
    assert res_unfollow.status_code == 200
    assert res_unfollow.json()["profile"]["following"] is False

def test_get_nonexistent_profile_404(client):
    res = client.get("/api/profiles/nonexistentuser")
    assert res.status_code == 404
    assert "errors" in res.json()
