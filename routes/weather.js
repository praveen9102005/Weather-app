const express = require('express');
const axios = require('axios');
const router = express.Router();

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?city=London
router.get('/', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'Please add your OpenWeatherMap API key to the .env file'
    });
  }

  try {
    // Current weather
    const currentRes = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: apiKey, units: 'metric' }
    });

    // 5-day forecast
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: apiKey, units: 'metric', cnt: 40 }
    });

    const current = currentRes.data;
    const forecast = forecastRes.data;

    // Process daily forecast (one per day at noon)
    const dailyForecasts = [];
    const seenDays = new Set();
    for (const item of forecast.list) {
      const date = new Date(item.dt * 1000);
      const day = date.toDateString();
      const hour = date.getHours();
      if (!seenDays.has(day) && hour >= 11 && hour <= 14) {
        seenDays.add(day);
        dailyForecasts.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind: item.wind.speed
        });
      }
      if (dailyForecasts.length === 5) break;
    }

    res.json({
      city: current.name,
      country: current.sys.country,
      timezone: current.timezone,
      current: {
        temp: Math.round(current.main.temp),
        feels_like: Math.round(current.main.feels_like),
        temp_min: Math.round(current.main.temp_min),
        temp_max: Math.round(current.main.temp_max),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        visibility: (current.visibility / 1000).toFixed(1),
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        clouds: current.clouds.all
      },
      forecast: dailyForecasts
    });

  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `City "${city}" not found. Please check the spelling.` });
    }
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key. Please check your OpenWeatherMap API key.' });
    }
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data', message: err.message });
  }
});

// GET /api/weather/geo?lat=51.5&lon=-0.12
router.get('/geo', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const apiKey = process.env.OPENWEATHER_API_KEY;
  try {
    const geoRes = await axios.get(`${BASE_URL}/weather`, {
      params: { lat, lon, appid: apiKey, units: 'metric' }
    });
    res.json({ city: geoRes.data.name });
  } catch (err) {
    res.status(500).json({ error: 'Geolocation lookup failed' });
  }
});

module.exports = router;
