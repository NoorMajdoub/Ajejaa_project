
#  3jeja

**Real-Time AI-Powered Route Optimization for Delivery and Field Service Vehicles**

##  Project Overview

3jeja is an intelligent assistant for transportation planning designed to reduce traffic contribution, fuel costs, and wasted time for companies operating delivery and service fleets.

This system leverages **real-time data**, **LLM reasoning**, and **driver-friendly notifications** to suggest **safe**, **fast**, and **place-aware** routes — all while adapting to changes mid-journey.

Demo link : https://drive.google.com/file/d/1wGOxAkt3FZAX9O1KahsqEmBDJsN4Bm_-/view?usp=sharing

---

##  Core Idea

A pipeline that collects multi-source data and feeds it into an LLM (or ML model) to generate optimal and adaptive routing suggestions. The system provides:

* Pre-trip route recommendations
* Real-time in-trip rerouting alerts (hands-free via TTS)

---
## Idea: Using an AI agent

LangChain: We wrap each API as a tool
The tools would be:
Weather tool → OpenWeather API
Traffic tool → TomTom API (or Overpass if TomTom fails)
Social tool → Scrape / summarize tweets / posts (with fallback to LLM if scraping fails)
Maps tool → Google Maps Directions API
Reasoning tool → Gemini/OpenAI LLM

---
##  Pipeline Logic

1. **Data Collection**
   Gather data from:

   * 🚦 Real-time traffic APIs
   * ☁️ Weather APIs
   * 🧱 Road infrastructure rules
   * 🕓 Time of day / cultural norms
   * 🧑‍🤝‍🧑 Social media signals (accidents, events)
   * 🧭 Custom business rules / location-specific info

2. **Input Structuring**
   Structure the above data into a context-rich prompt.

3. **Routing Intelligence**
   🔹 **LLM Task:**

   > “Given this context, what is the best route for a delivery van in downtown Tunis at 12:30 on Friday?”

   🔹 **Future ML Integration Ideas:**

   * Predict average ETA based on historical data
   * Classify streets by risk score (flood-prone, congested, etc.)

4. **Output Processing**

   * Parse the LLM response into structured data (JSON, etc.)
   * Extract route, explanation, and alternatives

5. **Driver Interaction**

   * 📱 Before trip: Check the app for the recommended route
   * 🚘 During trip: Get real-time alerts on route updates
   * 🔊 Alerts delivered via **text-to-speech (TTS)** to avoid distraction

---

## 🧠 Why This Matters

💸 **Reduce costs** for fuel & delay penalties
🛣️ **Reduce traffic impact** by choosing optimized routes
📦 **Improve delivery times** and SLA adherence
🧍‍♂️ **Assist drivers** with calm, adaptive guidance

---

## 🧪 Tech Stack (WIP)

* **APIs**: OpenWeatherMap, TomTom/HERE, Twitter/X (for incidents)
* **LLM**: GPT / Open-source LLMs via API
* **Frontend**: React Native or Flutter (driver app)
* **Backend**: FastAPI / Node.js
* **Database**: MongoDB / Firebase for storing delivery context
* **Text-to-Speech**: Google TTS / Coqui TTS for real-time alerts

---

##  Future Directions

* Train custom models for:

  * Risk-aware path planning
  * Road type classification using image data
  * Multi-agent delivery scheduling
  * Optimization % estimation
* Find better apis for getting roads /traffic info cause the ones used in the demo are not very reliable
* Find alternative for google maps cause free trial over


---

##  Target Users

* 🏢 **Delivery & logistics companies**
* 🧰 **Field service providers** (electricians, repair teams, etc.)
* 🚚 **Courier platforms** looking to optimize fleet movement

---


