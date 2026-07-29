from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("Food_Delivery_Model.joblib")


class InputData(BaseModel):
    Order_ID: int
    Distance_km: float
    Weather: int
    Traffic_Level: int
    Time_of_Day: int
    Vehicle_Type: int
    Preparation_Time_min: float
    Courier_Experience_yrs: float


@app.get("/")
def root():
    return {"message": "Welcome to the Model API!"}


@app.post("/predict")
def predict(input_data: InputData):
    df = pd.DataFrame([input_data.model_dump()])

    prediction = model.predict(df)

    return {
        "prediction": float(prediction[0])
    }