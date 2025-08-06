import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';
class StockChartApp {
    constructor() {
        this.chart = null;
        this.currentStockData = [];
        this.currentStockInfo = null;
        this.currentNewsData = [];
        this.apiBaseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5001/api'
            : '/api';
        this.isLoading = false; // Flag to prevent multiple simultaneous API calls
        this.isLoadingNews = false; // Flag to prevent multiple simultaneous news API calls
        this.initializeElements();
        this.bindEvents();
        this.loadInitialStockData();
    }
    initializeElements() {
        this.chartCanvas = document.getElementById('lineChart');
        this.chartTypeSelect = document.getElementById('chartType');
        this.timeRangeSelect = document.getElementById('timeRange');
        this.animationSpeedSelect = document.getElementById('animationSpeed');
        this.refreshDataBtn = document.getElementById('refreshData');
        this.stockSymbolInput = document.getElementById('stockSymbol');
        this.searchStockBtn = document.getElementById('searchStock');
        this.stockInfoDiv = document.getElementById('stockInfo');
        this.stockNameH3 = document.getElementById('stockName');
        this.stockDetailsP = document.getElementById('stockDetails');
        this.textList = document.getElementById('textList');
        this.newsList = document.getElementById('newsList');
        // Add click event listener to chart canvas as fallback
        this.chartCanvas.addEventListener('click', (event) => {
            console.log('Canvas clicked directly');
        });
    }
    bindEvents() {
        this.chartTypeSelect.addEventListener('change', () => this.updateChart());
        this.timeRangeSelect.addEventListener('change', () => this.loadStockData());
        this.animationSpeedSelect.addEventListener('change', () => this.updateChart());
        this.refreshDataBtn.addEventListener('click', () => this.loadStockData());
        this.searchStockBtn.addEventListener('click', () => this.searchStock());
        this.stockSymbolInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchStock();
            }
        });
    }
    async loadInitialStockData() {
        await this.loadStockData();
    }
    async loadStockData() {
        // Prevent multiple simultaneous API calls
        if (this.isLoading) {
            console.log('Already loading data, skipping request');
            return;
        }
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        const period = this.timeRangeSelect.value;
        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }
        this.isLoading = true;
        this.showLoading(true);
        this.refreshDataBtn.textContent = 'Loading...';
        this.refreshDataBtn.disabled = true;
        try {
            // Try real data first, fallback to mock data if it fails
            let response = await fetch(`${this.apiBaseUrl}/stock-data?symbol=${symbol}&period=${period}&interval=1d`);
            let data = await response.json();
            // If real data fails, use mock data
            if (!response.ok) {
                console.log('Real data failed, using mock data');
                response = await fetch(`${this.apiBaseUrl}/mock-stock-data?symbol=${symbol}&period=${period}&interval=1d`);
                data = await response.json();
            }
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch stock data');
            }
            this.currentStockData = data.data;
            this.currentStockInfo = data.stock_info;
            this.displayStockInfo();
            this.renderChart();
            this.generateTextList();
            await this.loadStockNews(); // Load news data
            this.showError(''); // Clear any previous errors
        }
        catch (error) {
            console.error('Error loading stock data:', error);
            this.showError(`Error loading stock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            this.isLoading = false;
            this.showLoading(false);
            this.refreshDataBtn.textContent = 'Refresh Data';
            this.refreshDataBtn.disabled = false;
        }
    }
    async searchStock() {
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }
        this.stockSymbolInput.value = symbol;
        await this.loadStockData();
    }
    async loadStockNews() {
        // Prevent multiple simultaneous news API calls
        if (this.isLoadingNews) {
            console.log('Already loading news, skipping request');
            return;
        }
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        if (!symbol) {
            return;
        }
        try {
            this.isLoadingNews = true;
            console.log(`Loading news for ${symbol}`);
            const response = await fetch(`${this.apiBaseUrl}/stock-news-tt?symbol=${symbol}`);
            const data = await response.json();
            if (response.ok && data.success) {
                this.currentNewsData = data.news;
                this.displayNews(data.news);
                this.updateChartWithNews(); // Update chart to highlight news dates
            }
            else {
                console.warn('Failed to load news:', data.error);
                this.currentNewsData = [];
                this.displayNews([]);
                this.updateChartWithNews(); // Update chart even if no news
            }
        }
        catch (error) {
            console.error('Error loading news:', error);
            this.currentNewsData = [];
            this.displayNews([]);
            this.updateChartWithNews(); // Update chart even if error
        }
        finally {
            this.isLoadingNews = false;
        }
    }
    getNewsDates() {
        return this.currentNewsData.map(item => item.date);
    }
    scrollToNewsDate(targetDate) {
        try {
            console.log('Scrolling to news date:', targetDate);
            // Get scroll info for the target date
            const scrollInfo = this.getNewsDateScrollInfo(targetDate);
            if (scrollInfo.found) {
                console.log('Found target date, scrolling to position:', scrollInfo.scrollPosition);
                // Scroll to the exact position
                this.newsList.scrollTo({
                    top: scrollInfo.scrollPosition,
                    behavior: 'smooth'
                });
                // Find and highlight the element
                const newsEntries = this.newsList.querySelectorAll('.news-entry');
                const targetEntry = scrollInfo.index !== undefined ? newsEntries[scrollInfo.index] : null;
                if (targetEntry) {
                    // Add a brief highlight effect
                    targetEntry.style.backgroundColor = 'rgba(255, 99, 132, 0.2)';
                    targetEntry.style.transform = 'scale(1.02)';
                    // Remove highlight after 2 seconds
                    setTimeout(() => {
                        targetEntry.style.backgroundColor = '';
                        targetEntry.style.transform = '';
                    }, 2000);
                }
                console.log('Scroll completed');
            }
            else {
                console.log('Target date not found:', targetDate);
            }
        }
        catch (error) {
            console.error('Error scrolling to news date:', error);
        }
    }
    scrollToNewsMiddle() {
        try {
            console.log('Scrolling to middle of news box...');
            // Scroll the news list to the middle
            this.newsList.scrollTo({
                top: this.newsList.scrollHeight / 2,
                behavior: 'smooth'
            });
            console.log('Scroll to middle completed');
        }
        catch (error) {
            console.error('Error scrolling to news middle:', error);
        }
    }
    getNewsDateScrollInfo(targetDate) {
        try {
            console.log(`Looking for news date: ${targetDate}`);
            console.log(`Total news list scroll height: ${this.newsList.scrollHeight}`);
            const newsEntries = this.newsList.querySelectorAll('.news-entry');
            console.log(`Total news entries found: ${newsEntries.length}`);
            let cumulativeHeight = 0;
            for (let i = 0; i < newsEntries.length; i++) {
                const entry = newsEntries[i];
                const dateElement = entry.querySelector('.news-date');
                const entryHeight = entry.offsetHeight;
                console.log(`Entry ${i}: date="${dateElement?.textContent}", height=${entryHeight}, cumulative=${cumulativeHeight}`);
                if (dateElement && dateElement.textContent === targetDate) {
                    console.log(`🎯 FOUND TARGET DATE: ${targetDate}`);
                    console.log(`   Entry index: ${i}`);
                    console.log(`   Entry height: ${entryHeight}`);
                    console.log(`   Scroll position to reach this entry: ${cumulativeHeight}`);
                    console.log(`   Entry offsetTop: ${entry.offsetTop}`);
                    return {
                        found: true,
                        index: i,
                        height: entryHeight,
                        scrollPosition: cumulativeHeight,
                        offsetTop: entry.offsetTop
                    };
                }
                cumulativeHeight += entryHeight;
            }
            console.log(`❌ Target date ${targetDate} not found`);
            return { found: false };
        }
        catch (error) {
            console.error('Error getting news date scroll info:', error);
            return { found: false, error: error };
        }
    }
    displayNews(news) {
        if (!news.length) {
            this.newsList.innerHTML = '<p class="no-data">No news available for this stock</p>';
            return;
        }
        // Group news by date
        const groupedNews = news.reduce((groups, item) => {
            const date = item.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
            return groups;
        }, {});
        // Create HTML for grouped news
        this.newsList.innerHTML = Object.entries(groupedNews).map(([date, items]) => {
            const newsItems = items.map((item) => {
                const truncatedTitle = item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title;
                return `
                    <div class="news-item">
                        <div class="news-title">
                            <span class="news-title-text">${truncatedTitle}</span>
                            <a href="${item.link}" target="_blank" class="news-link">Read more →</a>
                        </div>
                    </div>
                `;
            }).join('');
            return `
                <div class="news-entry">
                    <div class="news-date">${date}</div>
                    ${newsItems}
                </div>
            `;
        }).join('');
    }
    displayStockInfo() {
        if (!this.currentStockInfo)
            return;
        this.stockNameH3.textContent = `${this.currentStockInfo.symbol} - ${this.currentStockInfo.name}`;
        const marketCap = this.formatMarketCap(this.currentStockInfo.market_cap);
        const currentPrice = this.currentStockInfo.current_price?.toFixed(2) || 'N/A';
        this.stockDetailsP.innerHTML = `
            <strong>Sector:</strong> ${this.currentStockInfo.sector || 'N/A'} | 
            <strong>Industry:</strong> ${this.currentStockInfo.industry || 'N/A'} | 
            <strong>Market Cap:</strong> ${marketCap} | 
            <strong>Current Price:</strong> $${currentPrice}
        `;
        this.stockInfoDiv.style.display = 'block';
    }
    formatMarketCap(marketCap) {
        if (!marketCap)
            return 'N/A';
        if (marketCap >= 1e12) {
            return `$${(marketCap / 1e12).toFixed(2)}T`;
        }
        else if (marketCap >= 1e9) {
            return `$${(marketCap / 1e9).toFixed(2)}B`;
        }
        else if (marketCap >= 1e6) {
            return `$${(marketCap / 1e6).toFixed(2)}M`;
        }
        else {
            return `$${marketCap.toLocaleString()}`;
        }
    }
    getAnimationDuration() {
        const speed = this.animationSpeedSelect.value;
        switch (speed) {
            case 'slow': return 2000;
            case 'fast': return 500;
            default: return 1000;
        }
    }
    getChartType() {
        const type = this.chartTypeSelect.value;
        switch (type) {
            case 'area': return 'line';
            case 'spline': return 'line';
            default: return 'line';
        }
    }
    renderChart() {
        if (this.chart) {
            this.chart.destroy();
        }
        if (!this.currentStockData.length) {
            return;
        }
        const ctx = this.chartCanvas.getContext('2d');
        if (!ctx)
            return;
        // Get news dates for highlighting
        const newsDates = this.getNewsDates();
        const priceData = this.currentStockData.map(item => ({
            x: parseISO(item.date),
            y: item.close
        }));
        const volumeData = this.currentStockData.map(item => ({
            x: parseISO(item.date),
            y: item.volume
        }));
        const isAreaChart = this.chartTypeSelect.value === 'area';
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Stock Price',
                        data: priceData,
                        borderColor: '#667eea',
                        backgroundColor: isAreaChart ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        fill: isAreaChart,
                        borderWidth: 3,
                        pointBackgroundColor: (context) => {
                            const dataPoint = context.parsed;
                            const date = new Date(dataPoint.x);
                            const dateStr = date.toISOString().split('T')[0];
                            return newsDates.includes(dateStr) ? '#ff6384' : '#667eea';
                        },
                        pointBorderColor: (context) => {
                            const dataPoint = context.parsed;
                            const date = new Date(dataPoint.x);
                            const dateStr = date.toISOString().split('T')[0];
                            return newsDates.includes(dateStr) ? '#fff' : '#fff';
                        },
                        pointBorderWidth: 2,
                        pointRadius: (context) => {
                            const dataPoint = context.parsed;
                            const date = new Date(dataPoint.x);
                            const dateStr = date.toISOString().split('T')[0];
                            return newsDates.includes(dateStr) ? 6 : 4;
                        },
                        pointHoverRadius: 8,
                        tension: this.chartTypeSelect.value === 'spline' ? 0.4 : 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Volume',
                        data: volumeData,
                        type: 'bar',
                        backgroundColor: 'rgba(255, 99, 132, 0.3)',
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: this.getAnimationDuration(),
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                onClick: (event, elements) => {
                    try {
                        console.log('Chart clicked!');
                        console.log('Elements:', elements);
                        if (elements && elements.length > 0) {
                            const element = elements[0];
                            console.log('Element:', element);
                            console.log('Element datasetIndex:', element.datasetIndex);
                            // Only handle clicks on the price line (dataset 0), not volume bars (dataset 1)
                            if (element.datasetIndex === 0) {
                                console.log('Element parsed:', element.parsed);
                                console.log('Element index:', element.index);
                                // Get the data point from the chart data
                                const dataIndex = element.index;
                                console.log('Chart data labels:', this.chart.data.labels);
                                console.log('Chart data length:', this.chart.data.labels?.length);
                                console.log('Data index:', dataIndex);
                                const dataPoint = this.chart.data.labels?.[dataIndex];
                                if (dataPoint) {
                                    const date = new Date(dataPoint);
                                    const dateStr = date.toISOString().split('T')[0];
                                    console.log('Clicked date:', dateStr);
                                    console.log('Available news dates:', this.currentNewsData.map(n => n.date));
                                    // Check if this date has news
                                    if (this.currentNewsData.some(news => news.date === dateStr)) {
                                        console.log('Found news for this date, scrolling...');
                                        this.scrollToNewsDate(dateStr);
                                    }
                                    else {
                                        console.log('No news found for this date');
                                    }
                                }
                                else {
                                    console.log('No data point found for this index');
                                    // Try alternative method to get the date
                                    console.log('Trying alternative date access method...');
                                    // Access the dataset data directly
                                    const priceData = this.chart.data.datasets[0].data;
                                    if (priceData && priceData[dataIndex]) {
                                        const altDataPoint = priceData[dataIndex];
                                        if (altDataPoint && altDataPoint.x) {
                                            const date = new Date(altDataPoint.x);
                                            const dateStr = date.toISOString().split('T')[0];
                                            console.log('Alternative clicked date:', dateStr);
                                            // Check if this date has news
                                            if (this.currentNewsData.some(news => news.date === dateStr)) {
                                                console.log('Found news for this date, scrolling...');
                                                this.scrollToNewsDate(dateStr);
                                            }
                                            else {
                                                console.log('No news found for this date');
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                console.log('Click was not on price line or invalid element');
                            }
                        }
                        else {
                            console.log('No elements found in click');
                        }
                    }
                    catch (error) {
                        console.error('Error handling chart click:', error);
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: (context) => {
                                const date = context[0].parsed.x;
                                return format(date, 'MMM dd, yyyy');
                            },
                            label: (context) => {
                                if (context.dataset.label === 'Stock Price') {
                                    return `Price: $${context.parsed.y.toFixed(2)}`;
                                }
                                else if (context.dataset.label === 'Volume') {
                                    return `Volume: ${context.parsed.y.toLocaleString()}`;
                                }
                                return context.dataset.label + ': ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM dd'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            },
                            callback: (value) => `$${value}`
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#ff6384',
                            font: {
                                size: 10
                            },
                            callback: (value) => {
                                const numValue = Number(value);
                                if (numValue >= 1e6) {
                                    return `${(numValue / 1e6).toFixed(1)}M`;
                                }
                                else if (numValue >= 1e3) {
                                    return `${(numValue / 1e3).toFixed(1)}K`;
                                }
                                return numValue.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    updateChart() {
        if (this.chart) {
            this.renderChart();
        }
    }
    updateChartWithNews() {
        // Only update the chart if it exists and we have data
        if (this.chart && this.currentStockData.length > 0) {
            // Instead of full re-render, just update the chart data
            this.updateChartData();
        }
    }
    updateChartData() {
        if (!this.chart || !this.currentStockData.length)
            return;
        // Get news dates for highlighting
        const newsDates = this.getNewsDates();
        // Update the chart's point colors based on news data
        this.chart.data.datasets[0].pointBackgroundColor = this.chart.data.datasets[0].data.map((dataPoint) => {
            const date = new Date(dataPoint.x);
            const dateStr = date.toISOString().split('T')[0];
            return newsDates.includes(dateStr) ? '#ff6384' : '#667eea';
        });
        this.chart.data.datasets[0].pointBorderColor = this.chart.data.datasets[0].data.map((dataPoint) => {
            const date = new Date(dataPoint.x);
            const dateStr = date.toISOString().split('T')[0];
            return newsDates.includes(dateStr) ? '#fff' : '#fff';
        });
        // Update the chart
        this.chart.update('none'); // Update without animation for better performance
    }
    generateTextList() {
        if (!this.currentStockData.length) {
            this.textList.innerHTML = '<p class="no-data">No stock data available</p>';
            return;
        }
        const recentData = this.currentStockData.slice(-10).reverse(); // Last 10 entries, newest first
        this.textList.innerHTML = recentData.map(item => {
            const date = format(parseISO(item.date), 'MMM dd, yyyy');
            const change = this.calculateChange(item);
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '+' : '';
            return `
                <div class="text-entry">
                    <div class="date">${date}</div>
                    <div class="title">
                        <strong>$${item.close.toFixed(2)}</strong>
                        <span class="change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</span>
                    </div>
                    <div class="details">
                        Volume: ${item.volume.toLocaleString()} | 
                        High: $${item.high.toFixed(2)} | 
                        Low: $${item.low.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }
    calculateChange(currentItem) {
        const currentIndex = this.currentStockData.findIndex(item => item.date === currentItem.date);
        if (currentIndex <= 0)
            return 0;
        const previousItem = this.currentStockData[currentIndex - 1];
        const change = ((currentItem.close - previousItem.close) / previousItem.close) * 100;
        return change;
    }
    showLoading(show) {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }
    showError(message) {
        // Create or update error message
        let errorElement = document.getElementById('error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.style.cssText = `
                background: #fee;
                color: #c33;
                padding: 12px 16px;
                border-radius: 8px;
                margin: 16px 0;
                border-left: 4px solid #c33;
                display: none;
            `;
            document.querySelector('.container')?.insertBefore(errorElement, document.querySelector('.stock-search'));
        }
        if (message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        else {
            errorElement.style.display = 'none';
        }
    }
}
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockChartApp();
});
