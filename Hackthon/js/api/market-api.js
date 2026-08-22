/**
 * Market & Price Intelligence API
 * Handles commodity market data, price trends, and forecasting
 */

class MarketAPI {
    constructor() {
        this.config = {
            baseUrl: CONFIG.API.MARKET.BASE_URL || 'https://api.commoditymarket.com/v1',
            apiKey: CONFIG.API.MARKET.KEY || 'YOUR_API_KEY',
            endpoints: CONFIG.API.MARKET.ENDPOINTS || {
                PRICES: '/prices',
                TRENDS: '/trends',
                FORECAST: '/forecast',
                COMMODITIES: '/commodities',
                HISTORICAL: '/historical'
            }
        };
        
        this.cache = {
            prices: null,
            trends: null,
            forecast: null,
            timestamp: null,
            ttl: 600000 // 10 minutes
        };
    }

    /**
     * Get current market prices for commodities
     * @param {Array} commodities - List of commodities to fetch
     * @returns {Promise<Object>} Current prices
     */
    async getCurrentPrices(commodities = ['Wheat', 'Corn', 'Soybean']) {
        try {
            if (this.isCacheValid() && this.cache.prices) {
                return this.cache.prices;
            }

            // If no real API, generate sample data
            const prices = this.generateSamplePrices(commodities);
            
            this.cache.prices = prices;
            this.cache.timestamp = Date.now();
            
            return prices;
        } catch (error) {
            console.error('Failed to fetch market prices:', error);
            return this.generateSamplePrices(commodities);
        }
    }

    /**
     * Get price trends for a commodity
     * @param {string} commodity - Commodity name
     * @param {number} days - Number of days of trend data
     * @returns {Promise<Object>} Price trend data
     */
    async getPriceTrends(commodity = 'Wheat', days = 30) {
        try {
            const trends = this.generateSampleTrends(commodity, days);
            return trends;
        } catch (error) {
            console.error('Failed to fetch price trends:', error);
            return this.generateSampleTrends(commodity, days);
        }
    }

    /**
     * Get price forecast for a commodity
     * @param {string} commodity - Commodity name
     * @param {number} days - Number of days to forecast
     * @returns {Promise<Object>} Price forecast
     */
    async getPriceForecast(commodity = 'Wheat', days = 30) {
        try {
            const forecast = this.generateSampleForecast(commodity, days);
            return forecast;
        } catch (error) {
            console.error('Failed to fetch price forecast:', error);
            return this.generateSampleForecast(commodity, days);
        }
    }

    /**
     * Get comprehensive market intelligence
     * @param {Array} commodities - List of commodities
     * @returns {Promise<Object>} Market intelligence data
     */
    async getMarketIntelligence(commodities = ['Wheat', 'Corn', 'Soybean']) {
        try {
            const [prices, trends] = await Promise.all([
                this.getCurrentPrices(commodities),
                this.getPriceTrends(commodities[0] || 'Wheat', 30)
            ]);

            return {
                prices: prices,
                trends: trends,
                timestamp: new Date().toISOString(),
                summary: this.generateMarketSummary(prices)
            };
        } catch (error) {
            console.error('Failed to get market intelligence:', error);
            return this.getFallbackMarketData();
        }
    }

    /**
     * Generate sample price data (mock API response)
     * @param {Array} commodities - List of commodities
     * @returns {Object} Sample price data
     */
    generateSamplePrices(commodities) {
        const basePrices = {
            'Wheat': 4.25,
            'Corn': 3.85,
            'Soybean': 12.45,
            'Tomato': 0.85,
            'Potato': 0.45,
            'Rice': 14.50,
            'Cotton': 0.75
        };

        const result = {};
        commodities.forEach(commodity => {
            const basePrice = basePrices[commodity] || 5.00;
            const variation = (Math.random() - 0.5) * 0.4;
            const price = Math.round((basePrice + variation) * 100) / 100;
            const change = Math.round((Math.random() - 0.3) * 0.6 * 100) / 100;
            
            result[commodity] = {
                name: commodity,
                price: price,
                change: change,
                change_percent: Math.round((change / price) * 1000) / 10,
                unit: 'USD/bushel',
                trend: change > 0 ? 'Up' : change < 0 ? 'Down' : 'Stable',
                last_updated: new Date().toISOString(),
                volume: Math.round(1000 + Math.random() * 9000),
                high_52week: Math.round((basePrice * 1.2) * 100) / 100,
                low_52week: Math.round((basePrice * 0.8) * 100) / 100
            };
        });

        return result;
    }

    /**
     * Generate sample trend data
     * @param {string} commodity - Commodity name
     * @param {number} days - Number of days
     * @returns {Object} Trend data
     */
    generateSampleTrends(commodity, days) {
        const basePrice = {
            'Wheat': 4.25,
            'Corn': 3.85,
            'Soybean': 12.45,
            'Tomato': 0.85,
            'Potato': 0.45,
            'Rice': 14.50,
            'Cotton': 0.75
        }[commodity] || 5.00;

        const historical = [];
        const now = new Date();
        let currentPrice = basePrice * 0.9;

        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Random walk with slight upward bias
            currentPrice = currentPrice * (1 + (Math.random() - 0.48) * 0.02);
            currentPrice = Math.max(0.5, currentPrice);
            
            historical.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                price: Math.round(currentPrice * 100) / 100,
                volume: Math.round(1000 + Math.random() * 9000)
            });
        }

        const current = historical[historical.length - 1];
        const previous = historical[historical.length - 2] || current;
        const change = current.price - previous.price;

        return {
            commodity: commodity,
            current_price: current.price,
            change: change,
            change_percent: Math.round((change / previous.price) * 1000) / 10,
            high: Math.max(...historical.map(h => h.price)),
            low: Math.min(...historical.map(h => h.price)),
            average: Math.round(historical.reduce((sum, h) => sum + h.price, 0) / historical.length * 100) / 100,
            historical: historical,
            trend: change > 0 ? 'Bullish' : change < 0 ? 'Bearish' : 'Neutral',
            volatility: Math.round(Math.random() * 20 + 5) // Simulated volatility percentage
        };
    }

    /**
     * Generate sample forecast data
     * @param {string} commodity - Commodity name
     * @param {number} days - Number of days to forecast
     * @returns {Object} Forecast data
     */
    generateSampleForecast(commodity, days) {
        const basePrice = {
            'Wheat': 4.25,
            'Corn': 3.85,
            'Soybean': 12.45
        }[commodity] || 5.00;

        const forecast = [];
        const now = new Date();
        let currentPrice = basePrice;

        // Generate forecast with trend
        const trend = (Math.random() - 0.4) * 0.03; // Slight upward bias
        
        for (let i = 1; i <= days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            
            // Add trend with some randomness
            currentPrice = currentPrice * (1 + trend + (Math.random() - 0.5) * 0.015);
            currentPrice = Math.max(0.5, currentPrice);
            
            forecast.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                price: Math.round(currentPrice * 100) / 100,
                confidence_low: Math.round((currentPrice * 0.92) * 100) / 100,
                confidence_high: Math.round((currentPrice * 1.08) * 100) / 100
            });
        }

        return {
            commodity: commodity,
            forecast: forecast,
            predicted_trend: trend > 0 ? 'Upward' : 'Downward',
            confidence_level: Math.round(70 + Math.random() * 25), // Percentage
            recommendation: trend > 0 ? 'Hold/Sell' : 'Buy/Store',
            summary: this.generateForecastSummary(commodity, forecast)
        };
    }

    /**
     * Generate market summary
     * @param {Object} prices - Price data
     * @returns {Object} Market summary
     */
    generateMarketSummary(prices) {
        const commodities = Object.keys(prices);
        const totalValue = commodities.reduce((sum, c) => sum + prices[c].price, 0);
        const avgPrice = totalValue / commodities.length;
        const maxCommodity = commodities.reduce((max, c) => 
            prices[c].price > prices[max].price ? c : max
        , commodities[0]);
        const minCommodity = commodities.reduce((min, c) => 
            prices[c].price < prices[min].price ? c : min
        , commodities[0]);

        return {
            total_commodities: commodities.length,
            average_price: Math.round(avgPrice * 100) / 100,
            highest_priced: {
                commodity: maxCommodity,
                price: prices[maxCommodity].price
            },
            lowest_priced: {
                commodity: minCommodity,
                price: prices[minCommodity].price
            },
            market_status: avgPrice > 5 ? 'Favorable' : 'Neutral',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate forecast summary
     * @param {string} commodity - Commodity name
     * @param {Array} forecast - Forecast data
     * @returns {string} Forecast summary
     */
    generateForecastSummary(commodity, forecast) {
        const startPrice = forecast[0]?.price || 0;
        const endPrice = forecast[forecast.length - 1]?.price || 0;
        const change = endPrice - startPrice;
        const changePercent = (change / startPrice * 100);
        
        let outlook = '';
        if (changePercent > 5) outlook = 'strongly positive';
        else if (changePercent > 2) outlook = 'positive';
        else if (changePercent > -2) outlook = 'stable';
        else if (changePercent > -5) outlook = 'negative';
        else outlook = 'strongly negative';

        return `Prices for ${commodity} are expected to trend ${outlook} with an estimated ${Math.abs(Math.round(changePercent))}% change over the forecast period.`;
    }

    /**
     * Check cache validity
     * @returns {boolean} Whether cache is valid
     */
    isCacheValid() {
        if (!this.cache.timestamp) return false;
        return (Date.now() - this.cache.timestamp) < this.cache.ttl;
    }

    /**
     * Get fallback market data
     * @returns {Object} Fallback market data
     */
    getFallbackMarketData() {
        return {
            prices: {
                'Wheat': { name: 'Wheat', price: 4.25, change: 0.12, change_percent: 2.9, trend: 'Up', unit: 'USD/bushel' },
                'Corn': { name: 'Corn', price: 3.85, change: -0.04, change_percent: -1.0, trend: 'Down', unit: 'USD/bushel' },
                'Soybean': { name: 'Soybean', price: 12.45, change: 0.35, change_percent: 2.9, trend: 'Up', unit: 'USD/bushel' }
            },
            trends: {
                commodity: 'Wheat',
                current_price: 4.25,
                change: 0.12,
                change_percent: 2.9,
                historical: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    price: Math.round((3.8 + Math.random() * 0.8) * 100) / 100
                }))
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get breakeven analysis for a crop
     * @param {string} cropType - Crop type
     * @param {Object} costs - Production costs
     * @returns {Object} Breakeven analysis
     */
    getBreakevenAnalysis(cropType, costs) {
        const defaultCosts = {
            land: 150,
            machinery: 75,
            seed: 50,
            chemical: 60,
            fertilizer: 80,
            labor: 100,
            other: 35
        };

        const totalCosts = { ...defaultCosts, ...costs };
        const totalPerAcre = Object.values(totalCosts).reduce((sum, val) => sum + val, 0);
        
        const avgYields = {
            'Wheat': 45,
            'Corn': 175,
            'Soybean': 45,
            'Tomato': 20,
            'Potato': 20,
            'Rice': 45,
            'Cotton': 1.5
        };

        const yieldPerAcre = avgYields[cropType] || 40;
        const currentPrice = this.generateSamplePrices([cropType])[cropType]?.price || 4.00;
        
        const breakevenYield = totalPerAcre / currentPrice;
        const profitAtAverage = (yieldPerAcre * currentPrice) - totalPerAcre;
        const profitMargin = (profitAtAverage / (yieldPerAcre * currentPrice)) * 100;

        return {
            crop: cropType,
            total_cost_per_acre: Math.round(totalPerAcre * 100) / 100,
            average_yield_per_acre: yieldPerAcre,
            current_price: currentPrice,
            breakeven_yield: Math.round(breakevenYield * 100) / 100,
            profit_at_average_yield: Math.round(profitAtAverage * 100) / 100,
            profit_margin: Math.round(profitMargin * 10) / 10,
            recommendation: profitMargin > 20 ? 'Profitable' : profitMargin > 0 ? 'Marginal' : 'Loss',
            cost_breakdown: totalCosts
        };
    }
}

// Export for use in other files
window.MarketAPI = MarketAPI;