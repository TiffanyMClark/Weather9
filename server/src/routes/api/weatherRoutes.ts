import { Router } from "express";
const router = Router();
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// TODO: POST Request with city name to retrieve weather data
router.post("/", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const weatherData = await WeatherService.getWeatherForCity(city);
    if (!weatherData) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    await HistoryService.addCity(city);

    return res.status(200).json({ weather: weatherData });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: GET search history
router.get("/history", async (_req, res) => {
  try {
    const history = await HistoryService.getCities(); // Fetch saved cities
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ error: "Failed to retrieve search history" });
  }
});

// * BONUS TODO: DELETE city from search history
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
