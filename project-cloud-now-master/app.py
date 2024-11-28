from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
# สร้างแอปพลิเคชัน Flask
app = Flask(__name__)
CORS(app)
# กำหนด API key และ base URL สำหรับ OpenWeather API
API_KEY = "a1463aa00c8a6f717ddfb9f64f06c07b"  # ใส่ API Key ของคุณที่ได้จาก OpenWeather
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# ฟังก์ชันเพื่อดึงข้อมูลอุณหภูมิจาก OpenWeather API
def get_temperature(city):
    # สร้าง URL สำหรับดึงข้อมูล
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"  # ใช้ units=metric เพื่อให้ได้ค่าอุณหภูมิในหน่วย Celsius
    response = requests.get(url)
    
    # ตรวจสอบว่าเรียก API สำเร็จหรือไม่
    if response.status_code == 200:
        data = response.json()  # แปลงข้อมูลเป็น JSON
        # ดึงข้อมูลอุณหภูมิจากผลลัพธ์
        temperature = data['main']['temp']
        return temperature
    else:
        return None  # ถ้าไม่สามารถดึงข้อมูลได้

# สร้าง API endpoint สำหรับดึงอุณหภูมิ
@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City is required"}), 400

    weather_url = "https://api.openweathermap.org/data/2.5/weather"
    forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric",
        "lang": "th"
    }

    # ดึงข้อมูลปัจจุบัน
    weather_response = requests.get(weather_url, params=params)
    if weather_response.status_code != 200:
        return jsonify({"error": "City not found"}), 404
    weather_data = weather_response.json()

    # ดึงข้อมูลรายชั่วโมง
    forecast_response = requests.get(forecast_url, params=params)
    forecast_data = forecast_response.json() if forecast_response.status_code == 200 else {}

    # จัดรูปแบบข้อมูล
    result = {
        "city": weather_data["name"],
        "temperature": weather_data["main"]["temp"],
        "description": weather_data["weather"][0]["description"],
        "icon": weather_data["weather"][0]["icon"],
       "hourlyForecast": [
    {
        "time": item["dt_txt"].split(" ")[1][:5],  # เวลาจาก forecast
        "temp": item["main"]["temp"],             # อุณหภูมิ
        "description": item["weather"][0]["description"],  # คำอธิบาย
        "icon": item["weather"][0]["icon"]        # ไอคอน
    }
    for item in forecast_data.get("list", [])[:5]  # จำกัดเฉพาะ 5 ชั่วโมง
]

    }
    return jsonify(result)

# รันแอปพลิเคชัน Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
