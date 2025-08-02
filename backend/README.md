# Stock Chart Backend

A Flask-based backend API that fetches real-time stock data from Yahoo Finance using the `yfinance` library.

## Features

- Fetch historical stock data with customizable time periods
- Search for stocks by symbol or company name
- Real-time data from Yahoo Finance
- RESTful API endpoints
- CORS enabled for frontend integration

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

The server will start on `http://localhost:5001`

## API Endpoints

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

## Response Format

### Stock Data Response
```json
{
  "success": true,
  "stock_info": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "market_cap": 3000000000000,
    "current_price": 150.25
  },
  "data": [
    {
      "date": "2024-01-01",
      "open": 150.00,
      "high": 152.50,
      "low": 149.75,
      "close": 151.25,
      "volume": 1000000
    }
  ],
  "period": "6mo",
  "interval": "1d"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request (missing required parameters)
- `404`: Not Found (stock symbol not found)
- `500`: Internal Server Error (API or network issues)

## Dependencies

- `yfinance`: Yahoo Finance data fetching
- `Flask`: Web framework
- `Flask-CORS`: Cross-origin resource sharing
- `pandas`: Data manipulation
- `numpy`: Numerical computing 