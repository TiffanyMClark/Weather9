import { Router } from "express";
import historyService from "../../service/historyService";
import weatherService from "../../service/weatherService";
const router = Router();

// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post("/", (req, res) => {
  // TODO: GET weather data from city name
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }
    const weatherData = await weatherService.getWeather(city);
    // TODO: save city to search history
    await historyService.saveSearch(city);
    res.json({ city, weather: weatherData });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

// TODO: GET search history
router.get("/history", async (req, res) => {
  try {
    const history = await historyService.getSearchHistory();
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve search history" });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await historyService.deleteSearch(id);

    if (!deleted) {
      return res.status(404).json({ error: "City not found in history" });
    }

    res.json({ message: "City removed from history" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete city from history" });
  }
});
export default router;
