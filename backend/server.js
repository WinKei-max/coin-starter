import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// CEX API URLs
const cexApis = {
  binance: 'https://api.binance.com/api/v3/ticker/price',
  mexc: 'https://www.mexc.com/open/api/v2/market/ticker',
  kucoin: 'https://api.kucoin.com/api/v1/market/allTickers',
  coinbase: 'https://api.coinbase.com/v2/prices',
  bitfinex: 'https://api.bitfinex.com/v1/pubticker/',
};

// Route to fetch coin data for a specific CEX
app.get('/api/coin-data/:cex', async (req, res) => {
  const { cex } = req.params;

  if (!cexApis[cex]) {
    return res.status(400).json({ error: 'CEX not supported' });
  }

  try {
    const response = await axios.get(cexApis[cex]);
    let data = [];

    if (cex === 'binance') {
      data = response.data.map(coin => ({
        symbol: coin.symbol,
        price: coin.price,
      }));
    } else if (cex === 'mexc') {
      data = response.data.data.map(coin => ({
        symbol: coin.symbol,
        price: coin.bid,
      }));
    } else if (cex === 'kucoin') {
      data = response.data.data.ticker.map(coin => ({
        symbol: coin.symbol,
        price: coin.last,
      }));
    } else if (cex === 'coinbase') {
      data = [{ symbol: 'USD', price: response.data.data.amount }];
    } else if (cex === 'bitfinex') {
      data = [{ symbol: 'USD', price: response.data.ask }];
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching data: ', error);
    res.status(500).json({ error: 'Error fetching data from the CEX API' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
