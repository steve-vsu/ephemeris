const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const PageView = require("./models/PageView");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB using async/await with enhanced error handling
async function connectToDB() {
    try {
        await mongoose.connect(MONGO_URI);
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

// Configure CORS to allow requests from specific origins stored in .env
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Example protected route
app.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const pageViews = await PageView.find();
        res.json(pageViews);
    } catch (error) {
        res.status(500).send('Error fetching page views');
    }
});

// Route to handle tracking page views using async/await
app.post("/trackPageView", authenticateToken, async (req, res) => {
    const { page, userId, location } = req.body;

    console.log(req.body);

    try {
        if (!userId) {
            return res.status(400).send("User ID not found in request");
        }

        if (!page) {
            return res.status(400).send("Page data not provided");
        }

        const sanitizedPage = page.replace(/[^a-zA-Z0-9-_/\.]/g, "");

        const newPageView = new PageView({
            userId,
            page: sanitizedPage,
            location: location || {},
            device: req.body.device || "unknown"
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