/**
 * Soil Agent - Real-world Soil & Irrigation Logic
 * Handles soil monitoring, analysis, and irrigation scheduling
 */

class SoilAgent {
    constructor() {
        this.soilData = null;
        this.irrigationSchedules = [];
        this.soilSensors = [];
        this.moistureHistory = [];
        this.initialize();
    }

    initialize() {
        console.log('🧪 Soil Agent initialized with real-world monitoring');
        this.initializeSoilSensors();
        this.generateInitialData();
        this.startSoilMonitoring();
        this.initializeIrrigationSchedules();
    }

    initializeSoilSensors() {
        this.soilSensors = [
            {
                id: 'SENSOR-001',
                field_id: 'field-001',
                location: 'North Field - Center',
                depth: 30, // cm
                type: 'capacitance',
                status: 'active'
            },
            {
                id: 'SENSOR-002',
                field_id: 'field-001',
                location: 'North Field - Edge',
                depth: 60,
                type: 'capacitance',
                status: 'active'
            },
            {
                id: 'SENSOR-003',
                field_id: 'field-002',
                location: 'South Field - Center',
                depth: 30,
                type: 'tensiometer',
                status: 'active'
            },
            {
                id: 'SENSOR-004',
                field_id: 'field-003',
                location: 'East Field - Center',
                depth: 40,
                type: 'capacitance',
                status: 'active'
            }
        ];
    }

    generateInitialData() {
        this.soilData = {
            field_id: 'field-001',
            timestamp: new Date().toISOString(),
            moisture: 65,
            temperature: 22,
            ec: 0.8,
            ph: 6.5,
            npk: {
                nitrogen: 28,
                phosphorus: 18,
                potassium: 32
            },
            organic_matter: 3.2,
            soil_type: 'Loam',
            bulk_density: 1.4,
            infiltration_rate: 2.5,
            wilting_point: 15,
            field_capacity: 85
        };

        // Initialize moisture history
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            this.moistureHistory.push({
                date: date.toISOString().split('T')[0],
                moisture: Math.round(55 + Math.random() * 30),
                temperature: Math.round(18 + Math.random() * 8)
            });
        }
    }

    initializeIrrigationSchedules() {
        this.irrigationSchedules = [
            {
                id: 'IRRIG-001',
                field_id: 'field-001',
                type: 'Drip',
                schedule: 'Every 3 days',
                amount: 25, // mm
                duration: 2, // hours
                start_time: '06:00',
                status: 'active',
                last_run: new Date().toISOString()
            },
            {
                id: 'IRRIG-002',
                field_id: 'field-002',
                type: 'Sprinkler',
                schedule: 'Every 4 days',
                amount: 30,
                duration: 3,
                start_time: '05:30',
                status: 'active',
                last_run: new Date().toISOString()
            }
        ];
    }

    startSoilMonitoring() {
        // Update soil data every 30 minutes
        setInterval(() => {
            this.updateSoilData();
        }, 1800000); // 30 minutes

        // Analyze soil trends every 6 hours
        setInterval(() => {
            this.analyzeSoilTrends();
        }, 21600000); // 6 hours
    }

    updateSoilData() {
        // Simulate soil sensor readings with real-world variations
        const variation = (Math.random() - 0.5) * 3;
        const moistureVariation = (Math.random() - 0.5) * 2;
        const tempVariation = (Math.random() - 0.5) * 1.5;

        const newMoisture = Math.max(10, Math.min(90, this.soilData.moisture + moistureVariation));
        const newTemp = Math.max(10, Math.min(35, this.soilData.temperature + tempVariation));

        this.soilData = {
            ...this.soilData,
            timestamp: new Date().toISOString(),
            moisture: Math.round(newMoisture * 10) / 10,
            temperature: Math.round(newTemp * 10) / 10,
            ec: Math.max(0.1, Math.min(2.5, this.soilData.ec + (Math.random() - 0.5) * 0.05))
        };

        // Update moisture history
        this.moistureHistory.push({
            date: new Date().toISOString().split('T')[0],
            moisture: this.soilData.moisture,
            temperature: this.soilData.temperature
        });

        // Keep only last 90 days
        if (this.moistureHistory.length > 90) {
            this.moistureHistory.shift();
        }

        // Check for extreme conditions
        this.checkSoilExtremes(this.soilData);
    }

    checkSoilExtremes(soilData) {
        const alerts = [];

        if (soilData.moisture < 20) {
            alerts.push({
                type: 'DROUGHT_CONDITION',
                severity: 'CRITICAL',
                message: `Soil moisture at ${soilData.moisture}% - Immediate irrigation required`,
                field_id: soilData.field_id,
                timestamp: new Date().toISOString()
            });
        }

        if (soilData.moisture > 80) {
            alerts.push({
                type: 'FLOOD_CONDITION',
                severity: 'HIGH',
                message: `Soil moisture at ${soilData.moisture}% - Risk of waterlogging`,
                field_id: soilData.field_id,
                timestamp: new Date().toISOString()
            });
        }

        if (soilData.ph < 5.0 || soilData.ph > 7.5) {
            alerts.push({
                type: 'PH_IMBALANCE',
                severity: 'MODERATE',
                message: `Soil pH at ${soilData.ph} - Optimal range is 6.0-7.0`,
                field_id: soilData.field_id,
                timestamp: new Date().toISOString()
            });
        }

        if (soilData.ec > 1.5) {
            alerts.push({
                type: 'SALINITY_RISK',
                severity: 'MODERATE',
                message: `Soil EC at ${soilData.ec} mS/cm - Possible salinity issue`,
                field_id: soilData.field_id,
                timestamp: new Date().toISOString()
            });
        }

        if (alerts.length > 0) {
            this.dispatchSoilAlerts(alerts);
        }
    }

    analyzeSoilTrends() {
        // Analyze moisture trends over the last 7 days
        const recentData = this.moistureHistory.slice(-7);
        if (recentData.length < 7) return;

        const avgMoisture = recentData.reduce((sum, d) => sum + d.moisture, 0) / recentData.length;
        const trend = recentData[recentData.length - 1].moisture - recentData[0].moisture;
        
        const trendAnalysis = {
            current_moisture: this.soilData.moisture,
            average_moisture_7day: Math.round(avgMoisture * 10) / 10,
            trend_7day: Math.round(trend * 10) / 10,
            trend_direction: trend > 0 ? 'INCREASING' : trend < 0 ? 'DECREASING' : 'STABLE',
            recommendation: this.getMoistureRecommendation(this.soilData.moisture, trend)
        };

        document.dispatchEvent(new CustomEvent('soilTrends', {
            detail: {
                ...trendAnalysis,
                field_id: this.soilData.field_id,
                timestamp: new Date().toISOString()
            }
        }));

        return trendAnalysis;
    }

    getMoistureRecommendation(currentMoisture, trend) {
        if (currentMoisture < 25) {
            return 'URGENT: Immediate irrigation required. Soil moisture critically low.';
        } else if (currentMoisture < 35) {
            return 'HIGH: Schedule irrigation within 24 hours. Moisture levels below optimal.';
        } else if (currentMoisture < 50) {
            if (trend < 0) {
                return 'MEDIUM: Plan irrigation in 2-3 days. Moisture trending downward.';
            }
            return 'MEDIUM: Monitor moisture levels. Irrigation may be needed soon.';
        } else if (currentMoisture < 75) {
            return 'LOW: Soil moisture adequate. Monitor for changes.';
        } else {
            return 'LOW: Soil moisture high. Ensure proper drainage.';
        }
    }

    dispatchSoilAlerts(alerts) {
        alerts.forEach(alert => {
            document.dispatchEvent(new CustomEvent('soilAlert', {
                detail: alert
            }));
        });
    }

    async getSoilData(fieldId = null) {
        if (fieldId && fieldId !== this.soilData.field_id) {
            // Simulate different field data
            return this.generateFieldSoilData(fieldId);
        }
        return this.soilData;
    }

    generateFieldSoilData(fieldId) {
        const baseData = {
            field_id: fieldId,
            timestamp: new Date().toISOString(),
            moisture: Math.round(50 + Math.random() * 35),
            temperature: Math.round(18 + Math.random() * 8),
            ec: Math.round((0.3 + Math.random() * 1.2) * 100) / 100,
            ph: Math.round((6.0 + Math.random() * 1.5) * 100) / 100,
            npk: {
                nitrogen: Math.round(15 + Math.random() * 30),
                phosphorus: Math.round(10 + Math.random() * 25),
                potassium: Math.round(20 + Math.random() * 30)
            },
            organic_matter: Math.round((2 + Math.random() * 3) * 10) / 10,
            soil_type: ['Loam', 'Sandy', 'Clay', 'Silt'][Math.floor(Math.random() * 4)],
            bulk_density: Math.round((1.2 + Math.random() * 0.5) * 100) / 100,
            infiltration_rate: Math.round((1.5 + Math.random() * 2) * 10) / 10,
            wilting_point: Math.round(10 + Math.random() * 10),
            field_capacity: Math.round(70 + Math.random() * 20)
        };
        return baseData;
    }

    async getSoilAnalysis(fieldId = null) {
        const soilData = await this.getSoilData(fieldId);
        return {
            ...soilData,
            analysis: {
                texture: this.analyzeTexture(soilData),
                drainage: this.assessDrainage(soilData),
                fertility: this.assessFertility(soilData),
                salinity_risk: soilData.ec > 1.5 ? 'HIGH' : soilData.ec > 0.8 ? 'MEDIUM' : 'LOW',
                recommendations: this.generateSoilRecommendations(soilData)
            }
        };
    }

    analyzeTexture(soilData) {
        const textureMap = {
            'Loam': 'Ideal soil texture - good water holding capacity and drainage',
            'Sandy': 'Sandy soil - excellent drainage but low water and nutrient holding capacity',
            'Clay': 'Clay soil - high water holding but poor drainage, compaction risk',
            'Silt': 'Silt soil - moderate drainage and fertility'
        };
        return textureMap[soilData.soil_type] || 'Mixed soil texture';
    }

    assessDrainage(soilData) {
        const { infiltration_rate, moisture } = soilData;
        if (infiltration_rate > 3) return 'EXCELLENT';
        if (infiltration_rate > 2) return 'GOOD';
        if (infiltration_rate > 1) return 'MODERATE';
        return 'POOR';
    }

    assessFertility(soilData) {
        const { npk, organic_matter } = soilData;
        const score = (npk.nitrogen / 30) * 0.4 + (npk.phosphorus / 25) * 0.3 + (npk.potassium / 35) * 0.2 + (organic_matter / 4) * 0.1;
        return score > 0.7 ? 'HIGH' : score > 0.4 ? 'MODERATE' : 'LOW';
    }

    generateSoilRecommendations(soilData) {
        const recommendations = [];

        if (soilData.ph < 5.5) {
            recommendations.push({
                issue: 'Soil too acidic',
                recommendation: 'Apply lime at 2-3 tons/ha to raise pH to optimal range (6.0-7.0)',
                priority: 'HIGH'
            });
        } else if (soilData.ph > 7.0) {
            recommendations.push({
                issue: 'Soil too alkaline',
                recommendation: 'Apply elemental sulfur or organic matter to lower pH',
                priority: 'HIGH'
            });
        }

        if (soilData.npk.nitrogen < 20) {
            recommendations.push({
                issue: 'Low nitrogen',
                recommendation: 'Apply 40-60 kg N/ha as urea or ammonium nitrate',
                priority: 'HIGH'
            });
        }

        if (soilData.npk.phosphorus < 15) {
            recommendations.push({
                issue: 'Low phosphorus',
                recommendation: 'Apply 30-45 kg P2O5/ha as DAP or MAP',
                priority: 'MEDIUM'
            });
        }

        if (soilData.npk.potassium < 25) {
            recommendations.push({
                issue: 'Low potassium',
                recommendation: 'Apply 40-60 kg K2O/ha as potassium chloride',
                priority: 'MEDIUM'
            });
        }

        if (soilData.organic_matter < 2) {
            recommendations.push({
                issue: 'Low organic matter',
                recommendation: 'Apply compost or manure at 10-15 tons/ha to improve soil health',
                priority: 'MEDIUM'
            });
        }

        if (soilData.ec > 1.5) {
            recommendations.push({
                issue: 'Salinity concern',
                recommendation: 'Apply gypsum and improve drainage to reduce salt accumulation',
                priority: 'HIGH'
            });
        }

        return recommendations;
    }

    async getIrrigationRecommendation(fieldId = null, cropData = null, weatherData = null) {
        const soilData = await this.getSoilData(fieldId);
        const moisture = soilData.moisture;
        const fieldCapacity = soilData.field_capacity || 85;
        const wiltingPoint = soilData.wilting_point || 15;

        // Calculate irrigation need
        const deficit = fieldCapacity - moisture;
        const availableWater = moisture - wiltingPoint;
        const maxAvailable = fieldCapacity - wiltingPoint;
        const availableRatio = availableWater / maxAvailable;

        let urgency = 'LOW';
        let status = 'Adequate moisture';
        let recommendation = 'No irrigation needed at this time';
        let amount = 0;

        if (availableRatio < 0.25) {
            urgency = 'CRITICAL';
            status = 'Severe water stress';
            amount = Math.round(deficit * 0.8);
            recommendation = `EMERGENCY: Apply ${amount}mm irrigation immediately.`;
        } else if (availableRatio < 0.4) {
            urgency = 'HIGH';
            status = 'Water stress developing';
            amount = Math.round(deficit * 0.6);
            recommendation = `Apply ${amount}mm irrigation within 24-48 hours.`;
        } else if (availableRatio < 0.55) {
            urgency = 'MEDIUM';
            status = 'Moderate moisture depletion';
            amount = Math.round(deficit * 0.4);
            recommendation = `Apply ${amount}mm irrigation within 3-4 days.`;
        } else if (availableRatio < 0.7) {
            urgency = 'LOW';
            status = 'Adequate moisture';
            recommendation = 'Monitor moisture levels. No immediate irrigation needed.';
        }

        return {
            field_id: fieldId || this.soilData.field_id,
            current_moisture: Math.round(moisture),
            field_capacity: fieldCapacity,
            wilting_point: wiltingPoint,
            available_water: Math.round(availableWater),
            available_ratio: Math.round(availableRatio * 100),
            deficit: Math.round(deficit),
            urgency: urgency,
            status: status,
            irrigation_amount: amount,
            recommendation: recommendation,
            method: this.getIrrigationMethod(soilData, cropData),
            timing: this.getIrrigationTiming(urgency, weatherData),
            crop_stage_specific: this.getStageSpecificAdvice(cropData, availableRatio)
        };
    }

    getIrrigationMethod(soilData, cropData) {
        if (!cropData) return 'Sprinkler irrigation recommended';
        
        if (cropData.cropType === 'Tomato' || cropData.cropType === 'Potato') {
            return 'Drip irrigation - ideal for vegetables and root crops';
        } else if (cropData.cropType === 'Rice') {
            return 'Flood irrigation - maintain 5-10cm water level';
        } else if (soilData.soil_type === 'Sandy') {
            return 'Drip irrigation - sandy soil requires frequent, light applications';
        } else if (soilData.soil_type === 'Clay') {
            return 'Sprinkler irrigation - allow gradual infiltration on clay soil';
        }
        return 'Sprinkler irrigation recommended for uniform coverage';
    }

    getIrrigationTiming(urgency, weatherData) {
        if (urgency === 'CRITICAL') return 'Immediately';
        if (urgency === 'HIGH') return 'Within 24 hours';
        if (urgency === 'MEDIUM') return 'Within 2-3 days';
        
        if (weatherData && weatherData.forecast) {
            const rainIn3Days = weatherData.forecast.slice(0, 3).reduce((sum, d) => sum + (d.precipitation || 0), 0);
            if (rainIn3Days > 10) {
                return 'Monitor - rainfall expected in coming days';
            }
        }
        return 'No immediate action required - monitor regularly';
    }

    getStageSpecificAdvice(cropData, availableRatio) {
        if (!cropData) return 'Maintain optimal soil moisture for current growth stage';
        
        const stageAdvice = {
            'Seedling': 'Keep soil consistently moist - available water should be > 60%',
            'Vegetative': 'Maintain > 50% available water for rapid growth',
            'Flowering': 'Critical period - maintain > 60% available water',
            'Fruiting': 'Maintain > 55% available water for fruit development',
            'Maturity': 'Slightly reduce water - maintain > 40% available water'
        };

        const advice = stageAdvice[cropData.growthStage] || 'Maintain optimal moisture for current growth stage';
        const current = availableRatio > 0.6 ? 'Good moisture levels' : 
                       availableRatio > 0.4 ? 'Moderate moisture - monitor closely' : 
                       'Low moisture - take action immediately';
        
        return `${advice} - ${current}`;
    }

    async getMoistureHistory(days = 30) {
        return this.moistureHistory.slice(-days);
    }

    async getSoilHealth() {
        const soilData = await this.getSoilData();
        const analysis = await this.getSoilAnalysis();
        
        const healthScore = this.calculateSoilHealthScore(soilData);
        const healthFactors = this.assessSoilHealthFactors(soilData, analysis);
        
        return {
            field_id: soilData.field_id,
            health_score: Math.round(healthScore),
            factors: healthFactors,
            status: healthScore > 75 ? 'GOOD' : healthScore > 50 ? 'MODERATE' : 'POOR',
            recommendations: analysis.analysis.recommendations,
            timestamp: new Date().toISOString()
        };
    }

    calculateSoilHealthScore(soilData) {
        let score = 50; // Base score
        
        // Moisture score (0-20)
        if (soilData.moisture > 60 && soilData.moisture < 80) score += 20;
        else if (soilData.moisture > 40 && soilData.moisture < 85) score += 15;
        else if (soilData.moisture > 20 && soilData.moisture < 90) score += 10;
        else score += 5;

        // pH score (0-15)
        if (soilData.ph > 6.0 && soilData.ph < 7.0) score += 15;
        else if (soilData.ph > 5.5 && soilData.ph < 7.5) score += 10;
        else score += 5;

        // Organic matter score (0-15)
        if (soilData.organic_matter > 3) score += 15;
        else if (soilData.organic_matter > 2) score += 10;
        else score += 5;

        // Nutrient score (0-20)
        const nutrientScore = (soilData.npk.nitrogen / 30) * 7 + 
                            (soilData.npk.phosphorus / 25) * 6 + 
                            (soilData.npk.potassium / 35) * 7;
        score += Math.min(20, Math.round(nutrientScore));

        return Math.min(100, score);
    }

    assessSoilHealthFactors(soilData, analysis) {
        return {
            physical: {
                texture: soilData.soil_type,
                drainage: analysis.analysis.drainage,
                compaction: soilData.bulk_density > 1.5 ? 'HIGH' : 'LOW'
            },
            chemical: {
                ph: soilData.ph,
                ph_status: soilData.ph > 6.0 && soilData.ph < 7.0 ? 'OPTIMAL' : 'NEEDS_ADJUSTMENT',
                salinity: soilData.ec,
                salinity_status: soilData.ec < 0.8 ? 'GOOD' : 'CONCERN'
            },
            biological: {
                organic_matter: soilData.organic_matter,
                organic_matter_status: soilData.organic_matter > 2.5 ? 'GOOD' : 'IMPROVE'
            }
        };
    }

    async scheduleIrrigation(fieldId, amount, timing) {
        const schedule = {
            id: `IRRIG-${Date.now()}`,
            field_id: fieldId || this.soilData.field_id,
            amount: amount,
            timing: timing,
            scheduled_time: new Date().toISOString(),
            status: 'scheduled',
            type: 'Drip'
        };
        
        this.irrigationSchedules.push(schedule);
        return schedule;
    }

    async getIrrigationSchedules(fieldId = null) {
        if (fieldId) {
            return this.irrigationSchedules.filter(s => s.field_id === fieldId);
        }
        return this.irrigationSchedules;
    }

    async updateSoilDataFromSensors() {
        // Simulate sensor data collection
        const sensorData = this.soilSensors.map(sensor => ({
            sensor_id: sensor.id,
            field_id: sensor.field_id,
            depth: sensor.depth,
            moisture: Math.round(50 + Math.random() * 35),
            temperature: Math.round(18 + Math.random() * 8),
            timestamp: new Date().toISOString()
        }));

        // Update soil data with average sensor readings
        const avgMoisture = sensorData.reduce((sum, s) => sum + s.moisture, 0) / sensorData.length;
        const avgTemp = sensorData.reduce((sum, s) => sum + s.temperature, 0) / sensorData.length;

        this.soilData = {
            ...this.soilData,
            moisture: Math.round(avgMoisture * 10) / 10,
            temperature: Math.round(avgTemp * 10) / 10,
            timestamp: new Date().toISOString()
        };

        return {
            sensors: sensorData,
            average: {
                moisture: this.soilData.moisture,
                temperature: this.soilData.temperature
            }
        };
    }
}

window.SoilAgent = SoilAgent;