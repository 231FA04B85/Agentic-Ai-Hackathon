/**
 * Weather Page Logic
 * Handles weather monitoring, forecasts, and agricultural weather services
 */

class WeatherPage {
    constructor() {
        this.weatherData = null;
        this.forecastData = [];
        this.selectedLocation = null;
        this.chartInstances = {};
        this.updateInterval = null;
        
        this.initialize();
    }

    initialize() {
        console.log('🌤️ Weather Page initializing...');
        this.setupEventListeners();
        this.loadWeatherData();
        this.initializeCharts();
        this.startAutoUpdate();
        console.log('✅ Weather Page initialized');
    }

    setupEventListeners() {
        // Refresh weather
        document.getElementById('refreshWeatherBtn')?.addEventListener('click', () => {
            this.loadWeatherData(true);
        });

        // Location selector
        document.getElementById('weatherLocation')?.addEventListener('change', (e) => {
            this.selectedLocation = e.target.value;
            this.loadWeatherData(true);
        });

        // Forecast toggle
        document.getElementById('forecastToggle')?.addEventListener('click', () => {
            this.toggleForecastView();
        });

        // Weather alerts
        document.getElementById('viewAlertsBtn')?.addEventListener('click', () => {
            this.showWeatherAlerts();
        });

        // Export weather data
        document.getElementById('exportWeatherBtn')?.addEventListener('click', () => {
            this.exportWeatherData();
        });
    }

    async loadWeatherData(forceRefresh = false) {
        try {
            this.showLoading(true);

            let data;
            if (window.weatherAPI) {
                data = await window.weatherAPI.getWeatherData();
            } else {
                data = this.generateSampleWeatherData();
            }

            this.weatherData = data;
            this.displayCurrentWeather(data);
            this.displayForecast(data.forecast || []);
            this.updateWeatherMetrics(data);
            this.updateWeatherAlerts(data.alerts || []);

            // Update charts
            this.updateCharts(data);

            // Dispatch event
            document.dispatchEvent(new CustomEvent('weatherUpdated', {
                detail: { data: data }
            }));

        } catch (error) {
            console.error('Failed to load weather data:', error);
            this.showError('Failed to load weather data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleWeatherData() {
        const now = new Date();
        const forecast = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            forecast.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toISOString(),
                high: Math.round(22 + Math.random() * 10),
                low: Math.round(14 + Math.random() * 6),
                avg_temp: Math.round(18 + Math.random() * 8),
                humidity: Math.round(55 + Math.random() * 30),
                condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)],
                icon: ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-bolt'][Math.floor(Math.random() * 5)],
                precipitation: Math.round(Math.random() * 20),
                precipitation_chance: Math.round(Math.random() * 100),
                wind_speed: Math.round(10 + Math.random() * 20),
                wind_direction: Math.round(Math.random() * 360)
            });
        }

        return {
            current: {
                temperature: Math.round(22 + Math.random() * 8),
                feels_like: Math.round(20 + Math.random() * 6),
                humidity: Math.round(55 + Math.random() * 30),
                pressure: 1013 + Math.round((Math.random() - 0.5) * 20),
                wind_speed: Math.round(10 + Math.random() * 15),
                wind_direction: Math.round(Math.random() * 360),
                precipitation: Math.round(Math.random() * 5),
                condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
                uv_index: Math.round((4 + Math.random() * 4) * 10) / 10,
                visibility: Math.round((10 + Math.random() * 10) * 1000)
            },
            forecast: forecast,
            alerts: [
                {
                    type: 'Weather Advisory',
                    message: 'Heat advisory in effect for tomorrow. Stay hydrated.',
                    severity: 'Moderate'
                }
            ],
            agricultural: {
                growing_degree_days: Math.round(15 + Math.random() * 10),
                evapotranspiration: Math.round((3 + Math.random() * 3) * 10) / 10,
                rain_forecast_7d: Math.round(Math.random() * 30),
                frost_risk: Math.random() > 0.8 ? 'Low' : 'None'
            },
            timestamp: new Date().toISOString()
        };
    }

    displayCurrentWeather(data) {
        const container = document.getElementById('currentWeather');
        if (!container || !data) return;

        const current = data.current;
        const agri = data.agricultural || {};

        container.innerHTML = `
            <div class="current-weather">
                <div class="weather-main">
                    <div class="weather-temp">${current.temperature}°C</div>
                    <div class="weather-condition">
                        <i class="fas ${this.getWeatherIcon(current.condition)}"></i>
                        ${current.condition}
                    </div>
                    <div class="weather-feels-like">Feels like ${current.feels_like}°C</div>
                </div>
                <div class="weather-details-grid">
                    <div class="detail-item">
                        <i class="fas fa-tint"></i>
                        <span>Humidity</span>
                        <strong>${current.humidity}%</strong>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wind"></i>
                        <span>Wind</span>
                        <strong>${current.wind_speed} km/h</strong>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-compress-alt"></i>
                        <span>Pressure</span>
                        <strong>${current.pressure} hPa</strong>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-sun"></i>
                        <span>UV Index</span>
                        <strong>${current.uv_index}</strong>
                    </div>
                </div>
                ${agri.growing_degree_days ? `
                    <div class="weather-agricultural">
                        <h4>Agricultural Weather</h4>
                        <div class="agri-metrics">
                            <div class="agri-metric">
                                <span>Growing Degree Days</span>
                                <strong>${agri.growing_degree_days}</strong>
                            </div>
                            <div class="agri-metric">
                                <span>Evapotranspiration</span>
                                <strong>${agri.evapotranspiration} mm/day</strong>
                            </div>
                            <div class="agri-metric">
                                <span>7-Day Rain Forecast</span>
                                <strong>${agri.rain_forecast_7d} mm</strong>
                            </div>
                            <div class="agri-metric">
                                <span>Frost Risk</span>
                                <strong class="${agri.frost_risk === 'High' ? 'text-danger' : 'text-success'}">${agri.frost_risk}</strong>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <div class="weather-updated">
                    Updated: ${new Date(data.timestamp).toLocaleString()}
                </div>
            </div>
        `;
    }

    displayForecast(forecast) {
        const container = document.getElementById('weatherForecast');
        if (!container) return;

        if (forecast.length === 0) {
            container.innerHTML = '<p>No forecast data available</p>';
            return;
        }

        container.innerHTML = `
            <div class="forecast-grid">
                ${forecast.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-day-name">${day.day}</div>
                        <i class="fas ${day.icon || 'fa-cloud'}"></i>
                        <div class="forecast-temp">
                            <span class="forecast-high">${day.high}°</span>
                            <span class="forecast-low">${day.low}°</span>
                        </div>
                        <div class="forecast-condition">${day.condition}</div>
                        <div class="forecast-details">
                            <span><i class="fas fa-tint"></i> ${day.precipitation_chance}%</span>
                            <span><i class="fas fa-wind"></i> ${day.wind_speed} km/h</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateWeatherMetrics(data) {
        const metrics = {
            weatherTemp: `${data.current.temperature}°C`,
            weatherHumidity: `${data.current.humidity}%`,
            weatherWind: `${data.current.wind_speed} km/h`,
            weatherPressure: `${data.current.pressure} hPa`,
            weatherCondition: data.current.condition
        };
        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        const icon = document.getElementById('weatherIcon');
        if (icon) {
            icon.className = `fas ${this.getWeatherIcon(data.current.condition)}`;
        }

        // Update last update time
        const lastUpdate = document.getElementById('lastWeatherUpdate');
        if (lastUpdate) lastUpdate.textContent = new Date(data.timestamp).toLocaleString();
    }

    updateWeatherAlerts(alerts) {
        const container = document.getElementById('weatherAlerts');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="alert-item alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>No active weather alerts</span>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.severity?.toLowerCase() || 'info'}">
                <i class="fas ${this.getAlertIcon(alert.type)}"></i>
                <div class="alert-content">
                    <strong>${alert.type}</strong>
                    <p>${alert.message}</p>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        // Temperature trend chart
        const canvas = document.getElementById('temperatureChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.chartInstances.temperature = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'High Temperature',
                            data: [],
                            borderColor: '#C62828',
                            backgroundColor: 'rgba(198, 40, 40, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Low Temperature',
                            data: [],
                            borderColor: '#1565C0',
                            backgroundColor: 'rgba(21, 101, 192, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        // Precipitation chart
        const precipCanvas = document.getElementById('precipitationChart');
        if (precipCanvas) {
            const ctx = precipCanvas.getContext('2d');
            this.chartInstances.precipitation = new Chart(ctx, {
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
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    updateCharts(data) {
        if (!data || !data.forecast) return;

        const labels = data.forecast.map(d => d.day);
        const highs = data.forecast.map(d => d.high);
        const lows = data.forecast.map(d => d.low);
        const precipitation = data.forecast.map(d => d.precipitation || 0);

        // Update temperature chart
        if (this.chartInstances.temperature) {
            this.chartInstances.temperature.data.labels = labels;
            this.chartInstances.temperature.data.datasets[0].data = highs;
            this.chartInstances.temperature.data.datasets[1].data = lows;
            this.chartInstances.temperature.update();
        }

        // Update precipitation chart
        if (this.chartInstances.precipitation) {
            this.chartInstances.precipitation.data.labels = labels;
            this.chartInstances.precipitation.data.datasets[0].data = precipitation;
            this.chartInstances.precipitation.update();
        }
    }

    getWeatherIcon(condition) {
        const icons = {
            'Sunny': 'fa-sun',
            'Clear': 'fa-sun',
            'Partly Cloudy': 'fa-cloud-sun',
            'Cloudy': 'fa-cloud',
            'Light Rain': 'fa-cloud-rain',
            'Heavy Rain': 'fa-cloud-showers-heavy',
            'Thunderstorm': 'fa-bolt',
            'Snow': 'fa-snowflake',
            'Fog': 'fa-smog'
        };
        return icons[condition] || 'fa-cloud';
    }

    getAlertIcon(type) {
        const icons = {
            'Weather Advisory': 'fa-exclamation-circle',
            'Heat Advisory': 'fa-thermometer-half',
            'Storm Warning': 'fa-bolt',
            'Frost Warning': 'fa-thermometer-empty',
            'Flood Warning': 'fa-water'
        };
        return icons[type] || 'fa-info-circle';
    }

    toggleForecastView() {
        const container = document.getElementById('weatherForecast');
        if (!container) return;

        // Toggle between daily and hourly view
        const currentView = container.dataset.view || 'daily';
        const newView = currentView === 'daily' ? 'hourly' : 'daily';
        container.dataset.view = newView;

        // Update button text
        const toggleBtn = document.getElementById('forecastToggle');
        if (toggleBtn) {
            toggleBtn.textContent = newView === 'daily' ? 'Switch to Hourly' : 'Switch to Daily';
        }

        this.showToast(`Switched to ${newView} view`, 'info');
    }

    showWeatherAlerts() {
        if (!this.weatherData || !this.weatherData.alerts) {
            this.showToast('No weather alerts', 'info');
            return;
        }

        const alerts = this.weatherData.alerts;
        const message = alerts.map(a => `${a.type}: ${a.message}`).join('\n');
        
        ModalComponent.alert(message, {
            title: 'Weather Alerts',
            confirmText: 'Dismiss'
        });
    }

    exportWeatherData() {
        if (!this.weatherData) {
            this.showToast('No weather data to export', 'warning');
            return;
        }

        const data = {
            weather: this.weatherData,
            exported_at: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Weather data exported successfully!', 'success');
    }

    startAutoUpdate() {
        // Update every 15 minutes
        this.updateInterval = setInterval(() => {
            this.loadWeatherData(true);
        }, 900000);
    }

    showLoading(show) {
        const container = document.getElementById('currentWeather');
        if (container && show) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading weather data...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('currentWeather');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="weatherPage.loadWeatherData(true)">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    showToast(message, type = 'info') {
        if (window.notification) {
            window.notification.show(message, type);
        } else {
            alert(message);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        console.log('🌤️ Weather Page destroyed');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.weatherPage = new WeatherPage();
});

window.WeatherPage = WeatherPage;