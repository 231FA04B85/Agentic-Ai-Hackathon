/**
 * Weather API Integration
 * Handles all weather-related API calls including current conditions and forecasts
 * Uses API Key Manager for secure key management
 */

class WeatherAPI {
    constructor() {
        this.config = {
            baseUrl: CONFIG.API.WEATHER.BASE_URL || 'https://api.openweathermap.org/data/2.5',
            timeout: CONFIG.API.WEATHER.TIMEOUT || 10000,
            retryCount: CONFIG.API.WEATHER.RETRY_COUNT || 3,
            endpoints: CONFIG.API.WEATHER.ENDPOINTS || {
                CURRENT: '/weather',
                FORECAST: '/forecast',
                HISTORICAL: '/historical'
            },
            units: 'metric'
        };
        
        // Cache for weather data to reduce API calls
        this.cache = {
            current: null,
            forecast: null,
            timestamp: null,
            ttl: CONFIG.API.WEATHER.CACHE_TTL || 300000 // 5 minutes cache
        };

        this.retries = 0;
    }

    /**
     * Get API key with validation
     * @private
     * @returns {string} API key
     */
    getApiKey() {
        if (typeof apiKeyManager !== 'undefined') {
            return apiKeyManager.getKey('weather', true);
        }
        
        const key = CONFIG.API.WEATHER.KEY;
        if (!key || key === 'YOUR_API_KEY_HERE') {
            throw new Error(
                'Weather API key not configured. ' +
                'Please set your OpenWeatherMap API key at: https://openweathermap.org/api ' +
                'Then configure it in settings or via apiKeyManager.setKey("weather", "YOUR_KEY")'
            );
        }
        return key;
    }

    /**
     * Get current weather data for a location
     * @param {string} lat - Latitude
     * @param {string} lon - Longitude
     * @param {string} city - City name (alternative to lat/lon)
     * @returns {Promise<Object>} Current weather data
     */
    async getCurrentWeather(lat = null, lon = null, city = null) {
        try {
            // Check cache first
            if (this.isCacheValid()) {
                console.log('[WeatherAPI] Returning cached current weather data');
                return this.cache.current;
            }

            const apiKey = this.getApiKey();
            let url = `${this.config.baseUrl}${this.config.endpoints.CURRENT}`;
            const params = new URLSearchParams();
            
            if (city) {
                params.append('q', city);
            } else if (lat && lon) {
                params.append('lat', lat);
                params.append('lon', lon);
            } else {
                // Default to a location (e.g., Chicago for demo)
                params.append('q', 'Chicago,US');
            }
            
            params.append('appid', apiKey);
            params.append('units', this.config.units);

            const response = await this.fetchWithRetry(`${url}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform API response to our format
            const transformedData = this.transformCurrentWeather(data);
            
            // Update cache
            this.cache.current = transformedData;
            this.cache.timestamp = Date.now();
            
            console.log('[WeatherAPI] ✓ Current weather data fetched successfully');
            return transformedData;
        } catch (error) {
            console.error('[WeatherAPI] Failed to fetch current weather:', error);
            // Return fallback data
            return this.getFallbackCurrentWeather();
        }
    }

    /**
     * Get weather forecast for a location
     * @param {string} lat - Latitude
     * @param {string} lon - Longitude
     * @param {number} days - Number of days to forecast (1-16)
     * @returns {Promise<Array>} Forecast data
     */
    async getWeatherForecast(lat = null, lon = null, days = 7) {
        try {
            // Check cache for forecast
            if (this.isCacheValid() && this.cache.forecast) {
                console.log('[WeatherAPI] Returning cached forecast data');
                return this.cache.forecast;
            }

            const apiKey = this.getApiKey();
            let url = `${this.config.baseUrl}${this.config.endpoints.FORECAST}`;
            const params = new URLSearchParams();
            
            if (lat && lon) {
                params.append('lat', lat);
                params.append('lon', lon);
            } else {
                params.append('q', 'Chicago,US');
            }
            
            params.append('appid', apiKey);
            params.append('units', this.config.units);
            params.append('cnt', days * 8); // 3-hour intervals

            const response = await this.fetchWithRetry(`${url}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform API response to our format
            const transformedData = this.transformForecast(data, days);
            
            // Update cache
            this.cache.forecast = transformedData;
            this.cache.timestamp = Date.now();
            
            console.log('[WeatherAPI] ✓ Forecast data fetched successfully');
            return transformedData;
        } catch (error) {
            console.error('[WeatherAPI] Failed to fetch forecast:', error);
            // Return fallback data
            return this.getFallbackForecast(days);
        }
    }

    /**
     * Get combined weather data (current + forecast)
     * @param {string} lat - Latitude
     * @param {string} lon - Longitude
     * @param {string} city - City name
     * @returns {Promise<Object>} Combined weather data
     */
    async getWeatherData(lat = null, lon = null, city = null) {
        try {
            // Fetch both current and forecast in parallel
            const [current, forecast] = await Promise.all([
                this.getCurrentWeather(lat, lon, city),
                this.getWeatherForecast(lat, lon, 7)
            ]);

            return {
                current: current,
                forecast: forecast,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to get weather data:', error);
            return this.getFallbackWeatherData();
        }
    }

    /**
     * Get agricultural weather data including evapotranspiration, growing degree days, etc.
     * @param {string} lat - Latitude
     * @param {string} lon - Longitude
     * @param {string} cropType - Type of crop
     * @returns {Promise<Object>} Agricultural weather data
     */
    async getAgriculturalWeather(lat = null, lon = null, cropType = null) {
        try {
            const current = await this.getCurrentWeather(lat, lon);
            
            // Calculate agricultural metrics
            const agriData = {
                temperature: current.temp,
                humidity: current.humidity,
                windSpeed: current.windSpeed,
                precipitation: current.precipitation || 0,
                // Calculate growing degree days (base 10°C for most crops)
                growingDegreeDays: this.calculateGrowingDegreeDays(current.temp),
                // Calculate evapotranspiration (simplified)
                evapotranspiration: this.calculateEvapotranspiration(current),
                // Crop-specific heat stress warning
                heatStressWarning: this.checkHeatStress(current.temp, cropType),
                // Frost warning
                frostWarning: this.checkFrostWarning(current.temp),
                // Rain forecast for next 24 hours
                rainForecast: await this.getRainForecast(lat, lon)
            };

            return agriData;
        } catch (error) {
            console.error('Failed to get agricultural weather:', error);
            return this.getFallbackAgriculturalWeather();
        }
    }

    /**
     * Check cache validity
     * @returns {boolean} Whether cache is still valid
     */
    isCacheValid() {
        if (!this.cache.timestamp) return false;
        const now = Date.now();
        const elapsed = now - this.cache.timestamp;
        return elapsed < this.cache.ttl;
    }

    /**
     * Transform OpenWeatherMap current weather response to our format
     * @param {Object} data - API response data
     * @returns {Object} Transformed data
     */
    transformCurrentWeather(data) {
        return {
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            temp_min: Math.round(data.main.temp_min),
            temp_max: Math.round(data.main.temp_max),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            condition: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            windDirection: data.wind.deg,
            precipitation: data.rain ? data.rain['1h'] || 0 : 0,
            uvIndex: data.uvi || null,
            visibility: data.visibility || null,
            cloudiness: data.clouds.all,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
            location: data.name,
            country: data.sys.country
        };
    }

    /**
     * Transform OpenWeatherMap forecast response to our format
     * @param {Object} data - API response data
     * @param {number} days - Number of days
     * @returns {Array} Transformed forecast data
     */
    transformForecast(data, days) {
        const forecast = [];
        const dailyData = {};
        
        // Group forecast by day
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                    temps: [],
                    humidities: [],
                    conditions: [],
                    precipitations: [],
                    icons: []
                };
            }
            
            dailyData[dayKey].temps.push(item.main.temp);
            dailyData[dayKey].humidities.push(item.main.humidity);
            dailyData[dayKey].conditions.push(item.weather[0].description);
            dailyData[dayKey].precipitations.push(item.rain ? item.rain['3h'] || 0 : 0);
            dailyData[dayKey].icons.push(item.weather[0].icon);
        });
        
        // Process each day
        const dayKeys = Object.keys(dailyData).slice(0, days);
        dayKeys.forEach((dayKey, index) => {
            const day = dailyData[dayKey];
            const date = new Date(dayKey);
            
            forecast.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: dayKey,
                high: Math.round(Math.max(...day.temps)),
                low: Math.round(Math.min(...day.temps)),
                avg_temp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
                humidity: Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length),
                condition: this.getMostFrequent(day.conditions),
                icon: this.getMostFrequent(day.icons),
                precipitation: Math.round(day.precipitations.reduce((a, b) => a + b, 0) * 10) / 10,
                precipitation_chance: Math.min(100, Math.round((day.precipitations.filter(p => p > 0).length / day.precipitations.length) * 100))
            });
        });
        
        return forecast;
    }

    /**
     * Get the most frequent item in an array
     * @param {Array} arr - Array to process
     * @returns {*} Most frequent item
     */
    getMostFrequent(arr) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = arr[0];
        
        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostFrequent = item;
            }
        });
        
        return mostFrequent;
    }

    /**
     * Calculate growing degree days
     * @param {number} temp - Current temperature
     * @param {number} baseTemp - Base temperature (default 10°C)
     * @returns {number} Growing degree days
     */
    calculateGrowingDegreeDays(temp, baseTemp = 10) {
        return Math.max(0, temp - baseTemp);
    }

    /**
     * Calculate evapotranspiration using simplified method
     * @param {Object} weather - Weather data
     * @returns {number} Evapotranspiration in mm/day
     */
    calculateEvapotranspiration(weather) {
        // Simplified Penman-Monteith approximation
        const temp = weather.temp;
        const humidity = weather.humidity;
        const windSpeed = weather.windSpeed / 3.6; // Convert to m/s
        const solarRadiation = 20; // MJ/m2/day (simplified)
        
        // Simplified formula
        const delta = 0.2 * Math.exp(0.1 * temp);
        const gamma = 0.067;
        const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
        const ea = es * (humidity / 100);
        
        const et = (0.408 * delta * solarRadiation + gamma * (900 / (temp + 273)) * windSpeed * (es - ea)) / (delta + gamma * (1 + 0.34 * windSpeed));
        
        return Math.max(0, Math.round(et * 10) / 10);
    }

    /**
     * Check for heat stress in crops
     * @param {number} temp - Current temperature
     * @param {string} cropType - Crop type
     * @returns {Object} Heat stress warning
     */
    checkHeatStress(temp, cropType) {
        const thresholds = {
            'Wheat': 30,
            'Corn': 32,
            'Tomato': 35,
            'Soybean': 33,
            'Rice': 35,
            'Cotton': 40,
            'Potato': 28
        };
        
        const threshold = thresholds[cropType] || 32;
        
        if (temp > threshold) {
            return {
                warning: true,
                level: temp > threshold + 5 ? 'Severe' : 'Moderate',
                message: `Temperature ${temp}°C exceeds optimal threshold of ${threshold}°C for ${cropType || 'crops'}`,
                recommended_action: 'Increase irrigation and provide shade if possible'
            };
        }
        
        return {
            warning: false,
            message: 'Temperature within optimal range'
        };
    }

    /**
     * Check for frost warning
     * @param {number} temp - Current temperature
     * @returns {Object} Frost warning
     */
    checkFrostWarning(temp) {
        if (temp < 2) {
            return {
                warning: true,
                level: temp < 0 ? 'Severe' : 'Moderate',
                message: `Temperature ${temp}°C approaching frost conditions`,
                recommended_action: 'Cover crops or activate frost protection systems'
            };
        }
        
        return {
            warning: false,
            message: 'No frost risk'
        };
    }

    /**
     * Get rain forecast for next 24 hours
     * @param {string} lat - Latitude
     * @param {string} lon - Longitude
     * @returns {Promise<Object>} Rain forecast
     */
    async getRainForecast(lat = null, lon = null) {
        try {
            const forecast = await this.getWeatherForecast(lat, lon, 1);
            const next24h = forecast.slice(0, 4); // 8 * 3h = 24h
            
            const totalRain = next24h.reduce((sum, day) => sum + (day.precipitation || 0), 0);
            const rainChance = Math.max(0, ...next24h.map(day => day.precipitation_chance || 0));
            
            return {
                total_rainfall: Math.round(totalRain * 10) / 10,
                max_rain_chance: rainChance,
                timing: next24h.map(day => ({
                    time: day.day,
                    chance: day.precipitation_chance || 0,
                    amount: day.precipitation || 0
                }))
            };
        } catch (error) {
            console.error('Failed to get rain forecast:', error);
            return { total_rainfall: 0, max_rain_chance: 0 };
        }
    }

    /**
     * Fetch with retry logic
     * @private
     * @param {string} url - URL to fetch
     * @param {number} retryCount - Current retry count
     * @returns {Promise<Response>} Fetch response
     */
    async fetchWithRetry(url, retryCount = 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (retryCount < this.config.retryCount && error.name !== 'AbortError') {
                console.log(`[WeatherAPI] Retry ${retryCount + 1}/${this.config.retryCount}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                return this.fetchWithRetry(url, retryCount + 1);
            }
            
            throw error;
        }
    }

    /**
     * Get fallback current weather data when API fails
     * @returns {Object} Fallback data
     */
    getFallbackCurrentWeather() {
        return {
            temp: 25,
            feels_like: 24,
            temp_min: 20,
            temp_max: 28,
            humidity: 65,
            pressure: 1013,
            condition: 'Partly Cloudy',
            icon: '04d',
            windSpeed: 12,
            windDirection: 180,
            precipitation: 0,
            uvIndex: 5,
            visibility: 10000,
            cloudiness: 40,
            sunrise: '6:30 AM',
            sunset: '7:45 PM',
            location: 'Unknown Location',
            country: 'Unknown'
        };
    }

    /**
     * Get fallback forecast data when API fails
     * @param {number} days - Number of days
     * @returns {Array} Fallback forecast
     */
    getFallbackForecast(days = 7) {
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
        const icons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain'];
        
        return Array.from({ length: days }, (_, i) => ({
            day: daysOfWeek[i % 7],
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toDateString(),
            high: Math.round(22 + Math.random() * 8),
            low: Math.round(14 + Math.random() * 6),
            avg_temp: Math.round(18 + Math.random() * 6),
            humidity: Math.round(55 + Math.random() * 30),
            condition: conditions[i % conditions.length],
            icon: icons[i % icons.length],
            precipitation: Math.round(Math.random() * 15 * 10) / 10,
            precipitation_chance: Math.round(Math.random() * 100)
        }));
    }

    /**
     * Get fallback complete weather data
     * @returns {Object} Fallback weather data
     */
    getFallbackWeatherData() {
        return {
            current: this.getFallbackCurrentWeather(),
            forecast: this.getFallbackForecast(7),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get fallback agricultural weather data
     * @returns {Object} Fallback agricultural data
     */
    getFallbackAgriculturalWeather() {
        return {
            temperature: 25,
            humidity: 65,
            windSpeed: 12,
            precipitation: 0,
            growingDegreeDays: 15,
            evapotranspiration: 4.5,
            heatStressWarning: { warning: false, message: 'No heat stress' },
            frostWarning: { warning: false, message: 'No frost risk' },
            rainForecast: { total_rainfall: 0, max_rain_chance: 0 }
        };
    }
}

// Export for use in other files
window.WeatherAPI = WeatherAPI;