// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import our database connection module

const app = express();
const PORT = process.env.PORT || 3001;

// Enable Cross-Origin Resource Sharing so our frontend can call the API
app.use(cors());

/**
 * API Endpoint: GET /api/coins
 * Fetches a list of all coins from the database, ordered by creation time.
 */
app.get('/api/coins', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM coins ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error("Error fetching coins:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * API Endpoint: GET /api/trades/:curveAddress
 * Fetches the trade history for a specific coin's bonding curve.
 */
app.get('/api/trades/:curveAddress', async (req, res) => {
    const { curveAddress } = req.params;
    try {
        const { rows } = await db.query(
            'SELECT * FROM trades WHERE bonding_curve_address = $1 ORDER BY timestamp ASC', 
            [curveAddress]
        );
        res.json(rows);
    } catch (err) {
        console.error(`Error fetching trades for ${curveAddress}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
});