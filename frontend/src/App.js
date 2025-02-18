import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const App = () => {
  const [prices, setPrices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 20;

  // Fetch Prices and Update Only if Changed
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/prices");
      if (JSON.stringify(response.data) !== JSON.stringify(prices)) {
        setPrices(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Auto-fetch every 3 seconds without useEffect
  setInterval(fetchData, 3000);

  const totalPages = Math.ceil(prices.length / coinsPerPage);
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = prices.slice(indexOfFirstCoin, indexOfLastCoin);

  return (
    <div className="container">
      {/* Pagination at Top-Right */}
      <div className="pagination-container">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ◀ Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </button>
      </div>

      <h1>Crypto Arbitrage Price Comparison</h1>

      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Max Price</th>
            <th>Max Price CEX</th>
            <th>Min Price</th>
            <th>Min Price CEX</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {currentCoins.length > 0 ? (
            currentCoins.map((coin) => (
              <tr key={coin.coin}>
                <td>{coin.coin}</td>
                <td>{coin.maxPrice}</td>
                <td>{coin.maxExchange.toUpperCase()}</td>
                <td>{coin.minPrice}</td>
                <td>{coin.minExchange.toUpperCase()}</td>
                <td>{coin.difference}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data to display.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;
