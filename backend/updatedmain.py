from langchain.agents import initialize_agent, Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from main import get_prompttext 
import requests
from pydantic import BaseModel
from bs4 import BeautifulSoup
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
#weather api
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")




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

#get weather info 
def get_weather(city: str):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    r = requests.get(url).json()
    if "main" not in r: 
        return "Weather info not available."
    return f"{r['main']['temp']}°C, {r['weather'][0]['description']}"

#get traffic info (not fully working tbh)
def get_traffic(lat: float, lon: float):
    API_KEY = ""
    url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    params = {"point": f"{lat},{lon}", "key": API_KEY}
    r = requests.get(url, params=params).json()
    if "flowSegmentData" in r:
        speed = r["flowSegmentData"]["currentSpeed"]
        road = r["flowSegmentData"]["frc"]
        return f"Traffic speed: {speed} km/h on road class {road}"
    return f"Traffic data error: {r}"

#google maps tool
def get_directions(origin: str, destination: str):
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={GOOGLE_MAPS_API_KEY}"
    r = requests.get(url).json()
    if r["status"] != "OK":
        return f"Directions not available: {r['status']}"
    steps = r["routes"][0]["legs"][0]["steps"]
    directions = []
    for i, step in enumerate(steps, 1):
        txt = BeautifulSoup(step["html_instructions"], "html.parser").get_text()
        dist = step["distance"]["text"]
        directions.append(f"{i}. {txt} ({dist})")
    return "\n".join(directions)

#langchain settup
tools = [
    Tool(name="Weather", func=get_weather, description="Get weather by city"),
    Tool(name="Traffic", func=lambda q: get_traffic(35.8256, 10.6084), description="Get traffic near Sousse"),
    Tool(name="Directions", func=lambda q: get_directions("Sousse", q), description="Get directions to destination from Sousse")
]

llm = ChatGoogleGenerativeAI(
    model=MODEL_NAME,
    temperature=0,
    google_api_key=api_key
)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
from asyncio import get_running_loop

async def run_agent_async(prompt: str):
    loop = get_running_loop()
    result = await loop.run_in_executor(None, lambda: agent.run(prompt))
    return result

@app.post("/data")
async def get_text_summary(data: Adress):
    prompt = get_prompttext(data.fromm, data.dest, data.vehicule, data.time)
    result = await run_agent_async(prompt)
    return {"result": result}
    
async def get_response(loc,des,veh,time):

    model = genai.GenerativeModel(MODEL_NAME)
    chat = model.start_chat()
    #get dat res babayyyyyyy
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
@app.post("/data2")
async def get_text_summary(data: Adress):
    #result="why god"
    result = await  get_response(data.fromm,data.dest,data.vehicule,data.time)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


