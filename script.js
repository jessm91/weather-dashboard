var cityList = [];
var cityName;

initCityList();
initWeather();

function renderCities() {
    $("#cityList").empty();
    $("#cityInput").val("");

    for (i = 0; i < cityList.length; i++) {
        var a = $("<a>");
        a.addClass("list-group-item list-group-item-action list-group-item-primary city");
        a.attr("data-name", cityList[i]);
        a.text(cityList[i]);
        $("#cityList").prepend(a);
    }
}

function initCityList() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null) {
        cityList = storedCities;
    }
    renderCities();
}

function initWeather() {
    var storedWeather = JSON.parse(localStorage.getItem("currentCity"));

    if (storedWeather !== null) {
        cityName = storedWeather;

        displayWeather();
        displayFiveDayForecast();
    }
}

function storeCityArray() {
    localStorage.setItem("cities", JSON.stringify(cityList));
}

function storeCurrentCity() {
    localStorage.setItem("currentCity", JSON.stringify(cityName));
}

$("#citySearchBtn").on("click", function(event) {
    event.preventDefault();

    cityName = $("#cityInput").val().trim();
    if(cityName === "") {
        alert("Please enter a city to look up")
    } else if (cityList.length >= 5) {
        cityList.shift();
        cityList.push(cityName);
    } else {
        cityList.push(cityName);
    }
    storeCurrentCity();
    storeCityArray();
    renderCities();
    displayWeather();
    displayFiveDayForecast();
})

$("#cityInput").keypress(function(e) {
    if(e.which === 13) {
        $("#citySearchBtn").click();
    }
})

async function displayWeather() {
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=d3b85d453bf90d469c82e650a0a3da26";

    var response = await $.ajax({
        url: queryUrl,
        method: "GET"
    })

    var currentWeatherDiv = $("<div class='card-body' id='currentWeather'>");
    var getCurrentCity = response.name;
    var date = new Date();
    var val = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
    var getCurrentWeatherIcon = response.weather[0].icon;
    var displayCurrentWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + "@2x.png />");
    var currentCityEl = $("<h3 class='card-body'>").text(getCurrentCity+" ("+val+")");
    currentCityEl.append(displayCurrentWeatherIcon);
    currentWeatherDiv.append(currentCityEl);
    var getTemp = response.main.temp.toFixed(1);
    var tempEl = $("<p class='card-text'>").text("Temperature: "+getTemp+"° F");
    currentWeatherDiv.append(tempEl);
    var getHumidity = response.main.humidity;
    var humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
    currentWeatherDiv.append(humidityEl);
    var getWindSpeed = response.wind.speed.toFixed(1);
    var windSpeedEl = $("<p class='card-text'>").text("Wind Speed: "+getWindSpeed+" mph");
    currentWeatherDiv.append(windSpeedEl);
    var getLong = response.coord.lon;
    var getLat = response.coord.lat;

    var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=d3b85d453bf90d469c82e650a0a3da26&lat="+getLat+"&lon="+getLong;
    var uvResponse = await $.ajax({
        url: uvUrl,
        method: "GET"
    })

    var getUvIndex = uvResponse.value;
    var uvNumber = $("<span>");
    if (getUvIndex > 0 && getUvIndex <= 5.99) {
        uvNumber.addClass("favorable");
    } else if (getUvIndex >= 5.99 && getUvIndex <= 10.99){
        uvNumber.addClass("moderate");
    } else {
        uvNumber.addClass("severe");
    }
    uvNumber.text(getUvIndex);
    var uvIndexEl = $("<p class='card-text'>").text("UV Index: ");
    uvNumber.appendTo(uvIndexEl);
    currentWeatherDiv.append(uvIndexEl);
    $("#weatherContainer").html(currentWeatherDiv);
}

async function displayFiveDayForecast() {
    var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&units=imperial&appid=d3b85d453bf90d469c82e650a0a3da26";
    var response = await $.ajax({
        url: queryUrl,
        method: "GET"
    })
    var forecastDiv = $("<div id='fiveDayForecast'>");
    var forecastHeader = $("<h5 class='card-header border-secondary'>").text("5 Day Forecast");
    forecastDiv.append(forecastHeader);
    var cardDeck = $("<div class='card-deck'>");
    forecastDiv.append(cardDeck);

    for (i = 0; i < 5; i++) {
        var forecastCard = $("<div class='card mb-3 mt-3'>");
        var cardBody = $("<div class='card-body'>");
        var date = new Date ();
        var val = (date.getMonth()+1)+"/"+(date.getDate()+i+1)+"/"+date.getFullYear();
        var forecastDate = $("<h5 class='card-title'>").text(val);

        cardBody.append(forecastDate);
        var getCurrentWeatherIcon = response.list[i].weather[0].icon;
        var displayWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + ".png />");
        cardBody.append(displayWeatherIcon);
        var getTemp = response.list[i].main.temp;
        var tempEl = $("<p class='card-text'>").text("Temp: "+getTemp+"° F");
        cardBody.append(tempEl);
        var getHumidity = response.list[i].main.humidity;
        var humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
        cardBody.append(humidityEl);
        forecastCard.append(cardBody);
        cardDeck.append(forecastCard);
    }
    $("#forecastContainer").html(forecastDiv);
}

function historyDisplayWeather() {
    cityName = $(this).attr("data-name");
    displayWeather();
    displayFiveDayForecast();
}
$(document).on("click", ".city", historyDisplayWeather);