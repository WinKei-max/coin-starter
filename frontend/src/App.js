import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import ReactPaginate from 'react-paginate';
import './App.css';

// Utility function to format numbers with K and M suffix
function formatNumber(number) {
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1) + 'M'; // 1 million is M
  } else if (number >= 1_000) {
    return (number / 1_000).toFixed(1) + 'K'; // 1 thousand is K
  } else {
    return number; // Show price as is for smaller values
  }
}

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [pageNumber, setPageNumber] = useState(0); // Track current page
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const coinsPerPage = 20; // Number of coins per page
  const pagesVisited = pageNumber * coinsPerPage; // Calculate the starting index of the page

  const fetchCoinsData = () => {
    setInterval(() => {
      axios.get('http://localhost:5000/api/coins')
      .then(response => {
        console.log("Update New Prices");
        setCoins(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching coin data:', error);
        setLoading(false);
      });
    }, 100);
  };

  useEffect(() => {
    // Fetch coin data from the backend
    fetchCoinsData();
  }, []);


  const pageCount = Math.ceil(coins.length / coinsPerPage); // Calculate the number of pages

  // Slice the coins array based on the current page
  const displayedCoins = coins
    .filter(coin => coin.name.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
    .slice(pagesVisited, pagesVisited + coinsPerPage);

  // Handle page change
  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPageNumber(0); // Reset to first page when search changes
  };

  // Function to handle coin selection
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <div className="App">
      <h1 className="title">Cryptocurrency Prices</h1>

      <input
        type="text"
        placeholder="Search by Coin Name"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />

      {loading ? (
        <div className="loading-indicator">
          <img src="/loading-spinner.gif" alt="Loading..." />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Coin Data Table */}
          <div className="coin-table-container">
            <table className="coin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Market Cap</th>
                  <th>24h Change</th>
                  <th>Volume (24h)</th>
                  <th>Supply</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {displayedCoins.map(coin => (
                  <tr
                    key={coin.id}
                    className={selectedCoin?.id === coin.id ? 'selected-coin' : ''}
                    onClick={() => handleCoinSelect(coin)}
                  >
                    <td><img src={coin.image} alt={coin.name} className="coin-logo" /></td>
                    <td>{coin.name}</td>
                    <td>{coin.symbol.toUpperCase()}</td>
                    <td>${formatNumber(coin.current_price)}</td>
                    <td>${formatNumber(coin.market_cap)}</td>
                    <td className={coin.price_change_percentage_24h < 0 ? 'negative' : 'positive'}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td>{formatNumber(coin.total_volume)}</td>
                    <td>{formatNumber(coin.circulating_supply)}</td>
                    <td>{coin.market_cap_rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination-container">
              <ReactPaginate
                previousLabel={'← Previous'}
                nextLabel={'Next →'}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'previous-item'}
                nextClassName={'next-item'}
                disabledClassName={'disabled'}
                activeClassName={'active'}
              />
            </div>
          </div>

          {/* Coin Price History Chart */}
          {selectedCoin && (
            <div className="coin-chart-container">
              <CoinChart coinId={selectedCoin.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CoinChart({ coinId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch the historical data for the selected coin
    axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: '1', // Data for the last 1 day
      },
    })
    .then(response => {
      const prices = response.data.prices.map(([timestamp, price]) => ({
        x: new Date(timestamp),
        y: price,
      }));
      
      setChartData({
        labels: prices.map(p => p.x),
        datasets: [
          {
            label: 'Price (USD)',
            data: prices.map(p => p.y),
            borderColor: 'rgba(75, 192, 192, 1)', // Stylish border color
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light background color
            fill: true, // Fill the area under the curve
            pointRadius: 0, // Hide the points for a clean line chart
            tension: 0.3, // Smooth the line
          },
        ],
      });
    })
    .catch(error => {
      console.error('Error fetching coin chart data:', error);
    });
  }, [coinId]);

  if (!chartData) {
    return <p>Loading chart...</p>;
  }

  // Chart.js options for better styling and readability
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill the container
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'Pp', // Correct format string for date-fns
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        ticks: {
          callback: function (value) {
            return '$' + formatNumber(value); // Format y-axis tick values
          },
        },
        title: {
          display: true,
          text: 'Price (USD)',
        },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (tooltipItem) {
            return `$${tooltipItem.raw.toFixed(2)}`; // Format tooltips to show the price
          },
        },
      },
      legend: {
        labels: {
          font: {
            size: 14, // Increase the font size of the legend labels
          },
        },
      },
    },
  };

  return (
    <div className="coin-chart">
      <h3>Price History (24h)</h3>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default App;
