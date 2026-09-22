def test_comment_and_favorite_flow(client):
    # Register user 1 (Author)
    u1 = client.post("/api/users", json={
        "user": {"username": "writer", "email": "writer@example.com", "password": "pass"}
    }).json()
    token1 = u1["user"]["token"]

    # Create article
    art = client.post("/api/articles", json={
        "article": {"title": "Cool Post", "description": "desc", "body": "content"}
    }, headers={"Authorization": f"Token {token1}"}).json()["article"]
    slug = art["slug"]

    # Register user 2 (Reader)
    u2 = client.post("/api/users", json={
        "user": {"username": "reader", "email": "reader@example.com", "password": "pass"}
    }).json()
    token2 = u2["user"]["token"]

    # Favorite article
    fav_res = client.post(f"/api/articles/{slug}/favorite", headers={"Authorization": f"Token {token2}"})
    assert fav_res.status_code == 200
    assert fav_res.json()["article"]["favorited"] is True
    assert fav_res.json()["article"]["favoritesCount"] == 1

    # Unfavorite article
    unfav_res = client.delete(f"/api/articles/{slug}/favorite", headers={"Authorization": f"Token {token2}"})
    assert unfav_res.status_code == 200
    assert unfav_res.json()["article"]["favorited"] is False

    # Add comment
    c_res = client.post(f"/api/articles/{slug}/comments", json={
        "comment": {"body": "Awesome post!"}
    }, headers={"Authorization": f"Token {token2}"})
    assert c_res.status_code == 201
    comment_id = c_res.json()["comment"]["id"]

    # Get comments
    get_c = client.get(f"/api/articles/{slug}/comments")
    assert get_c.status_code == 200
    assert len(get_c.json()["comments"]) == 1

    # Delete comment
    del_c = client.delete(f"/api/articles/{slug}/comments/{comment_id}", headers={"Authorization": f"Token {token2}"})
    assert del_c.status_code == 204
