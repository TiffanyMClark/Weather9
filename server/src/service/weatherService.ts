import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

// Define an interface for the Coordinates object
interface WeatherAPIResponse {
  main: { temp: number; feels_like: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
}
interface Coordinates {
  cityName: string;
  lat: number;
  lon: number;
  state: string;
  country: string;
}

// Define a class for the Weather object
class Weather {
  cityName: string;
  date: string;
  description: string;
  feelsLike: number;
  humidity: number;
  icon: string;
  temp: number;
  windSpeed: number;

  constructor(
    cityName: string,
    date: string,
    description: string,
    feelsLike: number,
    humidity: number,
    icon: string,
    temp: number,
    windSpeed: number
  ) {
    this.cityName = cityName;
    this.date = date;
    this.description = description;
    this.feelsLike = feelsLike;
    this.humidity = humidity;
    this.icon = icon;
    this.temp = temp;
    this.windSpeed = windSpeed;
  }
}

// WeatherService class
class WeatherService {
  private apiBaseUrl: string = process.env.API_BASE_URL || "";
  private apiKey: string = process.env.API_KEY || "";

  // Method to get weather for a city
  async getWeatherForCity(city: string): Promise<Weather> {
    try {
      const normalizedCity = city.toLowerCase().trim();
      const locationData = await this.fetchLocationData(normalizedCity);
      console.log("Location Data:", locationData);

      if (!locationData || !locationData.lat || !locationData.lon) {
        throw new Error("Location data is invalid or not found.");
      }

      const coordinates = this.destructureLocationData(locationData);
      const weatherData = await this.fetchWeatherData(coordinates);

      if (!weatherData) {
        throw new Error("Weather data could not be fetched.");
      }

      return weatherData;
    } catch (error) {
      console.error(`Error fetching weather for city: ${city}`, error);
      throw new Error(`Unable to fetch weather for city: ${city}`);
    }
  }

  // Fetch location data for the city
  private async fetchLocationData(city: string): Promise<any> {
    const url = this.buildGeocodeQuery(city);
    const response = await axios.get(url);
    console.log("Geocode API Response for city:", city, response.data);

    if (!response.data || response.data.length === 0) {
      console.error("No results found for city:", city);
      throw new Error("No results found for city");
    }

    // Ensure that the cityName is correctly passed
    const locationData = response.data[0];
    const cityName = locationData.name || city; // Default to original city if missing
    return { ...locationData, cityName }; // Return the cityName with the rest of the location data
  }

  // Destructure location data to get coordinates
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { cityName, lat, lon, state, country } = locationData;
    return { cityName, lat, lon, state, country };
  }

  // Build geocode query URL
  private buildGeocodeQuery(city: string): string {
    const encodedCity = encodeURIComponent(city);
    return `${this.apiBaseUrl}/geo/1.0/direct?q=${encodedCity}&limit=1&appid=${this.apiKey}`;
  }

  // Build weather query URL
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<Weather> {
    try {
      const url = this.buildWeatherQuery(coordinates);
      console.log("Fetching weather data from:", url);
      const response = await axios.get<WeatherAPIResponse>(url);
      console.log("Weather API Response:", response.data);

      const { main, weather, wind } = response.data;
      if (!main || !weather || !weather.length || !wind) {
        console.error("Missing data in weather response:", response.data);
        throw new Error("Malformed weather data response.");
      }

      return this.parseCurrentWeather(
        coordinates.cityName,
        main,
        weather,
        wind
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error in fetchWeatherData:", error.message);
        throw new Error("Failed to fetch weather data.");
      } else {
        console.error("An unknown error occurred:", error);
        throw new Error(
          "An unknown error occurred while fetching weather data."
        );
      }
    }
  }

  // Parse current weather data
  private parseCurrentWeather(
    cityName: string, // Ensure that cityName is passed correctly
    main: { temp: number; humidity: number; feels_like: number },
    weather: Array<{ description: string; icon: string }>,
    wind: { speed: number }
  ): Weather {
    const description = weather[0].description || "No description";
    const icon = weather[0].icon || "default-icon";
    const temp = main.temp || 0;
    const humidity = main.humidity || 0;
    const windSpeed = wind.speed || 0;

    // Ensure that cityName is passed correctly
    return new Weather(
      cityName || "Unknown City", // Default to "Unknown City" if undefined
      new Date().toISOString(),
      description,
      main.feels_like || 0,
      humidity,
      icon,
      temp,
      windSpeed
    );
  }
  // Fetch weather forecast
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.apiBaseUrl}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch weather forecast data
  private async fetchWeatherForecast(
    coordinates: Coordinates
  ): Promise<Weather[]> {
    const url = this.buildForecastQuery(coordinates);
    const response = await axios.get(url);
    console.log("Weather Forecast API Response:", response.data);

    return this.buildForecastArray(response.data.list, response.data.city.name);
  }

  // Build weather forecast array
  private buildForecastArray(forecastData: any[], cityName: string): Weather[] {
    return forecastData.map((data) => {
      return new Weather(
        cityName,
        new Date(data.dt * 1000).toISOString(),
        data.weather[0].description,
        data.main.feels_like,
        data.main.humidity,
        data.weather[0].icon,
        data.main.temp,
        data.wind.speed
      );
    });
  }

  // Method to get weather forecast for a city
  async getWeatherForecastForCity(city: string): Promise<Weather[]> {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const forecastData = await this.fetchWeatherForecast(coordinates);
    return forecastData;
  }
}

export default new WeatherService();
