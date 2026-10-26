


const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const LOCATION = {
    latitude: 39.4301,
    longitude: -77.8042
};

const weatherCodes = {
    0: ["Clear sky", "☀️"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    53: ["Drizzle", "🌦️"],
    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    73: ["Snow", "🌨️"],
    81: ["Rain showers", "🌧️"],
    95: ["Thunderstorm", "⛈️"],
    
};

function describeWeather(code) {
    return weatherCodes[code] || ["Conditions unavailable", "🌡️"];
}

function formatDate(dateString, options = {}) {
    
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        weekday: options.weekday || "long",
        month: options.month || "short",
        day: options.day || "numeric"
    });
}

function showValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function renderShortForecast(data) {
    const container = document.getElementById("home-forecast");

    if (!container) return;

    container.replaceChildren();

    
    const days = data.daily.time.slice(0, 3);

    days.forEach((date, index) => {
        const [description, icon] =
            describeWeather(data.daily.weather_code[index]);

        const card = document.createElement("article");
        card.className = "forecast-card";

        const heading = document.createElement("h3");
        heading.textContent = formatDate(date);

        const weatherIcon = document.createElement("span");
        weatherIcon.className = "weather-icon";
        weatherIcon.setAttribute("aria-hidden", "true");
        weatherIcon.textContent = icon;

        const condition = document.createElement("p");
        condition.textContent = description;

        const temperatures = document.createElement("p");
        temperatures.className = "high-low";
        temperatures.textContent =
            `${Math.round(data.daily.temperature_2m_max[index])}° / ` +
            `${Math.round(data.daily.temperature_2m_min[index])}°F`;

        card.append(heading, weatherIcon, condition, temperatures);
        container.appendChild(card);
    });
}

async function loadWeather() {
    const status = document.getElementById("weather-status");

    const params = new URLSearchParams({
        latitude: LOCATION.latitude,
        longitude: LOCATION.longitude,
        timezone: "America/New_York",
        temperature_unit: "fahrenheit",
        wind_speed_unit: "mph",
        current: [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code"
        ].join(","),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ].join(","),
        forecast_days: "7"
    });

    try {
        const response = await fetch(`${WEATHER_URL}?${params}`);

        if (!response.ok) {
            throw new Error("Weather service returned an error.");
        }

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;
        const [description, icon] =
            describeWeather(current.weather_code);

        showValue("current-condition", description);
        showValue("current-temp", Math.round(current.temperature_2m));
        showValue(
            "feels-like",
            `Feels like ${Math.round(current.apparent_temperature)}°F`
        );
        showValue("wind-speed", `${Math.round(current.wind_speed_10m)} mph`);
        showValue("humidity", `${current.relative_humidity_2m}%`);
        showValue("today-high", `${Math.round(daily.temperature_2m_max[0])}°F`);
        showValue("today-low", `${Math.round(daily.temperature_2m_min[0])}°F`);
        showValue("current-date", formatDate(current.time.slice(0, 10)));

        const iconElement = document.getElementById("current-icon");

        if (iconElement) {
            iconElement.textContent = icon;
        }

        renderShortForecast(data);
        showValue("weather-status", "Weather updated successfully.");
    } catch (error) {
        console.error("Unable to load weather:", error);
        showValue(
            "weather-status",
            "Weather data could not be loaded. Please try again later."
        );
    }
}

loadWeather();
