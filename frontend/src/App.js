import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [selectedCEX, setSelectedCEX] = useState('binance');
  const [coinData, setCoinData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 10;

  const cexApis = {
    binance: 'binance',
    mexc: 'mexc',
    kucoin: 'kucoin',
    coinbase: 'coinbase',
    bitfinex: 'bitfinex',
  };

  const fetchCoinData = async (cex) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/coin-data/${cex}`);
      setCoinData(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCoinData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (cex) => {
    setSelectedCEX(cex);
    fetchCoinData(cex);
    setCurrentPage(1); // Reset to the first page on tab switch
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredData = coinData.filter(coin =>
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredData.slice(indexOfFirstCoin, indexOfLastCoin);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Crypto Price Tracker</h1>
      </header>

      <div className="tabs">
        {Object.keys(cexApis).map(cex => (
          <button
            key={cex}
            className={`tab-button ${selectedCEX === cex ? 'active' : ''}`}
            onClick={() => handleTabClick(cex)}
          >
            {cex.toUpperCase()}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by coin symbol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="coin-list">
          {currentCoins.length > 0 ? (
            currentCoins.map((coin, index) => (
              <div className="coin-item" key={index}>
                <span className="coin-symbol">{coin.symbol}</span>
                <span className="coin-price">${coin.price}</span>
              </div>
            ))
          ) : (
            <p>No coins found</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredData.length > coinsPerPage && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-number">{`Page ${currentPage}`}</span>
          <button
            className="page-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * coinsPerPage >= filteredData.length}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
