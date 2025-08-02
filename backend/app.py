from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging
import requests
import json
from pandas import json_normalize

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/stock-data', methods=['GET'])
def get_stock_data():
    """
    Fetch stock data from Yahoo Finance
    Query parameters:
    - symbol: Stock symbol (e.g., 'AAPL', 'GOOGL')
    - period: Time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
    - interval: Data interval ('1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo')
    """
    try:
        # Get query parameters
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '6mo')
        interval = request.args.get('interval', '1d')
        
        logger.info(f"Fetching data for {symbol} with period={period}, interval={interval}")
        
        # Fetch data from Yahoo Finance using download method
        try:
            # Calculate date range based on period
            end_date = datetime.now()
            if period == '1mo':
                start_date = end_date - timedelta(days=30)
            elif period == '3mo':
                start_date = end_date - timedelta(days=90)
            elif period == '6mo':
                start_date = end_date - timedelta(days=180)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            elif period == '2y':
                start_date = end_date - timedelta(days=730)
            elif period == '5y':
                start_date = end_date - timedelta(days=1825)
            else:
                start_date = end_date - timedelta(days=180)  # Default to 6 months
            
            # Download data using yf.download
            data = yf.download(symbol, start=start_date, end=end_date, progress=False)
            
            if data.empty:
                return jsonify({
                    'error': f'No data found for symbol {symbol}. Please check if the symbol is correct.',
                    'symbol': symbol
                }), 404
                
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return jsonify({
                'error': f'Failed to fetch data for {symbol}. Please try again later.',
                'symbol': symbol
            }), 500
        
        # Convert to JSON-friendly format
        stock_data = []
        for date, row in data.iterrows():
            stock_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })
        
        # Get current price from the latest data (no additional API calls)
        latest_price = stock_data[-1]['close'] if stock_data else 0
        
        # Simple stock info without additional API calls
        stock_info = {
            'symbol': symbol,
            'name': f'{symbol} Inc.',
            'sector': 'Unknown',
            'industry': 'Unknown',
            'market_cap': 0,
            'current_price': latest_price
        }
        
        return jsonify({
            'success': True,
            'stock_info': stock_info,
            'data': stock_data,
            'period': period,
            'interval': interval
        })
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return jsonify({
            'error': f'Failed to fetch stock data: {str(e)}',
            'symbol': symbol if 'symbol' in locals() else 'Unknown'
        }), 500

@app.route('/api/search-stocks', methods=['GET'])
def search_stocks():
    """
    Search for stocks by symbol or name
    Query parameters:
    - query: Search query string
    """
    try:
        query = request.args.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        logger.info(f"Searching for stocks with query: {query}")
        
        # For now, return some popular stocks that match the query
        # In a real application, you might want to use a more sophisticated search
        popular_stocks = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.'},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.'},
            {'symbol': 'META', 'name': 'Meta Platforms Inc.'},
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation'},
            {'symbol': 'NFLX', 'name': 'Netflix Inc.'},
            {'symbol': 'DIS', 'name': 'The Walt Disney Company'},
            {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.'}
        ]
        
        # Filter stocks that match the query
        matching_stocks = [
            stock for stock in popular_stocks
            if query.upper() in stock['symbol'].upper() or 
               query.lower() in stock['name'].lower()
        ]
        
        return jsonify({
            'success': True,
            'results': matching_stocks[:10]  # Limit to 10 results
        })
        
    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        return jsonify({'error': f'Failed to search stocks: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/mock-stock-data', methods=['GET'])
def get_mock_stock_data():
    """Mock stock data for testing when yfinance is not working"""
    symbol = request.args.get('symbol', 'AAPL').upper()
    period = request.args.get('period', '6mo')
    
    # Generate mock data
    import random
    from datetime import datetime, timedelta
    
    # Calculate start date based on period
    end_date = datetime.now()
    if period == '1mo':
        start_date = end_date - timedelta(days=30)
    elif period == '3mo':
        start_date = end_date - timedelta(days=90)
    elif period == '6mo':
        start_date = end_date - timedelta(days=180)
    elif period == '1y':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=180)
    
    # Generate mock stock data
    stock_data = []
    current_price = 150.0  # Starting price
    
    current_date = start_date
    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            # Add some randomness to price
            change = (random.random() - 0.5) * 10  # -5 to +5
            current_price = max(50, min(300, current_price + change))
            
            stock_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'open': round(current_price - random.random() * 2, 2),
                'high': round(current_price + random.random() * 3, 2),
                'low': round(current_price - random.random() * 3, 2),
                'close': round(current_price, 2),
                'volume': random.randint(1000000, 5000000)
            })
        
        current_date += timedelta(days=1)
    
    # Mock stock info
    stock_info = {
        'symbol': symbol,
        'name': f'{symbol} Inc.',
        'sector': 'Technology',
        'industry': 'Consumer Electronics',
        'market_cap': 2500000000000,  # 2.5T
        'current_price': current_price
    }
    
    return jsonify({
        'success': True,
        'stock_info': stock_info,
        'data': stock_data,
        'period': period,
        'interval': '1d',
        'note': 'Mock data - yfinance connection issues'
    })

def get_stock_news(stock_sym):
    """Fetch stock news from TickerTick API"""
    try:
        continueloop = 1
        url = ""
        text = ""
        hours_ago = 1
        lastID = 0
        urllink = f"https://api.tickertick.com/feed?q=(and tt:{stock_sym} (or s:tickerreport s:seekingalpha))&lang=en&n=200"

        ttdf = pd.DataFrame()
        while continueloop != 0:
            url = requests.get(urllink)
            text = url.text
            ttjson = json.loads(text)
            tmpdf = json_normalize(ttjson['stories']) 
            tmpdf['time'] = pd.to_datetime(tmpdf['time'], unit="ms")
            ttdf = pd.concat([ttdf, tmpdf], axis=0)
            
            if (ttdf.iloc[-1]['time'] > datetime.now() - timedelta(days=90)):
                lastdate = ttdf.iloc[-1]['time']
                hour_offset = int((datetime.now() - lastdate).total_seconds() / 3600)
                hours_ago = hours_ago + hour_offset
                urllink = f"https://api.tickertick.com/feed?q=(and tt:{stock_sym} (or s:tickerreport s:seekingalpha))&lang=en&hours_ago={hours_ago}"

                lastID = ttdf.iloc[-1]['id']
                urllink = f"https://api.tickertick.com/feed?q=(and tt:{stock_sym} (or s:tickerreport s:seekingalpha))&lang=en&n=200&last={lastID}"

                if continueloop < 10:  # in case of runaway train
                    continueloop = continueloop + 1
                else:
                    continueloop = 0
            else:
                continueloop = 0

        ttdf['time'] = pd.to_datetime(ttdf['time'], unit="ms")
        ttdf['time'] = ttdf['time'].dt.date
        ttdf['title'] = ttdf['title'].str.slice(0, 90) + "..." + "<br>"
        ttdf = ttdf.rename(columns={"time": "pubdate", "url": "link"})

        # Combine all titles in case there are multiple of them in a single day
        ttdf = ttdf.groupby('pubdate').agg({'title': 'sum', 'link': 'sum'})
        ttdf = ttdf.reset_index()
        
        return ttdf
    except Exception as e:
        logger.error(f"Error fetching news for {stock_sym}: {str(e)}")
        return pd.DataFrame()

@app.route('/api/stock-news', methods=['GET'])
def get_stock_news_api():
    """
    Fetch stock news from TickerTick API
    Query parameters:
    - symbol: Stock symbol (e.g., 'AAPL', 'GOOGL')
    """
    try:
        symbol = request.args.get('symbol', 'AAPL').upper()
        
        logger.info(f"Fetching news for {symbol}")
        
        news_data = get_stock_news(symbol)
        
        if news_data.empty:
            return jsonify({
                'error': f'No news found for symbol {symbol}',
                'symbol': symbol
            }), 404
        
        # Convert to JSON-friendly format
        news_list = []
        for _, row in news_data.iterrows():
            news_list.append({
                'date': row['pubdate'].strftime('%Y-%m-%d') if hasattr(row['pubdate'], 'strftime') else str(row['pubdate']),
                'title': row['title'],
                'link': row['link']
            })
        
        return jsonify({
            'success': True,
            'symbol': symbol,
            'news': news_list
        })
        
    except Exception as e:
        logger.error(f"Error in stock news API: {str(e)}")
        return jsonify({
            'error': f'Failed to fetch news: {str(e)}',
            'symbol': symbol if 'symbol' in locals() else 'Unknown'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 