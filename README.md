# 📈 Interactive Stock Chart Application

A modern web application that displays real-time stock data with interactive charts. The application consists of a Python Flask backend that fetches data from Yahoo Finance and a TypeScript frontend with beautiful visualizations.

## 🚀 Features

- **Real-time Stock Data**: Fetches live stock data from Yahoo Finance using the `yfinance` library
- **Interactive Charts**: Beautiful, responsive charts built with Chart.js
- **Multiple Time Ranges**: View stock data from 1 month to 5 years
- **Stock Search**: Search for any stock by symbol (e.g., AAPL, GOOGL, TSLA)
- **Stock Information**: Display company details, sector, industry, and market cap
- **Price Changes**: Visual indicators for price increases/decreases
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

The application is split into two main components:

### Backend (Python/Flask)
- **Framework**: Flask with CORS support
- **Data Source**: Yahoo Finance via `yfinance` library
- **API Endpoints**: RESTful API for stock data and search
- **Port**: 5001

### Frontend (TypeScript/Vite)
- **Framework**: Vanilla TypeScript with Vite build tool
- **Charts**: Chart.js with date-fns for date handling
- **Styling**: Modern CSS with glassmorphism effects
- **Port**: 5173 (Vite dev server)

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5001`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 API Endpoints

### GET /api/stock-data
Fetch historical stock data for a given symbol.

**Query Parameters:**
- `symbol` (optional): Stock symbol (default: AAPL)
- `period` (optional): Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
- `interval` (optional): Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)

**Example:**
```
GET /api/stock-data?symbol=AAPL&period=6mo&interval=1d
```

### GET /api/search-stocks
Search for stocks by symbol or company name.

**Query Parameters:**
- `query` (required): Search query string

**Example:**
```
GET /api/search-stocks?query=apple
```

### GET /api/health
Health check endpoint.

## 🎨 Features

### Chart Types
- **Line Chart**: Standard line chart showing price trends
- **Area Chart**: Filled area chart for better visual impact
- **Spline Chart**: Smooth curved lines for elegant presentation

### Time Ranges
- 1 Month
- 3 Months
- 6 Months (default)
- 1 Year
- 2 Years
- 5 Years

### Animation Speeds
- Slow (2 seconds)
- Normal (1 second)
- Fast (0.5 seconds)

## 📱 Usage

1. **Search for a Stock**: Enter a stock symbol in the search box (e.g., AAPL, GOOGL, TSLA)
2. **View Stock Info**: See company details, sector, and current price
3. **Adjust Time Range**: Select different time periods to view historical data
4. **Change Chart Type**: Switch between line, area, and spline charts
5. **Control Animation**: Adjust animation speed for chart transitions
6. **View Recent Data**: Scroll through the latest 10 trading days with price changes

## 🛠️ Development

### Project Structure
```
ai_news_chart/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── frontend/
│   ├── main.ts            # Main TypeScript application
│   ├── index.html         # HTML template
│   ├── styles.css         # CSS styles
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
└── README.md              # This file
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
The Flask app can be deployed using any WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the Flask server is running on port 5001
2. **Stock Data Not Loading**: Check if the stock symbol is valid
3. **CORS Errors**: The backend includes CORS headers, but ensure both servers are running
4. **Chart Not Rendering**: Check browser console for JavaScript errors

### Debug Mode

To enable debug mode for the backend:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

## 📊 Data Source

This application uses Yahoo Finance data through the `yfinance` Python library. The data includes:
- Open, High, Low, Close prices
- Trading volume
- Company information
- Market capitalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Yahoo Finance](https://finance.yahoo.com/) for providing stock data
- [Chart.js](https://www.chartjs.org/) for the charting library
- [yfinance](https://github.com/ranaroussi/yfinance) for the Python Yahoo Finance library
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Vite](https://vitejs.dev/) for the build tool 