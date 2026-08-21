/**
 * Market Agent - Real-time Market Intelligence
 * Handles market data, price forecasting, and economic analysis
 */

class MarketAgent {
    constructor() {
        this.marketData = null;
        this.priceHistory = [];
        this.forecasts = [];
        this.economicIndicators = [];
        this.initialize();
    }

    initialize() {
        console.log('📊 Market Agent initialized with real-time intelligence');
        this.generateInitialData();
        this.startMarketMonitoring();
        this.initializeEconomicIndicators();
    }

    generateInitialData() {
        const historical = this.generateHistoricalPrices();
        this.priceHistory = historical;
        
        this.marketData = {
            current_prices: this.getCurrentPrices(),
            historical: historical,
            forecasts: this.generateForecasts(),
            trends: this.calculateTrends(),
            timestamp: new Date().toISOString()
        };

        this.forecasts = this.marketData.forecasts;
    }

    generateHistoricalPrices() {
        const history = {};
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        const basePrices = { Wheat: 4.25, Corn: 3.85, Soybean: 12.45, Tomato: 0.85, Potato: 0.45 };
        
        commodities.forEach(commodity => {
            history[commodity] = [];
            const basePrice = basePrices[commodity] || 5.00;
            
            for (let i = 365; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                // Add seasonality
                const month = date.getMonth();
                const seasonality = Math.sin((month / 12) * 2 * Math.PI) * 0.15;
                
                // Add random variation
                const variation = (Math.random() - 0.5) * 0.2;
                
                const price = Math.round((basePrice * (1 + seasonality + variation)) * 100) / 100;
                
                history[commodity].push({
                    date: date.toISOString().split('T')[0],
                    price: price,
                    volume: Math.round(1000 + Math.random() * 9000),
                    trend: price > (history[commodity][history[commodity].length - 1]?.price || price) ? 'UP' : 'DOWN'
                });
            }
        });
        
        return history;
    }

    getCurrentPrices() {
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        const prices = {};
        
        commodities.forEach(commodity => {
            const history = this.priceHistory[commodity];
            if (history && history.length > 0) {
                const latest = history[history.length - 1];
                const previous = history[history.length - 2] || latest;
                
                prices[commodity] = {
                    price: latest.price,
                    change: latest.price - previous.price,
                    change_percent: ((latest.price - previous.price) / previous.price * 100),
                    volume: latest.volume,
                    timestamp: latest.date,
                    trend: latest.trend
                };
            }
        });
        
        return prices;
    }

    generateForecasts() {
        const forecasts = {};
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        
        commodities.forEach(commodity => {
            const history = this.priceHistory[commodity];
            if (!history || history.length < 30) {
                forecasts[commodity] = [];
                return;
            }
            
            // Simple forecasting using moving average with seasonality
            const recent = history.slice(-30);
            const avgPrice = recent.reduce((sum, d) => sum + d.price, 0) / recent.length;
            const trend = (recent[recent.length - 1].price - recent[0].price) / 30;
            
            forecasts[commodity] = [];
            const currentDate = new Date();
            
            for (let i = 1; i <= 30; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i);
                const month = date.getMonth();
                const seasonality = Math.sin((month / 12) * 2 * Math.PI) * 0.1;
                
                const predictedPrice = Math.round((avgPrice + trend * i * (1 + seasonality)) * 100) / 100;
                const confidence = Math.max(50, 90 - Math.abs(trend) * 20);
                
                forecasts[commodity].push({
                    date: date.toISOString().split('T')[0],
                    predicted_price: predictedPrice,
                    confidence_low: Math.round((predictedPrice * (1 - (100 - confidence) / 200)) * 100) / 100,
                    confidence_high: Math.round((predictedPrice * (1 + (100 - confidence) / 200)) * 100) / 100,
                    confidence_level: Math.round(confidence)
                });
            }
        });
        
        return forecasts;
    }

    calculateTrends() {
        const trends = {};
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        
        commodities.forEach(commodity => {
            const history = this.priceHistory[commodity];
            if (!history || history.length < 60) {
                trends[commodity] = { trend: 'STABLE', volatility: 0 };
                return;
            }
            
            const recent = history.slice(-30);
            const older = history.slice(-60, -30);
            
            const recentAvg = recent.reduce((sum, d) => sum + d.price, 0) / recent.length;
            const olderAvg = older.reduce((sum, d) => sum + d.price, 0) / older.length;
            
            const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
            const volatility = this.calculateVolatility(recent);
            
            let trend = 'STABLE';
            if (percentChange > 2) trend = 'BULLISH';
            else if (percentChange < -2) trend = 'BEARISH';
            
            trends[commodity] = {
                trend: trend,
                percent_change: Math.round(percentChange * 10) / 10,
                volatility: Math.round(volatility * 100) / 100,
                recent_average: Math.round(recentAvg * 100) / 100,
                older_average: Math.round(olderAvg * 100) / 100
            };
        });
        
        return trends;
    }

    calculateVolatility(data) {
        if (data.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            const ret = (data[i].price - data[i-1].price) / data[i-1].price;
            returns.push(ret);
        }
        
        const avgRet = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgRet, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    initializeEconomicIndicators() {
        this.economicIndicators = [
            {
                name: 'USDA Crop Production Report',
                value: 'Latest: 45.2 bushels/acre',
                change: '+2.3%',
                impact: 'Positive'
            },
            {
                name: 'Export Demand Index',
                value: '108.5',
                change: '+1.8%',
                impact: 'Moderate'
            },
            {
                name: 'Global Supply Outlook',
                value: 'Slightly Tight',
                change: '-5%',
                impact: 'Positive'
            },
            {
                name: 'Energy Prices (Oil)',
                value: '$72.50/barrel',
                change: '-0.5%',
                impact: 'Neutral'
            },
            {
                name: 'Inflation Rate',
                value: '3.2%',
                change: '-0.3%',
                impact: 'Moderate'
            }
        ];
    }

    startMarketMonitoring() {
        // Update market data every hour during market hours
        setInterval(() => {
            this.updateMarketData();
        }, 3600000); // 1 hour

        // Update forecasts every 6 hours
        setInterval(() => {
            this.updateForecasts();
        }, 21600000); // 6 hours

        // Check for market alerts every 30 minutes
        setInterval(() => {
            this.checkMarketAlerts();
        }, 1800000); // 30 minutes
    }

    updateMarketData() {
        // Simulate real-time market updates
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        
        commodities.forEach(commodity => {
            const history = this.priceHistory[commodity];
            if (!history || history.length === 0) return;
            
            const lastPrice = history[history.length - 1].price;
            const variation = (Math.random() - 0.5) * 0.1;
            const newPrice = Math.round((lastPrice * (1 + variation)) * 100) / 100;
            
            history.push({
                date: new Date().toISOString().split('T')[0],
                price: newPrice,
                volume: Math.round(1000 + Math.random() * 9000),
                trend: newPrice > lastPrice ? 'UP' : 'DOWN'
            });
            
            // Keep only 1 year of data
            if (history.length > 365) {
                history.shift();
            }
        });

        this.marketData.current_prices = this.getCurrentPrices();
        this.marketData.trends = this.calculateTrends();
        this.marketData.timestamp = new Date().toISOString();
    }

    updateForecasts() {
        this.forecasts = this.generateForecasts();
        this.marketData.forecasts = this.forecasts;
    }

    checkMarketAlerts() {
        const alerts = [];
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        
        commodities.forEach(commodity => {
            const trend = this.marketData.trends[commodity];
            if (!trend) return;
            
            if (trend.volatility > 0.15) {
                alerts.push({
                    commodity: commodity,
                    type: 'HIGH_VOLATILITY',
                    message: `${commodity} prices show high volatility (${Math.round(trend.volatility * 100)}%)`,
                    severity: 'MODERATE'
                });
            }
            
            if (trend.trend === 'BULLISH' && trend.percent_change > 5) {
                alerts.push({
                    commodity: commodity,
                    type: 'STRONG_UPTREND',
                    message: `${commodity} prices strongly trending upward (${trend.percent_change}%)`,
                    severity: 'LOW'
                });
            }
            
            if (trend.trend === 'BEARISH' && trend.percent_change < -5) {
                alerts.push({
                    commodity: commodity,
                    type: 'STRONG_DOWNTREND',
                    message: `${commodity} prices strongly trending downward (${trend.percent_change}%)`,
                    severity: 'HIGH'
                });
            }
        });

        if (alerts.length > 0) {
            document.dispatchEvent(new CustomEvent('marketAlert', {
                detail: {
                    alerts: alerts,
                    timestamp: new Date().toISOString()
                }
            }));
        }
    }

    async getMarketData() {
        return this.marketData;
    }

    async getPriceForecast(commodity = 'Wheat', days = 30) {
        if (!this.forecasts[commodity]) {
            return { error: 'Commodity not found' };
        }
        return this.forecasts[commodity].slice(0, days);
    }

    async getPriceHistory(commodity = 'Wheat', days = 90) {
        if (!this.priceHistory[commodity]) {
            return { error: 'Commodity not found' };
        }
        return this.priceHistory[commodity].slice(-days);
    }

    async getBreakevenAnalysis(cropType) {
        const costs = {
            'Wheat': 150,
            'Corn': 200,
            'Soybean': 180,
            'Tomato': 250,
            'Potato': 200
        };

        const yields = {
            'Wheat': 45,
            'Corn': 175,
            'Soybean': 45,
            'Tomato': 20,
            'Potato': 20
        };

        const currentPrice = this.marketData.current_prices[cropType]?.price || 5.00;
        const costPerAcre = costs[cropType] || 180;
        const yieldPerAcre = yields[cropType] || 40;
        const breakevenYield = costPerAcre / currentPrice;
        const profitAtAverage = (yieldPerAcre * currentPrice) - costPerAcre;
        const profitMargin = (profitAtAverage / (yieldPerAcre * currentPrice)) * 100;

        // Get trend for recommendation
        const trend = this.marketData.trends[cropType] || { trend: 'STABLE' };

        return {
            crop: cropType,
            total_cost_per_acre: costPerAcre,
            average_yield_per_acre: yieldPerAcre,
            current_price: currentPrice,
            breakeven_yield: Math.round(breakevenYield * 100) / 100,
            profit_at_average_yield: Math.round(profitAtAverage * 100) / 100,
            profit_margin: Math.round(profitMargin * 10) / 10,
            recommendation: this.getBreakevenRecommendation(profitMargin, trend.trend),
            trend: trend.trend,
            cost_breakdown: {
                'Land': costPerAcre * 0.3,
                'Machinery': costPerAcre * 0.15,
                'Seed': costPerAcre * 0.1,
                'Chemical': costPerAcre * 0.12,
                'Fertilizer': costPerAcre * 0.16,
                'Labor': costPerAcre * 0.1,
                'Other': costPerAcre * 0.07
            }
        };
    }

    getBreakevenRecommendation(profitMargin, trend) {
        if (profitMargin > 25) {
            return 'HIGHLY PROFITABLE - Consider expanding production';
        } else if (profitMargin > 15) {
            return 'PROFITABLE - Good returns. Consider increasing efficiency.';
        } else if (profitMargin > 5) {
            if (trend === 'BULLISH') {
                return 'MARGINAL BUT IMPROVING - Price trend positive. Consider holding.';
            } else {
                return 'MARGINAL - Optimize costs and consider market timing.';
            }
        } else {
            if (trend === 'BULLISH') {
                return 'BREAKING EVEN - Market improving. Monitor closely.';
            } else {
                return 'LOSS - Consider reducing acreage or switching crops.';
            }
        }
    }

    async getSellRecommendation(cropType) {
        const currentPrice = this.marketData.current_prices[cropType]?.price || 5.00;
        const forecast = this.forecasts[cropType] || [];
        const trend = this.marketData.trends[cropType] || { trend: 'STABLE' };
        
        if (forecast.length === 0) {
            return {
                crop: cropType,
                current_price: currentPrice,
                recommendation: 'HOLD',
                reason: 'Insufficient data for recommendation'
            };
        }

        const futurePrices = forecast.slice(0, 7).map(f => f.predicted_price);
        const futureAvg = futurePrices.reduce((sum, p) => sum + p, 0) / futurePrices.length;
        const trendStrength = (futureAvg - currentPrice) / currentPrice * 100;

        let recommendation = 'HOLD';
        let reason = '';
        let optimalWindow = '';

        if (trendStrength > 3) {
            recommendation = 'HOLD';
            reason = 'Prices expected to rise. Wait for better market conditions.';
            optimalWindow = '2-4 weeks';
        } else if (trendStrength < -3) {
            recommendation = 'SELL';
            reason = 'Prices expected to decline. Sell at current favorable prices.';
            optimalWindow = 'Immediate to 1 week';
        } else {
            recommendation = 'MONITOR';
            reason = 'Prices stable. Monitor market conditions.';
            optimalWindow = 'Flexible';
        }

        return {
            crop: cropType,
            current_price: currentPrice,
            predicted_price_7day: Math.round(futureAvg * 100) / 100,
            trend_strength: Math.round(trendStrength * 10) / 10,
            recommendation: recommendation,
            reason: reason,
            optimal_window: optimalWindow,
            market_trend: trend.trend,
            volatility: Math.round(trend.volatility * 100)
        };
    }

    async getMarketSummary() {
        return {
            market_status: this.calculateMarketStatus(),
            top_performer: this.findTopPerformer(),
            worst_performer: this.findWorstPerformer(),
            overall_trend: this.calculateOverallTrend(),
            economic_indicators: this.economicIndicators,
            timestamp: new Date().toISOString()
        };
    }

    calculateMarketStatus() {
        const prices = this.marketData.current_prices;
        const trends = this.marketData.trends;
        
        const bullishCount = Object.values(trends).filter(t => t.trend === 'BULLISH').length;
        const bearishCount = Object.values(trends).filter(t => t.trend === 'BEARISH').length;
        
        if (bullishCount > bearishCount * 1.5) return 'BULLISH';
        if (bearishCount > bullishCount * 1.5) return 'BEARISH';
        return 'NEUTRAL';
    }

    findTopPerformer() {
        const trends = this.marketData.trends;
        let top = null;
        let topChange = -Infinity;
        
        for (const [commodity, data] of Object.entries(trends)) {
            if (data.percent_change > topChange) {
                topChange = data.percent_change;
                top = commodity;
            }
        }
        
        return top;
    }

    findWorstPerformer() {
        const trends = this.marketData.trends;
        let worst = null;
        let worstChange = Infinity;
        
        for (const [commodity, data] of Object.entries(trends)) {
            if (data.percent_change < worstChange) {
                worstChange = data.percent_change;
                worst = commodity;
            }
        }
        
        return worst;
    }

    calculateOverallTrend() {
        const trends = this.marketData.trends;
        const avgChange = Object.values(trends).reduce((sum, t) => sum + t.percent_change, 0) / Object.values(trends).length;
        
        if (avgChange > 1) return 'UPWARD';
        if (avgChange < -1) return 'DOWNWARD';
        return 'STABLE';
    }

    async getMarketAlert() {
        const alerts = [];
        const commodities = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        
        commodities.forEach(commodity => {
            const price = this.marketData.current_prices[commodity];
            const forecast = this.forecasts[commodity];
            
            if (!price || !forecast) return;
            
            const futurePrice = forecast[0]?.predicted_price || price.price;
            const changePercent = ((futurePrice - price.price) / price.price) * 100;
            
            if (changePercent > 5) {
                alerts.push({
                    commodity: commodity,
                    current_price: price.price,
                    predicted_price: futurePrice,
                    change_percent: Math.round(changePercent * 10) / 10,
                    recommendation: 'Consider holding for better prices',
                    severity: 'LOW'
                });
            } else if (changePercent < -5) {
                alerts.push({
                    commodity: commodity,
                    current_price: price.price,
                    predicted_price: futurePrice,
                    change_percent: Math.round(changePercent * 10) / 10,
                    recommendation: 'Consider selling now before prices drop',
                    severity: 'HIGH'
                });
            }
        });
        
        return alerts;
    }
}

window.MarketAgent = MarketAgent;