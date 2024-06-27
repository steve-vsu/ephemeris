/* 
AUTHOR: Steven Sauls
  The Ephemeris server initializes and connects to a MongoDB database, then starting middlewares (CORS, parsers).
  The server begins listening for API requests and uses CORS to verify the origin of each request.
  Once a POST request with userId, page, and location are received, Ephemeris logs it in the MongoDB.
 */

require('dotenv').config(); // Environment variables

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PageView = require("./models/PageView"); // Mongoose Schema for MongoDB Database

const app = express();
const PORT = process.env.PORT; // Set server's listening port.

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB using async/await with enhanced error handling
async function connectToDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process with failure code
  }
}

connectToDB();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse cookies
app.use(cookieParser());

// Configure CORS to allow requests from multiple origins
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Check if the origin is in the allowedOrigins list
      if (allowedOrigins.includes(origin) || origin.startsWith("file://")) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Route to handle tracking page views using async/await
app.post("/trackPageView", async (req, res) => {
  const { page, userId, location } = req.body;

  console.log(req.body);

  try {
    // Validate inputs
    if (!userId) {
      return res.status(400).send("User ID not found in cookies");
    }

    if (!page) {
      return res.status(400).send("Page data not provided");
    }

    // Sanitize inputs (example using a basic regex to allow only alphanumeric and limited characters)
    const sanitizedPage = page.replace(/[^a-zA-Z0-9-_/]/g, "");

       // Save page view data to MongoDB
    const newPageView = new PageView({
      userId,
      page: sanitizedPage,
      location: location || {}
    });
    await newPageView.save();

    console.log("Page view tracked:", { userId, sanitizedPage, location });

    res.sendStatus(200); // Respond with success status
  } catch (error) {
    console.error("Error tracking page view:", error);
    res.sendStatus(500); // Respond with server error status
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
