async function getWeather() {
    const city = document.getElementById('city').value; 
    const tempDiv = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // ล้างค่าที่แสดงไว้ก่อนหน้า
    tempDiv.innerHTML = '';
    weatherInfoDiv.innerHTML = '';
    weatherIcon.src = '';
    hourlyForecastDiv.innerHTML = '';

    if (!city) {
        tempDiv.innerHTML = '<p>Please enter a city name.</p>';
        return;
    }

    try {
        // ส่งคำขอไปที่ app Backend (ปรับ endpoint ตามจริง)
        const response = await fetch(`http://52.187.146.94/weather?city=${city}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            tempDiv.innerHTML = `<p>Error: ${errorData.error}</p>`;
            return;
        }

        const data = await response.json();

        // แสดงข้อมูลที่ได้รับ
        tempDiv.innerHTML = `<h3>${data.temperature}°C</h3> 
                            <h4>${data.city}</h4>`;       
        weatherInfoDiv.innerHTML = `<p>${data.description}</p>`;

        // แสดงไอคอนสภาพอากาศ (ถ้ามีข้อมูล)
        if (data.icon) {
            weatherIcon.src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
            weatherIcon.alt = data.description;
            weatherIcon.style.display = 'block'; // เปิดการแสดงผล
        }
        else if(!data.icon){
            weatherIcon.src = '';
        }

        // หากมีข้อมูลพยากรณ์อากาศรายชั่วโมง
        if (data.hourlyForecast) {
            hourlyForecastDiv.innerHTML = '';
            data.hourlyForecast.forEach(hour => {
            const forecast = document.createElement('div');
            forecast.className = 'hourly-item';
            forecast.innerHTML = `
            <p>${hour.time}</p>
            <img src="http://openweathermap.org/img/wn/${hour.icon}@2x.png" alt="${hour.description}">
            <p>${hour.temp}°C</p>
            
    `;
    hourlyForecastDiv.appendChild(forecast);
});
        }
        
    } catch (error) {
        tempDiv.innerHTML = `<p>Failed to fetch weather data. Please try again later.</p>`;
        console.error('Error fetching weather data:', error);
    }
}
