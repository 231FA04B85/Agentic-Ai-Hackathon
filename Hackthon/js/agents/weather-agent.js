/**
 * Weather Agent - Real-time Weather Processing
 * Handles weather monitoring, forecasting, and agricultural weather services
 */

class WeatherAgent {
    constructor() {
        this.currentWeather = null;
        this.forecast = [];
        this.weatherStations = [];
        this.weatherAlerts = [];
        this.initialize();
    }

    initialize() {
        console.log('🌤️ Weather Agent initialized with real-time monitoring');
        this.initializeWeatherStations();
        this.startWeatherMonitoring();
        this.generateInitialWeather();
    }

    initializeWeatherStations() {
        this.weatherStations = [
            {
                id: 'WS-001',
                name: 'North Station',
                latitude: 41.8781,
                longitude: -87.6298,
                elevation: 182,
                status: 'active'
            },
            {
                id: 'WS-002',
                name: 'South Station',
                latitude: 41.8000,
                longitude: -87.6000,
                elevation: 175,
                status: 'active'
            },
            {
                id: 'WS-003',
                name: 'East Station',
                latitude: 41.8500,
                longitude: -87.5500,
                elevation: 180,
                status: 'active'
            }
        ];
    }

    generateInitialWeather() {
        const now = new Date();
        this.currentWeather = {
            station_id: 'WS-001',
            timestamp: now.toISOString(),
            temperature: 24,
            feels_like: 23,
            humidity: 65,
            pressure: 1013,
            wind_speed: 12,
            wind_direction: 180,
            precipitation: 0,
            precipitation_type: 'none',
            visibility: 16000,
            cloud_cover: 40,
            uv_index: 5,
            condition: 'Partly Cloudy',
            icon: 'fa-cloud-sun'
        };

        this.forecast = this.generateForecast();
        this.weatherAlerts = this.checkWeatherAlerts(this.currentWeather);
    }

    startWeatherMonitoring() {
        // Update weather every 15 minutes
        setInterval(() => {
            this.updateWeatherData();
        }, 900000); // 15 minutes

        // Update forecast every hour
        setInterval(() => {
            this.updateForecast();
        }, 3600000); // 1 hour

        // Check for severe weather every 5 minutes
        setInterval(() => {
            this.monitorSevereWeather();
        }, 300000); // 5 minutes
    }

    updateWeatherData() {
        // Simulate weather data from stations
        const stations = this.weatherStations;
        stations.forEach(station => {
            const weather = this.generateStationWeather(station);
            this.processStationData(station, weather);
        });

        // Update current weather with average
        this.currentWeather = this.calculateAverageWeather(stations);
        this.currentWeather.timestamp = new Date().toISOString();
        
        // Check for weather alerts
        this.weatherAlerts = this.checkWeatherAlerts(this.currentWeather);
        
        console.log('🌤️ Weather data updated:', this.currentWeather.timestamp);
    }

    generateStationWeather(station) {
        const baseTemp = 24;
        const tempVariation = (Math.random() - 0.5) * 4;
        const humidityVariation = (Math.random() - 0.5) * 15;
        
        return {
            station_id: station.id,
            temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
            humidity: Math.round(65 + humidityVariation),
            wind_speed: Math.round(10 + Math.random() * 10),
            wind_direction: Math.round(Math.random() * 360),
            precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
            pressure: Math.round(1013 + (Math.random() - 0.5) * 10),
            cloud_cover: Math.round(Math.random() * 100)
        };
    }

    processStationData(station, weather) {
        // Process and store station data
        station.last_update = weather.timestamp || new Date().toISOString();
        station.weather = weather;
    }

    calculateAverageWeather(stations) {
        const validStations = stations.filter(s => s.weather);
        if (validStations.length === 0) {
            return this.currentWeather;
        }

        const avg = {
            temperature: 0,
            humidity: 0,
            wind_speed: 0,
            wind_direction: 0,
            precipitation: 0,
            pressure: 0,
            cloud_cover: 0
        };

        validStations.forEach(s => {
            avg.temperature += s.weather.temperature;
            avg.humidity += s.weather.humidity;
            avg.wind_speed += s.weather.wind_speed;
            avg.wind_direction += s.weather.wind_direction;
            avg.precipitation += s.weather.precipitation;
            avg.pressure += s.weather.pressure;
            avg.cloud_cover += s.weather.cloud_cover;
        });

        const count = validStations.length;
        return {
            ...this.currentWeather,
            temperature: Math.round((avg.temperature / count) * 10) / 10,
            feels_like: this.calculateFeelsLike(avg.temperature / count, avg.humidity / count, avg.wind_speed / count),
            humidity: Math.round(avg.humidity / count),
            wind_speed: Math.round(avg.wind_speed / count),
            wind_direction: Math.round(avg.wind_direction / count),
            precipitation: Math.round((avg.precipitation / count) * 10) / 10,
            pressure: Math.round(avg.pressure / count),
            cloud_cover: Math.round(avg.cloud_cover / count),
            condition: this.determineWeatherCondition(avg.temperature / count, avg.humidity / count, avg.precipitation / count, avg.cloud_cover / count),
            icon: this.determineWeatherIcon(avg.temperature / count, avg.humidity / count, avg.precipitation / count, avg.cloud_cover / count),
            uv_index: this.calculateUVIndex(avg.temperature / count, avg.cloud_cover / count),
            visibility: this.calculateVisibility(avg.humidity / count, avg.precipitation / count)
        };
    }

    calculateFeelsLike(temp, humidity, windSpeed) {
        // Real-world feels-like calculation (simplified)
        let feelsLike = temp;
        
        // Humidity effect
        if (temp > 20) {
            feelsLike += (humidity / 100) * 2;
        }
        
        // Wind chill effect
        if (temp < 10 && windSpeed > 5) {
            feelsLike -= (windSpeed / 10) * 2;
        }
        
        return Math.round(feelsLike * 10) / 10;
    }

    determineWeatherCondition(temp, humidity, precipitation, cloudCover) {
        if (precipitation > 2) return 'Heavy Rain';
        if (precipitation > 0) return 'Light Rain';
        if (cloudCover > 80) return 'Cloudy';
        if (cloudCover > 40) return 'Partly Cloudy';
        if (temp > 30) return 'Sunny';
        if (temp < 0) return 'Freezing';
        return 'Clear';
    }

    determineWeatherIcon(temp, humidity, precipitation, cloudCover) {
        if (precipitation > 2) return 'fa-cloud-rain';
        if (precipitation > 0) return 'fa-cloud-rain';
        if (cloudCover > 80) return 'fa-cloud';
        if (cloudCover > 40) return 'fa-cloud-sun';
        if (temp > 30) return 'fa-sun';
        return 'fa-sun';
    }

    calculateUVIndex(temp, cloudCover) {
        const baseUV = 5;
        const tempFactor = Math.min(2, Math.max(0, (temp - 15) / 10));
        const cloudFactor = 1 - (cloudCover / 100) * 0.5;
        return Math.round((baseUV * tempFactor * cloudFactor) * 10) / 10;
    }

    calculateVisibility(humidity, precipitation) {
        let visibility = 16000; // meters
        
        if (humidity > 90) visibility -= 5000;
        if (humidity > 80) visibility -= 2000;
        if (precipitation > 2) visibility -= 8000;
        if (precipitation > 0) visibility -= 2000;
        
        return Math.max(1000, Math.round(visibility / 1000) * 1000);
    }

    generateForecast() {
        const forecast = [];
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Scattered Showers'];
        const icons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-rain'];

        for (let i = 0; i < 7; i++) {
            const tempBase = 24;
            const tempVariation = (Math.random() - 0.5) * 10;
            const precipitation = Math.random() > 0.6 ? Math.round(Math.random() * 15 * 10) / 10 : 0;
            const conditionIndex = precipitation > 5 ? 3 : Math.floor(Math.random() * 4);
            
            forecast.push({
                day: daysOfWeek[i],
                date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                high: Math.round((tempBase + tempVariation + 5) * 10) / 10,
                low: Math.round((tempBase + tempVariation - 5) * 10) / 10,
                avg_temp: Math.round((tempBase + tempVariation) * 10) / 10,
                humidity: Math.round(55 + Math.random() * 30),
                condition: conditions[conditionIndex],
                icon: icons[conditionIndex],
                precipitation: precipitation,
                precipitation_chance: Math.round(Math.random() * 100),
                wind_speed: Math.round(10 + Math.random() * 20),
                wind_direction: Math.round(Math.random() * 360),
                pressure: Math.round(1013 + (Math.random() - 0.5) * 15),
                cloud_cover: Math.round(Math.random() * 100),
                uv_index: Math.round((4 + Math.random() * 4) * 10) / 10,
                sunrise: '06:30',
                sunset: '19:45'
            });
        }
        return forecast;
    }

    updateForecast() {
        this.forecast = this.generateForecast();
        console.log('📅 Weather forecast updated');
    }

    monitorSevereWeather() {
        const alerts = this.checkWeatherAlerts(this.currentWeather);
        if (alerts.length > 0 && alerts !== this.weatherAlerts) {
            this.weatherAlerts = alerts;
            this.dispatchWeatherAlerts(alerts);
        }
    }

    checkWeatherAlerts(weather) {
        const alerts = [];

        // Heat wave
        if (weather.temperature > 35) {
            alerts.push({
                type: 'HEAT_WAVE',
                severity: 'HIGH',
                message: `Extreme heat warning: ${weather.temperature}°C. Take precautions.`,
                timestamp: new Date().toISOString()
            });
        }

        // Heavy rain
        if (weather.precipitation > 20) {
            alerts.push({
                type: 'HEAVY_RAIN',
                severity: 'HIGH',
                message: `Heavy rainfall warning: ${weather.precipitation}mm in last 24h.`,
                timestamp: new Date().toISOString()
            });
        }

        // High wind
        if (weather.wind_speed > 50) {
            alerts.push({
                type: 'HIGH_WIND',
                severity: 'MODERATE',
                message: `High wind warning: ${weather.wind_speed} km/h. Secure equipment.`,
                timestamp: new Date().toISOString()
            });
        }

        // Frost warning
        if (weather.temperature < 2) {
            alerts.push({
                type: 'FROST',
                severity: 'HIGH',
                message: `Frost warning: ${weather.temperature}°C. Protect sensitive crops.`,
                timestamp: new Date().toISOString()
            });
        }

        // Low humidity (fire risk)
        if (weather.humidity < 20) {
            alerts.push({
                type: 'FIRE_RISK',
                severity: 'MODERATE',
                message: `Low humidity warning: ${weather.humidity}%. Fire risk elevated.`,
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }

    dispatchWeatherAlerts(alerts) {
        alerts.forEach(alert => {
            document.dispatchEvent(new CustomEvent('weatherAlert', {
                detail: {
                    ...alert,
                    timestamp: new Date().toISOString()
                }
            }));
        });
    }

    async getCurrentData() {
        // Update weather data before returning
        this.updateWeatherData();
        return this.currentWeather;
    }

    async getForecast(days = 7) {
        if (this.forecast.length === 0) {
            this.forecast = this.generateForecast();
        }
        return this.forecast.slice(0, days);
    }

    async getWeatherData(location = null) {
        const current = await this.getCurrentData();
        const forecast = await this.getForecast(7);
        
        return {
            current: current,
            forecast: forecast,
            alerts: this.weatherAlerts,
            timestamp: new Date().toISOString(),
            agricultural_metrics: this.calculateAgriculturalMetrics(current, forecast)
        };
    }

    calculateAgriculturalMetrics(current, forecast) {
        // Calculate growing degree days
        const gdd = this.calculateGDD(current.temperature);
        
        // Calculate evapotranspiration
        const et = this.calculateET(current.temperature, current.humidity, current.wind_speed);
        
        // Calculate chilling hours (for fruit trees)
        const chillingHours = this.calculateChillingHours(current.temperature);
        
        // Calculate solar radiation estimate
        const solarRadiation = this.calculateSolarRadiation(current.cloud_cover, current.temperature);
        
        return {
            growing_degree_days: gdd,
            evapotranspiration: et,
            chilling_hours: chillingHours,
            solar_radiation: solarRadiation,
            heat_stress_index: this.calculateHeatStressIndex(current.temperature, current.humidity),
            crop_water_requirement: this.calculateCropWaterRequirement(current.temperature, et)
        };
    }

    calculateGDD(temp) {
        const baseTemp = 10;
        return Math.max(0, temp - baseTemp);
    }

    calculateET(temp, humidity, windSpeed) {
        // Simplified Penman-Monteith approximation
        const delta = 0.2 * Math.exp(0.1 * temp);
        const gamma = 0.067;
        const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
        const ea = es * (humidity / 100);
        const windFactor = 0.34 * windSpeed / 3.6; // Convert to m/s
        
        const et = (0.408 * delta * 20 + gamma * (900 / (temp + 273)) * (windSpeed / 3.6) * (es - ea)) / (delta + gamma * (1 + windFactor));
        return Math.max(0, Math.round(et * 10) / 10);
    }

    calculateChillingHours(temp) {
        // Calculate chilling hours (below 7°C)
        if (temp < 7) {
            return 1;
        }
        return 0;
    }

    calculateSolarRadiation(cloudCover, temp) {
        const clearSkyRadiation = 25; // MJ/m2/day
        const cloudFactor = 1 - (cloudCover / 100) * 0.5;
        const tempFactor = 1 + (temp - 20) * 0.01;
        return Math.round(clearSkyRadiation * cloudFactor * tempFactor * 10) / 10;
    }

    calculateHeatStressIndex(temp, humidity) {
        // Simplified heat index calculation
        const tempF = (temp * 9/5) + 32;
        const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity 
            - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF 
            - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity 
            + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
        
        const hiC = (hi - 32) * 5/9;
        return Math.max(0, Math.round(hiC * 10) / 10);
    }

    calculateCropWaterRequirement(temp, et) {
        // Crop coefficient approximation
        const kc = 0.7 + (temp / 100);
        return Math.round((et * kc) * 10) / 10;
    }

    async getWeatherStations() {
        return this.weatherStations;
    }

    async getWeatherAlerts() {
        this.monitorSevereWeather();
        return this.weatherAlerts;
    }

    async getAgriculturalWeather(lat = null, lon = null) {
        const data = await this.getWeatherData();
        return data.agricultural_metrics || {};
    }
}

window.WeatherAgent = WeatherAgent;

// Auto-instantiate so pages can use window.weatherAgent directly
if (typeof window !== 'undefined' && !window.weatherAgent) {
    window.weatherAgent = new WeatherAgent();
}
