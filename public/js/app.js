// ── Weather App Frontend JS ──────────────────────────────────────

const API_BASE = '/api/weather';

// DOM refs
const searchInput  = document.getElementById('search-input');
const searchBtn    = document.getElementById('search-btn');
const geoBtn       = document.getElementById('geo-btn');
const display      = document.getElementById('weather-display');
const clockEl      = document.getElementById('local-clock');

// ── Utility ──────────────────────────────────────────────────────
const iconUrl = (code, size = '@2x') =>
  `https://openweathermap.org/img/wn/${code}${size}.png`;

function windDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ── Clock ─────────────────────────────────────────────────────────
let timezoneOffset = null;
function startClock() {
  if (clockEl) {
    setInterval(() => {
      if (timezoneOffset === null) return;
      const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
      const local = new Date(utc + timezoneOffset * 1000);
      clockEl.textContent = local.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }, 1000);
  }
}
startClock();

// ── Render ────────────────────────────────────────────────────────
function renderWeather(data) {
  timezoneOffset = data.timezone;

  const forecastCards = (data.forecast || []).map(d => `
    <div class="forecast-card">
      <div class="forecast-day">${d.date.split(',')[0]}</div>
      <img class="forecast-icon" src="${iconUrl(d.icon)}" alt="${d.description}">
      <div class="forecast-temp">${d.temp}°</div>
      <div class="forecast-desc">${d.description}</div>
    </div>
  `).join('');

  const c = data.current;

  display.innerHTML = `
    <div class="main-card">
      <div class="main-card-header">
        <div class="location-info">
          <h2>📍 ${data.city}</h2>
          <span class="country-badge">${data.country}</span>
        </div>
        <div class="local-time">
          <label style="font-size:0.72rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);">Local Time</label>
          <span class="time-val" id="local-clock">--:--:--</span>
        </div>
      </div>

      <div class="temp-block">
        <div class="weather-icon-wrap">
          <img src="${iconUrl(c.icon)}" alt="${c.description}">
        </div>
        <div>
          <div class="temp-main">${c.temp}<span class="temp-unit">°C</span></div>
        </div>
        <div class="temp-details">
          <div class="temp-desc">${c.description}</div>
          <div class="temp-feels">Feels like ${c.feels_like}°C</div>
          <div class="temp-range">
            <span class="temp-hi">▲ ${c.temp_max}°</span>
            <span class="temp-lo">▼ ${c.temp_min}°</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">💧</span>
          <div class="stat-label">Humidity</div>
          <div class="stat-value">${c.humidity}<span>%</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💨</span>
          <div class="stat-label">Wind</div>
          <div class="stat-value">${c.wind_speed}<span> m/s ${windDirection(c.wind_deg)}</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👁️</span>
          <div class="stat-label">Visibility</div>
          <div class="stat-value">${c.visibility}<span> km</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🌡️</span>
          <div class="stat-label">Pressure</div>
          <div class="stat-value">${c.pressure}<span> hPa</span></div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">☁️</span>
          <div class="stat-label">Cloud Cover</div>
          <div class="stat-value">${c.clouds}<span>%</span></div>
        </div>
      </div>
    </div>

    <div class="sun-card">
      <div class="sun-item">
        <span class="sun-emoji">🌅</span>
        <div class="sun-detail">
          <label>Sunrise</label>
          <strong>${c.sunrise}</strong>
        </div>
      </div>
      <div class="sun-divider"></div>
      <div class="sun-item">
        <span class="sun-emoji">🌇</span>
        <div class="sun-detail">
          <label>Sunset</label>
          <strong>${c.sunset}</strong>
        </div>
      </div>
    </div>

    ${data.forecast?.length ? `
    <p class="section-title">5-Day Forecast</p>
    <div class="forecast-grid">${forecastCards}</div>
    ` : ''}
  `;

  // restart clock with new timezone
  timezoneOffset = data.timezone;
}

function renderError(msg) {
  display.innerHTML = `
    <div class="error-box">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>${msg}</p>
    </div>
  `;
}

function renderLoading() {
  display.innerHTML = `
    <div class="loader">
      <div class="loader-ring"></div>
      <p>Fetching weather data...</p>
    </div>
  `;
}

function renderEmpty() {
  display.innerHTML = `
    <div class="empty-state">
      <span class="globe">🌍</span>
      <h3>Search for any city</h3>
      <p>Type a city name above and discover real-time weather, forecasts and more.</p>
    </div>
  `;
}

// ── Fetch ─────────────────────────────────────────────────────────
async function fetchWeather(city) {
  if (!city.trim()) return;
  renderLoading();
  try {
    const res = await fetch(`${API_BASE}?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unknown error');
    renderWeather(data);
  } catch (err) {
    renderError(err.message);
  }
}

// ── Geolocation ───────────────────────────────────────────────────
function fetchByGeo() {
  if (!navigator.geolocation) {
    return renderError('Geolocation is not supported by your browser.');
  }
  renderLoading();
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    try {
      const res = await fetch(`${API_BASE}/geo?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      searchInput.value = data.city;
      fetchWeather(data.city);
    } catch (err) {
      renderError(err.message);
    }
  }, () => {
    renderError('Location access denied. Please allow location access or search manually.');
  });
}

// ── Events ────────────────────────────────────────────────────────
searchBtn.addEventListener('click', () => fetchWeather(searchInput.value));

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchWeather(searchInput.value);
});

geoBtn.addEventListener('click', fetchByGeo);

document.querySelectorAll('.city-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    searchInput.value = chip.dataset.city;
    fetchWeather(chip.dataset.city);
  });
});

// ── Init ──────────────────────────────────────────────────────────
renderEmpty();
