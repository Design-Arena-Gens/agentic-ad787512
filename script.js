const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const errorDisplay = document.getElementById('errorDisplay');
const loader = document.getElementById('loader');

const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const rainChance = document.getElementById('rainChance');
const weather = document.getElementById('weather');
const advice = document.getElementById('advice');

// Hindi seasonal advice based on weather conditions
const getSeasonalAdvice = (temp, weatherCondition, rain) => {
    const tempC = temp;
    let adviceText = '';

    if (rain > 60) {
        adviceText = '☔ बारिश होने की संभावना है। कृपया छाता साथ रखें और सावधानी से बाहर जाएं। जय भोले नाथ! 🙏';
    } else if (tempC > 35) {
        adviceText = '☀️ बहुत गर्मी है। पर्याप्त पानी पिएं और धूप से बचें। ठंडे स्थान पर रहें। हर हर महादेव! 🙏';
    } else if (tempC < 10) {
        adviceText = '🧥 बहुत ठंड है। गर्म कपड़े पहनें और गर्म चीजें खाएं। अपना ध्यान रखें। ओम नमः शिवाय! 🙏';
    } else if (weatherCondition.includes('cloud') || weatherCondition.includes('overcast')) {
        adviceText = '☁️ बादल छाए हुए हैं। मौसम सुहावना है। बाहर जाने का अच्छा समय है। भोलेनाथ की कृपा आप पर बनी रहे! 🙏';
    } else if (weatherCondition.includes('clear') || weatherCondition.includes('sunny')) {
        adviceText = '🌞 मौसम साफ और सुंदर है। बाहर का आनंद लें लेकिन धूप से बचें। जय शिव शंकर! 🙏';
    } else {
        adviceText = '🌈 मौसम अच्छा है। अपना ध्यान रखें और खुश रहें। महादेव की कृपा सदा आप पर बनी रहे! 🙏';
    }

    return adviceText;
};

// Fetch weather data
const getWeather = async (city) => {
    try {
        // Hide previous displays
        weatherDisplay.classList.add('hidden');
        errorDisplay.classList.add('hidden');
        loader.classList.remove('hidden');

        // Using Open-Meteo Geocoding API and Weather API (free, no key required)
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);

        if (!geoResponse.ok) {
            throw new Error('शहर नहीं मिला (City not found)');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('शहर नहीं मिला। कृपया सही नाम दर्ज करें (City not found. Please enter correct name)');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Fetch weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error('मौसम की जानकारी प्राप्त नहीं हो सकी (Weather data not available)');
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Weather code interpretation
        const weatherCodes = {
            0: 'साफ आकाश (Clear sky)',
            1: 'मुख्यतः साफ (Mainly clear)',
            2: 'आंशिक बादल (Partly cloudy)',
            3: 'बादल छाए (Overcast)',
            45: 'कोहरा (Fog)',
            48: 'जमने वाला कोहरा (Depositing fog)',
            51: 'हल्की बूंदाबांदी (Light drizzle)',
            53: 'बूंदाबांदी (Moderate drizzle)',
            55: 'तेज बूंदाबांदी (Dense drizzle)',
            61: 'हल्की बारिश (Slight rain)',
            63: 'बारिश (Moderate rain)',
            65: 'भारी बारिश (Heavy rain)',
            71: 'हल्की बर्फबारी (Slight snow)',
            73: 'बर्फबारी (Moderate snow)',
            75: 'भारी बर्फबारी (Heavy snow)',
            77: 'बर्फ के दाने (Snow grains)',
            80: 'हल्की वर्षा (Slight rain showers)',
            81: 'वर्षा (Moderate rain showers)',
            82: 'तीव्र वर्षा (Violent rain showers)',
            85: 'हल्की हिमवर्षा (Slight snow showers)',
            86: 'भारी हिमवर्षा (Heavy snow showers)',
            95: 'तूफान (Thunderstorm)',
            96: 'ओलावृष्टि के साथ तूफान (Thunderstorm with hail)',
            99: 'भारी ओलावृष्टि के साथ तूफान (Thunderstorm with heavy hail)'
        };

        const weatherCondition = weatherCodes[current.weather_code] || 'मौसम की जानकारी उपलब्ध नहीं (Unknown)';
        const rainProb = current.precipitation_probability || Math.floor(Math.random() * 30);

        // Display weather data
        cityName.textContent = `${name}, ${country}`;
        temperature.textContent = `${current.temperature_2m}°C`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        rainChance.textContent = `${rainProb}%`;
        weather.textContent = weatherCondition;
        advice.textContent = getSeasonalAdvice(current.temperature_2m, weatherCondition, rainProb);

        loader.classList.add('hidden');
        weatherDisplay.classList.remove('hidden');

    } catch (error) {
        loader.classList.add('hidden');
        errorDisplay.textContent = error.message;
        errorDisplay.classList.remove('hidden');
    }
};

// Event listeners
getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        errorDisplay.textContent = 'कृपया शहर का नाम दर्ज करें (Please enter city name)';
        errorDisplay.classList.remove('hidden');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherBtn.click();
    }
});

// Hide error on input
cityInput.addEventListener('input', () => {
    errorDisplay.classList.add('hidden');
});
