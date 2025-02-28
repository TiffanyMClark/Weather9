import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface WeatherAPIResponse {
  main: { temp: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
}
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;

  constructor(
    temperature: number,
    description: string,
    icon: string,
    windSpeed: number,
    humidity: number
  ) {
    this.temperature = temperature;
    this.description = description;
    this.icon = icon;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = "https://api.openweathermap.org";
    this.apiKey = process.env.WEATHER_API_KEY || "";
  }
  // TODO: Define the baseURL, API key, and city name properties
  // TODO: Create fetchLocationData method
  private async fetchLocationData(city: string): Promise<any> {
    const url = this.buildGeocodeQuery(city);
    const response = await axios.get(url);
    console.log("Geocode API Response for city:", city, response.data);

    if (!response.data || response.data.length === 0) {
      console.error("No results found for city:", city);
    }

    return response.data[0];
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    const encodedCity = encodeURIComponent(city); // Encode the city name
    const query = `${this.baseURL}/geo/1.0/direct?q=${encodedCity}&limit=1&appid=${this.apiKey}`;
    console.log("Geocode Query:", query); // Log the generated query
    return query;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
    console.log("Weather Query:", query); // Log the generated query
    return query;
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<Weather> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await axios.get<WeatherAPIResponse>(url);
    console.log("API Response:", response.data);

    if (
      !response.data ||
      !response.data.main ||
      !response.data.weather ||
      response.data.weather.length === 0
    ) {
      throw new Error("Weather data is missing or malformed.");
    }

    return this.parseCurrentWeather(response.data);
  }
  private parseCurrentWeather(response: any): Weather {
    if (!response.main || !response.weather || response.weather.length === 0) {
      throw new Error("Weather data is incomplete.");
    }

    return new Weather(
      response.main.temp,
      response.weather[0].description,
      response.weather[0].icon,
      response.wind.speed,
      response.main.humidity
    );
  }
  async getWeatherForCity(city: string): Promise<Weather> {
    try {
      const normalizedCity = city.toLowerCase().trim();

      const locationData = await this.fetchLocationData(normalizedCity);
      console.log("Location Data:", locationData);
      // Check if location data is valid
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
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }
  private async fetchWeatherForecast(
    coordinates: Coordinates
  ): Promise<Weather[]> {
    const url = this.buildForecastQuery(coordinates);
    const response = await axios.get(url);
    return this.buildForecastArray(response.data.list);
  }
  private buildForecastArray(forecastData: any[]): Weather[] {
    return forecastData.map(
      (data) =>
        new Weather(
          data.main.temp,
          data.weather[0].description,
          data.weather[0].icon,
          data.wind.speed,
          data.main.humidity
        )
    );
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForecastForCity(city: string): Promise<Weather[]> {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const forecastData = await this.fetchWeatherForecast(coordinates);
    return forecastData;
  }
}

export default new WeatherService();
