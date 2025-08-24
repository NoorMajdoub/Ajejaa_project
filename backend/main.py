from pydantic import BaseModel

from dotenv import load_dotenv
import os
import json
import google.generativeai as genai
import asyncio
from fastapi import FastAPI,Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv() 

api_key = os.getenv("GOOGLE_API_KEY")
MODEL_NAME= os.getenv("MODEL_NAME")

genai.configure(api_key=api_key)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

#get location and dest
def get_prompttext(location,destination,vehicule,time):
        prompt_text=f"""

       I need you to act as a smart route planning assistant. I will provide you with my current location, my desired destination, the type of vehicle I'll be using, and my planned departure time. Your task is to analyze the standard Google Maps route for this journey and then compare it with a "smart" route that takes into account live traffic conditions, the specific vehicle type, and the given time.

Here's the input you will use:

Current Location,
Destination,
Vehicle Type,
Departure Time,

Based on this input, please provide the following output:

Traffic Congestion:

You look up the traffic from google map 

Recommended Route:

A one-line recommendation (e.g., "Avoid [Street X] due to heavy congestion, take [Street Y] instead." or "Stay on the main highway for the fastest journey.").

Smart Route:

The fastest route based on live traffic, including:

Estimated travel time in minutes

Estimated distance in km

Time saved by using the smart route compared to the standard Google Maps route in minutes

Distance saved/increased by using the smart route compared to the standard Google Maps route in km

Decision Reasoning:

Bullet points explaining how you made this decision, considering:

Live traffic data for the relevant roads.

Impact of vehicle type on route recommendations (e.g., a bicycle might avoid main roads, a truck might need to avoid low bridges).

Influence of the departure time on expected traffic patterns.

Example of how I expect the output to look (do not generate this unless I provide input):

Traffic Congestion: Moderate
Recommended Route: Avoid Boulevard Périphérique due to peak hour traffic, consider taking Avenue des Champs-Élysées.
Smart Route:
x min
x km
(Win x min, x km less)
Decision Reasoning:

Live traffic indicates significant slowdowns on Boulevard Périphérique at 8:00 AM.

For a car, Avenue des Champs-Élysées, while longer in distance, has a more fluid traffic flow at this time.

The departure time of 8:00 AM aligns with typical morning rush hour, necessitating an alternative route.

    Here is the data i will provide to you 
    Current Location: {location}

Destination: {destination}

Vehicle Type: {vehicule}

Departure Time: :{time}


     """
        res=prompt_text.format(location=location,destination=destination,vehicule=vehicule,time=time)
        
        return res

async def get_response(loc,des,veh,time):

    model = genai.GenerativeModel(MODEL_NAME)
    chat = model.start_chat()
    #get dat transcription babayyyyyyy
    instruction =get_prompttext(loc,des,veh,time)
    print(instruction)
    response = await chat.send_message_async(instruction)
    result = response.text

  
    return result
class Adress(BaseModel):
    fromm: str
    dest: str
    time: str
    vehicule: str
    #location , dest , veh type
@app.post("/data")
async def get_text_summary(data: Adress):
    #result="why god"
    result = await  get_response(data.fromm,data.dest,data.vehicule,data.time)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


#to do evaluation resutls 
#comparation on two google maps windows
