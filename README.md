# Condo Price Prediction

A demo project showcasing how to integrate a machine learning model into a production-ready API using **FastAPI**.

## Overview

This project serves a condo price prediction model through a REST API. It demonstrates a clean project structure for deploying ML models with FastAPI, including preprocessing, inference, database integration, and routing.

## Project Structure

```
condo_price_prediction/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── schema.py             # Pydantic request/response schemas
│   ├── database.py           # Database connection setup
│   ├── database_model.py     # ORM models
│   ├── requirements.txt      # Python dependencies
│   ├── models/               # Saved ML model files
│   ├── routers/
│   │   └── properties.py     # API routes for property predictions
│   └── src/
│       ├── inference.py      # Model loading and prediction logic
│       └── preprocessing.py  # Feature engineering and data preprocessing
└── frontend/                 # Frontend (UI)
```

## Tech Stack

- **FastAPI** — API framework
- **Pydantic** — Data validation and serialization
- **Scikit-learn / ML model** — Price prediction
- **SQLAlchemy** — Database ORM

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Run the API server:
   ```bash
   uvicorn backend.main:app --reload
   ```

3. Open the interactive docs at `http://localhost:8000/docs`

## Purpose

This is a **demo project** intended to illustrate how to structure and serve an ML model using FastAPI — not intended for production use.
