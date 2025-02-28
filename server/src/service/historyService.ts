import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
// TODO: Define a City class with name and id properties
class City {
  id: string;
  name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
export { City };

// TODO: Complete the HistoryService class
class HistoryService {
  private filePath: string;
  constructor() {
    this.filePath = path.resolve(__dirname, "serverdbsearchHistory.json");
  }

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      if (!(await fileExists(this.filePath))) {
        await fs.writeFile(this.filePath, "[]"); // Make one if there isn't one already
        return [];
      }
      const data = await fs.readFile(this.filePath, "utf-8");
      const citiesData = JSON.parse(data);
      return citiesData.map(
        (city: { id: string; name: string }) => new City(city.id, city.name)
      );
    } catch (error) {
      console.error("Error reading the file:", error);
      throw new Error("Failed to retrieve search history");
    }
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async writeHistory(cities: City[]): Promise<void> {
    console.log("Writing cities to file:", cities);
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return this.read();
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string): Promise<void> {
    const trimmedCityName = cityName.trim();
    if (!trimmedCityName) {
      throw new Error("City name cannot be empty.");
    }
    const cities = await this.read();
    if (
      cities.some(
        (city) => city.name.toLowerCase() === trimmedCityName.toLowerCase()
      )
    ) {
      return;
    }

    const newCity = new City(uuidv4(), trimmedCityName);
    cities.push(newCity);

    await this.writeHistory(cities);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);

    await this.writeHistory(updatedCities);
  }
}

export default new HistoryService();
