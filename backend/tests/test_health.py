def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "LivelihoodAI"
    assert data["version"] == "1.0.0"
    assert "health" in data


def test_api_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "healthy"
    assert body["data"]["database_connected"] is True
    assert body["data"]["version"] == "1.0.0"
    assert "X-Process-Time" in response.headers


def test_ops_health_endpoint(client):
    """The /health ops endpoint checks DB connectivity and returns structured status."""
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["db"] == "ok"
    assert "redis" in body