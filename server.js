const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Route to handle tracking page views
app.post('/trackPageView', (req, res) => {
    const pageViewData = req.body;
    console.log('Page view tracked:', pageViewData);
    res.sendStatus(200);
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});