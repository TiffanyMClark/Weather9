import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;

  constructor(temperature: number, description: string) {
    this.temperature = temperature;
    this.description = description;
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
    return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }
  private async fetchWeatherData(coordinates: Coordinates): Promise<Weather> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await axios.get(url);
    return this.parseCurrentWeather(response.data);
  }
  private parseCurrentWeather(response: any): Weather {
    return new Weather(response.main.temp, response.weather[0].description);
  }
  async getWeatherForCity(city: string): Promise<Weather> {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    return this.fetchWeatherData(coordinates);
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
      (data) => new Weather(data.main.temp, data.weather[0].description)
    );
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForecastForCity(city: string): Promise<Weather[]> {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    return this.fetchWeatherForecast(coordinates);
  }
}

export default new WeatherService();
