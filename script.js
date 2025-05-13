const apiKey = "887ac095aee1bcb94eb614c678b45806";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=`;
const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");
const weatherIcon = document.querySelector(".weather-icon img");
const weather = document.querySelector(".weather");
const errorText = document.querySelector(".error");

// поисковик город
async function getCoordinates(city) {
    const geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const response = await fetch(geocodingApiUrl);
    const data = await response.json();
    if (data && data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
    } else {
        return null;
    }
}

// uv индекс
async function getUvIndex(lat, lon) {
    const uviApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(uviApiUrl);
    const data = await response.json();
    return data.value;
}

// качество воздуха
async function getAirQuality(lat, lon) {
    const airPollutionApiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(airPollutionApiUrl);
    const data = await response.json();
    if (data && data.list && data.list.length > 0) {
        return data.list[0].main.aqi;
    } else {
        return null;
    }
}

// получение координат
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Геолокация не поддерживается вашим браузером"));
        }
    });
}

// получение города по координатам
async function getCityFromCoordinates(lat, lon) {
    const reverseGeocodingUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(reverseGeocodingUrl);
    const data = await response.json();
    if (data && data.length > 0) {
        return data[0].name;
    }
    return null;
}
// проверка погоды
async function checkWeather(cityOrCoords) {
    let city;
    let coordinates;

    // проверка на город
    if (typeof cityOrCoords === 'string') {
        city = cityOrCoords;
        coordinates = await getCoordinates(city);
    } else if (cityOrCoords.city) {
        city = cityOrCoords.city;
        coordinates = {
            lat: cityOrCoords.lat,
            lon: cityOrCoords.lon
        };
    } else {
        coordinates = cityOrCoords;
        city = await getCityFromCoordinates(coordinates.lat, coordinates.lon);
    }

    // проверка на ошибку
    if (!city) {
        errorText.style.display = "block";
        weather.style.display = "none";
        return;
    }

    // получение погоды
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if (response.status === 404) {
        errorText.style.display = "block";
        weather.style.display = "none";
    } else {
        const weatherData = await response.json();
        console.log(weatherData);

        document.querySelector(".city").innerHTML = weatherData.name;
        document.querySelector(".status").innerHTML = weatherData.weather[0].main;
        document.querySelector(".temp").innerHTML =
            Math.round(weatherData.main.temp) + "°C";
        document.querySelector("#wind").innerHTML = weatherData.wind.speed + " km/h";

        // Получаем координаты
        const coordinates = await getCoordinates(city);
        if (coordinates) {
            const uvIndex = await getUvIndex(coordinates.lat, coordinates.lon);
            const airQuality = await getAirQuality(coordinates.lat, coordinates.lon);

            document.querySelector("#uv").innerHTML = uvIndex;
            document.querySelector("#air").innerHTML = airQuality;
        } else {
            document.querySelector("#uv").innerHTML = "Нет данных";
            document.querySelector("#air").innerHTML = "Нет данных";
        }

        // проверка на погоду
        if (weatherData.weather[0].main == "Clear") {
            weatherIcon.src = 'img/sunny.svg';
        } else if (weatherData.weather[0].main == "Rain") {
            weatherIcon.src = 'img/rainy.svg';
        } else if (weatherData.weather[0].main == "Clouds") {
            weatherIcon.src = 'img/cloud.svg';
        } else if (weatherData.weather[0].main == "Snow") {
            weatherIcon.src = 'img/snowy.svg';
        } else if (weatherData.weather[0].main == "Thunderstorm") {
            weatherIcon.src = 'img/thunderstorm.svg';
        }else if (weatherData.weather[0].main == "partly cloudy") {
            weatherIcon.src = 'img/partly_cloudy_day.svg';
        }else if (weatherData.weather[0].main == "weather mix") {
            weatherIcon.src = 'img/weather_mix.svg';
        } else {
            weatherIcon.src = 'images/sunny.svg';
        }
    }
}

// поиск по городу
searchButton.addEventListener("click", () => {
    checkWeather(searchInput.value);
    searchInput.value = "";
});

// поиск по городу
searchInput.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        checkWeather(searchInput.value);
        searchInput.value = "";
    }
});
});
