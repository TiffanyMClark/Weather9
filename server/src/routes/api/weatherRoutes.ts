import { Router } from "express";
const router = Router();
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// TODO: POST Request with city name to retrieve weather data
router.post("/", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }
    const weatherData = await WeatherService.getWeather(city);
    // Save city to search history
    await HistoryService.saveSearch(city);
    res.json({ city, weather: weatherData });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

// TODO: GET search history
router.get("/history", async (req, res) => {
  try {
    const history = await HistoryService.getSearchHistory(); // Fixed naming issue
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve search history" });
  }
});
// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HistoryService.deleteSearch(id); // Fixed naming issue

    if (!deleted) {
      return res.status(404).json({ error: "City not found in history" });
    }

    res.json({ message: "City removed from history" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete city from history" });
  }
});
export default router;
