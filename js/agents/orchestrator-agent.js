/**
 * Orchestrator Agent - Main Coordinator for All Farm Operations
 * Real-world use cases: Integrated farm management, emergency response coordination
 */

class OrchestratorAgent {
    constructor() {
        this.agents = {
            crop: new CropAgent(),
            weather: new WeatherAgent(),
            soil: new SoilAgent(),
            pest: new PestAgent(),
            market: new MarketAgent(),
            explanation: new ExplanationAgent()
        };
        
        this.state = {
            initialized: false,
            lastUpdate: null,
            recommendations: [],
            alerts: [],
            fieldData: [],
            emergencyProtocols: [],
            taskQueue: [],
            activeIncidents: []
        };

        // Real-world emergency thresholds
        this.emergencyThresholds = {
            DROUGHT_CRITICAL: 20, // Soil moisture %
            FLOOD_RISK: 50, // mm rainfall in 24h
            HEAT_WAVE: 38, // °C
            FROST: 2, // °C
            PEST_OUTBREAK: 8, // Risk level /10
            STORM_WARNING: 60, // km/h wind speed
            DISEASE_EPIDEMIC: 75 // Disease severity %
        };

        // Real-world crop calendars
        this.cropCalendars = {
            'Wheat': {
                'Seedling': { days: 20, temperature_optimum: 15, water_requirement: 20 },
                'Vegetative': { days: 35, temperature_optimum: 20, water_requirement: 35 },
                'Flowering': { days: 20, temperature_optimum: 22, water_requirement: 45 },
                'Fruiting': { days: 25, temperature_optimum: 25, water_requirement: 50 },
                'Maturity': { days: 20, temperature_optimum: 28, water_requirement: 25 }
            },
            'Corn': {
                'Seedling': { days: 15, temperature_optimum: 18, water_requirement: 25 },
                'Vegetative': { days: 30, temperature_optimum: 25, water_requirement: 40 },
                'Flowering': { days: 15, temperature_optimum: 28, water_requirement: 50 },
                'Fruiting': { days: 30, temperature_optimum: 30, water_requirement: 55 },
                'Maturity': { days: 20, temperature_optimum: 25, water_requirement: 30 }
            },
            'Tomato': {
                'Seedling': { days: 25, temperature_optimum: 20, water_requirement: 20 },
                'Vegetative': { days: 30, temperature_optimum: 25, water_requirement: 30 },
                'Flowering': { days: 20, temperature_optimum: 27, water_requirement: 40 },
                'Fruiting': { days: 40, temperature_optimum: 25, water_requirement: 45 },
                'Maturity': { days: 15, temperature_optimum: 22, water_requirement: 25 }
            }
        };

        // Real-world pest profiles
        this.pestProfiles = {
            'Aphids': {
                scientific_name: 'Aphidoidea',
                optimal_temp: '18-25°C',
                severity_risk: 7,
                treatment: 'Insecticidal soap or neem oil',
                early_warning: 'Sticky honeydew on leaves',
                impact_crops: ['Wheat', 'Corn', 'Tomato', 'Soybean']
            },
            'Fall Armyworm': {
                scientific_name: 'Spodoptera frugiperda',
                optimal_temp: '25-30°C',
                severity_risk: 9,
                treatment: 'Bt spray or synthetic pyrethroids',
                early_warning: 'Irregular holes and frass on leaves',
                impact_crops: ['Corn', 'Soybean', 'Cotton']
            },
            'Late Blight': {
                scientific_name: 'Phytophthora infestans',
                optimal_temp: '15-22°C',
                severity_risk: 9,
                treatment: 'Fungicides containing metalaxyl or mancozeb',
                early_warning: 'Brown spots with white fuzzy growth',
                impact_crops: ['Tomato', 'Potato']
            },
            'Rust': {
                scientific_name: 'Pucciniales',
                optimal_temp: '18-25°C',
                severity_risk: 7,
                treatment: 'Fungicides with triazole or strobilurin',
                early_warning: 'Orange/brown pustules on leaves',
                impact_crops: ['Wheat', 'Corn']
            },
            'Whitefly': {
                scientific_name: 'Bemisia tabaci',
                optimal_temp: '22-30°C',
                severity_risk: 6,
                treatment: 'Neem oil or insect growth regulators',
                early_warning: 'Yellowing and curling of leaves',
                impact_crops: ['Tomato', 'Cotton']
            }
        };

        // Real-world market price reference
        this.marketReferences = {
            'Wheat': { base_price: 4.25, seasonality: [4.0, 4.5, 4.8, 5.0, 4.5, 4.0, 3.8, 3.5, 3.8, 4.2, 4.5, 4.8] },
            'Corn': { base_price: 3.85, seasonality: [3.5, 3.8, 4.2, 4.5, 4.0, 3.5, 3.2, 3.0, 3.2, 3.5, 3.8, 4.0] },
            'Soybean': { base_price: 12.45, seasonality: [11.0, 11.5, 12.0, 12.5, 13.0, 12.5, 12.0, 11.5, 11.0, 11.5, 12.0, 12.5] },
            'Tomato': { base_price: 0.85, seasonality: [0.70, 0.75, 0.80, 0.90, 1.00, 0.95, 0.85, 0.75, 0.70, 0.75, 0.80, 0.90] }
        };
    }

    initialize() {
        console.log('🌾 Orchestrator Agent initializing with real-world farm management protocols...');
        Object.values(this.agents).forEach(agent => {
            if (typeof agent.initialize === 'function') agent.initialize();
        });
        this.state.initialized = true;
        console.log('✅ Orchestrator Agent initialized with emergency response protocols');
        this.startMonitoringCycle();
        this.setupEmergencyProtocols();
    }

    setupEmergencyProtocols() {
        this.state.emergencyProtocols = [
            {
                id: 'EMERG-001',
                name: 'Drought Emergency Protocol',
                triggers: ['soil_moisture_critical', 'crop_wilting'],
                actions: ['emergency_irrigation', 'reduce_crop_density', 'apply_anti-transpirants'],
                priority: 1
            },
            {
                id: 'EMERG-002',
                name: 'Pest Outbreak Protocol',
                triggers: ['pest_risk_critical', 'crop_damage_visible'],
                actions: ['emergency_spraying', 'quarantine_area', 'alert_neighbors'],
                priority: 1
            },
            {
                id: 'EMERG-003',
                name: 'Extreme Weather Protocol',
                triggers: ['storm_warning', 'flood_risk', 'heat_wave'],
                actions: ['secure_equipment', 'protect_crops', 'evacuate_personnel'],
                priority: 2
            }
        ];
    }

    async startMonitoringCycle() {
        await this.runFullAssessment();
        
        // Real-time monitoring with different frequencies
        setInterval(async () => {
            await this.monitorCriticalParameters();
        }, 300000); // 5 minutes - critical parameters

        setInterval(async () => {
            await this.runFullAssessment();
        }, 3600000); // 1 hour - full assessment

        setInterval(async () => {
            await this.updateMarketIntelligence();
        }, 86400000); // 24 hours - market update
    }

    async monitorCriticalParameters() {
        try {
            const [weatherData, soilData] = await Promise.all([
                this.agents.weather.getCurrentData(),
                this.agents.soil.getSoilData()
            ]);

            // Check for emergencies
            await this.checkEmergencyConditions(weatherData, soilData);
            
            // Send real-time alerts if needed
            this.dispatchRealTimeAlerts(weatherData, soilData);
        } catch (error) {
            console.error('Critical monitoring failed:', error);
        }
    }

    async checkEmergencyConditions(weatherData, soilData) {
        const emergencies = [];

        // Drought emergency
        if (soilData.moisture < this.emergencyThresholds.DROUGHT_CRITICAL) {
            emergencies.push({
                type: 'DROUGHT',
                severity: 'CRITICAL',
                message: `Soil moisture at ${soilData.moisture}% - Immediate irrigation required`,
                protocol: 'EMERG-001'
            });
        }

        // Heat wave emergency
        if (weatherData.temp > this.emergencyThresholds.HEAT_WAVE) {
            emergencies.push({
                type: 'HEAT_WAVE',
                severity: 'HIGH',
                message: `Temperature ${weatherData.temp}°C exceeds critical threshold`,
                protocol: 'EMERG-003'
            });
        }

        // Flood/Storm risk
        if (weatherData.precipitation > this.emergencyThresholds.FLOOD_RISK) {
            emergencies.push({
                type: 'FLOOD_RISK',
                severity: 'HIGH',
                message: `Heavy rainfall ${weatherData.precipitation}mm in forecast`,
                protocol: 'EMERG-003'
            });
        }

        // Frost warning
        if (weatherData.temp < this.emergencyThresholds.FROST) {
            emergencies.push({
                type: 'FROST',
                severity: 'HIGH',
                message: `Temperature ${weatherData.temp}°C - Frost risk to crops`,
                protocol: 'EMERG-003'
            });
        }

        // Pest outbreak
        const pestData = await this.agents.pest.getRiskAssessment();
        if (pestData.risk > this.emergencyThresholds.PEST_OUTBREAK) {
            emergencies.push({
                type: 'PEST_OUTBREAK',
                severity: 'CRITICAL',
                message: `${pestData.type} risk at ${pestData.risk}/10 - Immediate action required`,
                protocol: 'EMERG-002'
            });
        }

        if (emergencies.length > 0) {
            this.handleEmergencies(emergencies);
        }
    }

    handleEmergencies(emergencies) {
        console.warn('⚠️ EMERGENCY CONDITIONS DETECTED:', emergencies);
        this.state.activeIncidents = emergencies;

        emergencies.forEach(emergency => {
            const protocol = this.state.emergencyProtocols.find(p => p.id === emergency.protocol);
            if (protocol) {
                console.log(`🚨 Executing ${protocol.name}`);
                this.executeEmergencyProtocol(protocol, emergency);
            }

            // Dispatch emergency alert
            document.dispatchEvent(new CustomEvent('emergencyAlert', {
                detail: {
                    ...emergency,
                    timestamp: new Date().toISOString()
                }
            }));
        });
    }

    executeEmergencyProtocol(protocol, emergency) {
        // Real-world emergency response actions
        const actions = {
            'emergency_irrigation': () => {
                console.log('💧 Starting emergency irrigation protocol');
                // Trigger irrigation system
                this.state.taskQueue.push({
                    action: 'emergency_irrigation',
                    priority: 1,
                    details: { amount: '30mm', duration: '2 hours' }
                });
            },
            'reduce_crop_density': () => {
                console.log('🌾 Reducing crop density to conserve water');
                // Thinning recommendation
            },
            'apply_anti-transpirants': () => {
                console.log('🧪 Applying anti-transpirants to reduce water loss');
            },
            'emergency_spraying': () => {
                console.log('🧪 Initiating emergency pest control spraying');
                this.state.taskQueue.push({
                    action: 'emergency_spraying',
                    priority: 1,
                    details: { chemical: 'Recommended pesticide', timing: 'Immediate' }
                });
            },
            'quarantine_area': () => {
                console.log('🛑 Quarantining affected area');
            },
            'alert_neighbors': () => {
                console.log('📢 Alerting neighboring farms of pest risk');
            },
            'secure_equipment': () => {
                console.log('🔒 Securing farm equipment for storm');
            },
            'protect_crops': () => {
                console.log('🛡️ Implementing crop protection measures');
            },
            'evacuate_personnel': () => {
                console.log('🚨 Evacuating personnel from dangerous areas');
            }
        };

        // Execute protocol actions
        protocol.actions.forEach(action => {
            if (actions[action]) {
                actions[action]();
            }
        });
    }

    dispatchRealTimeAlerts(weatherData, soilData) {
        const alerts = [];

        // Heat stress alert for livestock
        if (weatherData.temp > 32 && weatherData.humidity > 60) {
            alerts.push({
                type: 'HEAT_STRESS',
                message: 'High heat and humidity - ensure livestock have adequate water and shade',
                severity: 'MODERATE'
            });
        }

        // Wind warning
        if (weatherData.windSpeed > 40) {
            alerts.push({
                type: 'HIGH_WIND',
                message: `Wind speed ${weatherData.windSpeed} km/h - secure loose equipment and structures`,
                severity: 'MODERATE'
            });
        }

        // Soil compaction alert
        if (soilData.moisture > 80) {
            alerts.push({
                type: 'SOIL_COMPACTION',
                message: 'Excessive soil moisture - avoid field operations to prevent compaction',
                severity: 'MODERATE'
            });
        }

        if (alerts.length > 0) {
            document.dispatchEvent(new CustomEvent('realTimeAlert', {
                detail: { alerts, timestamp: new Date().toISOString() }
            }));
        }
    }

    async runFullAssessment() {
        try {
            console.log('🔄 Running comprehensive farm assessment...');
            
            const [weatherData, cropData, soilData, pestData, marketData] = await Promise.all([
                this.agents.weather.getCurrentData(),
                this.agents.crop.getFieldData(),
                this.agents.soil.getSoilData(),
                this.agents.pest.getRiskAssessment(),
                this.agents.market.getMarketData()
            ]);

            // Real-world case-based reasoning
            const recommendations = await this.generateCaseBasedRecommendations(
                weatherData, cropData, soilData, pestData, marketData
            );

            const explainedRecommendations = await this.explainRecommendations(
                recommendations, weatherData, cropData, soilData, pestData, marketData
            );

            this.state.recommendations = explainedRecommendations;
            this.state.lastUpdate = new Date();

            this.dispatchRecommendations(explainedRecommendations);
            console.log(`✅ Assessment complete: ${explainedRecommendations.length} recommendations generated`);
            
        } catch (error) {
            console.error('Assessment failed:', error);
        }
    }

    async generateCaseBasedRecommendations(weather, crop, soil, pest, market) {
        const recommendations = [];
        const fieldData = await this.agents.crop.getFieldData();

        // CASE 1: DROUGHT MANAGEMENT
        if (soil.moisture < 35) {
            recommendations.push({
                id: `rec-${Date.now()}-DRT-001`,
                category: 'irrigation',
                title: 'Drought Response Plan',
                summary: `Critical water deficit detected. Implement drought management strategies.`,
                priority: 'HIGH',
                icon: 'fa-water',
                time: 'Immediate',
                case_reference: 'DRT-2024-001',
                details: {
                    severity: soil.moisture < 20 ? 'CRITICAL' : 'SEVERE',
                    current_moisture: soil.moisture,
                    recommended_actions: [
                        'Apply emergency irrigation 30mm over 2 days',
                        'Reduce crop density through selective pruning',
                        'Apply anti-transpirants to reduce water loss',
                        'Mulch around plants to conserve soil moisture'
                    ],
                    expected_yield_loss: soil.moisture < 20 ? '30-50%' : '15-25%',
                    timeline: 'Immediate to 7 days'
                },
                confidence: 0.92
            });
        }

        // CASE 2: PEST OUTBREAK - REAL-WORLD SCENARIO
        if (pest.risk > 6) {
            const pestProfile = this.pestProfiles[pest.type] || this.pestProfiles['Aphids'];
            recommendations.push({
                id: `rec-${Date.now()}-PST-001`,
                category: 'pest_control',
                title: `${pest.type} Outbreak Response`,
                summary: `${pest.type} detected at ${pest.risk}/10 severity. ${pestProfile.treatment}`,
                priority: pest.risk > 7 ? 'HIGH' : 'MEDIUM',
                icon: 'fa-bug',
                time: 'Within 24 hours',
                case_reference: `PST-${pest.type}-2024`,
                details: {
                    pest: pest.type,
                    scientific_name: pestProfile.scientific_name,
                    severity: pest.risk,
                    treatment: pestProfile.treatment,
                    early_warning_signs: pestProfile.early_warning,
                    optimal_temperature: pestProfile.optimal_temp,
                    affected_crops: pestProfile.impact_crops,
                    recommended_actions: [
                        `Apply ${pestProfile.treatment}`,
                        'Monitor for 7 days post-treatment',
                        'Remove and destroy heavily infested plants',
                        'Practice crop rotation next season'
                    ],
                    economic_impact: pest.risk > 7 ? 'HIGH - 25-40% yield loss' : 'MEDIUM - 10-20% yield loss'
                },
                confidence: 0.85
            });
        }

        // CASE 3: FERTILIZATION OPTIMIZATION
        if (soil.npk && soil.npk.nitrogen < 25) {
            const cropType = fieldData?.cropType || 'Wheat';
            const growthStage = fieldData?.growthStage || 'Vegetative';
            const requirements = this.cropCalendars[cropType]?.[growthStage] || { water_requirement: 30 };
            
            recommendations.push({
                id: `rec-${Date.now()}-FERT-001`,
                category: 'fertilization',
                title: `Precision Nitrogen Management for ${cropType}`,
                summary: `Nitrogen levels at ${soil.npk.nitrogen} ppm. Optimize for ${growthStage} stage.`,
                priority: 'MEDIUM',
                icon: 'fa-flask',
                time: 'Within 3 days',
                case_reference: `FERT-${cropType}-2024`,
                details: {
                    current_nitrogen: soil.npk.nitrogen,
                    optimal_range: '25-40 ppm',
                    recommended_rate: cropType === 'Corn' ? '60 kg/ha' : '40 kg/ha',
                    application_timing: 'Split application: 50% now, 50% in 14 days',
                    expected_response: '15-20% yield increase',
                    phosphorus: soil.npk.phosphorus,
                    potassium: soil.npk.potassium,
                    method: 'Broadcast and incorporate into top 5cm of soil'
                },
                confidence: 0.82
            });
        }

        // CASE 4: HARVEST TIMING OPTIMIZATION
        if (fieldData && fieldData.growthStage === 'Maturity' && fieldData.ripeness > 80) {
            const marketPrice = market?.currentPrice || 4.25;
            const cropType = fieldData.cropType || 'Wheat';
            const priceTrend = this.marketReferences[cropType];
            
            recommendations.push({
                id: `rec-${Date.now()}-HRV-001`,
                category: 'harvest',
                title: `Optimal Harvest Window for ${cropType}`,
                summary: `Crop at ${fieldData.ripeness}% maturity. Market conditions: $${marketPrice}/bushel.`,
                priority: 'HIGH',
                icon: 'fa-tractor',
                time: '5-14 days',
                case_reference: `HRV-${cropType}-2024`,
                details: {
                    ripeness: fieldData.ripeness,
                    market_price: marketPrice,
                    price_trend: priceTrend ? this.determinePriceTrend(priceTrend) : 'STABLE',
                    harvest_window: this.getOptimalHarvestWindow(weather, cropType),
                    recommended_actions: [
                        'Prepare harvesting equipment',
                        'Secure labor for harvest operations',
                        'Arrange storage and transport',
                        `Monitor market prices for optimal selling window`
                    ],
                    expected_yield: this.estimateYield(fieldData, soil),
                    weather_forecast: weather.forecast?.slice(0, 5).map(d => ({
                        day: d.day,
                        condition: d.condition,
                        suitable_for_harvest: d.precipitation < 5 && d.high < 30
                    }))
                },
                confidence: 0.90
            });
        }

        // CASE 5: DISEASE RISK MANAGEMENT
        if (pest.disease_risk && pest.disease_risk > 50) {
            recommendations.push({
                id: `rec-${Date.now()}-DZ-001`,
                category: 'disease_management',
                title: 'Disease Prevention Protocol',
                summary: `Disease risk at ${pest.disease_risk}%. Preventative measures recommended.`,
                priority: 'HIGH',
                icon: 'fa-heartbeat',
                time: 'Immediate',
                case_reference: 'DZ-2024-001',
                details: {
                    disease_risk: pest.disease_risk,
                    risk_level: pest.disease_risk > 75 ? 'EPIDEMIC' : 'HIGH',
                    environmental_factors: {
                        temperature: weather.temp,
                        humidity: weather.humidity,
                        forecast: weather.forecast?.slice(0, 3).map(d => d.condition)
                    },
                    recommended_actions: [
                        'Apply preventative fungicides',
                        'Improve air circulation through pruning',
                        'Remove and destroy infected plant material',
                        'Reduce irrigation to minimize disease spread'
                    ],
                    monitoring_frequency: pest.disease_risk > 75 ? 'Daily' : 'Weekly'
                },
                confidence: 0.78
            });
        }

        // CASE 6: REAL-WORLD PRICE INTELLIGENCE
        if (market && market.currentPrice) {
            const cropType = fieldData?.cropType || 'Wheat';
            const priceForecast = this.calculatePriceForecast(cropType, market);
            
            recommendations.push({
                id: `rec-${Date.now()}-MKT-001`,
                category: 'market_intelligence',
                title: `Market Intelligence Report: ${cropType}`,
                summary: `Current price: $${market.currentPrice}. ${priceForecast.outlook}`,
                priority: 'MEDIUM',
                icon: 'fa-chart-line',
                time: 'Ongoing',
                case_reference: `MKT-${cropType}-2024`,
                details: {
                    current_price: market.currentPrice,
                    price_trend: priceForecast.trend,
                    outlook: priceForecast.outlook,
                    recommended_action: priceForecast.action,
                    breakeven_price: this.calculateBreakeven(cropType),
                    optimal_selling_window: priceForecast.optimal_window,
                    market_factors: [
                        'Global supply and demand',
                        'Weather conditions in major producing regions',
                        'Export/import policies',
                        'Currency exchange rates'
                    ]
                },
                confidence: 0.75
            });
        }

        // CASE 7: WEATHER-BASED CROP ADVISORY
        if (weather && weather.forecast) {
            const weatherAdvisory = this.generateWeatherAdvisory(weather, fieldData);
            recommendations.push({
                id: `rec-${Date.now()}-WTH-001`,
                category: 'weather_advisory',
                title: 'Weather-Based Crop Advisory',
                summary: weatherAdvisory.summary,
                priority: weatherAdvisory.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
                icon: 'fa-cloud-sun',
                time: weatherAdvisory.timing,
                case_reference: `WTH-${new Date().toISOString().slice(0,10)}`,
                details: weatherAdvisory.details,
                confidence: weatherAdvisory.confidence
            });
        }

        // CASE 8: SUSTAINABLE PRACTICES RECOMMENDATION
        if (soil && soil.organic_matter < 2.5) {
            recommendations.push({
                id: `rec-${Date.now()}-SUS-001`,
                category: 'sustainability',
                title: 'Soil Health Improvement Plan',
                summary: 'Low organic matter detected. Implement sustainable soil management.',
                priority: 'MEDIUM',
                icon: 'fa-seedling',
                time: 'This season',
                case_reference: 'SUS-2024-001',
                details: {
                    current_organic_matter: soil.organic_matter,
                    target_organic_matter: '3-4%',
                    recommended_actions: [
                        'Apply compost or manure at 10-15 tons/ha',
                        'Plant cover crops during off-season',
                        'Practice crop rotation with legumes',
                        'Reduce tillage to preserve soil structure'
                    ],
                    timeline: '3-5 years for significant improvement',
                    expected_benefits: [
                        'Improved water retention',
                        'Better nutrient cycling',
                        'Reduced fertilizer requirements',
                        'Enhanced carbon sequestration'
                    ]
                },
                confidence: 0.88
            });
        }

        return recommendations;
    }

    determinePriceTrend(priceData) {
        if (!priceData || !priceData.seasonality) return 'STABLE';
        const currentMonth = new Date().getMonth();
        const currentPrice = priceData.seasonality[currentMonth] || priceData.base_price;
        const nextPrice = priceData.seasonality[(currentMonth + 1) % 12] || currentPrice;
        
        if (nextPrice > currentPrice * 1.05) return 'BULLISH';
        if (nextPrice < currentPrice * 0.95) return 'BEARISH';
        return 'STABLE';
    }

    getOptimalHarvestWindow(weather, cropType) {
        // Real-world harvest timing based on weather forecast
        if (!weather || !weather.forecast) return '7-14 days';
        
        const favorableDays = weather.forecast.filter(day => 
            day.precipitation < 5 && day.high < 32 && day.high > 15
        );
        
        if (favorableDays.length >= 5) {
            return 'Start harvesting within 3 days';
        } else if (favorableDays.length >= 3) {
            return 'Plan harvesting in 5-7 days';
        } else {
            return 'Monitor weather - harvest when conditions improve';
        }
    }

    estimateYield(fieldData, soil) {
        // Real-world yield estimation based on multiple factors
        const baseYield = {
            'Wheat': 45,
            'Corn': 175,
            'Soybean': 45,
            'Tomato': 20,
            'Potato': 20
        }[fieldData?.cropType] || 40;

        const moistureFactor = soil.moisture > 60 ? 1.1 : 0.8;
        const healthFactor = fieldData?.health > 70 ? 1.0 : 0.7;
        const maturityFactor = fieldData?.ripeness > 80 ? 1.0 : 0.9;

        return Math.round(baseYield * moistureFactor * healthFactor * maturityFactor);
    }

    calculatePriceForecast(cropType, marketData) {
        const seasonality = this.marketReferences[cropType]?.seasonality || [];
        const currentMonth = new Date().getMonth();
        const currentPrice = marketData.currentPrice || 4.25;
        
        if (seasonality.length > 0) {
            const nextMonth = (currentMonth + 1) % 12;
            const predictedPrice = seasonality[nextMonth] * (currentPrice / (seasonality[currentMonth] || currentPrice));
            
            if (predictedPrice > currentPrice * 1.05) {
                return {
                    trend: 'UPWARD',
                    outlook: 'Prices expected to increase - consider holding',
                    action: 'Hold for 2-4 weeks for better prices',
                    optimal_window: '3-4 weeks',
                    predicted_price: Math.round(predictedPrice * 100) / 100
                };
            } else if (predictedPrice < currentPrice * 0.95) {
                return {
                    trend: 'DOWNWARD',
                    outlook: 'Prices expected to decrease - sell soon',
                    action: 'Sell within 1-2 weeks',
                    optimal_window: 'Immediate to 2 weeks',
                    predicted_price: Math.round(predictedPrice * 100) / 100
                };
            }
        }

        return {
            trend: 'STABLE',
            outlook: 'Prices stable - monitor market conditions',
            action: 'Sell when price meets your target',
            optimal_window: 'Flexible',
            predicted_price: currentPrice
        };
    }

    calculateBreakeven(cropType) {
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

        const costPerAcre = costs[cropType] || 180;
        const yieldPerAcre = yields[cropType] || 40;
        
        return Math.round((costPerAcre / yieldPerAcre) * 100) / 100;
    }

    generateWeatherAdvisory(weather, fieldData) {
        const advisory = {
            summary: '',
            severity: 'MEDIUM',
            timing: 'Immediate',
            details: {},
            confidence: 0.80
        };

        // Real-world weather advisory logic
        const forecast = weather.forecast || [];
        const hasRain = forecast.some(day => day.precipitation > 5);
        const hasHeat = forecast.some(day => day.high > 32);
        const hasFrost = forecast.some(day => day.low < 2);

        if (hasRain) {
            advisory.summary = 'Rain forecast in coming days. Plan operations accordingly.';
            advisory.details = {
                rain_days: forecast.filter(day => day.precipitation > 5).map(d => d.day),
                total_rainfall: forecast.reduce((sum, d) => sum + (d.precipitation || 0), 0),
                recommended_actions: [
                    'Delay spraying operations until after rain',
                    'Plan irrigation schedule to complement rainfall',
                    'Check drainage systems',
                    'Harvest before rain if crop is ready'
                ]
            };
        }

        if (hasHeat) {
            advisory.summary += (advisory.summary ? ' ' : '') + 'Heat stress risk. Provide extra water and protect crops.';
            advisory.severity = 'HIGH';
            advisory.details = {
                ...advisory.details,
                heat_days: forecast.filter(day => day.high > 32).map(d => d.day),
                recommended_actions: [
                    'Increase irrigation during hot periods',
                    'Apply shade cloth for sensitive crops',
                    'Monitor for heat stress symptoms',
                    'Avoid applying fertilizers during extreme heat'
                ]
            };
        }

        if (hasFrost) {
            advisory.summary += (advisory.summary ? ' ' : '') + 'Frost risk detected. Implement frost protection measures.';
            advisory.severity = 'HIGH';
            advisory.details = {
                ...advisory.details,
                frost_days: forecast.filter(day => day.low < 2).map(d => d.day),
                recommended_actions: [
                    'Cover sensitive crops with frost cloth',
                    'Run irrigation during frost events',
                    'Harvest susceptible crops before frost',
                    'Use wind machines or heaters if available'
                ]
            };
        }

        if (!advisory.summary) {
            advisory.summary = 'Favorable weather conditions for farm operations';
            advisory.details = {
                recommended_actions: [
                    'Continue regular farm operations',
                    'Take advantage of favorable conditions for planting/harvesting',
                    'Monitor weather for any changes'
                ]
            };
        }

        return advisory;
    }

    async explainRecommendations(recommendations, weather, crop, soil, pest, market) {
        const explained = [];
        for (const rec of recommendations) {
            const explanation = await this.agents.explanation.generateExplanation(
                rec, { weather, crop, soil, pest, market }
            );
            explained.push({ ...rec, explanation });
        }
        return explained;
    }

    dispatchRecommendations(recommendations) {
        document.dispatchEvent(new CustomEvent('recommendationGenerated', {
            detail: { recommendations, timestamp: new Date().toISOString() }
        }));
    }

    async updateMarketIntelligence() {
        try {
            const marketData = await this.agents.market.getMarketData();
            // Update price forecasts
            this.state.marketIntelligence = marketData;
            console.log('📊 Market intelligence updated:', new Date().toISOString());
        } catch (error) {
            console.error('Market update failed:', error);
        }
    }

    // Public API methods
    async getFieldData() {
        return await this.agents.crop.getFieldData();
    }

    async getWeatherData() {
        const data = await this.agents.weather.getCurrentData();
        // Normalise: always expose both .temperature and .temp so any consumer works
        if (data && data.temperature === undefined && data.temp !== undefined) {
            data.temperature = data.temp;
        }
        if (data && data.temp === undefined && data.temperature !== undefined) {
            data.temp = data.temperature;
        }
        // Also attach forecast so dashboard widget can render it
        if (data && !data.forecast) {
            data.forecast = await this.agents.weather.getForecast(7).catch(() => []);
        }
        return data;
    }

    async getSoilData() {
        return await this.agents.soil.getSoilData();
    }

    async getPestData() {
        return await this.agents.pest.getRiskAssessment();
    }

    async getRecommendations() {
        // If no recommendations yet, trigger an assessment first
        if (!this.state.recommendations || this.state.recommendations.length === 0) {
            await this.runFullAssessment().catch(() => {});
        }
        return this.state.recommendations || [];
    }

    async getMarketData() {
        const data = await this.agents.market.getMarketData();
        // Flatten: expose currentPrice at top level for dashboard widget
        if (data && !data.currentPrice && data.current_prices) {
            const wheat = data.current_prices['Wheat'];
            if (wheat) {
                data.currentPrice = wheat.price;
                data.historical = (await this.agents.market.getPriceHistory('Wheat', 30)).map
                    ? await this.agents.market.getPriceHistory('Wheat', 30)
                    : [];
            }
        }
        return data;
    }

    async getEmergencyStatus() {
        return {
            active_incidents: this.state.activeIncidents,
            emergency_protocols: this.state.emergencyProtocols,
            task_queue: this.state.taskQueue,
            timestamp: new Date().toISOString()
        };
    }

    async submitFeedback(recommendationId, feedback) {
        console.log('Feedback submitted:', recommendationId, feedback);
        return { success: true, message: 'Thank you for your feedback!' };
    }
}

// Export for browser use
window.OrchestratorAgent = OrchestratorAgent;