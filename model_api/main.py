from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import pandas as pd


app = FastAPI()

data = joblib.load("Food_Delivery_model.joblib")

class InputData(BaseModel):
    Order_ID               : int
    Distance_km            : float
    Weather                : int
    Traffic_Level          : int
    Time_of_Day            : int
    Vehicle_Type           : int
    Preparation_Time_min   : float
    Courier_Experience_yrs : float

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Model API!"} 


@app.get("/predict")
async def predict(input_data: InputData):
    # Convert input data to a DataFrame
    df = pd.DataFrame([input_data.dict()])
    
    # Make prediction
    prediction = data.predict(df)
    
    return {"prediction": prediction[0]}