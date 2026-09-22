def test_get_tags(client):
    u = client.post("/api/users", json={
        "user": {"username": "taguser", "email": "tag@example.com", "password": "pass"}
    }).json()
    token = u["user"]["token"]

    client.post("/api/articles", json={
        "article": {"title": "Tagged post", "description": "d", "body": "b", "tagList": ["react", "fastapi"]}
    }, headers={"Authorization": f"Token {token}"})

    res = client.get("/api/tags")
    assert res.status_code == 200
    tags = res.json()["tags"]
    assert "react" in tags
    assert "fastapi" in tags
