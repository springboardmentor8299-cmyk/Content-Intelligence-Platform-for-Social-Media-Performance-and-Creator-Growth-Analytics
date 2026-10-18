from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="jaswanth@99",
    host="localhost",
    port=5432,
    database="creatoriqp"
)


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()