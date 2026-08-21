/**
 * Chart Helpers - Chart.js Utilities
 * Provides helper functions for creating and managing charts
 */

class ChartHelpers {
    /**
     * Create a standard chart configuration
     * @param {Object} options - Chart options
     * @returns {Object} Chart configuration
     */
    static createChartConfig(options = {}) {
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };

        return {
            ...defaultOptions,
            ...options
        };
    }

    /**
     * Create a line chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Line chart configuration
     */
    static createLineChart(data, options = {}) {
        const defaultData = {
            labels: [],
            datasets: []
        };

        const config = this.createChartConfig({
            ...options,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.3
                },
                point: {
                    radius: 3,
                    hoverRadius: 6
                }
            }
        });

        return {
            type: 'line',
            data: { ...defaultData, ...data },
            options: config
        };
    }

    /**
     * Create a bar chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Bar chart configuration
     */
    static createBarChart(data, options = {}) {
        const defaultData = {
            labels: [],
            datasets: []
        };

        const config = this.createChartConfig({
            ...options,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        });

        return {
            type: 'bar',
            data: { ...defaultData, ...data },
            options: config
        };
    }

    /**
     * Create a pie chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Pie chart configuration
     */
    static createPieChart(data, options = {}) {
        const defaultData = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: []
            }]
        };

        const config = this.createChartConfig({
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        });

        // Generate colors if not provided
        if (!data.datasets?.[0]?.backgroundColor) {
            data.datasets = data.datasets || [{}];
            data.datasets[0].backgroundColor = this.generateColors(data.labels?.length || 0);
        }

        return {
            type: 'pie',
            data: { ...defaultData, ...data },
            options: config
        };
    }

    /**
     * Create a doughnut chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Doughnut chart configuration
     */
    static createDoughnutChart(data, options = {}) {
        const config = this.createPieChart(data, {
            ...options,
            cutout: '60%'
        });
        config.type = 'doughnut';
        return config;
    }

    /**
     * Create a radar chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Radar chart configuration
     */
    static createRadarChart(data, options = {}) {
        const defaultData = {
            labels: [],
            datasets: []
        };

        const config = this.createChartConfig({
            ...options,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        });

        return {
            type: 'radar',
            data: { ...defaultData, ...data },
            options: config
        };
    }

    /**
     * Create a scatter chart configuration
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Scatter chart configuration
     */
    static createScatterChart(data, options = {}) {
        const defaultData = {
            datasets: []
        };

        const config = this.createChartConfig({
            ...options,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 8
                }
            }
        });

        return {
            type: 'scatter',
            data: { ...defaultData, ...data },
            options: config
        };
    }

    /**
     * Generate chart colors
     * @param {number} count - Number of colors needed
     * @param {string} palette - Color palette name
     * @returns {Array} Array of color strings
     */
    static generateColors(count, palette = 'agriculture') {
        const palettes = {
            agriculture: [
                '#2E7D32', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7',
                '#1565C0', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB',
                '#F57C00', '#FFA726', '#FFB74D', '#FFCC80', '#FFE0B2',
                '#C62828', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2'
            ],
            weather: [
                '#1A237E', '#283593', '#303F9F', '#3F51B5', '#5C6BC0',
                '#42A5F5', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE'
            ],
            crop: [
                '#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50',
                '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'
            ],
            soil: [
                '#4E342E', '#5D4037', '#6D4C41', '#795548', '#8D6E63',
                '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9', '#F5F5F5'
            ]
        };

        const selectedPalette = palettes[palette] || palettes.agriculture;
        const colors = [];

        for (let i = 0; i < count; i++) {
            colors.push(selectedPalette[i % selectedPalette.length]);
        }

        return colors;
    }

    /**
     * Create time series data for agricultural metrics
     * @param {Array} data - Data points
     * @param {string} metric - Metric name
     * @param {Object} options - Additional options
     * @returns {Object} Time series chart data
     */
    static createTimeSeries(data, metric, options = {}) {
        const labels = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const values = data.map(d => d[metric]);

        const colors = options.color ? [options.color] : this.generateColors(1, options.palette);

        return {
            labels: labels,
            datasets: [{
                label: options.label || metric,
                data: values,
                borderColor: colors[0],
                backgroundColor: this.hexToRgba(colors[0], 0.1),
                fill: options.fill !== undefined ? options.fill : true,
                tension: options.tension || 0.3
            }]
        };
    }

    /**
     * Create multi-metric comparison chart
     * @param {Array} data - Data points with multiple metrics
     * @param {Array} metrics - Array of metric names
     * @param {Object} options - Additional options
     * @returns {Object} Comparison chart data
     */
    static createComparisonChart(data, metrics, options = {}) {
        const labels = data.map(d => d.label || d.name || '');
        const datasets = [];

        const colors = this.generateColors(metrics.length, options.palette);

        metrics.forEach((metric, index) => {
            const values = data.map(d => d[metric]);
            datasets.push({
                label: options.labels?.[index] || metric,
                data: values,
                backgroundColor: colors[index],
                borderColor: colors[index],
                borderWidth: 2
            });
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    /**
     * Create soil health radar chart data
     * @param {Object} soilData - Soil data
     * @returns {Object} Radar chart data
     */
    static createSoilHealthRadar(soilData) {
        const metrics = {
            'Organic Matter': soilData.organic_matter || 3,
            'Nitrogen': soilData.npk?.nitrogen || 20,
            'Phosphorus': soilData.npk?.phosphorus || 15,
            'Potassium': soilData.npk?.potassium || 25,
            'pH': (soilData.ph || 6.5) - 4, // Scale pH to 0-10
            'Moisture': soilData.moisture || 60
        };

        const normalizedMetrics = {};
        Object.entries(metrics).forEach(([key, value]) => {
            // Normalize to 0-100 scale
            if (key === 'pH') {
                normalizedMetrics[key] = ((value - 4) / 6) * 100; // pH 4-10 mapped to 0-100
            } else if (key === 'Moisture') {
                normalizedMetrics[key] = value;
            } else {
                normalizedMetrics[key] = (value / 50) * 100; // Assuming max 50 for nutrients
            }
            normalizedMetrics[key] = Math.min(100, Math.max(0, normalizedMetrics[key]));
        });

        return {
            labels: Object.keys(normalizedMetrics),
            datasets: [{
                label: 'Soil Health',
                data: Object.values(normalizedMetrics),
                backgroundColor: 'rgba(46, 125, 50, 0.2)',
                borderColor: '#2E7D32',
                pointBackgroundColor: '#2E7D32',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#2E7D32'
            }]
        };
    }

    /**
     * Create crop health trend chart data
     * @param {Array} healthData - Historical health data
     * @returns {Object} Trend chart data
     */
    static createHealthTrend(healthData) {
        const labels = healthData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const healthValues = healthData.map(d => d.health || 0);
        const ndviValues = healthData.map(d => (d.ndvi || 0) * 100);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Overall Health',
                    data: healthValues,
                    borderColor: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'NDVI Index',
                    data: ndviValues,
                    borderColor: '#1565C0',
                    backgroundColor: 'rgba(21, 101, 192, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1',
                    borderDash: [5, 5]
                }
            ]
        };
    }

    /**
     * Hex color to RGBA
     * @param {string} hex - Hex color code
     * @param {number} alpha - Alpha value
     * @returns {string} RGBA color string
     */
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Update chart data with animation
     * @param {Object} chart - Chart.js instance
     * @param {Object} newData - New chart data
     * @param {number} delay - Animation delay
     */
    static async updateChart(chart, newData, delay = 500) {
        if (!chart) return;

        return new Promise((resolve) => {
            setTimeout(() => {
                chart.data = newData;
                chart.update();
                resolve();
            }, delay);
        });
    }

    /**
     * Create chart for market price trends
     * @param {Array} priceData - Historical price data
     * @param {string} commodity - Commodity name
     * @param {number} forecastDays - Days to forecast
     * @returns {Object} Price trend chart data
     */
    static createPriceTrendChart(priceData, commodity, forecastDays = 0) {
        const labels = priceData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const prices = priceData.map(d => d.price);
        const confidenceLow = priceData.map(d => d.confidence_low || d.price * 0.9);
        const confidenceHigh = priceData.map(d => d.confidence_high || d.price * 1.1);

        const datasets = [
            {
                label: `${commodity} Price`,
                data: prices,
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fill: true,
                tension: 0.3
            }
        ];

        if (forecastDays > 0) {
            // Add forecast confidence band
            const forecastPrices = prices.slice(-forecastDays);
            const forecastLabels = labels.slice(-forecastDays);
            
            datasets.push({
                label: 'Forecast Range',
                data: confidenceHigh.slice(-forecastDays),
                borderColor: 'rgba(46, 125, 50, 0.2)',
                backgroundColor: 'rgba(46, 125, 50, 0.05)',
                fill: '+1',
                tension: 0.3,
                pointRadius: 0
            });
        }

        return {
            labels: labels,
            datasets: datasets
        };
    }

    /**
     * Create yield prediction chart
     * @param {Object} yieldData - Yield prediction data
     * @returns {Object} Yield chart data
     */
    static createYieldPredictionChart(yieldData) {
        const categories = ['Estimated', 'Potential', 'Historical Average', 'Breakeven'];
        const values = [
            yieldData.estimated || 0,
            yieldData.potential || 0,
            yieldData.historical_average || 0,
            yieldData.breakeven || 0
        ];

        const colors = ['#2E7D32', '#1565C0', '#F57C00', '#C62828'];

        return {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors.map(c => this.hexToRgba(c, 0.7)),
                borderColor: colors,
                borderWidth: 2
            }]
        };
    }

    /**
     * Create weather forecast chart
     * @param {Array} forecastData - Weather forecast data
     * @returns {Object} Weather chart data
     */
    static createWeatherForecastChart(forecastData) {
        const labels = forecastData.map(d => d.day || d.date);
        const tempsHigh = forecastData.map(d => d.high || 0);
        const tempsLow = forecastData.map(d => d.low || 0);
        const precipitation = forecastData.map(d => d.precipitation || 0);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'High Temperature',
                    data: tempsHigh,
                    borderColor: '#C62828',
                    backgroundColor: 'rgba(198, 40, 40, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Low Temperature',
                    data: tempsLow,
                    borderColor: '#1565C0',
                    backgroundColor: 'rgba(21, 101, 192, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Precipitation (mm)',
                    data: precipitation,
                    borderColor: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.2)',
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        };
    }
}

// Export for use in other files
window.ChartHelpers = ChartHelpers;