from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("Food_Delivery_Model.joblib")


class InputData(BaseModel):
    Order_ID: int
    Distance_km: float
    Weather: str
    Traffic_Level: str
    Time_of_Day: str
    Vehicle_Type: str
    Preparation_Time_min: float
    Courier_Experience_yrs: float


@app.get("/")
def root():
    return {"message": "Welcome to the Model API!"}


@app.post("/predict")
def predict(input_data: InputData):
    try:
        input_row = pd.DataFrame([{
            "Order_ID": input_data.Order_ID,
            "Distance_km": input_data.Distance_km,
            "Weather": input_data.Weather,
            "Traffic_Level": input_data.Traffic_Level,
            "Time_of_Day": input_data.Time_of_Day,
            "Vehicle_Type": input_data.Vehicle_Type,
            "Preparation_Time_min": input_data.Preparation_Time_min,
            "Courier_Experience_yrs": input_data.Courier_Experience_yrs
        }])

        prediction = model.predict(input_row)[0]

        return {
            "predicted_delivery_time_min": float(prediction)
        }

    except Exception as e:
        return {"error": str(e)}