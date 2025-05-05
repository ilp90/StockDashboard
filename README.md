# Stock Dashboard

A modern, responsive stock price dashboard built with React, Tailwind CSS, and the Alpha Vantage API.

![Stock Dashboard Screenshot](https://via.placeholder.com/800x450?text=Stock+Dashboard+Screenshot)

## 🚀 Features

### Core Features
- **Real-time Stock Data**: Track current prices and daily changes for multiple stocks
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Optional Features Implemented
- ✅ **Interactive Price Charts**: View 30-day historical price data for any selected stock
- ✅ **Search & Sort Functionality**: Find stocks quickly with search bar and sort by clicking column headers
- ✅ **Loading States**: Visual spinners and indicators while fetching data
- ✅ **Error Handling**: Graceful handling of API failures and rate limits with user-friendly messages

## 📋 Requirements

- Node.js (v14+)
- npm or yarn
- Alpha Vantage API key (get one for free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

## 📋 Project Submission Details

This stock dashboard implements all the core requirements from the assignment:
- Fetches stock data from Alpha Vantage API
- Displays data in a responsive table with Tailwind CSS
- Ready for deployment to Vercel, Netlify, or GitHub Pages

Additionally, it includes ALL of the optional features:
1. **Loading States**: Implemented spinners during data fetching operations
2. **Charts**: Added interactive 30-day price history chart for selected stocks
3. **Search/Sorting**: Implemented search functionality and sortable columns
4. **Error Handling**: Added comprehensive error handling for API failures and rate limits

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ilp90/StockDashboard.git
   cd stock-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure your API key**
   - Open `src/StockDashboard.jsx`
   - Find the line `const API_KEY = 'YOUR_API_KEY';` (appears in two places)
   - Replace with your Alpha Vantage API key

## 🖥️ Usage

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Build for Production

Create an optimized build:
```bash
npm run build
# or
yarn build
```

## 🚀 Deployment

### Vercel

1. Push your code to a GitHub repository
2. Connect to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Deploy with default settings




## 📝 Notes on Alpha Vantage API

The free tier of Alpha Vantage API has the following limitations:
- 5 API calls per minute
- 500 API calls per day

The app is designed to handle these limits gracefully with proper error messages.

## 🛠️ Customization

### Default Stock Symbols

Modify the `DEFAULT_SYMBOLS` array in `src/StockDashboard.jsx` to track different stocks:

```javascript
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
```

### UI Customization

The application uses Tailwind CSS for styling. You can customize the appearance by modifying the relevant className attributes in the JSX.


## 📄 License

This project is licensed under the MIT License 

## 👨‍💻 Author

Created by Ishit Pradhan

