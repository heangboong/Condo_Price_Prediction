from datetime import datetime
from typing import Optional

from pydantic import BaseModel,Field

class PredictionInput(BaseModel):
    area : float = Field(..., gt = 0, description="Area in m2")
    bedroom : int = Field(..., gt = 0, description="Number of bedrooms")
    khan: str
    sangkat: str

class PropertyCreate(BaseModel):
    title:        str
    area:         float   = Field(..., gt=0)
    bedroom:      int     = Field(..., ge=1)
    khan:         str
    sangkat:      str
    actual_price: Optional[float] = None

class PropertyResponse(PropertyCreate):
    id:              int
    predicted_price: Optional[float] = None
    created_at:      datetime
    model_config = {"from_attributes": True}