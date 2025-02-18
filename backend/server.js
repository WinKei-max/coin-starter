const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

// Route to fetch all coin data
app.get('/api/coins', async (req, res) => {
  try {
    // Fetch data from CoinGecko API
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd', // You can change this to another currency
        order: 'market_cap_desc', // Sorting by market cap
        per_page: 1000, // Number of coins per page
        page: 1, // Page number for pagination
      },
    });

    // Send response with coin data
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coin data', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});