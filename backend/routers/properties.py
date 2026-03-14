from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schema import PropertyCreate, PropertyResponse
import database_model

router = APIRouter()


@router.get("/properties", response_model=list[PropertyResponse])
def list_properties(db: Session = Depends(get_db)):
    return db.query(database_model.Property).all()


@router.get("/properties/{id}", response_model=PropertyResponse)
def get_property(id: int, db: Session = Depends(get_db)):
    prop = db.query(database_model.Property)\
             .filter(database_model.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.post("/properties", response_model=PropertyResponse, status_code=201)
def create_property(data: PropertyCreate, db: Session = Depends(get_db)):
    prop = database_model.Property(**data.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.put("/properties/{id}", response_model=PropertyResponse)
def update_property(id: int, data: PropertyCreate, db: Session = Depends(get_db)):
    prop = db.query(database_model.Property)\
             .filter(database_model.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    for field, value in data.model_dump().items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/properties/{id}", status_code=204)
def delete_property(id: int, db: Session = Depends(get_db)):
    prop = db.query(database_model.Property)\
             .filter(database_model.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()
