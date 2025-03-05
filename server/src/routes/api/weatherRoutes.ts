import { Router } from "express";
import { v4 as uuidv4 } from "uuid"; // Import uuid to generate unique IDs
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

const router = Router();

// POST Request to save city and retrieve weather data
router.post("/", async (req, res) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: "City is required" });
    }

    const weatherData = await WeatherService.getWeatherForCity(cityName);
    console.log("Weather Data from Weather Service:", weatherData);
    if (!weatherData) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    const currentWeather = {
      city: cityName, // Add city from the input
      date: new Date().toLocaleDateString(),
      icon: weatherData.icon || "default-icon",
      iconDescription: weatherData.description || "No description",
      tempC: weatherData.temp || 0,
      windSpeed: weatherData.windSpeed || 0,
      humidity: weatherData.humidity || 0,
    };

    // Add city to the history
    await HistoryService.addCity(cityName);

    // Declare the addedCity object
    const addedCity = {
      id: uuidv4(), // generate a new id for the city
      cityName: cityName,
    };

    // Return the weather data along with the addedCity
    return res.status(200).json({ weather: currentWeather, addedCity });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET search history
router.get("/history", async (_req, res) => {
  try {
    const history = await HistoryService.getCities(); // Fetch saved cities with IDs
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ error: "Failed to retrieve search history" });
  }
});

// DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    return res.status(200).json({ message: "City deleted" });
  } catch (error) {
    console.error("Error deleting city:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
