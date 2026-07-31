from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

    
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://food-delivery-prediction-seven.vercel.app",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def predict(data: InputData):
    try:
        input_row = pd.DataFrame([{
            "Order_ID": data.Order_ID,
            "Distance_km": data.Distance_km,
            "Weather": data.Weather,
            "Traffic_Level": data.Traffic_Level,
            "Time_of_Day": data.Time_of_Day,
            "Vehicle_Type": data.Vehicle_Type,
            "Preparation_Time_min": data.Preparation_Time_min,
            "Courier_Experience_yrs": data.Courier_Experience_yrs
        }])

        prediction = model.predict(input_row)[0]

        return {
            "predicted_delivery_time_min": float(prediction)
        }

    except Exception as e:
        return {"error": str(e)}