from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health_includes_security_headers():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


def test_solve_rejects_empty_question():
    response = client.post("/solve", json={"question": "   "})

    assert response.status_code == 422
    assert "Question is required" in response.text


def test_metrics_shape():
    response = client.get("/metrics")

    assert response.status_code == 200
    body = response.json()
    assert "total_runs" in body
    assert "success_rate" in body
    assert isinstance(body["recent_runs"], list)


def test_training_run_creates_job():
    run_response = client.post("/training/run", json={"samples": 32})
    jobs_response = client.get("/training/jobs")

    assert run_response.status_code == 200
    assert run_response.json()["status"] == "completed"
    assert jobs_response.status_code == 200
    assert len(jobs_response.json()["jobs"]) >= 1
