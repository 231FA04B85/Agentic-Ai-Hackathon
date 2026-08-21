/**
 * Dashboard Page Logic
 * Main dashboard with real-time farm overview, statistics, and key metrics
 * Displays integrated view of all farm operations including weather, crops, soil, and market
 */

class DashboardPage {
    constructor() {
        // State management
        this.state = {
            fields: [],
            weather: null,
            recommendations: [],
            marketData: null,
            soilData: null,
            alerts: [],
            stats: {
                totalFields: 0,
                activeFields: 0,
                totalArea: 0,
                avgHealth: 0,
                riskLevel: 'Low',
                marketTrend: 'Stable'
            },
            lastUpdate: null,
            isRefreshing: false
        };

        // Chart instances for cleanup
        this.chartInstances = {
            market: null,
            health: null,
            distribution: null,
            weather: null
        };

        // Update intervals
        this.updateInterval = null;
        this.realTimeInterval = null;

        // DOM references
        this.elements = {};

        this.initialize();
    }

    /**
     * Initialize the dashboard
     */
    initialize() {
        console.log('📊 Dashboard Page initializing...');
        
        this.cacheDomElements();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardData();
        this.startAutoRefresh();
        this.startRealTimeUpdates();
        
        console.log('✅ Dashboard Page initialized');
    }

    /**
     * Cache DOM elements for performance
     */
    cacheDomElements() {
        this.elements = {
            // Stats
            totalFields: document.getElementById('activeFields'),
            totalArea: document.getElementById('totalArea'),
            avgHealth: document.getElementById('avgHealth'),
            riskLevel: document.getElementById('riskLevel'),
            
            // Weather
            currentTemp: document.getElementById('currentTemp'),
            weatherCondition: document.getElementById('weatherCondition'),
            weatherForecast: document.getElementById('weatherForecast'),
            
            // Market
            marketPrice: document.getElementById('marketPrice'),
            marketChange: document.getElementById('marketChange'),
            
            // Fields
            fieldList: document.getElementById('fieldList'),
            
            // Recommendations
            recommendationList: document.getElementById('recommendationList'),
            
            // Charts
            marketChart: document.getElementById('marketChart'),
            healthChart: document.getElementById('healthChart'),
            distributionChart: document.getElementById('distributionChart'),
            weatherChart: document.getElementById('weatherChart'),
            
            // Timestamps
            lastUpdateTime: document.getElementById('lastUpdateTime'),
            
            // Buttons
            refreshBtn: document.getElementById('refreshDataBtn'),
            viewAllRecs: document.getElementById('viewAllRecs'),
            
            // Containers
            alertContainer: document.getElementById('alertContainer'),
            quickActions: document.getElementById('quickActions')
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Refresh button
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // View all recommendations
        if (this.elements.viewAllRecs) {
            this.elements.viewAllRecs.addEventListener('click', () => {
                window.location.href = 'recommendations.html';
            });
        }

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action) {
                    this.handleQuickAction(action);
                }
            });
        });

        // Custom events from other components
        document.addEventListener('fieldSelected', (e) => {
            this.handleFieldSelected(e.detail);
        });

        document.addEventListener('recommendationGenerated', (e) => {
            this.handleRecommendationUpdate(e.detail);
        });

        document.addEventListener('weatherAlert', (e) => {
            this.handleWeatherAlert(e.detail);
        });

        document.addEventListener('soilAlert', (e) => {
            this.handleSoilAlert(e.detail);
        });

        document.addEventListener('marketAlert', (e) => {
            this.handleMarketAlert(e.detail);
        });

        // Visibility change - pause updates when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRefresh();
            } else {
                this.resumeAutoRefresh();
                this.loadDashboardData();
            }
        });

        // Window resize - update charts
        window.addEventListener('resize', this.debounce(() => {
            this.resizeCharts();
        }, 250));
    }

    /**
     * Load all dashboard data
     */
    async loadDashboardData() {
        try {
            this.showLoading(true);

            // Fetch all data in parallel
            const [fields, weather, recommendations, market, soil] = await Promise.all([
                this.fetchFields(),
                this.fetchWeather(),
                this.fetchRecommendations(),
                this.fetchMarketData(),
                this.fetchSoilData()
            ]);

            // Update state
            this.state.fields = fields || [];
            this.state.weather = weather;
            this.state.recommendations = recommendations || [];
            this.state.marketData = market;
            this.state.soilData = soil;
            this.state.lastUpdate = new Date();

            // Calculate statistics
            this.calculateStats();

            // Render all sections
            this.renderStats();
            this.renderWeather(weather);
            this.renderFields(fields);
            this.renderRecommendations(recommendations);
            this.renderMarket(market);
            this.renderAlerts();
            this.updateTimestamp();

            // Update charts
            this.updateCharts();

            // Dispatch data loaded event
            document.dispatchEvent(new CustomEvent('dashboardLoaded', {
                detail: { state: this.state }
            }));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data. Please try refreshing.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Fetch fields data from agents
     */
    async fetchFields() {
        try {
            if (window.orchestrator) {
                return await window.orchestrator.getFieldData();
            } else if (window.cropAgent) {
                return await window.cropAgent.getFieldData();
            } else {
                return this.generateSampleFields();
            }
        } catch (error) {
            console.error('Error fetching fields:', error);
            return this.generateSampleFields();
        }
    }

    /**
     * Fetch weather data
     */
    async fetchWeather() {
        try {
            if (window.weatherAPI) {
                return await window.weatherAPI.getWeatherData();
            } else if (window.orchestrator) {
                return await window.orchestrator.getWeatherData();
            } else {
                return this.generateSampleWeather();
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.generateSampleWeather();
        }
    }

    /**
     * Fetch recommendations
     */
    async fetchRecommendations() {
        try {
            if (window.orchestrator) {
                return await window.orchestrator.getRecommendations();
            } else if (window.recommendationAPI) {
                return await window.recommendationAPI.getRecommendations();
            } else {
                return this.generateSampleRecommendations();
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return this.generateSampleRecommendations();
        }
    }

    /**
     * Fetch market data
     */
    async fetchMarketData() {
        try {
            if (window.marketAPI) {
                return await window.marketAPI.getMarketData();
            } else if (window.orchestrator) {
                return await window.orchestrator.getMarketData();
            } else {
                return this.generateSampleMarket();
            }
        } catch (error) {
            console.error('Error fetching market data:', error);
            return this.generateSampleMarket();
        }
    }

    /**
     * Fetch soil data
     */
    async fetchSoilData() {
        try {
            if (window.soilAPI) {
                return await window.soilAPI.getSoilData();
            } else if (window.orchestrator) {
                return await window.orchestrator.getSoilData();
            } else {
                return this.generateSampleSoil();
            }
        } catch (error) {
            console.error('Error fetching soil data:', error);
            return this.generateSampleSoil();
        }
    }

    /**
     * Calculate dashboard statistics
     */
    calculateStats() {
        const fields = this.state.fields || [];
        const totalFields = fields.length;
        const activeFields = fields.filter(f => f.status === 'Active' || !f.status).length;
        const totalArea = fields.reduce((sum, f) => sum + (f.area || 0), 0);
        const avgHealth = totalFields > 0 
            ? fields.reduce((sum, f) => sum + (f.health || 0), 0) / totalFields 
            : 0;

        // Calculate risk level based on recommendations
        const highPriority = this.state.recommendations.filter(r => 
            r.priority === 'high' || r.priority === 'High' || r.priority === 'Critical'
        ).length;

        let riskLevel = 'Low';
        if (highPriority > 3) riskLevel = 'Critical';
        else if (highPriority > 1) riskLevel = 'Moderate';

        // Determine market trend
        let marketTrend = 'Stable';
        if (this.state.marketData) {
            const trends = this.state.marketData.trends || {};
            const bullCount = Object.values(trends).filter(t => t.trend === 'BULLISH').length;
            const bearCount = Object.values(trends).filter(t => t.trend === 'BEARISH').length;
            if (bullCount > bearCount * 1.5) marketTrend = 'Bullish';
            else if (bearCount > bullCount * 1.5) marketTrend = 'Bearish';
        }

        this.state.stats = {
            totalFields,
            activeFields,
            totalArea: Math.round(totalArea * 10) / 10,
            avgHealth: Math.round(avgHealth),
            riskLevel,
            marketTrend
        };
    }

    /**
     * Render statistics cards
     */
    renderStats() {
        const { totalFields, activeFields, totalArea, avgHealth, riskLevel } = this.state.stats;

        // Update stat cards
        if (this.elements.totalFields) {
            this.elements.totalFields.textContent = totalFields;
        }

        if (this.elements.totalArea) {
            this.elements.totalArea.textContent = totalArea + ' ha';
        }

        if (this.elements.avgHealth) {
            this.elements.avgHealth.textContent = avgHealth + '%';
        }

        if (this.elements.riskLevel) {
            this.elements.riskLevel.textContent = riskLevel;
            this.elements.riskLevel.className = `stat-number risk-level ${riskLevel.toLowerCase()}`;
        }
    }

    /**
     * Render weather section
     */
    renderWeather(weather) {
        if (!weather) return;

        const current = weather.current || weather;

        // Current weather
        if (this.elements.currentTemp) {
            this.elements.currentTemp.textContent = `${current.temp || current.temperature || 0}°C`;
        }

        if (this.elements.weatherCondition) {
            this.elements.weatherCondition.textContent = current.condition || 'Unknown';
        }

        // Weather forecast
        if (this.elements.weatherForecast) {
            const forecast = weather.forecast || [];
            if (forecast.length > 0) {
                this.elements.weatherForecast.innerHTML = forecast.slice(0, 7).map(day => `
                    <div class="forecast-day">
                        <span class="day-name">${day.day}</span>
                        <i class="fas ${day.icon || 'fa-cloud'}"></i>
                        <span class="day-temp">${day.high || day.max || 0}°/${day.low || day.min || 0}°</span>
                    </div>
                `).join('');
            } else {
                this.elements.weatherForecast.innerHTML = '<div class="forecast-day">No forecast data</div>';
            }
        }
    }

    /**
     * Render fields list
     */
    renderFields(fields) {
        if (!this.elements.fieldList) return;

        const displayFields = fields.slice(0, 5);

        if (displayFields.length === 0) {
            this.elements.fieldList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling"></i>
                    <p>No fields found</p>
                </div>
            `;
            return;
        }

        this.elements.fieldList.innerHTML = displayFields.map(field => `
            <div class="field-item" data-field-id="${field.id}">
                <div class="field-info">
                    <span class="field-name">${field.name || 'Unnamed Field'}</span>
                    <span class="field-crop">${field.cropType || 'No crop'}</span>
                </div>
                <div class="field-status">
                    <span class="status-badge ${this.getHealthClass(field.health || 0)}">
                        ${field.health || 0}%
                    </span>
                    <span class="field-stage">${field.growthStage || 'Unknown'}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render recommendations
     */
    renderRecommendations(recommendations) {
        if (!this.elements.recommendationList) return;

        const displayRecs = recommendations.slice(0, 3);

        if (displayRecs.length === 0) {
            this.elements.recommendationList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <p>No recommendations available</p>
                </div>
            `;
            return;
        }

        this.elements.recommendationList.innerHTML = displayRecs.map(rec => `
            <div class="recommendation-item" data-rec-id="${rec.id}">
                <div class="rec-icon">
                    <i class="fas ${rec.icon || 'fa-lightbulb'}"></i>
                </div>
                <div class="rec-content">
                    <h4>${rec.title || 'Recommendation'}</h4>
                    <p>${rec.summary || rec.description || ''}</p>
                    <div class="rec-meta">
                        <span class="rec-priority ${(rec.priority || 'medium').toLowerCase()}">
                            ${rec.priority || 'Medium'}
                        </span>
                        <span class="rec-time">${rec.time || 'Now'}</span>
                    </div>
                </div>
                <button class="btn-sm" onclick="window.location.href='recommendations.html?id=${rec.id}'">
                    View
                </button>
            </div>
        `).join('');
    }

    /**
     * Render market data
     */
    renderMarket(market) {
        if (!market) return;

        // Current price
        if (this.elements.marketPrice) {
            const price = market.currentPrice || market.current?.price || 0;
            this.elements.marketPrice.textContent = `$${price.toFixed(2)}`;
        }

        // Price change
        if (this.elements.marketChange) {
            const change = market.change || market.current?.change || 0;
            const changePercent = market.changePercent || market.current?.change_percent || 0;
            const direction = change >= 0 ? 'positive' : 'negative';
            const icon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            this.elements.marketChange.innerHTML = `
                <i class="fas ${icon}"></i>
                ${changePercent.toFixed(1)}%
            `;
            this.elements.marketChange.className = `stat-change ${direction}`;
        }
    }

    /**
     * Render alerts
     */
    renderAlerts() {
        const alerts = this.state.alerts || [];
        if (!this.elements.alertContainer) return;

        if (alerts.length === 0) {
            this.elements.alertContainer.innerHTML = '';
            return;
        }

        this.elements.alertContainer.innerHTML = alerts.slice(0, 3).map(alert => `
            <div class="alert-item alert-${alert.severity?.toLowerCase() || 'info'}">
                <i class="fas ${this.getAlertIcon(alert.type)}"></i>
                <div class="alert-content">
                    <strong>${alert.type || 'Alert'}</strong>
                    <p>${alert.message || ''}</p>
                </div>
                <button class="alert-close" onclick="this.closest('.alert-item').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Update timestamp
     */
    updateTimestamp() {
        if (this.elements.lastUpdateTime) {
            const now = this.state.lastUpdate || new Date();
            this.elements.lastUpdateTime.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Initialize chart.js instances
     */
    initializeCharts() {
        // Market Chart
        if (this.elements.marketChart) {
            const ctx = this.elements.marketChart.getContext('2d');
            this.chartInstances.market = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Market Price',
                        data: [],
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `$${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
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
                }
            });
        }

        // Health Chart
        if (this.elements.healthChart) {
            const ctx = this.elements.healthChart.getContext('2d');
            this.chartInstances.health = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Crop Health',
                        data: [],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
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
                }
            });
        }

        // Distribution Chart
        if (this.elements.distributionChart) {
            const ctx = this.elements.distributionChart.getContext('2d');
            this.chartInstances.distribution = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#2E7D32', '#1565C0', '#F57C00', '#C62828', '#9C27B0', '#009688']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 10,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // Weather Chart
        if (this.elements.weatherChart) {
            const ctx = this.elements.weatherChart.getContext('2d');
            this.chartInstances.weather = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Precipitation (mm)',
                        data: [],
                        backgroundColor: 'rgba(21, 101, 192, 0.6)',
                        borderColor: '#1565C0',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
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
                }
            });
        }
    }

    /**
     * Update all charts with current data
     */
    updateCharts() {
        this.updateMarketChart();
        this.updateHealthChart();
        this.updateDistributionChart();
        this.updateWeatherChart();
    }

    /**
     * Update market chart
     */
    updateMarketChart() {
        const chart = this.chartInstances.market;
        if (!chart) return;

        const market = this.state.marketData;
        if (!market || !market.historical) return;

        const historicalData = Array.isArray(market.historical)
            ? market.historical
            : market.historical.Wheat || [];
        const historical = historicalData.slice(-30);
        const labels = historical.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const prices = historical.map(d => d.price);

        chart.data.labels = labels;
        chart.data.datasets[0].data = prices;
        chart.update();
    }

    /**
     * Update health chart
     */
    updateHealthChart() {
        const chart = this.chartInstances.health;
        if (!chart) return;

        const fields = this.state.fields;
        if (!fields || fields.length === 0) return;

        // Group by date or use field indices
        const labels = fields.map(f => f.name || 'Field');
        const healthData = fields.map(f => f.health || 0);

        chart.data.labels = labels;
        chart.data.datasets[0].data = healthData;
        chart.update();
    }

    /**
     * Update distribution chart
     */
    updateDistributionChart() {
        const chart = this.chartInstances.distribution;
        if (!chart) return;

        const fields = this.state.fields;
        if (!fields || fields.length === 0) return;

        // Count by crop type
        const cropCounts = {};
        fields.forEach(f => {
            const crop = f.cropType || 'Unknown';
            cropCounts[crop] = (cropCounts[crop] || 0) + 1;
        });

        const labels = Object.keys(cropCounts);
        const data = Object.values(cropCounts);

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }

    /**
     * Update weather chart
     */
    updateWeatherChart() {
        const chart = this.chartInstances.weather;
        if (!chart) return;

        const weather = this.state.weather;
        if (!weather || !weather.forecast) return;

        const forecast = weather.forecast.slice(0, 7);
        const labels = forecast.map(d => d.day);
        const precipitation = forecast.map(d => d.precipitation || 0);

        chart.data.labels = labels;
        chart.data.datasets[0].data = precipitation;
        chart.update();
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
        if (this.state.isRefreshing) return;

        this.state.isRefreshing = true;
        const btn = this.elements.refreshBtn;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        }

        try {
            await this.loadDashboardData();
            this.showToast('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showToast('Failed to refresh dashboard. Please try again.', 'error');
        } finally {
            this.state.isRefreshing = false;
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh All';
            }
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.updateInterval = setInterval(() => {
            this.loadDashboardData();
        }, 300000);
    }

    /**
     * Start real-time updates (WebSocket simulation)
     */
    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        this.realTimeInterval = setInterval(() => {
            this.checkForRealTimeUpdates();
        }, 30000);
    }

    /**
     * Check for real-time updates
     */
    checkForRealTimeUpdates() {
        // Randomly simulate real-time events
        if (Math.random() > 0.7) {
            // Simulate a new recommendation
            const rec = this.generateRandomRecommendation();
            this.state.recommendations.unshift(rec);
            this.renderRecommendations(this.state.recommendations);
            
            this.showToast(`New recommendation: ${rec.title}`, 'info');
        }

        if (Math.random() > 0.85) {
            // Simulate an alert
            this.state.alerts.unshift({
                type: 'Weather Update',
                message: 'Weather conditions changed - new forecast available',
                severity: 'Info'
            });
            this.renderAlerts();
        }

        // Update timestamp
        this.updateTimestamp();
    }

    /**
     * Generate random recommendation for simulation
     */
    generateRandomRecommendation() {
        const types = [
            { title: 'Irrigation Advisory', icon: 'fa-water', priority: 'Medium' },
            { title: 'Pest Alert', icon: 'fa-bug', priority: 'High' },
            { title: 'Fertilizer Recommendation', icon: 'fa-flask', priority: 'Medium' },
            { title: 'Harvest Update', icon: 'fa-tractor', priority: 'Low' }
        ];

        const type = types[Math.floor(Math.random() * types.length)];
        return {
            id: `rec-${Date.now()}`,
            title: type.title,
            summary: `New ${type.title.toLowerCase()} based on recent field conditions.`,
            icon: type.icon,
            priority: type.priority,
            time: 'Just now'
        };
    }

    /**
     * Handle quick actions
     */
    handleQuickAction(action) {
        switch (action) {
            case 'analyze':
                window.location.href = 'crop-analysis.html';
                break;
            case 'weather':
                window.location.href = 'weather.html';
                break;
            case 'pests':
                window.location.href = 'pest-disease.html';
                break;
            case 'market':
                window.location.href = 'market-intelligence.html';
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    /**
     * Handle field selected event
     */
    handleFieldSelected(detail) {
        const { field } = detail;
        if (field) {
            this.showToast(`Selected field: ${field.name}`, 'info');
        }
    }

    /**
     * Handle recommendation update
     */
    handleRecommendationUpdate(detail) {
        const { recommendations } = detail;
        if (recommendations) {
            this.state.recommendations = recommendations;
            this.renderRecommendations(recommendations);
            this.calculateStats();
            this.renderStats();
        }
    }

    /**
     * Handle weather alert
     */
    handleWeatherAlert(detail) {
        this.state.alerts.unshift({
            type: 'Weather Alert',
            message: detail.message || 'Weather alert issued',
            severity: detail.severity || 'Warning'
        });
        this.renderAlerts();
        this.showToast(`Weather Alert: ${detail.message}`, 'warning');
    }

    /**
     * Handle soil alert
     */
    handleSoilAlert(detail) {
        this.state.alerts.unshift({
            type: 'Soil Alert',
            message: detail.message || 'Soil condition alert',
            severity: detail.severity || 'Warning'
        });
        this.renderAlerts();
        this.showToast(`Soil Alert: ${detail.message}`, 'warning');
    }

    /**
     * Handle market alert
     */
    handleMarketAlert(detail) {
        this.state.alerts.unshift({
            type: 'Market Alert',
            message: detail.message || 'Market condition alert',
            severity: detail.severity || 'Info'
        });
        this.renderAlerts();
        this.showToast(`Market Alert: ${detail.message}`, 'info');
    }

    /**
     * Pause auto-refresh
     */
    pauseAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
    }

    /**
     * Resume auto-refresh
     */
    resumeAutoRefresh() {
        if (!this.updateInterval) {
            this.startAutoRefresh();
        }
        if (!this.realTimeInterval) {
            this.startRealTimeUpdates();
        }
    }

    /**
     * Helper: Get health class for badge
     */
    getHealthClass(health) {
        if (health >= 80) return 'healthy';
        if (health >= 60) return 'warning';
        return 'critical';
    }

    /**
     * Helper: Get alert icon
     */
    getAlertIcon(type) {
        const icons = {
            'Weather Alert': 'fa-cloud-sun',
            'Weather Update': 'fa-cloud-sun',
            'Soil Alert': 'fa-water',
            'Market Alert': 'fa-chart-line',
            'Pest Alert': 'fa-bug',
            'Warning': 'fa-exclamation-triangle',
            'Info': 'fa-info-circle',
            'Success': 'fa-check-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    /**
     * Helper: Show loading state
     */
    showLoading(show) {
        // Implementation depends on UI design
        // Could show a loading overlay or skeleton screens
    }

    /**
     * Helper: Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Helper: Show toast notification
     */
    showToast(message, type = 'info') {
        if (window.notification) {
            window.notification.show(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Debounce utility for resize events
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Sample data generators (for fallback)
     */
    generateSampleFields() {
        const cropTypes = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        const stages = ['Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
        const fieldNames = ['North Field', 'South Field', 'East Field', 'West Field', 'Central Field'];
        
        return fieldNames.map((name, index) => ({
            id: `field-${index + 1}`,
            name: name,
            cropType: cropTypes[index % cropTypes.length],
            growthStage: stages[index % stages.length],
            health: Math.round(55 + Math.random() * 40),
            area: Math.round(10 + Math.random() * 40),
            status: 'Active'
        }));
    }

    generateSampleWeather() {
        return {
            temp: Math.round(22 + Math.random() * 8),
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
            forecast: [
                { day: 'Mon', high: 24, low: 16, icon: 'fa-sun' },
                { day: 'Tue', high: 26, low: 18, icon: 'fa-cloud-sun' },
                { day: 'Wed', high: 23, low: 15, icon: 'fa-cloud' },
                { day: 'Thu', high: 20, low: 14, icon: 'fa-cloud-rain' },
                { day: 'Fri', high: 22, low: 15, icon: 'fa-cloud-sun' },
                { day: 'Sat', high: 25, low: 17, icon: 'fa-sun' },
                { day: 'Sun', high: 27, low: 19, icon: 'fa-sun' }
            ]
        };
    }

    generateSampleRecommendations() {
        return [
            {
                id: 'rec-1',
                title: 'Irrigation Required',
                summary: 'Soil moisture levels are below optimal. Apply irrigation within 48 hours.',
                priority: 'High',
                icon: 'fa-water',
                time: 'Now'
            },
            {
                id: 'rec-2',
                title: 'Fertilizer Application',
                summary: 'Nitrogen levels detected low. Apply nitrogen fertilizer at recommended rate.',
                priority: 'Medium',
                icon: 'fa-flask',
                time: '3 hours ago'
            },
            {
                id: 'rec-3',
                title: 'Pest Monitoring',
                summary: 'Increased pest activity detected in South Field. Schedule scouting.',
                priority: 'Medium',
                icon: 'fa-bug',
                time: '6 hours ago'
            }
        ];
    }

    generateSampleMarket() {
        return {
            currentPrice: 4.25,
            change: 0.12,
            changePercent: 2.9,
            historical: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
                price: Math.round((3.8 + Math.random() * 0.8) * 100) / 100
            }))
        };
    }

    generateSampleSoil() {
        return {
            moisture: Math.round(55 + Math.random() * 30),
            temperature: Math.round(18 + Math.random() * 8),
            ph: Math.round((6.0 + Math.random() * 1.5) * 100) / 100
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.pauseAutoRefresh();

        // Destroy chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.chartInstances = {};

        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        console.log('📊 Dashboard Page destroyed');
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardPage();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardPage;
}