const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 5000;

const EXCHANGES = {
  binance: "https://api.binance.com/api/v3/ticker/price",
  mexc: "https://www.mexc.com/open/api/v2/market/ticker",
  kraken: "https://api.kraken.com/0/public/Ticker?pair=",
  kucoin: "https://api.kucoin.com/api/v1/market/allTickers",
  coinbase: "https://api.coinbase.com/v2/prices/spot?currency=USD",
  huobi: "https://api.huobi.pro/market/tickers",
  bitfinex: "https://api-pub.bitfinex.com/v2/tickers?symbols=ALL"
};

// Fetch Prices with Retry
const fetchWithRetry = async (url, retries = 3) => {
  while (retries > 0) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${url}: ${error.message}`);
      retries--;
      if (retries === 0) return null;
    }
  }
};

const fetchPrices = async () => {
  try {
    const responses = await Promise.allSettled(
      Object.entries(EXCHANGES).map(async ([exchange, url]) => {
        const data = await fetchWithRetry(url);
        return { exchange, data };
      })
    );

    let prices = {};

    responses.forEach((result) => {
      if (result.status === "fulfilled" && result.value.data) {
        const { exchange, data } = result.value;
        if (!data) return;

        if (exchange === "binance" && Array.isArray(data)) {
          data.forEach((item) => {
            if (!prices[item.symbol]) prices[item.symbol] = {};
            prices[item.symbol][exchange] = item.price + "$";
          });
        } else if (exchange === "mexc" && data.data) {
          data.data.forEach((item) => {
            const symbol = item.symbol.toUpperCase();
            if (!prices[symbol]) prices[symbol] = {};
            prices[symbol][exchange] = item.last + "$";
          });
        } else if (exchange === "kraken" && data.result) {
          Object.keys(data.result).forEach((symbol) => {
            if (!prices[symbol]) prices[symbol] = {};
            prices[symbol][exchange] = data.result[symbol].c[0] + "$";
          });
        } else if (exchange === "kucoin" && data.data?.ticker) {
          data.data.ticker.forEach((item) => {
            if (!prices[item.symbol]) prices[item.symbol] = {};
            prices[item.symbol][exchange] = item.last + "$";
          });
        } else if (exchange === "coinbase" && data.data?.amount) {
          if (!prices["BTC-USD"]) prices["BTC-USD"] = {};
          prices["BTC-USD"][exchange] = data.data.amount + "$";
        } else if (exchange === "huobi" && data.data) {
          data.data.forEach((item) => {
            const symbol = item.symbol.toUpperCase();
            if (!prices[symbol]) prices[symbol] = {};
            prices[symbol][exchange] = item.close + "$";
          });
        } else if (exchange === "bitfinex" && Array.isArray(data)) {
          data.forEach((item) => {
            const symbol = item[0].substring(1);
            if (!prices[symbol]) prices[symbol] = {};
            prices[symbol][exchange] = item[7] + "$";
          });
        }
      }
    });

    return Object.keys(prices)
      .map((symbol) => {
        const exchanges = Object.keys(prices[symbol]);

        // Only include coins that exist on **all** exchanges
        if (exchanges.length < Object.keys(EXCHANGES).length) return null;

        let maxPrice = -Infinity,
          minPrice = Infinity,
          maxExchange = "",
          minExchange = "";

        exchanges.forEach((exchange) => {
          const price = parseFloat(prices[symbol][exchange].replace("$", ""));
          if (price > maxPrice) {
            maxPrice = price;
            maxExchange = exchange;
          }
          if (price < minPrice) {
            minPrice = price;
            minExchange = exchange;
          }
        });

        return {
          coin: symbol,
          ...prices[symbol],
          difference: (maxPrice - minPrice).toFixed(2) + "$",
          maxExchange,
          minExchange,
          icon: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/50`
        };
      })
      .filter((item) => item !== null) // Remove nulls
      .sort((a, b) => parseFloat(b.difference.replace("$", "")) - parseFloat(a.difference.replace("$", ""))); // Sort by difference
  } catch (error) {
    console.error("Error fetching prices:", error);
    return [];
  }
};

app.get("/prices", async (req, res) => {
  const priceData = await fetchPrices();
  res.json(priceData);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
