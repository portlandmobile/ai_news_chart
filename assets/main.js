// Chart.js and date-fns are loaded via CDN
// Chart is available globally as window.Chart
// date-fns functions are available globally

class StockChartApp {
    constructor() {
        this.chart = null;
        this.currentStockData = [];
        this.currentStockInfo = null;
        this.currentNewsData = [];
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5001/api' 
            : '/api';

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
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        const period = this.timeRangeSelect.value;

        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }

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
            await this.loadStockNews();
            this.generateTextList();
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError('Failed to load stock data. Please try again.');
        } finally {
            this.showLoading(false);
            this.refreshDataBtn.textContent = 'Refresh Data';
            this.refreshDataBtn.disabled = false;
        }
    }

    async searchStock() {
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        if (symbol) {
            await this.loadStockData();
        }
    }

    async loadStockNews() {
        try {
            const symbol = this.stockSymbolInput.value.trim().toUpperCase();
            if (!symbol) return;

            const response = await fetch(`${this.apiBaseUrl}/stock-news-tt?symbol=${symbol}`);
            const data = await response.json();

            if (response.ok && data.success) {
                this.currentNewsData = data.news || [];
                this.displayNews(this.currentNewsData);
            } else {
                console.error('Failed to load news:', data.error);
            }
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }

    getNewsDates() {
        return this.currentNewsData.map(item => item.date);
    }

    scrollToNewsDate(targetDate) {
        try {
            console.log(`Scrolling to news date: ${targetDate}`);
            
            const scrollInfo = this.getNewsDateScrollInfo(targetDate);
            if (!scrollInfo.found) {
                console.log(`Target date ${targetDate} not found in news list`);
                return;
            }

            console.log(`Found target date, scrolling to position: ${scrollInfo.scrollPosition}`);
            
            // Scroll to the calculated position
            this.newsList.scrollTo({
                top: scrollInfo.scrollPosition,
                behavior: 'smooth'
            });

            // Add temporary highlight to the target entry
            const newsEntries = this.newsList.querySelectorAll('.news-entry');
            if (scrollInfo.index !== undefined && newsEntries[scrollInfo.index]) {
                const targetEntry = newsEntries[scrollInfo.index];
                targetEntry.style.backgroundColor = 'rgba(255, 99, 132, 0.1)';
                setTimeout(() => {
                    targetEntry.style.backgroundColor = '';
                }, 2000);
            }

            console.log('Scroll completed');
        } catch (error) {
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
        } catch (error) {
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
            
        } catch (error) {
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
        if (!this.currentStockInfo) return;

        this.stockNameH3.textContent = `${this.currentStockInfo.symbol} - ${this.currentStockInfo.name}`;
        
        const marketCap = this.formatMarketCap(this.currentStockInfo.market_cap);
        const sector = this.currentStockInfo.sector || 'N/A';
        const industry = this.currentStockInfo.industry || 'N/A';
        
        this.stockDetailsP.innerHTML = `
            <strong>Sector:</strong> ${sector}<br>
            <strong>Industry:</strong> ${industry}<br>
            <strong>Market Cap:</strong> ${marketCap}<br>
            <strong>Current Price:</strong> $${this.currentStockInfo.current_price?.toFixed(2) || 'N/A'}
        `;
    }

    formatMarketCap(marketCap) {
        if (!marketCap) return 'N/A';
        
        if (marketCap >= 1e12) {
            return `$${(marketCap / 1e12).toFixed(2)}T`;
        } else if (marketCap >= 1e9) {
            return `$${(marketCap / 1e9).toFixed(2)}B`;
        } else if (marketCap >= 1e6) {
            return `$${(marketCap / 1e6).toFixed(2)}M`;
        } else {
            return `$${marketCap.toLocaleString()}`;
        }
    }

    getAnimationDuration() {
        const speed = this.animationSpeedSelect.value;
        switch (speed) {
            case 'fast': return 500;
            case 'normal': return 1000;
            case 'slow': return 2000;
            default: return 1000;
        }
    }

    getChartType() {
        return this.chartTypeSelect.value;
    }

    renderChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = this.chartCanvas.getContext('2d');
        const chartType = this.getChartType();
        const animationDuration = this.getAnimationDuration();

        // Prepare data
        const labels = this.currentStockData.map(item => item.date);
        const priceData = this.currentStockData.map(item => item.close);
        const volumeData = this.currentStockData.map(item => item.volume);

        // Get news dates for highlighting
        const newsDates = this.getNewsDates();

        this.chart = new window.Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Price',
                        data: priceData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y',
                        pointBackgroundColor: (context) => {
                            const dataIndex = context.dataIndex;
                            const date = labels[dataIndex];
                            return newsDates.includes(date) ? 'rgba(255, 215, 0, 1)' : 'rgba(255, 99, 132, 1)';
                        },
                        pointBorderColor: (context) => {
                            const dataIndex = context.dataIndex;
                            const date = labels[dataIndex];
                            return newsDates.includes(date) ? 'rgba(255, 215, 0, 1)' : 'rgba(255, 99, 132, 1)';
                        },
                        pointRadius: (context) => {
                            const dataIndex = context.dataIndex;
                            const date = labels[dataIndex];
                            return newsDates.includes(date) ? 8 : 4;
                        },
                        pointHoverRadius: (context) => {
                            const dataIndex = context.dataIndex;
                            const date = labels[dataIndex];
                            return newsDates.includes(date) ? 10 : 6;
                        }
                    },
                    {
                        label: 'Volume',
                        data: volumeData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1',
                        type: 'bar'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationDuration
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Price ($)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Volume'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Price: $${context.parsed.y}`;
                                } else {
                                    return `Volume: ${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    try {
                        console.log('Chart clicked!');
                        console.log('Elements:', elements);
                        
                        if (elements && elements.length > 0) {
                            const element = elements[0];
                            console.log('Element:', element);
                            console.log('Element datasetIndex:', element.datasetIndex);
                            
                            // Only handle clicks on the price line (dataset 0)
                            if (element.datasetIndex === 0) {
                                const dataIndex = element.index;
                                console.log('Data index:', dataIndex);
                                
                                if (dataIndex !== undefined && this.chart.data.labels[dataIndex]) {
                                    const dateStr = this.chart.data.labels[dataIndex];
                                    console.log('Clicked date:', dateStr);
                                    
                                    // Scroll to the specific news date
                                    this.scrollToNewsDate(dateStr);
                                } else {
                                    console.log('No data point found for this index');
                                }
                            } else {
                                console.log('Click was not on price line or invalid element');
                            }
                        } else {
                            console.log('No elements found in click event');
                        }
                    } catch (error) {
                        console.error('Error handling chart click:', error);
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
        if (this.chart) {
            this.renderChart();
        }
    }

    generateTextList() {
        if (!this.currentStockData.length) {
            this.textList.innerHTML = '<p class="no-data">No data available</p>';
            return;
        }

        const textItems = this.currentStockData.map((item, index) => {
            const change = this.calculateChange(item);
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '+' : '';
            
            return `
                <div class="text-entry">
                    <div class="date">${item.date}</div>
                    <div class="title">
                        <span>Close: $${item.close}</span>
                        <span class="change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</span>
                    </div>
                    <div class="details">
                        Open: $${item.open} | High: $${item.high} | Low: $${item.low} | Volume: ${item.volume.toLocaleString()}
                    </div>
                </div>
            `;
        });

        this.textList.innerHTML = textItems.join('');
    }

    calculateChange(currentItem) {
        const currentIndex = this.currentStockData.indexOf(currentItem);
        if (currentIndex === 0) return 0;
        
        const previousItem = this.currentStockData[currentIndex - 1];
        return ((currentItem.close - previousItem.close) / previousItem.close) * 100;
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockChartApp();
});
