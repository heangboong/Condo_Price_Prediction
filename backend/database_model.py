#database_model.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id              = Column(Integer,  primary_key=True, index=True)
    area            = Column(Float)
    bedroom         = Column(Integer)
    khan            = Column(String)
    sangkat         = Column(String)
    estimated_price = Column(Float)
    created_at      = Column(DateTime, default=datetime.utcnow)

class Property(Base):                              # ← add this
    __tablename__ = "properties"

    id              = Column(Integer,  primary_key=True, index=True)
    title           = Column(String)
    area            = Column(Float)
    bedroom         = Column(Integer)
    khan            = Column(String)
    sangkat         = Column(String)
    actual_price    = Column(Float,    nullable=True)
    predicted_price = Column(Float,    nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)