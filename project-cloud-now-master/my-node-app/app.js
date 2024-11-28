import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import mongoose from 'mongoose';
import moment from 'moment-timezone';

const app = express();
app.use(cors());

// เชื่อมต่อกับ MongoDB Atlas และระบุฐานข้อมูล (database)
const MONGO_URI = 'mongodb+srv://kittiwat:EsterShiro2547@cluster0.9ezue.mongodb.net/project-cloud?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// สร้าง Schema สำหรับข้อมูลสภาพอากาศ
const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  description: String,
  icon: String,
  hourlyForecast: [{
    time: String,
    temp: Number,
    description: String,
    icon: String
  }],
  Timestamp: {
    type: Date,
    default: () => moment().tz('Asia/Bangkok').toDate() // บันทึกเวลาไทยลง MongoDB
  }
});

// ระบุคอลเลกชันที่บันทึกข้อมูลลง (ในนี้คือ "User")
const Weather = mongoose.model('user', weatherSchema, 'user');  // 'user' คือชื่อคอลเลกชัน

const API_KEY = "a1463aa00c8a6f717ddfb9f64f06c07b";  // ใส่ API Key 
const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast";

// สร้าง API endpoint
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    const weatherUrl = `${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric&cnt=6`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            return res.status(404).json({ error: "City not found" });
        }
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            return res.status(404).json({ error: "Forecast data not found" });
        }
        const forecastData = await forecastResponse.json();

        const hourlyForecast = forecastData.list.map(item => ({
            time: item.dt_txt.split(' ')[1].slice(0, 5),
            temp: item.main.temp,
            description: item.weather[0].description,
            icon: item.weather[0].icon
        }));

        // สร้างเอกสารใหม่
        const weatherRecord = new Weather({
            city: weatherData.name,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            hourlyForecast: hourlyForecast
        });

        // บันทึกข้อมูลลง MongoDB
        await weatherRecord.save()
            .then(() => {
                console.log("Data saved to MongoDB successfully");
            })
            .catch((error) => {
                console.error("Error saving data to MongoDB:", error);
            });

        // ส่งข้อมูลไปยังผู้ใช้
        res.json({
            city: weatherData.name,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            hourlyForecast: hourlyForecast,
            Timestamp: moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss')
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
