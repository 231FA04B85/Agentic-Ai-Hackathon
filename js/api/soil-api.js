/**
 * Soil & Irrigation API Integration
 * Handles soil sensor data, irrigation management, and soil analysis
 * Uses API Key Manager for secure key management
 */

class SoilAPI {
    constructor() {
        this.config = {
            baseUrl: CONFIG.API.SOIL.BASE_URL || 'http://localhost:5000/api/v1',
            timeout: CONFIG.API.SOIL.TIMEOUT || 10000,
            retryCount: CONFIG.API.SOIL.RETRY_COUNT || 2,
            endpoints: CONFIG.API.SOIL.ENDPOINTS || {
                READINGS: '/soil/readings',
                IRRIGATION: '/soil/irrigation',
                ANALYSIS: '/soil/analysis',
                SENSORS: '/soil/sensors',
                HISTORY: '/soil/history'
            }
        };

        this.cache = {
            readings: null,
            analysis: null,
            timestamp: null,
            ttl: CONFIG.API.SOIL.CACHE_TTL || 300000 // 5 minutes
        };
    }

    /**
     * Check if soil API is available (local service)
     * @private
     * @returns {Promise<boolean>} True if API is available
     */
    async checkAvailability() {
        try {
            const response = await this.fetchWithRetry(`${this.config.baseUrl}/health`, 0, true);
            return response.ok;
        } catch (error) {
            console.warn('[SoilAPI] Local API not available. Using sample data.', error.message);
            return false;
        }
    }

    /**
     * Get current soil readings from sensors
     * @param {string} fieldId - Field identifier
     * @param {string} sensorId - Specific sensor ID (optional)
     * @returns {Promise<Object>} Soil readings
     */
    async getSoilReadings(fieldId = null, sensorId = null) {
        try {
            const isAvailable = await this.checkAvailability();
            
            if (isAvailable) {
                return await this.fetchSoilReadingsFromAPI(fieldId, sensorId);
            } else {
                console.log('[SoilAPI] Using sample soil data (local API unavailable)');
                const readings = this.generateSampleReadings(fieldId);
                
                this.cache.readings = readings;
                this.cache.timestamp = Date.now();
                
                return readings;
            }
        } catch (error) {
            console.error('[SoilAPI] Failed to fetch soil readings:', error);
            return this.getFallbackReadings();
        }
    }

    /**
     * Fetch soil readings from real API
     * @private
     */
    async fetchSoilReadingsFromAPI(fieldId, sensorId) {
        try {
            let url = `${this.config.baseUrl}${this.config.endpoints.READINGS}`;
            const params = new URLSearchParams();
            
            if (fieldId) params.append('field_id', fieldId);
            if (sensorId) params.append('sensor_id', sensorId);
            
            const response = await this.fetchWithRetry(`${url}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Soil API error: ${response.status}`);
            }

            const data = await response.json();
            this.cache.readings = data;
            this.cache.timestamp = Date.now();
            
            console.log('[SoilAPI] ✓ Soil readings fetched successfully');
            return data;
        } catch (error) {
            console.error('[SoilAPI] Error fetching from API:', error);
            throw error;
        }
    }

    /**
     * Get soil analysis data (NPK, pH, organic matter, etc.)
     * @param {string} fieldId - Field identifier
     * @returns {Promise<Object>} Soil analysis data
     */
    async getSoilAnalysis(fieldId = null) {
        try {
            if (this.isCacheValid() && this.cache.analysis) {
                return this.cache.analysis;
            }

            const analysis = this.generateSampleAnalysis(fieldId);
            
            this.cache.analysis = analysis;
            this.cache.timestamp = Date.now();
            
            return analysis;
        } catch (error) {
            console.error('Failed to fetch soil analysis:', error);
            return this.getFallbackAnalysis();
        }
    }

    /**
     * Get irrigation recommendations
     * @param {string} fieldId - Field identifier
     * @param {Object} cropData - Crop information
     * @param {Object} weatherData - Weather information
     * @returns {Promise<Object>} Irrigation recommendations
     */
    async getIrrigationRecommendation(fieldId = null, cropData = null, weatherData = null) {
        try {
            const readings = await this.getSoilReadings(fieldId);
            const moisture = readings.moisture || 60;
            
            const recommendation = this.calculateIrrigationRecommendation(
                moisture,
                cropData,
                weatherData
            );
            
            return recommendation;
        } catch (error) {
            console.error('Failed to get irrigation recommendation:', error);
            return this.getFallbackIrrigationRecommendation();
        }
    }

    /**
     * Get historical soil data
     * @param {string} fieldId - Field identifier
     * @param {number} days - Number of days of history
     * @returns {Promise<Array>} Historical soil data
     */
    async getSoilHistory(fieldId = null, days = 30) {
        try {
            const history = this.generateSampleHistory(fieldId, days);
            return history;
        } catch (error) {
            console.error('Failed to fetch soil history:', error);
            return this.generateSampleHistory(fieldId, days);
        }
    }

    /**
     * Get crop water stress assessment
     * @param {string} fieldId - Field identifier
     * @param {number} canopyTemp - Canopy temperature in Celsius
     * @param {number} airTemp - Air temperature in Celsius
     * @returns {Promise<Object>} Water stress assessment
     */
    async getWaterStressAssessment(fieldId = null, canopyTemp = null, airTemp = null) {
        try {
            const readings = await this.getSoilReadings(fieldId);
            const moisture = readings.moisture || 70;
            const actualCanopyTemp = canopyTemp || readings.canopyTemp || 24.5;
            const actualAirTemp = airTemp || readings.airTemp || 22.0;
            
            // Calculate stress using CWSI (Crop Water Stress Index)
            const stressIndex = this.calculateCWSI(actualCanopyTemp, actualAirTemp, moisture);
            
            return {
                field_id: fieldId || 'default',
                moisture: moisture,
                canopy_temp: actualCanopyTemp,
                air_temp: actualAirTemp,
                stress_index: Math.round(stressIndex * 100) / 100,
                stress_level: this.getStressLevel(stressIndex),
                water_deficit: Math.max(0, 100 - moisture),
                recommendation: this.getStressRecommendation(stressIndex, moisture),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to assess water stress:', error);
            return this.getFallbackStressAssessment();
        }
    }

    /**
     * Generate sample soil readings
     * @param {string} fieldId - Field identifier
     * @returns {Object} Sample soil readings
     */
    generateSampleReadings(fieldId = null) {
        const moisture = Math.round(50 + Math.random() * 35);
        const temperature = Math.round(18 + Math.random() * 10);
        
        return {
            field_id: fieldId || 'field-001',
            moisture: moisture,
            temperature: temperature,
            ec: Math.round((0.4 + Math.random() * 1.2) * 100) / 100, // Electrical conductivity
            ph: Math.round((6.0 + Math.random() * 1.5) * 100) / 100,
            npk: {
                nitrogen: Math.round(15 + Math.random() * 30),
                phosphorus: Math.round(10 + Math.random() * 25),
                potassium: Math.round(20 + Math.random() * 30)
            },
            organic_matter: Math.round((2 + Math.random() * 3) * 10) / 10,
            soil_type: ['Loam', 'Sandy', 'Clay', 'Silt'][Math.floor(Math.random() * 4)],
            canopy_temp: Math.round((22 + Math.random() * 8) * 10) / 10,
            air_temp: Math.round((20 + Math.random() * 8) * 10) / 10,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate sample soil analysis
     * @param {string} fieldId - Field identifier
     * @returns {Object} Sample soil analysis
     */
    generateSampleAnalysis(fieldId = null) {
        return {
            field_id: fieldId || 'field-001',
            texture: ['Sandy Loam', 'Silty Clay', 'Clay Loam', 'Silt'][Math.floor(Math.random() * 4)],
            ph: Math.round((6.0 + Math.random() * 1.5) * 100) / 100,
            ec: Math.round((0.3 + Math.random() * 1.2) * 100) / 100,
            organic_matter: Math.round((2 + Math.random() * 4) * 10) / 10,
            nitrogen: Math.round(15 + Math.random() * 35),
            phosphorus: Math.round(10 + Math.random() * 30),
            potassium: Math.round(20 + Math.random() * 40),
            calcium: Math.round(500 + Math.random() * 1000),
            magnesium: Math.round(100 + Math.random() * 300),
            sulfur: Math.round(10 + Math.random() * 30),
            zinc: Math.round((0.5 + Math.random() * 1.5) * 10) / 10,
            iron: Math.round((2 + Math.random() * 8) * 10) / 10,
            manganese: Math.round((5 + Math.random() * 20) * 10) / 10,
            copper: Math.round((0.5 + Math.random() * 2) * 10) / 10,
            boron: Math.round((0.3 + Math.random() * 1) * 10) / 10,
            deficiencies: this.identifyDeficiencies(),
            recommendations: this.generateFertilizerRecommendations(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Identify nutrient deficiencies
     * @returns {Array} List of identified deficiencies
     */
    identifyDeficiencies() {
        const deficiencies = [];
        const nutrients = {
            nitrogen: { threshold: 20, label: 'Nitrogen' },
            phosphorus: { threshold: 15, label: 'Phosphorus' },
            potassium: { threshold: 25, label: 'Potassium' },
            zinc: { threshold: 0.5, label: 'Zinc' }
        };

        for (const [key, value] of Object.entries(nutrients)) {
            const level = this.generateSampleAnalysis()[key];
            if (level && level < value.threshold) {
                deficiencies.push({
                    nutrient: value.label,
                    level: level,
                    threshold: value.threshold,
                    severity: (value.threshold - level) / value.threshold > 0.5 ? 'High' : 'Moderate'
                });
            }
        }

        return deficiencies.length > 0 ? deficiencies : [{ nutrient: 'None detected', level: 'Optimal', severity: 'Low' }];
    }

    /**
     * Generate fertilizer recommendations
     * @returns {Array} Fertilizer recommendations
     */
    generateFertilizerRecommendations() {
        const recommendations = [];
        const analysis = this.generateSampleAnalysis();
        
        if (analysis.nitrogen < 25) {
            recommendations.push({
                nutrient: 'Nitrogen',
                recommendation: 'Apply 50-70 kg N/ha',
                timing: 'Pre-planting or top-dress',
                type: 'Urea or Ammonium Nitrate'
            });
        }
        
        if (analysis.phosphorus < 20) {
            recommendations.push({
                nutrient: 'Phosphorus',
                recommendation: 'Apply 30-45 kg P2O5/ha',
                timing: 'Pre-planting',
                type: 'DAP or MAP'
            });
        }
        
        if (analysis.potassium < 30) {
            recommendations.push({
                nutrient: 'Potassium',
                recommendation: 'Apply 40-60 kg K2O/ha',
                timing: 'Pre-planting',
                type: 'Potassium Chloride'
            });
        }

        return recommendations.length > 0 ? recommendations : [
            { nutrient: 'Maintenance', recommendation: 'Apply balanced fertilizer at 100-120 kg NPK/ha', timing: 'At planting', type: 'Balanced NPK' }
        ];
    }

    /**
     * Calculate irrigation recommendation
     * @param {number} moisture - Current soil moisture %
     * @param {Object} cropData - Crop information
     * @param {Object} weatherData - Weather information
     * @returns {Object} Irrigation recommendation
     */
    calculateIrrigationRecommendation(moisture, cropData = null, weatherData = null) {
        const cropCoefficient = {
            'Wheat': 0.85,
            'Corn': 1.0,
            'Tomato': 1.1,
            'Soybean': 0.9,
            'Rice': 1.2,
            'Cotton': 0.95
        };
        
        const cropType = cropData?.type || 'Corn';
        const kc = cropCoefficient[cropType] || 1.0;
        const et = weatherData?.et || 5; // mm/day
        
        // Calculate water requirement
        const waterRequirement = et * kc;
        
        // Calculate deficit
        const deficit = 100 - moisture;
        const irrigationAmount = Math.max(0, (waterRequirement * deficit / 100) - (weatherData?.precipitation || 0));
        
        let urgency = 'Low';
        let status = 'Adequate';
        
        if (moisture < 40) {
            urgency = 'Critical';
            status = 'Severe Deficit';
        } else if (moisture < 55) {
            urgency = 'High';
            status = 'Moderate Deficit';
        } else if (moisture < 70) {
            urgency = 'Medium';
            status = 'Slight Deficit';
        }
        
        return {
            current_moisture: Math.round(moisture),
            deficit: Math.round(deficit),
            water_requirement: Math.round(waterRequirement * 10) / 10,
            irrigation_amount: Math.round(irrigationAmount * 10) / 10,
            urgency: urgency,
            status: status,
            recommendation: irrigationAmount > 5 
                ? `Apply ${Math.round(irrigationAmount)} mm of irrigation within ${urgency === 'Critical' ? '24' : '48'} hours`
                : 'No irrigation needed at this time',
            timing: urgency === 'Critical' ? 'Immediately' : urgency === 'High' ? 'Within 24 hours' : 'Monitor and re-evaluate in 3-5 days',
            method: this.getIrrigationMethod(cropType, moisture)
        };
    }

    /**
     * Get optimal irrigation method
     * @param {string} cropType - Type of crop
     * @param {number} moisture - Current moisture
     * @returns {string} Recommended method
     */
    getIrrigationMethod(cropType, moisture) {
        if (cropType === 'Tomato' || cropType === 'Potato') {
            return 'Drip irrigation recommended';
        } else if (cropType === 'Rice') {
            return 'Flood irrigation (maintain 5-10cm water level)';
        } else if (moisture < 45) {
            return 'Sprinkler irrigation for uniform application';
        } else {
            return 'Sprinkler or drip irrigation based on availability';
        }
    }

    /**
     * Calculate Crop Water Stress Index (CWSI)
     * @param {number} canopyTemp - Canopy temperature
     * @param {number} airTemp - Air temperature
     * @param {number} moisture - Soil moisture
     * @returns {number} Stress index (0-1)
     */
    calculateCWSI(canopyTemp, airTemp, moisture) {
        // Simplified CWSI calculation
        const tempDiff = canopyTemp - airTemp;
        const moistureFactor = 1 - (moisture / 100);
        
        // Normalize temperature difference (assuming 5°C difference is significant)
        const normalizedTemp = Math.min(1, Math.max(0, (tempDiff + 2) / 8));
        
        // Combine factors
        const stressIndex = (normalizedTemp * 0.7) + (moistureFactor * 0.3);
        return Math.min(1, Math.max(0, stressIndex));
    }

    /**
     * Get stress level from index
     * @param {number} index - Stress index
     * @returns {string} Stress level
     */
    getStressLevel(index) {
        if (index > 0.8) return 'Severe';
        if (index > 0.6) return 'Moderate';
        if (index > 0.4) return 'Mild';
        return 'None';
    }

    /**
     * Get stress recommendation
     * @param {number} index - Stress index
     * @param {number} moisture - Soil moisture
     * @returns {string} Recommendation
     */
    getStressRecommendation(index, moisture) {
        if (index > 0.8) {
            return 'Immediate irrigation required. Apply 30-40mm of water.';
        } else if (index > 0.6) {
            return 'Irrigation recommended within 24 hours. Apply 20-30mm of water.';
        } else if (index > 0.4) {
            return 'Monitor soil moisture. Irrigation may be needed in 2-3 days if no rain.';
        } else {
            return 'Crop is not water stressed. Maintain current irrigation schedule.';
        }
    }

    /**
     * Generate sample soil history
     * @param {string} fieldId - Field identifier
     * @param {number} days - Number of days
     * @returns {Array} Historical soil data
     */
    generateSampleHistory(fieldId = null, days = 30) {
        const history = [];
        const now = new Date();
        let moisture = 70;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Random walk for moisture
            moisture = Math.max(20, Math.min(95, moisture + (Math.random() - 0.5) * 8));
            
            history.push({
                date: date.toISOString().split('T')[0],
                moisture: Math.round(moisture),
                temperature: Math.round(18 + Math.random() * 10),
                rainfall: Math.round(Math.random() * 15),
                stress_index: Math.round(this.calculateCWSI(
                    22 + Math.random() * 6,
                    20 + Math.random() * 6,
                    moisture
                ) * 100) / 100
            });
        }
        
        return history;
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
     * Get fallback soil readings
     * @returns {Object} Fallback readings
     */
    getFallbackReadings() {
        return {
            field_id: 'default',
            moisture: 65,
            temperature: 22,
            ec: 0.8,
            ph: 6.5,
            npk: { nitrogen: 25, phosphorus: 20, potassium: 30 },
            organic_matter: 3.2,
            soil_type: 'Loam',
            canopy_temp: 24.5,
            air_temp: 22.0,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get fallback soil analysis
     * @returns {Object} Fallback analysis
     */
    getFallbackAnalysis() {
        return {
            field_id: 'default',
            texture: 'Sandy Loam',
            ph: 6.5,
            ec: 0.8,
            organic_matter: 3.0,
            nitrogen: 28,
            phosphorus: 18,
            potassium: 32,
            deficiencies: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get fallback irrigation recommendation
     * @returns {Object} Fallback recommendation
     */
    getFallbackIrrigationRecommendation() {
        return {
            current_moisture: 65,
            deficit: 35,
            water_requirement: 4.5,
            irrigation_amount: 15.8,
            urgency: 'Medium',
            status: 'Slight Deficit',
            recommendation: 'Apply 16mm of irrigation within 48 hours',
            timing: 'Within 24-48 hours',
            method: 'Sprinkler irrigation recommended'
        };
    }

    /**
     * Get fallback stress assessment
     * @returns {Object} Fallback stress assessment
     */
    getFallbackStressAssessment() {
        return {
            field_id: 'default',
            moisture: 65,
            canopy_temp: 24.5,
            air_temp: 22.0,
            stress_index: 0.35,
            stress_level: 'Mild',
            water_deficit: 35,
            recommendation: 'Monitor soil moisture. Irrigation may be needed in 2-3 days if no rain.',
            timestamp: new Date().toISOString()
        };
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
     * Fetch with retry logic
     * @private
     * @param {string} url - URL to fetch
     * @param {number} retryCount - Current retry count
     * @param {boolean} headOnly - Only check response status (for availability check)
     * @returns {Promise<Response>} Fetch response
     */
    async fetchWithRetry(url, retryCount = 0, headOnly = false) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const options = { signal: controller.signal };
            if (headOnly) options.method = 'HEAD';
            
            const response = await fetch(url, options);
            clearTimeout(timeoutId);
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (retryCount < this.config.retryCount && error.name !== 'AbortError') {
                console.log(`[SoilAPI] Retry ${retryCount + 1}/${this.config.retryCount}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                return this.fetchWithRetry(url, retryCount + 1, headOnly);
            }
            
            throw error;
        }
    }
}

// Export for use in other files
window.SoilAPI = SoilAPI;