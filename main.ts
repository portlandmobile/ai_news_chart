import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';

class StockChartApp {
    private chart: any = null;
    private currentStockData: any[] = [];
    private currentStockInfo: any = null;
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
                this.displayNews(data.news);
            } else {
                console.warn('Failed to load news:', data.error);
                this.displayNews([]);
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.displayNews([]);
        }
    }

    private displayNews(news: any[]) {
        if (!news.length) {
            this.newsList.innerHTML = '<p class="no-data">No news available for this stock</p>';
            return;
        }

        this.newsList.innerHTML = news.map(item => `
            <div class="news-entry">
                <div class="news-date">${item.date}</div>
                <div class="news-title">${item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title}</div>
                <a href="${item.link}" target="_blank" class="news-link">Read more →</a>
            </div>
        `).join('');
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
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
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