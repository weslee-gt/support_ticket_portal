from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool, 
)
TestingSession = sessionmaker(bind=engine)
Base.metadata.create_all(engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_create_ticket_returns_201_with_open_status():
    response = client.post(
        "/api/tickets",
        json={
            "title": "Printer jam",
            "description": "Duplex printing jams every time.",
            "requester_name": "Soong",
            "priority": "high",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "Open"
    assert body["title"] == "Printer jam"


def test_create_ticket_rejects_short_title():
    response = client.post(
        "/api/tickets",
        json={
            "title": "x",
            "description": "Duplex printing jams every time.",
            "requester_name": "Soong",
        },
    )

    assert response.status_code == 422


def test_status_cannot_jump_from_resolved_to_in_progress():
    create = client.post(
        "/api/tickets",
        json={
            "title": "VPN dropping",
            "description": "VPN disconnects every ten minutes.",
            "requester_name": "Soong",
        },
    )
    ticket_id = create.json()["id"]

    client.patch(f"/api/tickets/{ticket_id}/status", json={"status": "Resolved"})

    response = client.patch(
        f"/api/tickets/{ticket_id}/status", json={"status": "In Progress"}
    )

    assert response.status_code == 409


def test_getting_an_unknown_ticket_returns_404():
    response = client.get("/api/tickets/99999")

    assert response.status_code == 404


def test_create_ticket_rejects_whitespace_only_title():
    response = client.post(
        "/api/tickets",
        json={
            "title": "     ",
            "description": "Duplex printing jams every time.",
            "requester_name": "Soong",
        },
    )

    assert response.status_code == 422


def test_status_update_rejects_unknown_status():
    create = client.post(
        "/api/tickets",
        json={
            "title": "Laptop slow",
            "description": "Takes five minutes to boot.",
            "requester_name": "Soong",
        },
    )
    ticket_id = create.json()["id"]

    response = client.patch(f"/api/tickets/{ticket_id}/status", json={"status": "Done"})

    assert response.status_code == 422