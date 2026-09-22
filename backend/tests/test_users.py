def test_register_user_success(client):
    res = client.post("/api/users", json={
        "user": {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "password123"
        }
    })
    assert res.status_code == 201
    data = res.json()
    assert "user" in data
    assert data["user"]["username"] == "johndoe"
    assert data["user"]["email"] == "john@example.com"
    assert "token" in data["user"]

def test_register_duplicate_username_conflict(client):
    client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john1@example.com", "password": "pass"}
    })
    res = client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john2@example.com", "password": "pass"}
    })
    assert res.status_code == 409
    assert "errors" in res.json()
    assert "username" in res.json()["errors"]

def test_login_success(client):
    client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john@example.com", "password": "password123"}
    })
    res = client.post("/api/users/login", json={
        "user": {"email": "john@example.com", "password": "password123"}
    })
    assert res.status_code == 200
    assert "token" in res.json()["user"]

def test_login_invalid_password(client):
    client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john@example.com", "password": "password123"}
    })
    res = client.post("/api/users/login", json={
        "user": {"email": "john@example.com", "password": "wrongpassword"}
    })
    assert res.status_code == 401
    assert "errors" in res.json()

def test_get_current_user(client):
    reg = client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john@example.com", "password": "password123"}
    }).json()
    token = reg["user"]["token"]

    res = client.get("/api/user", headers={"Authorization": f"Token {token}"})
    assert res.status_code == 200
    assert res.json()["user"]["username"] == "johndoe"

def test_update_current_user(client):
    reg = client.post("/api/users", json={
        "user": {"username": "johndoe", "email": "john@example.com", "password": "password123"}
    }).json()
    token = reg["user"]["token"]

    res = client.put("/api/user", json={
        "user": {"bio": "I like code", "image": "http://example.com/avatar.jpg"}
    }, headers={"Authorization": f"Token {token}"})
    assert res.status_code == 200
    assert res.json()["user"]["bio"] == "I like code"
    assert res.json()["user"]["image"] == "http://example.com/avatar.jpg"
