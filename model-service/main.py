
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import pandas as pd
from catboost import CatBoostClassifier
import meinilam_predict
import json
import os

app = FastAPI()

MODEL_PATH = "meinilam_catboost.cbm"
model = CatBoostClassifier()
model.load_model(MODEL_PATH)

class PredictRequest(BaseModel):
    record: Dict[str, Any]

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        result = meinilam_predict.explain_case(model, request.record)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
