import dotenv from "dotenv";
import express from "express";
dotenv.config();

// Import the routes
import routes from "./routes/index.js";
import bodyParser from "body-parser";

const app = express();

const PORT = process.env.PORT || 3001;

// Serve static files of entire client dist folder
app.use(express.static(`../client/dist`));

// Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
function urlencoded(options: { extended: boolean }) {
  return bodyParser.urlencoded(options);
}
app.use(urlencoded({ extended: true }));

// Implement middleware to connect the routes
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
app.use(bodyParser.urlencoded({ extended: true }));
