def test_create_and_get_article(client):
    u = client.post("/api/users", json={
        "user": {"username": "author1", "email": "author1@example.com", "password": "password123"}
    }).json()
    token = u["user"]["token"]

    res = client.post("/api/articles", json={
        "article": {
            "title": "How to train your dragon",
            "description": "Ever wonder how?",
            "body": "Very carefully.",
            "tagList": ["dragons", "training"]
        }
    }, headers={"Authorization": f"Token {token}"})

    assert res.status_code == 201
    article = res.json()["article"]
    assert article["title"] == "How to train your dragon"
    assert "dragons" in article["tagList"]
    slug = article["slug"]

    # Get article by slug
    get_res = client.get(f"/api/articles/{slug}")
    assert get_res.status_code == 200
    assert get_res.json()["article"]["slug"] == slug

def test_list_articles(client):
    u = client.post("/api/users", json={
        "user": {"username": "author2", "email": "author2@example.com", "password": "password123"}
    }).json()
    token = u["user"]["token"]

    client.post("/api/articles", json={
        "article": {"title": "Article 1", "description": "d1", "body": "b1", "tagList": ["python"]}
    }, headers={"Authorization": f"Token {token}"})

    res = client.get("/api/articles?tag=python")
    assert res.status_code == 200
    data = res.json()
    assert data["articlesCount"] == 1
    assert data["articles"][0]["title"] == "Article 1"

def test_delete_article_forbidden_if_not_author(client):
    # Author 1 creates article
    u1 = client.post("/api/users", json={
        "user": {"username": "author1", "email": "a1@example.com", "password": "pass"}
    }).json()
    token1 = u1["user"]["token"]

    art = client.post("/api/articles", json={
        "article": {"title": "Secret article", "description": "d", "body": "b"}
    }, headers={"Authorization": f"Token {token1}"}).json()["article"]

    # Author 2 tries to delete
    u2 = client.post("/api/users", json={
        "user": {"username": "author2", "email": "a2@example.com", "password": "pass"}
    }).json()
    token2 = u2["user"]["token"]

    res = client.delete(f"/api/articles/{art['slug']}", headers={"Authorization": f"Token {token2}"})
    assert res.status_code == 403
