import requests
import random
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY", "f7d346d8975fc8c45585dec686e843b9")

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm"
}

def decode_wmo_code(code: int) -> str:
    return WMO_WEATHER_CODES.get(code, "Partly cloudy")

def fetch_open_meteo_live(lat: float, lon: float, location_name: str = "Live Location"):
    """Fetches real-time live weather using Open-Meteo for given coordinates."""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
        f"&daily=weather_code,temperature_2m_max,precipitation_probability_max"
        f"&timezone=auto"
    )
    res = requests.get(url, timeout=5)
    res.raise_for_status()
    data = res.json()
    curr = data.get("current", {})
    weather_desc = decode_wmo_code(curr.get("weather_code", 0))

    return {
        "temperature": round(float(curr.get("temperature_2m", 28.0)), 1),
        "humidity": int(curr.get("relative_humidity_2m", 65)),
        "wind_speed": round(float(curr.get("wind_speed_10m", 10.0)), 1),
        "description": weather_desc,
        "city": location_name,
        "simulated": False,
        "daily": data.get("daily", {})
    }

def geocode_city(city: str):
    """Resolves city name to latitude and longitude."""
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            results = res.json().get("results")
            if results and len(results) > 0:
                first = results[0]
                return float(first["latitude"]), float(first["longitude"]), first.get("name", city)
    except Exception:
        pass
    return None, None, city

def get_weather(city: str = None, lat: float = None, lon: float = None):
    """
    Fetches live weather by coordinates or city using OpenWeatherMap or Open-Meteo.
    Falls back gracefully if offline or unconfigured.
    """
    # 1. Coordinates provided directly (Live GPS from user's device)
    if lat is not None and lon is not None:
        if API_KEY:
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    d = r.json()
                    loc_name = d.get("name") or city or "Live Location"
                    return {
                        "temperature": round(d["main"]["temp"], 1),
                        "humidity": int(d["main"]["humidity"]),
                        "wind_speed": round(d.get("wind", {}).get("speed", 10.0), 1),
                        "description": d["weather"][0]["description"].capitalize() if "weather" in d and d["weather"] else "Clear sky",
                        "city": loc_name,
                        "simulated": False
                    }
            except Exception:
                pass
        try:
            return fetch_open_meteo_live(lat, lon, city or "Live Location")
        except Exception:
            pass

    # 2. City search provided
    if city and city.strip():
        if API_KEY:
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={city.strip()}&appid={API_KEY}&units=metric"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    d = r.json()
                    return {
                        "temperature": round(d["main"]["temp"], 1),
                        "humidity": int(d["main"]["humidity"]),
                        "wind_speed": round(d.get("wind", {}).get("speed", 10.0), 1),
                        "description": d["weather"][0]["description"].capitalize() if "weather" in d and d["weather"] else "Clear sky",
                        "city": d.get("name", city),
                        "simulated": False
                    }
            except Exception:
                pass

        # Try geocoding city for live weather via Open-Meteo
        c_lat, c_lon, resolved_name = geocode_city(city.strip())
        if c_lat is not None and c_lon is not None:
            try:
                return fetch_open_meteo_live(c_lat, c_lon, resolved_name)
            except Exception:
                pass

        return get_mock_weather(city)

    # 3. No parameters: return dynamic local farm weather
    return get_mock_weather("Local Farm")

def get_weather_forecast(city: str = None, lat: float = None, lon: float = None, days: int = 7):
    """
    Generates 7-day forecast data for agricultural planning.
    Uses live Open-Meteo daily forecast when available.
    """
    if lat is not None and lon is not None:
        try:
            live = fetch_open_meteo_live(lat, lon, city or "Live Location")
            daily = live.get("daily", {})
            times = daily.get("time", [])
            codes = daily.get("weather_code", [])
            max_temps = daily.get("temperature_2m_max", [])
            rain_probs = daily.get("precipitation_probability_max", [])

            if times and len(times) >= days:
                forecast = []
                for i in range(min(days, len(times))):
                    date_str = times[i]
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    cond = decode_wmo_code(codes[i] if i < len(codes) else 0)
                    t_max = max_temps[i] if i < len(max_temps) else live["temperature"]
                    r_prob = rain_probs[i] if i < len(rain_probs) else 20
                    forecast.append({
                        "date": date_str,
                        "day": dt.strftime("%a"),
                        "temperature": round(float(t_max), 1),
                        "humidity": live["humidity"],
                        "condition": cond,
                        "rain_probability": int(r_prob if r_prob is not None else 20),
                        "wind_speed": live.get("wind_speed", 12.0),
                        "uv_index": 6
                    })
                return forecast
        except Exception:
            pass

    # Generate realistic simulated forecast based on current weather
    base_weather = get_weather(city=city, lat=lat, lon=lon)
    forecast = []
    current_temp = base_weather["temperature"]
    current_humidity = base_weather["humidity"]

    for i in range(days):
        day_date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        day_name = (datetime.now() + timedelta(days=i)).strftime("%a")
        temp = round(current_temp + random.uniform(-2.5, 2.5), 1)
        humidity = max(15, min(95, int(current_humidity + random.uniform(-8, 8))))

        if humidity > 80:
            condition = "Showers" if random.random() > 0.4 else "Thunderstorm"
            rain_prob = random.randint(70, 95)
        elif humidity > 60:
            condition = "Partly cloudy" if random.random() > 0.5 else "Showers"
            rain_prob = random.randint(30, 60)
        else:
            condition = "Clear sky" if random.random() > 0.4 else "Mainly clear"
            rain_prob = random.randint(5, 25)

        forecast.append({
            "date": day_date,
            "day": day_name,
            "temperature": temp,
            "humidity": humidity,
            "condition": condition,
            "rain_probability": rain_prob,
            "wind_speed": round(random.uniform(6, 18), 1),
            "uv_index": random.randint(4, 9)
        })

    return forecast

def get_mock_weather(city: str = "Local Farm"):
    """Simulates realistic agricultural microclimate."""
    seed_str = city or "Local Farm"
    random.seed(seed_str)
    base_temp = random.randint(24, 32)
    base_humidity = random.randint(50, 75)
    random.seed()

    return {
        "temperature": base_temp,
        "humidity": base_humidity,
        "wind_speed": 11.5,
        "description": "Partly cloudy",
        "city": city or "Local Farm",
        "simulated": True
    }

def calculate_risk(humidity):
    """Calculates fungal infection risk based on atmospheric humidity."""
    if humidity > 80:
        return "High"
    if humidity > 60:
        return "Medium"
    return "Low"

def calculate_severity(confidence):
    """Calculates symptom outbreak severity based on detection certainty."""
    if confidence > 85:
        return "Severe"
    if confidence > 60:
        return "Moderate"
    return "Low"

def get_irrigation_recommendation(temperature, humidity):
    """Provides actionable agronomic irrigation scheduling."""
    if temperature > 32 and humidity < 50:
        return "High Evapotranspiration: Irrigate deeply in the early morning or evening to prevent heat wilt."
    elif humidity > 80:
        return "Excess Atmospheric Moisture: Pause overhead irrigation to restrict foliar pathogen germination."
    elif temperature < 18:
        return "Cool Climate: Moderate drip watering is sufficient; avoid waterlogging root zones."
    return "Standard Soil Irrigation: Maintain consistent soil moisture at the root zone."

def get_crop_stress_index(temp, humidity):
    """Returns specific agricultural stress alerts."""
    alerts = []

    # Heat stress
    if temp >= 38:
        alerts.append({
            "type": "Heat Stress",
            "level": "Critical",
            "message": "Extreme temperatures can cause flower drop and stunt crop development. Provide shade and deep irrigation.",
            "desc": "Extreme temperatures can cause flower drop and stunt crop development. Provide shade and deep irrigation."
        })
    elif temp >= 33:
        alerts.append({
            "type": "Heat Stress",
            "level": "Warning",
            "message": "High temperatures are causing rapid evaporation. Keep soil moisture elevated.",
            "desc": "High temperatures are causing rapid evaporation. Keep soil moisture elevated."
        })

    # Fungal infection risk
    if humidity >= 80 and 20 <= temp <= 30:
        alerts.append({
            "type": "Fungal Spread Risk",
            "level": "Critical",
            "message": "High Fungal Risk: Humidity and warmth accelerate Alternaria/Phytophthora spores. Spray preventative neem oil.",
            "desc": "High Fungal Risk: Humidity and warmth accelerate Alternaria/Phytophthora spores. Spray preventative neem oil."
        })

    # Water stress
    if humidity <= 35:
        alerts.append({
            "type": "Low Humidity / Water Stress",
            "level": "Warning",
            "message": "Dry air is causing stress. Leaves may curl. Check soil moisture daily.",
            "desc": "Dry air is causing stress. Leaves may curl. Check soil moisture daily."
        })

    # If no alerts, return an optimal status
    if not alerts:
        alerts.append({
            "type": "Optimal",
            "level": "Healthy",
            "message": "Weather conditions are optimal for general crop development.",
            "desc": "Weather conditions are optimal for general crop development."
        })

    return alerts