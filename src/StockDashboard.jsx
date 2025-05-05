import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

// Define stock symbols to fetch
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];

export default function StockDashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedStock, setSelectedStock] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);

  // Function to fetch stock data using Alpha Vantage API
  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      
      const API_KEY = 'YOUR_API_KEY';
      
      // Create an array to store all the fetch promises
      const fetchPromises = DEFAULT_SYMBOLS.map(symbol => 
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
      );
      
      // Wait for all fetch operations to complete
      const results = await Promise.all(fetchPromises);
    //   console.log("response:", results);
      
      // Process the results
      const stockData = results.map((data, index) => {
        // Check if we got valid data or an error message
        if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
          const quote = data['Global Quote'];
          const symbol = quote['01. symbol'];
          const price = parseFloat(quote['05. price']);
          const previousClose = parseFloat(quote['08. previous close']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
          
          return {
            symbol,
            price,
            previousPrice: previousClose,
            changePercent,
            lastUpdated: quote['07. latest trading day'],
            volume: parseInt(quote['06. volume'], 10)
          };
        } else {
          // If we get an error or empty response, return a placeholder with error info
          return {
            symbol: DEFAULT_SYMBOLS[index],
            price: 0,
            previousPrice: 0,
            changePercent: 0,
            lastUpdated: new Date().toLocaleDateString(),
            error: true,
            errorMessage: data.Note || data.Information || 'Unable to fetch data'
          };
        }
      });
      
      setStocks(stockData);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again later.');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch time series data for a specific stock using Alpha Vantage API
  const fetchTimeSeriesData = async (symbol) => {
    setTimeSeriesLoading(true);
    
    try {
      const API_KEY = 'YOUR_API_KEY';
      
      // Fetch daily time series data for the selected stock
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got valid data or an error message
      if (data['Time Series (Daily)']) {
        const timeSeriesData = Object.entries(data['Time Series (Daily)']).map(([date, values]) => ({
          date,
          price: parseFloat(values['4. close'])
        }));
        
        // Sort by date (oldest to newest)
        timeSeriesData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Limit to the last 30 days if we have more data
        const limitedData = timeSeriesData.slice(-30);
        
        setTimeSeriesData(limitedData);
      } else {
        // If we get an error, log it and set an empty array
        console.error('Error in API response:', data);
        setTimeSeriesData([]);
      }
    } catch (err) {
      console.error('Error fetching time series data:', err);
      setTimeSeriesData([]);
    } finally {
      setTimeSeriesLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStockData();
    // In a real app, you might set up a refresh interval here
    // const interval = setInterval(fetchStockData, 60000);
    // return () => clearInterval(interval);
  }, []);

  // Fetch time series data when a stock is selected
  useEffect(() => {
    if (selectedStock) {
      fetchTimeSeriesData(selectedStock);
    }
  }, [selectedStock]);

  // Sorting function
  const sortedStocks = () => {
    let sortableStocks = [...stocks];
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      sortableStocks = sortableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return sortableStocks;
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Stock Price Dashboard</h1>
        <p className="text-gray-600">Track the latest stock prices and trends</p>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
          onClick={fetchStockData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Stock Table */}
        <div className="md:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Stock Prices</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('symbol')}
                    >
                      Symbol {getSortDirectionIndicator('symbol')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('price')}
                    >
                      Price {getSortDirectionIndicator('price')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('changePercent')}
                    >
                      Change % {getSortDirectionIndicator('changePercent')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStocks().length > 0 ? (
                    sortedStocks().map((stock) => (
                      <tr 
                        key={stock.symbol}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedStock === stock.symbol ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedStock(stock.symbol)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{stock.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stock.error ? (
                            <span className="text-red-500">Error</span>
                          ) : (
                            `${stock.price.toFixed(2)}`
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          stock.error ? 'text-red-500' : 
                          stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.error ? (
                            <span title={stock.errorMessage}>API Limit</span>
                          ) : (
                            `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No matching stocks found' : 'No stocks available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
        
        {/* Stock Chart */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedStock ? `${selectedStock} Price History` : 'Select a stock to view price history'}
            </h2>
          </div>
          
          <div className="p-4 h-80">
            {!selectedStock ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Click on a stock to view its price history
              </div>
            ) : timeSeriesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Features summary */}
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Dashboard Features</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Real-time stock data display with price and percent change</li>
          <li>Interactive chart showing 30-day price history</li>
          <li>Search functionality to filter stocks</li>
          <li>Sortable columns (click on column headers)</li>
          <li>Loading states for improved user experience</li>
          <li>Error handling for API failures</li>
          <li>Responsive design for all device sizes</li>
        </ul>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        
        <p className="mt-2">© {new Date().getFullYear()} Stock Dashboard Demo</p>
      </footer>
    </div>
  );
}