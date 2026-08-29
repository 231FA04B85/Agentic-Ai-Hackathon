/**
 * Crop Agent - Real-world Crop Profile Management
 * Handles crop growth monitoring, phenology, and management
 */

class CropAgent {
    constructor() {
        this.fields = [];
        this.cropModels = {};
        this.initialize();
    }

    initialize() {
        console.log('🌱 Crop Agent initialized with real-world crop models');
        this.initializeCropModels();
        this.loadSampleFields();
        this.startPhenologyMonitoring();
    }

    initializeCropModels() {
        // Real-world crop growth models
        this.cropModels = {
            'Wheat': {
                name: 'Winter Wheat',
                scientific_name: 'Triticum aestivum',
                growing_degree_days: {
                    'Emergence': 100,
                    'Tillering': 400,
                    'Stem_Elongation': 700,
                    'Heading': 1000,
                    'Flowering': 1300,
                    'Maturity': 1800
                },
                critical_parameters: {
                    'base_temperature': 0,
                    'optimal_temperature': 20,
                    'maximum_temperature': 35,
                    'frost_tolerance': -5,
                    'water_requirements': 450,
                    'ph_optimum': 6.0,
                    'day_length_sensitivity': 'Long day'
                },
                nutrient_requirements: {
                    'nitrogen': 120,
                    'phosphorus': 60,
                    'potassium': 80
                },
                pest_susceptibility: ['Aphids', 'Rust', 'Septoria', 'Fusarium'],
                herbicide_tolerance: ['Glyphosate', '2,4-D', 'Dicamba']
            },
            'Corn': {
                name: 'Field Corn',
                scientific_name: 'Zea mays',
                growing_degree_days: {
                    'Emergence': 100,
                    'V6': 400,
                    'V12': 700,
                    'VT': 1000,
                    'R1': 1300,
                    'R6': 2000
                },
                critical_parameters: {
                    'base_temperature': 10,
                    'optimal_temperature': 25,
                    'maximum_temperature': 38,
                    'frost_tolerance': -2,
                    'water_requirements': 600,
                    'ph_optimum': 6.5,
                    'day_length_sensitivity': 'Neutral'
                },
                nutrient_requirements: {
                    'nitrogen': 180,
                    'phosphorus': 80,
                    'potassium': 120
                },
                pest_susceptibility: ['Fall Armyworm', 'Corn Borer', 'Corn Earworm', 'Rootworm'],
                herbicide_tolerance: ['Atrazine', 'Glyphosate', 'Glufosinate']
            },
            'Tomato': {
                name: 'Processing Tomato',
                scientific_name: 'Solanum lycopersicum',
                growing_degree_days: {
                    'Germination': 150,
                    'Seedling': 400,
                    'Vegetative': 700,
                    'Flowering': 1000,
                    'Fruit_Set': 1300,
                    'Maturity': 1800
                },
                critical_parameters: {
                    'base_temperature': 10,
                    'optimal_temperature': 22,
                    'maximum_temperature': 35,
                    'frost_tolerance': 0,
                    'water_requirements': 500,
                    'ph_optimum': 6.8,
                    'day_length_sensitivity': 'Neutral'
                },
                nutrient_requirements: {
                    'nitrogen': 150,
                    'phosphorus': 60,
                    'potassium': 200
                },
                pest_susceptibility: ['Late Blight', 'Whitefly', 'Tomato Hornworm', 'Aphids'],
                herbicide_tolerance: ['Metribuzin', 'S-metolachlor']
            },
            'Soybean': {
                name: 'Soybean',
                scientific_name: 'Glycine max',
                growing_degree_days: {
                    'Emergence': 150,
                    'V3': 400,
                    'R1': 700,
                    'R3': 1000,
                    'R5': 1300,
                    'R7': 1600
                },
                critical_parameters: {
                    'base_temperature': 10,
                    'optimal_temperature': 22,
                    'maximum_temperature': 35,
                    'frost_tolerance': -2,
                    'water_requirements': 550,
                    'ph_optimum': 6.5,
                    'day_length_sensitivity': 'Short day'
                },
                nutrient_requirements: {
                    'nitrogen': 60,
                    'phosphorus': 50,
                    'potassium': 100
                },
                pest_susceptibility: ['Soybean Aphid', 'Soybean Cyst Nematode', 'Japanese Beetle', 'Stink Bug'],
                herbicide_tolerance: ['Glyphosate', 'Glufosinate', 'Dicamba']
            }
        };
    }

    loadSampleFields() {
        this.fields = [
            {
                id: 1,
                name: 'North Field',
                cropType: 'Wheat',
                variety: 'Pioneer 34R07',
                scientific_name: 'Triticum aestivum',
                plantingDate: '2026-03-15',
                estimated_harvest: '2026-08-20',
                growthStage: 'Flowering',
                health: 85,
                ripeness: 45,
                area: 45,
                soilType: 'Loam',
                irrigationType: 'Sprinkler',
                planting_density: 120, // kg/ha
                soil_ph: 6.5,
                organic_matter: 3.2,
                irrigation_history: [],
                weather_station_id: 'WS-001',
                historical_yield: {
                    2024: 42,
                    2025: 48,
                    average: 45
                },
                phenology_tracking: {
                    'Emergence': '2026-03-25',
                    'Tillering': '2026-04-20',
                    'Stem_Elongation': '2026-05-15',
                    'Heading': '2026-06-10',
                    'Flowering': '2026-06-25'
                }
            },
            {
                id: 2,
                name: 'South Field',
                cropType: 'Corn',
                variety: 'Dekalb 64-69',
                scientific_name: 'Zea mays',
                plantingDate: '2026-03-20',
                estimated_harvest: '2026-09-05',
                growthStage: 'Vegetative',
                health: 72,
                ripeness: 20,
                area: 32,
                soilType: 'Sandy',
                irrigationType: 'Drip',
                planting_density: 75000, // plants/ha
                soil_ph: 6.2,
                organic_matter: 2.1,
                irrigation_history: [],
                weather_station_id: 'WS-002',
                historical_yield: {
                    2024: 165,
                    2025: 180,
                    average: 172
                },
                phenology_tracking: {
                    'Emergence': '2026-04-01',
                    'V3': '2026-04-25',
                    'V6': '2026-05-15'
                }
            },
            {
                id: 3,
                name: 'East Field',
                cropType: 'Tomato',
                variety: 'Rutgers',
                scientific_name: 'Solanum lycopersicum',
                plantingDate: '2026-04-01',
                estimated_harvest: '2026-08-15',
                growthStage: 'Fruiting',
                health: 68,
                ripeness: 60,
                area: 18,
                soilType: 'Clay',
                irrigationType: 'Drip',
                planting_density: 25000, // plants/ha
                soil_ph: 6.8,
                organic_matter: 4.5,
                irrigation_history: [],
                weather_station_id: 'WS-003',
                historical_yield: {
                    2024: 18,
                    2025: 22,
                    average: 20
                },
                phenology_tracking: {
                    'Germination': '2026-04-10',
                    'Seedling': '2026-04-25',
                    'Vegetative': '2026-05-20',
                    'Flowering': '2026-06-15',
                    'Fruit_Set': '2026-06-30'
                }
            }
        ];

        // Start tracking phenology
        this.startPhenologyTracking();
    }

    startPhenologyMonitoring() {
        // Monitor crop development daily
        setInterval(() => {
            this.updatePhenology();
        }, 86400000); // 24 hours
    }

    updatePhenology() {
        this.fields.forEach(field => {
            const daysAfterPlanting = this.calculateDaysAfterPlanting(field.plantingDate);
            const stage = this.determineGrowthStage(field.cropType, daysAfterPlanting);
            
            if (stage !== field.growthStage) {
                field.growthStage = stage;
                field.phenology_tracking[stage] = new Date().toISOString().split('T')[0];
                
                // Notify about stage change
                document.dispatchEvent(new CustomEvent('phenologyUpdate', {
                    detail: {
                        field_id: field.id,
                        cropType: field.cropType,
                        old_stage: field.growthStage,
                        new_stage: stage,
                        days_after_planting: daysAfterPlanting,
                        timestamp: new Date().toISOString()
                    }
                }));
            }

            // Update health based on current stage and conditions
            field.health = this.calculateHealth(field);
            field.ripeness = this.calculateRipeness(field);
        });
    }

    calculateDaysAfterPlanting(plantingDate) {
        const planting = new Date(plantingDate);
        const now = new Date();
        return Math.floor((now - planting) / (1000 * 60 * 60 * 24));
    }

    determineGrowthStage(cropType, days) {
        const model = this.cropModels[cropType];
        if (!model) return 'Vegetative';

        const stages = Object.keys(model.growing_degree_days);
        let currentStage = stages[0];
        let daysAccumulated = 0;

        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageDays = model.growing_degree_days[stage] / 10; // Simplified
            daysAccumulated += stageDays;
            
            if (days < daysAccumulated) {
                return stage;
            }
            currentStage = stage;
        }
        return currentStage;
    }

    calculateHealth(field) {
        // Real-world health calculation based on multiple factors
        let healthScore = 100;
        const model = this.cropModels[field.cropType];
        
        if (!model) return 70;

        // 1. Growth stage penalty
        const daysAfterPlanting = this.calculateDaysAfterPlanting(field.plantingDate);
        const maturityDays = model.growing_degree_days['Maturity'] / 10;
        if (daysAfterPlanting > maturityDays) {
            healthScore -= 10;
        }

        // 2. Soil health
        if (field.soil_ph < 5.5 || field.soil_ph > 7.5) {
            healthScore -= 10;
        }

        // 3. Moisture stress (simulated)
        const moistureVariation = Math.random() * 20 - 10;
        healthScore += moistureVariation;

        // 4. Disease pressure (simulated)
        const diseasePressure = Math.random() * 15;
        healthScore -= diseasePressure;

        // 5. Pest pressure (simulated)
        const pestPressure = Math.random() * 10;
        healthScore -= pestPressure;

        // Clamp between 0 and 100
        return Math.max(0, Math.min(100, Math.round(healthScore)));
    }

    calculateRipeness(field) {
        const daysAfterPlanting = this.calculateDaysAfterPlanting(field.plantingDate);
        const model = this.cropModels[field.cropType];
        
        if (!model) return 0;

        const maturityDays = model.growing_degree_days['Maturity'] / 10;
        const ripeness = Math.min(100, (daysAfterPlanting / maturityDays) * 100);
        
        return Math.round(ripeness);
    }

    startPhenologyTracking() {
        this.fields.forEach(field => {
            this.trackFieldPhenology(field);
        });
    }

    trackFieldPhenology(field) {
        // Real-world phenology tracking
        const model = this.cropModels[field.cropType];
        if (!model) return;

        // Simulate weather data for GDD calculation
        const gdd = this.calculateGrowingDegreeDays(field);
        const stage = this.getStageFromGDD(gdd, model);

        if (stage && stage !== field.growthStage) {
            field.growthStage = stage;
            console.log(`🌱 Field ${field.name} advanced to ${stage} stage`);
        }
    }

    calculateGrowingDegreeDays(field) {
        // Simplified GDD calculation using simulated temperatures
        const daysAfterPlanting = this.calculateDaysAfterPlanting(field.plantingDate);
        const baseTemp = this.cropModels[field.cropType]?.critical_parameters?.base_temperature || 10;
        
        let totalGDD = 0;
        for (let i = 0; i < daysAfterPlanting; i++) {
            // Simulate daily temperature (sinusoidal pattern)
            const temp = 15 + 10 * Math.sin((i / 365) * 2 * Math.PI);
            const dailyGDD = Math.max(0, temp - baseTemp);
            totalGDD += dailyGDD;
        }
        return totalGDD;
    }

    getStageFromGDD(gdd, model) {
        const stages = Object.entries(model.growing_degree_days);
        let currentStage = stages[0][0];

        for (const [stage, requiredGDD] of stages) {
            if (gdd >= requiredGDD) {
                currentStage = stage;
            } else {
                break;
            }
        }
        return currentStage;
    }

    async getFieldData() {
        // Return data with latest updates
        this.fields.forEach(field => {
            // Update health with current conditions
            field.health = this.calculateHealth(field);
            field.ripeness = this.calculateRipeness(field);
            
            // Add real-time weather impact
            const weatherImpact = this.calculateWeatherImpact(field);
            field.health += weatherImpact;
            field.health = Math.max(0, Math.min(100, field.health));
        });

        return this.fields;
    }

    calculateWeatherImpact(field) {
        // Simulate weather impact on crop health
        const impacts = [
            { condition: 'heat_stress', penalty: -5 },
            { condition: 'drought', penalty: -8 },
            { condition: 'ideal', bonus: 2 },
            { condition: 'mild_stress', penalty: -2 }
        ];
        
        const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
        return randomImpact.penalty || randomImpact.bonus || 0;
    }

    async getFieldById(id) {
        return this.fields.find(f => f.id === id);
    }

    async addField(fieldData) {
        const newField = {
            id: this.fields.length + 1,
            ...fieldData,
            health: 80,
            ripeness: 0,
            growthStage: 'Seedling',
            phenology_tracking: {},
            historical_yield: {
                average: 0
            },
            plantingDate: fieldData.plantingDate || new Date().toISOString().split('T')[0]
        };
        this.fields.push(newField);
        return newField;
    }

    async updateField(id, updates) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            Object.assign(field, updates);
            return field;
        }
        return null;
    }

    async deleteField(id) {
        const index = this.fields.findIndex(f => f.id === id);
        if (index > -1) {
            this.fields.splice(index, 1);
            return true;
        }
        return false;
    }

    async getCropRecommendations(fieldId) {
        const field = await this.getFieldById(fieldId);
        if (!field) return null;

        const model = this.cropModels[field.cropType];
        if (!model) return null;

        const daysAfterPlanting = this.calculateDaysAfterPlanting(field.plantingDate);
        const currentStage = field.growthStage;

        return {
            field: field.name,
            crop_type: field.cropType,
            current_stage: currentStage,
            days_after_planting: daysAfterPlanting,
            gdd_accumulated: this.calculateGrowingDegreeDays(field),
            nutrient_recommendations: this.generateNutrientRecommendations(field, model),
            irrigation_recommendations: this.generateIrrigationRecommendations(field, model),
            pest_risks: this.assessPestRisks(field, model),
            harvest_timing: this.estimateHarvestTiming(field, model),
            expected_yield: this.estimateYield(field)
        };
    }

    generateNutrientRecommendations(field, model) {
        const recommendations = [];
        const nutrients = model.nutrient_requirements;
        
        for (const [nutrient, requirement] of Object.entries(nutrients)) {
            const currentLevel = field[`${nutrient}_level`] || requirement * 0.7;
            const deficit = requirement - currentLevel;
            
            if (deficit > 10) {
                recommendations.push({
                    nutrient: nutrient.charAt(0).toUpperCase() + nutrient.slice(1),
                    requirement: requirement,
                    current_level: Math.round(currentLevel),
                    deficit: Math.round(deficit),
                    recommendation: `Apply ${Math.round(deficit * 0.8)} kg/ha of ${nutrient} fertilizer`,
                    timing: this.getFertilizerTiming(field.growthStage)
                });
            }
        }
        
        return recommendations;
    }

    getFertilizerTiming(stage) {
        const timingMap = {
            'Seedling': 'At planting or during seeding',
            'Tillering': 'Post-emergence, 2-3 weeks after emergence',
            'Vegetative': 'At rapid growth phase',
            'Stem_Elongation': 'Before jointing',
            'Heading': 'At stem elongation',
            'Flowering': 'At early flowering',
            'Fruiting': 'At fruit set',
            'Maturity': 'Not recommended at this stage'
        };
        return timingMap[stage] || 'Apply based on crop stage and soil conditions';
    }

    generateIrrigationRecommendations(field, model) {
        const waterReq = model.critical_parameters.water_requirements || 500;
        const stage = field.growthStage;
        
        // Stage-specific coefficients
        const stageCoefficients = {
            'Seedling': 0.3,
            'Tillering': 0.5,
            'Vegetative': 0.7,
            'Stem_Elongation': 0.8,
            'Heading': 0.9,
            'Flowering': 1.0,
            'Fruiting': 1.1,
            'Maturity': 0.4
        };

        const coefficient = stageCoefficients[stage] || 0.7;
        const dailyRequirement = (waterReq / 120) * coefficient; // Approximate mm/day

        return {
            daily_water_requirement: Math.round(dailyRequirement * 10) / 10,
            weekly_requirement: Math.round(dailyRequirement * 7),
            stage_specific_needs: `Currently in ${stage} stage, requires ${Math.round(coefficient * 100)}% of total water requirement`,
            irrigation_frequency: dailyRequirement > 5 ? 'Daily' : 'Every 2-3 days',
            recommendation: dailyRequirement > 5 ? 'Increase irrigation to meet peak demand' : 'Maintain normal irrigation schedule'
        };
    }

    assessPestRisks(field, model) {
        const susceptiblePests = model.pest_susceptibility || [];
        const risks = [];
        
        susceptiblePests.forEach(pest => {
            const riskLevel = Math.round(20 + Math.random() * 60);
            risks.push({
                pest: pest,
                risk_level: riskLevel,
                risk_category: riskLevel > 70 ? 'HIGH' : riskLevel > 40 ? 'MEDIUM' : 'LOW',
                monitoring_frequency: riskLevel > 70 ? 'Daily' : riskLevel > 40 ? 'Weekly' : 'Bi-weekly'
            });
        });

        return risks;
    }

    estimateHarvestTiming(field, model) {
        const plantingDate = new Date(field.plantingDate);
        const maturityGDD = model.growing_degree_days['Maturity'] || 1800;
        const currentGDD = this.calculateGrowingDegreeDays(field);
        
        const remainingGDD = Math.max(0, maturityGDD - currentGDD);
        const daysRemaining = Math.round(remainingGDD / 15); // Approximate 15 GDD/day
        
        const estimatedDate = new Date(plantingDate);
        estimatedDate.setDate(estimatedDate.getDate() + 120 + daysRemaining);

        return {
            days_remaining: Math.max(0, daysRemaining),
            estimated_harvest_date: estimatedDate.toISOString().split('T')[0],
            harvest_window: daysRemaining > 30 ? 'Not ready - continue monitoring' : 'Begin preparing for harvest',
            maturity: Math.min(100, (currentGDD / maturityGDD) * 100)
        };
    }

    estimateYield(field) {
        const baseYield = {
            'Wheat': 45,
            'Corn': 175,
            'Soybean': 45,
            'Tomato': 20,
            'Potato': 20
        }[field.cropType] || 40;

        const healthFactor = field.health / 100;
        const ripenessFactor = field.ripeness / 100;
        const stageFactor = this.getStageYieldFactor(field.growthStage);
        
        return Math.round(baseYield * healthFactor * ripenessFactor * stageFactor);
    }

    getStageYieldFactor(stage) {
        const factors = {
            'Seedling': 0.1,
            'Tillering': 0.2,
            'Vegetative': 0.3,
            'Stem_Elongation': 0.5,
            'Heading': 0.7,
            'Flowering': 0.8,
            'Fruiting': 0.9,
            'Maturity': 1.0
        };
        return factors[stage] || 0.5;
    }
}

window.CropAgent = CropAgent;

// Auto-instantiate so pages can use window.cropAgent directly
if (typeof window !== 'undefined' && !window.cropAgent) {
    window.cropAgent = new CropAgent();
}
