from sqlmodel import SQLModel, create_engine, Session
from fastapi import Depends
from sqlalchemy.orm import configure_mappers


DATABASE_URL = "sqlite:///evazo.db"
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    configure_mappers()
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
        print("Session closed")