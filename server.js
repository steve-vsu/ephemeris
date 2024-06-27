const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PageView = require("./models/PageView"); // Ensure you have a PageView model defined

const app = express();
const PORT = 3000;

// MongoDB connection URI
const MONGO_URI = "mongodb://127.0.0.1:27017/trackingDB";

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

// Configure CORS to allow requests from local HTML files
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow requests from local files and specific domains
      if (origin === "null" || origin.startsWith("file://"))
        return callback(null, true);
      // Allow requests from localhost
      if (origin === "localhost" || origin === "http://localhost")
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Route to handle tracking page views using async/await
app.post("/trackPageView", async (req, res) => {
  const { page, userId } = req.body;

  console.log(userId, page);

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
    const newPageView = new PageView({ userId, page: sanitizedPage });
    await newPageView.save();

    console.log("Page view tracked:", { userId, sanitizedPage });

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
