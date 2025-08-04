import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';

class StockChartApp {
    private chart: any = null;
    private currentStockData: any[] = [];
    private currentStockInfo: any = null;
    private currentNewsData: any[] = [];
    private apiBaseUrl: string = 'http://localhost:5001/api';

    // DOM elements
    private chartCanvas!: HTMLCanvasElement;
    private chartTypeSelect!: HTMLSelectElement;
    private timeRangeSelect!: HTMLSelectElement;
    private animationSpeedSelect!: HTMLSelectElement;
    private refreshDataBtn!: HTMLButtonElement;
    private stockSymbolInput!: HTMLInputElement;
    private searchStockBtn!: HTMLButtonElement;
    private stockInfoDiv!: HTMLDivElement;
    private stockNameH3!: HTMLHeadingElement;
    private stockDetailsP!: HTMLParagraphElement;
    private textList!: HTMLDivElement;
    private newsList!: HTMLDivElement;

    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadInitialStockData();
    }

    private initializeElements() {
        this.chartCanvas = document.getElementById('lineChart') as HTMLCanvasElement;
        this.chartTypeSelect = document.getElementById('chartType') as HTMLSelectElement;
        this.timeRangeSelect = document.getElementById('timeRange') as HTMLSelectElement;
        this.animationSpeedSelect = document.getElementById('animationSpeed') as HTMLSelectElement;
        this.refreshDataBtn = document.getElementById('refreshData') as HTMLButtonElement;
        this.stockSymbolInput = document.getElementById('stockSymbol') as HTMLInputElement;
        this.searchStockBtn = document.getElementById('searchStock') as HTMLButtonElement;
        this.stockInfoDiv = document.getElementById('stockInfo') as HTMLDivElement;
        this.stockNameH3 = document.getElementById('stockName') as HTMLHeadingElement;
        this.stockDetailsP = document.getElementById('stockDetails') as HTMLParagraphElement;
        this.textList = document.getElementById('textList') as HTMLDivElement;
        this.newsList = document.getElementById('newsList') as HTMLDivElement;
        
        // Add click event listener to chart canvas as fallback
        this.chartCanvas.addEventListener('click', (event) => {
            console.log('Canvas clicked directly');
        });
    }

    private bindEvents() {
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

    private async loadInitialStockData() {
        await this.loadStockData();
    }

    private async loadStockData() {
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
            this.generateTextList();
            await this.loadStockNews(); // Load news data
            this.showError(''); // Clear any previous errors

        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError(`Error loading stock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            this.showLoading(false);
            this.refreshDataBtn.textContent = 'Refresh Data';
            this.refreshDataBtn.disabled = false;
        }
    }

    private async searchStock() {
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        
        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }

        this.stockSymbolInput.value = symbol;
        await this.loadStockData();
    }

    private async loadStockNews() {
        const symbol = this.stockSymbolInput.value.trim().toUpperCase();
        
        if (!symbol) {
            return;
        }

        try {
            console.log(`Loading news for ${symbol}`);
            const response = await fetch(`${this.apiBaseUrl}/stock-news-tt?symbol=${symbol}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.currentNewsData = data.news;
                this.displayNews(data.news);
                this.updateChartWithNews(); // Update chart to highlight news dates
            } else {
                console.warn('Failed to load news:', data.error);
                this.currentNewsData = [];
                this.displayNews([]);
                this.updateChartWithNews(); // Update chart even if no news
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.displayNews([]);
        }
    }

    private getNewsDates(): string[] {
        return this.currentNewsData.map(item => item.date);
    }

    private scrollToNewsDate(targetDate: string) {
        try {
            console.log('Scrolling to news date:', targetDate);
            
            const newsEntries = this.newsList.querySelectorAll('.news-entry');
            console.log('Found news entries:', newsEntries.length);
            
            for (let i = 0; i < newsEntries.length; i++) {
                const entry = newsEntries[i] as HTMLElement;
                const dateElement = entry.querySelector('.news-date');
                
                if (dateElement && dateElement.textContent === targetDate) {
                    console.log('Found matching news entry for date:', targetDate);
                    
                    // Add a brief highlight effect
                    entry.style.backgroundColor = 'rgba(255, 99, 132, 0.2)';
                    entry.style.transform = 'scale(1.02)';
                    
                    // Scroll to the element
                    entry.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // Remove highlight after 2 seconds
                    setTimeout(() => {
                        entry.style.backgroundColor = '';
                        entry.style.transform = '';
                    }, 2000);
                    
                    break;
                }
            }
        } catch (error) {
            console.error('Error scrolling to news date:', error);
        }
    }

    private scrollToNewsMiddle() {
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

    private displayNews(news: any[]) {
        if (!news.length) {
            this.newsList.innerHTML = '<p class="no-data">No news available for this stock</p>';
            return;
        }

        // Group news by date
        const groupedNews = news.reduce((groups: any, item) => {
            const date = item.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
            return groups;
        }, {});

        // Create HTML for grouped news
        this.newsList.innerHTML = Object.entries(groupedNews).map(([date, items]: [string, any]) => {
            const newsItems = items.map((item: any) => `
                <div class="news-item">
                    <div class="news-title">${item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title}</div>
                    <a href="${item.link}" target="_blank" class="news-link">Read more →</a>
                </div>
            `).join('');

            return `
                <div class="news-entry">
                    <div class="news-date">${date}</div>
                    ${newsItems}
                </div>
            `;
        }).join('');
    }

    private displayStockInfo() {
        if (!this.currentStockInfo) return;

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

    private formatMarketCap(marketCap: number): string {
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

    private getAnimationDuration(): number {
        const speed = this.animationSpeedSelect.value;
        switch (speed) {
            case 'slow': return 2000;
            case 'fast': return 500;
            default: return 1000;
        }
    }

    private getChartType(): string {
        const type = this.chartTypeSelect.value;
        switch (type) {
            case 'area': return 'line';
            case 'spline': return 'line';
            default: return 'line';
        }
    }

    private renderChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        if (!this.currentStockData.length) {
            return;
        }

        const ctx = this.chartCanvas.getContext('2d');
        if (!ctx) return;

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
            type: 'line' as const,
            data: {
                datasets: [
                    {
                        label: 'Stock Price',
                        data: priceData,
                        borderColor: '#667eea',
                        backgroundColor: isAreaChart ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        fill: isAreaChart,
                        borderWidth: 3,
                        pointBackgroundColor: (context: any) => {
                            const dataPoint = context.parsed;
                            const date = new Date(dataPoint.x);
                            const dateStr = date.toISOString().split('T')[0];
                            return newsDates.includes(dateStr) ? '#ff6384' : '#667eea';
                        },
                        pointBorderColor: (context: any) => {
                            const dataPoint = context.parsed;
                            const date = new Date(dataPoint.x);
                            const dateStr = date.toISOString().split('T')[0];
                            return newsDates.includes(dateStr) ? '#fff' : '#fff';
                        },
                        pointBorderWidth: 2,
                        pointRadius: (context: any) => {
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
                        type: 'bar' as const,
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
                onClick: (event: any, elements: any) => {
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
                                    } else {
                                        console.log('No news found for this date');
                                    }
                                } else {
                                    console.log('No data point found for this index');
                                }
                                
                                // Test scroll to middle of news box on ANY chart click
                                console.log('Testing scroll to middle of news box...');
                                this.scrollToNewsMiddle();
                            } else {
                                console.log('Click was not on price line or invalid element');
                            }
                        } else {
                            console.log('No elements found in click');
                        }
                    } catch (error) {
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
                                } else if (context.dataset.label === 'Volume') {
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
                            callback: (value: any) => {
                                const numValue = Number(value);
                                if (numValue >= 1e6) {
                                    return `${(numValue / 1e6).toFixed(1)}M`;
                                } else if (numValue >= 1e3) {
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

    private updateChart() {
        if (this.chart) {
            this.renderChart();
        }
    }

    private updateChartWithNews() {
        if (this.chart) {
            this.renderChart();
        }
    }

    private generateTextList() {
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

    private calculateChange(currentItem: any): number {
        const currentIndex = this.currentStockData.findIndex(item => item.date === currentItem.date);
        if (currentIndex <= 0) return 0;
        
        const previousItem = this.currentStockData[currentIndex - 1];
        const change = ((currentItem.close - previousItem.close) / previousItem.close) * 100;
        return change;
    }

    private showLoading(show: boolean) {
        const loadingElement = document.querySelector('.loading') as HTMLElement;
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    private showError(message: string) {
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
        } else {
            errorElement.style.display = 'none';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockChartApp();
}); 