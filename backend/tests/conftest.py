import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.models.user import User
from app.services.security import get_password_hash, create_access_token

# In-memory SQLite for isolated, fast unit and integration tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def candidate_user(db_session) -> User:
    user = User(
        email="test_candidate@livelihood.ai",
        hashed_password=get_password_hash("CandidatePass123!"),
        full_name="Test Candidate",
        role="candidate",
        phone=None,
        preferred_language="ta",
        location="Madurai, Tamil Nadu",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session) -> User:
    user = User(
        email="test_admin@livelihood.ai",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Test Admin Officer",
        role="admin",
        phone=None,
        preferred_language="en",
        location="Chennai, Tamil Nadu",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def candidate_token(candidate_user) -> str:
    return create_access_token(subject=candidate_user.id, role=candidate_user.role)


@pytest.fixture
def admin_token(admin_user) -> str:
    return create_access_token(subject=admin_user.id, role=admin_user.role)
