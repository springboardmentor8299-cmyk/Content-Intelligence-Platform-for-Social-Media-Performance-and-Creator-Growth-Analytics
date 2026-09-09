from fastapi.testclient import TestClient

from app.db import SessionLocal
from app.models import Organization, User
from app.security import create_access_token, hash_password
from main import app


def test_analytics_routes_return_payloads() -> None:
    client = TestClient(app)
    database = SessionLocal()
    organization = Organization(id='org-123', name='Demo workspace')
    user = User(
        id='user-123',
        organization_id='org-123',
        email='demo@example.com',
        display_name='Demo Creator',
        password_hash=hash_password('SecurePassword1!'),
        role='creator',
    )
    database.add_all([organization, user])
    database.commit()
    database.close()

    token = create_access_token('user-123', 'org-123', 'creator')

    overview = client.get('/api/v1/analytics/overview', headers={'Authorization': f'Bearer {token}'})
    assert overview.status_code == 200
    assert 'kpis' in overview.json()
    assert overview.json()['kpis']['reach'] > 0

    content = client.get('/api/v1/analytics/content', headers={'Authorization': f'Bearer {token}'})
    assert content.status_code == 200
    assert len(content.json()['items']) >= 3

    audience = client.get('/api/v1/analytics/audience', headers={'Authorization': f'Bearer {token}'})
    assert audience.status_code == 200
    assert 'demographics' in audience.json()
