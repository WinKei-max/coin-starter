import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

const App = () => {
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [selectedCEX1, setSelectedCEX1] = useState("binance");
  const [selectedCEX2, setSelectedCEX2] = useState("mexc");
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/prices");
        setPrices(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sortedData = prices
      .filter(
        (coin) =>
          coin[selectedCEX1] !== undefined && coin[selectedCEX2] !== undefined
      )
      .sort(
        (a, b) =>
          parseFloat(b.difference.replace("$", "")) -
          parseFloat(a.difference.replace("$", ""))
      );

    setFilteredPrices(sortedData);
  }, [prices, selectedCEX1, selectedCEX2]);

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredPrices.slice(indexOfFirstCoin, indexOfLastCoin);

  const totalPages = Math.ceil(filteredPrices.length / coinsPerPage);

  const handleImageError = (event) => {
    event.target.src = "https://via.placeholder.com/30";
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Crypto Arbitrage Price Comparison</h1>
      </div>

      {filteredPrices.length > 0 ? (
        <div className="most-different">
          Most Difference: {filteredPrices[0].coin} -{" "}
          {filteredPrices[0].difference} between{" "}
          {filteredPrices[0].maxExchange.toUpperCase()} &{" "}
          {filteredPrices[0].minExchange.toUpperCase()}
        </div>
      ) : (
        <div className="most-different">No price data available.</div>
      )}

      <div className="select-container">
        <select
          value={selectedCEX1}
          onChange={(e) => setSelectedCEX1(e.target.value)}
          disabled={selectedCEX1 === selectedCEX2}
        >
          <option value="binance">Binance</option>
          <option value="mexc">MEXC</option>
          <option value="kraken">Kraken</option>
          <option value="kucoin">KuCoin</option>
          <option value="coinbase">Coinbase</option>
          <option value="huobi">Huobi</option>
          <option value="bitfinex">Bitfinex</option>
        </select>

        <select
          value={selectedCEX2}
          onChange={(e) => setSelectedCEX2(e.target.value)}
          disabled={selectedCEX1 === selectedCEX2}
        >
          <option value="binance">Binance</option>
          <option value="mexc">MEXC</option>
          <option value="kraken">Kraken</option>
          <option value="kucoin">KuCoin</option>
          <option value="coinbase">Coinbase</option>
          <option value="huobi">Huobi</option>
          <option value="bitfinex">Bitfinex</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Coin</th>
              <th>{selectedCEX1.toUpperCase()}</th>
              <th>{selectedCEX2.toUpperCase()}</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {currentCoins.length > 0 ? (
              currentCoins.map((coin) => (
                <tr key={coin.coin}>
                  <td>
                    <img
                      src={coin.icon}
                      alt={coin.coin}
                      onError={handleImageError}
                    />
                  </td>
                  <td>{coin.coin}</td>
                  <td>{coin[selectedCEX1]}</td>
                  <td>{coin[selectedCEX2]}</td>
                  <td>{coin.difference}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No data to display.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredPrices.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
