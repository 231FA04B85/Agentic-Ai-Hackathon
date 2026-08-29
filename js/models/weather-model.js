/**
 * Weather Model - Real-world Weather Data Structure
 * Comprehensive weather data for agricultural applications
 */

class WeatherModel {
    constructor(data = {}) {
        // Station Information
        this.station_id = data.station_id || `WS-${Date.now()}`;
        this.station_name = data.station_name || '';
        this.location = {
            latitude: data.location?.latitude || 0,
            longitude: data.location?.longitude || 0,
            elevation: data.location?.elevation || 0,
            region: data.location?.region || ''
        };
        
        // Current Conditions
        this.current = {
            timestamp: data.current?.timestamp || new Date().toISOString(),
            temperature: data.current?.temperature || 20,
            feels_like: data.current?.feels_like || 19,
            humidity: data.current?.humidity || 65,
            pressure: data.current?.pressure || 1013,
            wind_speed: data.current?.wind_speed || 10,
            wind_direction: data.current?.wind_direction || 180,
            wind_gust: data.current?.wind_gust || 0,
            precipitation: data.current?.precipitation || 0,
            precipitation_rate: data.current?.precipitation_rate || 0,
            precipitation_type: data.current?.precipitation_type || 'None',
            visibility: data.current?.visibility || 16000,
            cloud_cover: data.current?.cloud_cover || 30,
            cloud_base: data.current?.cloud_base || 1500,
            dew_point: data.current?.dew_point || 12,
            uv_index: data.current?.uv_index || 5,
            solar_radiation: data.current?.solar_radiation || 200,
            condition: data.current?.condition || 'Clear',
            weather_code: data.current?.weather_code || 0,
            icon: data.current?.icon || 'fa-sun'
        };
        
        // Daily Forecast
        this.forecast_daily = data.forecast_daily || [];
        
        // Hourly Forecast
        this.forecast_hourly = data.forecast_hourly || [];
        
        // Agricultural Metrics
        this.agricultural = {
            growing_degree_days: data.agricultural?.growing_degree_days || 0,
            growing_degree_days_10: data.agricultural?.growing_degree_days_10 || 0,
            evapotranspiration: data.agricultural?.evapotranspiration || 0,
            solar_radiation_agricultural: data.agricultural?.solar_radiation_agricultural || 0,
            rain_forecast_24h: data.agricultural?.rain_forecast_24h || 0,
            rain_forecast_7d: data.agricultural?.rain_forecast_7d || 0,
            chill_hours: data.agricultural?.chill_hours || 0,
            last_frost: data.agricultural?.last_frost || null,
            first_frost: data.agricultural?.first_frost || null,
            growing_season_length: data.agricultural?.growing_season_length || 0,
            heat_units: data.agricultural?.heat_units || 0
        };
        
        // Weather Alerts
        this.alerts = data.alerts || [];
        
        // Historical Data
        this.history = data.history || {
            daily: [],
            monthly: [],
            yearly: []
        };
        
        // Climate Data
        this.climate = data.climate || {
            annual_rainfall: 0,
            average_temperature: 0,
            annual_gdd: 0,
            frost_free_days: 0,
            climate_zone: ''
        };
        
        // Timestamps
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.forecast_generated_at = data.forecast_generated_at || null;
    }

    // Weather Metrics Calculations
    calculateHeatIndex() {
        const temp = this.current.temperature;
        const humidity = this.current.humidity;
        
        // Simplified heat index calculation
        if (temp < 27) return temp;
        
        const hi = -42.379 + 2.04901523 * temp + 10.14333127 * humidity - 0.22475541 * temp * humidity;
        return Math.round(hi * 10) / 10;
    }

    calculateWindChill() {
        const temp = this.current.temperature;
        const windSpeed = this.current.wind_speed;
        
        if (temp > 10 || windSpeed < 5) return temp;
        
        const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
        return Math.round(wc * 10) / 10;
    }

    calculateDewPoint() {
        const temp = this.current.temperature;
        const humidity = this.current.humidity;
        
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
        const dp = (b * alpha) / (a - alpha);
        
        return Math.round(dp * 10) / 10;
    }

    // Agricultural Calculations
    calculateGrowingDegreeDays(baseTemp = 10) {
        const temp = this.current.temperature;
        return Math.max(0, temp - baseTemp);
    }

    calculateEvapotranspiration() {
        const temp = this.current.temperature;
        const humidity = this.current.humidity;
        const windSpeed = this.current.wind_speed;
        const solarRad = this.current.solar_radiation || 200;
        
        // Simplified Penman-Monteith approximation
        const delta = 0.2 * Math.exp(0.1 * temp);
        const gamma = 0.067;
        const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
        const ea = es * (humidity / 100);
        const windFactor = 0.34 * windSpeed / 3.6;
        
        const et = (0.408 * delta * solarRad + gamma * (900 / (temp + 273)) * windFactor * (es - ea)) / 
                  (delta + gamma * (1 + windFactor));
        
        return Math.max(0, Math.round(et * 10) / 10);
    }

    // Forecast Methods
    addForecastDay(dayData) {
        this.forecast_daily.push({
            ...dayData,
            created_at: new Date().toISOString()
        });
        this.updateTimestamps();
    }

    addForecastHour(hourData) {
        this.forecast_hourly.push({
            ...hourData,
            created_at: new Date().toISOString()
        });
        this.updateTimestamps();
    }

    getForecastForDay(date) {
        return this.forecast_daily.find(f => f.date === date);
    }

    getForecastForHour(dateTime) {
        return this.forecast_hourly.find(f => f.datetime === dateTime);
    }

    // Alert Management
    addAlert(alertData) {
        this.alerts.push({
            ...alertData,
            issued_at: new Date().toISOString(),
            id: `ALERT-${Date.now()}-${this.alerts.length + 1}`
        });
        this.updateTimestamps();
    }

    clearAlerts() {
        this.alerts = this.alerts.filter(alert => 
            alert.issued_at && new Date(alert.issued_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
    }

    // Weather Assessment
    assessWeatherForAgriculture() {
        const assessment = {
            overall_rating: 'Good',
            factors: [],
            risks: [],
            recommendations: []
        };

        // Temperature assessment
        if (this.current.temperature > 32) {
            assessment.factors.push('High temperature risk');
            assessment.risks.push('Heat stress');
            assessment.recommendations.push('Increase irrigation during hot periods');
            assessment.overall_rating = 'Moderate';
        } else if (this.current.temperature < 2) {
            assessment.factors.push('Freezing temperature risk');
            assessment.risks.push('Frost damage');
            assessment.recommendations.push('Protect sensitive crops from frost');
            assessment.overall_rating = 'Moderate';
        }

        // Precipitation assessment
        if (this.current.precipitation > 20) {
            assessment.factors.push('Heavy precipitation');
            assessment.risks.push('Waterlogging');
            assessment.recommendations.push('Ensure proper drainage');
            assessment.overall_rating = 'Moderate';
        }

        // Wind assessment
        if (this.current.wind_speed > 50) {
            assessment.factors.push('High wind');
            assessment.risks.push('Wind damage');
            assessment.recommendations.push('Secure equipment and structures');
            assessment.overall_rating = 'Moderate';
        }

        // Humidity assessment
        if (this.current.humidity > 80) {
            assessment.factors.push('High humidity');
            assessment.risks.push('Disease risk');
            assessment.recommendations.push('Monitor for fungal diseases');
        } else if (this.current.humidity < 20) {
            assessment.factors.push('Low humidity');
            assessment.risks.push('Dry conditions');
            assessment.recommendations.push('Increase irrigation');
        }

        return assessment;
    }

    // Statistical Methods
    calculateStatistics() {
        if (this.history.daily.length === 0) return null;

        const temps = this.history.daily.map(d => d.temperature);
        const rainfall = this.history.daily.map(d => d.precipitation);
        
        return {
            average_temperature: temps.reduce((a, b) => a + b, 0) / temps.length,
            max_temperature: Math.max(...temps),
            min_temperature: Math.min(...temps),
            total_rainfall: rainfall.reduce((a, b) => a + b, 0),
            average_rainfall: rainfall.reduce((a, b) => a + b, 0) / rainfall.length,
            max_rainfall: Math.max(...rainfall),
            days_with_rain: rainfall.filter(r => r > 0).length,
            days_above_30: temps.filter(t => t > 30).length,
            days_below_0: temps.filter(t => t < 0).length
        };
    }

    // Validation
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.station_id) errors.push('Station ID is required');
        if (this.current.temperature < -50 || this.current.temperature > 60) {
            errors.push('Temperature out of valid range');
        }
        if (this.current.humidity < 0 || this.current.humidity > 100) {
            errors.push('Humidity out of valid range');
        }
        if (this.current.pressure < 800 || this.current.pressure > 1100) {
            warnings.push('Pressure value seems unusual');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    // Utility Methods
    updateTimestamps() {
        this.updated_at = new Date().toISOString();
    }

    toJSON() {
        return {
            station_id: this.station_id,
            station_name: this.station_name,
            location: this.location,
            current: this.current,
            forecast_daily: this.forecast_daily,
            forecast_hourly: this.forecast_hourly,
            agricultural: this.agricultural,
            alerts: this.alerts,
            history: this.history,
            climate: this.climate,
            created_at: this.created_at,
            updated_at: this.updated_at,
            forecast_generated_at: this.forecast_generated_at
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
        this.updated_at = new Date().toISOString();
        return this;
    }

    clone() {
        return new WeatherModel(this.toJSON());
    }

    static createSampleWeather() {
        return new WeatherModel({
            station_name: 'Main Weather Station',
            location: {
                latitude: 41.8781,
                longitude: -87.6298,
                elevation: 182,
                region: 'Midwest'
            },
            current: {
                temperature: 24.5,
                feels_like: 23.2,
                humidity: 68,
                pressure: 1014,
                wind_speed: 12,
                precipitation: 0,
                condition: 'Partly Cloudy',
                uv_index: 5
            },
            agricultural: {
                growing_degree_days: 1450,
                evapotranspiration: 4.2,
                rain_forecast_24h: 2.5
            }
        });
    }
}

window.WeatherModel = WeatherModel;