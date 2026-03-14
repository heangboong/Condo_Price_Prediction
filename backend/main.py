from fastapi import FastAPI, HTTPException,Depends
from schema import PredictionInput
import joblib 
from contextlib import asynccontextmanager
from src.inference import predict
from src.preprocessing import get_input_dataframe
from sqlalchemy.orm import Session
from database import get_db, engine
import database_model
from fastapi.middleware.cors import CORSMiddleware
from routers import properties

ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    database_model.Base.metadata.create_all(bind=engine)        #create tables
    ml_models['condo'] = joblib.load("models/condo_model.pkl")
    print("Model Loaded, table ready!")
    yield
    ml_models.clear()
    print("Model unloaded")

app = FastAPI(
    title="Condo Price Prediction API",
    description="API for predicting condo prices based on various features.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://condopricepredictionbackend.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(                                   # ← new phase 5
    properties.router,
    prefix="/api/v1",
    tags=["Properties"]
)

@app.get("/")
def root():
    return {"message": "API is running!"}

@app.get("/health")
def health():
    if "condo" in ml_models:
        return {"status": "ok", "model_loaded": "condo" in ml_models}
    else:
        raise HTTPException(
            status_code = 503, 
            detail = "Model not loaded, Check the log server."
        )

@app.post("/predict")
def predict_price(data: PredictionInput, db: Session = Depends(get_db)):
    if "condo" not in ml_models:
        raise HTTPException(
            status_code = 503, 
            detail = "Model not loaded, Check the log server."
        )
    df = get_input_dataframe(
        data.area,
        data.bedroom, 
        data.khan, 
        data.sangkat
    )

    price = predict(df, ml_models['condo'])
    log  = database_model.PredictionLog(
        area = data.area,
        bedroom = data.bedroom,
        khan = data.khan,
        sangkat = data.sangkat,
        estimated_price = price
    )
    db.add(log)
    db.commit()

    return {
        "estimated_price": price, 
        "currency": "USD"
    }

@app.get("/predictions")
def get_history(db: Session = Depends(get_db)):
    rows = db.query(database_model.PredictionLog)\
             .order_by(database_model.PredictionLog.created_at.desc())\
             .limit(20).all()
    return rows