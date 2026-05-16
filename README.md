# 🌤 WeatherLens — API Integration

A responsive weather web app built with **Express.js** (backend) and vanilla **HTML/CSS/JS** (frontend), fetching live data from the **OpenWeatherMap API**.

---

## 🚀 Features

- 🌡️ Real-time current weather (temp, feels-like, humidity, wind, pressure, visibility)
- 📅 5-day daily forecast
- 🌅 Sunrise & sunset times with local clock
- 📍 Geolocation support (auto-detect your city)
- ⚡ Quick-search city chips
- 🎨 Animated dark UI with glassmorphism design
- 📱 Fully responsive (mobile, tablet, desktop)

---

## 🛠️ Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Backend  | Node.js + Express.js          |
| Frontend | HTML5, CSS3, Vanilla JS       |
| API      | OpenWeatherMap (free tier)    |
| HTTP     | Axios (server-side)           |

---

## ⚙️ Setup Instructions

### 1. Get a Free API Key
1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to **API keys** tab and copy your key
4. *(Note: New keys may take ~2 hours to activate)*

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
Open `.env` and replace `your_api_key_here` with your actual API key:
```
OPENWEATHER_API_KEY=abc123yourkeyhere
PORT=3000
```

### 4. Run the App
```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

### 5. Open in Browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
weather-app/
├── server.js              # Express entry point
├── routes/
│   └── weather.js         # Weather API route handlers
├── public/
│   ├── index.html         # Frontend HTML
│   ├── css/
│   │   └── style.css      # Styles & animations
│   └── js/
│       └── app.js         # Frontend logic
├── .env.example           # Environment template
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/api/weather?city=London`   | Current weather + 5-day forecast   |
| GET    | `/api/weather/geo?lat=&lon=` | Reverse geocode lat/lon to city    |

---

## 📝 Notes

- Uses OpenWeatherMap's free tier (no credit card needed)
- All sensitive keys stay on the server — never exposed to the browser
- The backend proxies API requests, keeping your key secure
