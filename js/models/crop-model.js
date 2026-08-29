/**
 * Crop Model - Real-world Crop Data Structure
 * Comprehensive crop information including growth stages, requirements, and management
 */

class CropModel {
    constructor(data = {}) {
        // Basic Information
        this.id = data.id || this.generateId();
        this.field_id = data.field_id || '';
        this.crop_type = data.crop_type || '';
        this.variety = data.variety || '';
        this.scientific_name = data.scientific_name || '';
        
        // Planting Information
        this.planting = {
            date: data.planting?.date || null,
            method: data.planting?.method || 'Direct Seeding',
            seed_rate: data.planting?.seed_rate || 0, // kg/ha or seeds/ha
            row_spacing: data.planting?.row_spacing || 0, // cm
            plant_spacing: data.planting?.plant_spacing || 0, // cm
            planting_depth: data.planting?.planting_depth || 0, // cm
            fertilization_at_planting: data.planting?.fertilization_at_planting || null
        };
        
        // Growth & Development
        this.growth = {
            current_stage: data.growth?.current_stage || 'Seedling',
            days_after_planting: data.growth?.days_after_planting || 0,
            growing_degree_days: data.growth?.growing_degree_days || 0,
            accumulated_gdd: data.growth?.accumulated_gdd || 0,
            estimated_maturity: data.growth?.estimated_maturity || null,
            phenology: data.growth?.phenology || {},
            growth_rate: data.growth?.growth_rate || 0, // cm/day
            plant_height: data.growth?.plant_height || 0, // cm
            canopy_cover: data.growth?.canopy_cover || 0 // percentage
        };
        
        // Crop Health
        this.health = {
            overall_score: data.health?.overall_score || 85,
            canopy_temperature: data.health?.canopy_temperature || 22, // Celsius
            chlorophyll_content: data.health?.chlorophyll_content || 45, // SPAD units
            ndvi: data.health?.ndvi || 0.65,
            vegetation_index: data.health?.vegetation_index || 0.55,
            stress_factors: data.health?.stress_factors || [],
            disease_incidence: data.health?.disease_incidence || 5, // percentage
            pest_incidence: data.health?.pest_incidence || 3 // percentage
        };
        
        // Yield Data
        this.yield = {
            estimated_yield: data.yield?.estimated_yield || 0, // kg/ha
            actual_yield: data.yield?.actual_yield || 0,
            yield_potential: data.yield?.yield_potential || 0,
            yield_gap: data.yield?.yield_gap || 0,
            quality_parameters: data.yield?.quality_parameters || {},
            harvest_date: data.yield?.harvest_date || null,
            harvest_conditions: data.yield?.harvest_conditions || 'Fair'
        };
        
        // Inputs & Applications
        this.inputs = {
            irrigation: data.inputs?.irrigation || {
                total_applied: 0, // mm
                applications: [],
                efficiency: 70 // percentage
            },
            fertilization: data.inputs?.fertilization || {
                total_nitrogen: 0, // kg/ha
                total_phosphorus: 0,
                total_potassium: 0,
                applications: []
            },
            pesticides: data.inputs?.pesticides || {
                applications: [],
                total_applications: 0
            },
            growth_regulators: data.inputs?.growth_regulators || {
                applications: [],
                total_applications: 0
            }
        };
        
        // Environmental Conditions
        this.environment = {
            average_temperature: data.environment?.average_temperature || 20, // Celsius
            total_rainfall: data.environment?.total_rainfall || 0, // mm
            sunshine_hours: data.environment?.sunshine_hours || 0,
            frost_days: data.environment?.frost_days || 0,
            heat_stress_days: data.environment?.heat_stress_days || 0,
            water_stress_days: data.environment?.water_stress_days || 0
        };
        
        // Economic Data
        this.economics = {
            production_cost: data.economics?.production_cost || 0, // $/ha
            market_price: data.economics?.market_price || 0, // $/unit
            projected_revenue: data.economics?.projected_revenue || 0,
            profitability: data.economics?.profitability || 'Unknown',
            breakeven_yield: data.economics?.breakeven_yield || 0
        };
        
        // Dates & Tracking
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.last_scouted = data.last_scouted || null;
        this.next_scouting = data.next_scouting || null;
        
        // Status
        this.status = data.status || 'Active';
        this.season = data.season || new Date().getFullYear().toString();
    }

    generateId() {
        return `CROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Growth Stage Methods
    getGrowthStageDescription() {
        const descriptions = {
            'Germination': 'Seed has germinated and radicle emerged',
            'Seedling': 'True leaves developing, root system establishing',
            'Tillering': 'Stem branching and vegetative growth',
            'Stem Elongation': 'Stem elongating, canopy development',
            'Booting': 'Head/ear formation in leaf sheath',
            'Heading': 'Head/ear emergence from leaf sheath',
            'Flowering': 'Plants flowering, fertilization occurring',
            'Grain Fill': 'Grain development and filling',
            'Maturity': 'Crop approaching physiological maturity',
            'Ripening': 'Crop drying and ready for harvest'
        };
        return descriptions[this.growth.current_stage] || 'Unknown growth stage';
    }

    updateGrowthStage(daysAfterPlanting) {
        const stages = this.getGrowthStagesForCrop();
        let currentStage = 'Seedling';
        
        for (const [stage, stageDays] of Object.entries(stages)) {
            if (daysAfterPlanting >= stageDays) {
                currentStage = stage;
            } else {
                break;
            }
        }
        
        if (this.growth.current_stage !== currentStage) {
            this.growth.current_stage = currentStage;
            this.growth.phenology[currentStage] = new Date().toISOString();
            this.updateTimestamps();
        }
    }

    getGrowthStagesForCrop() {
        const stageMap = {
            'Wheat': {
                'Germination': 10,
                'Seedling': 25,
                'Tillering': 45,
                'Stem Elongation': 70,
                'Booting': 90,
                'Heading': 105,
                'Flowering': 115,
                'Grain Fill': 140,
                'Maturity': 160,
                'Ripening': 175
            },
            'Corn': {
                'Germination': 8,
                'Seedling': 20,
                'Tillering': 35,
                'Stem Elongation': 55,
                'Booting': 75,
                'Heading': 90,
                'Flowering': 100,
                'Grain Fill': 130,
                'Maturity': 155,
                'Ripening': 170
            },
            'Tomato': {
                'Germination': 12,
                'Seedling': 30,
                'Stem Elongation': 50,
                'Flowering': 70,
                'Fruit Set': 90,
                'Fruit Development': 120,
                'Maturity': 145,
                'Ripening': 160
            },
            'Soybean': {
                'Germination': 10,
                'Seedling': 20,
                'Stem Elongation': 40,
                'Flowering': 60,
                'Pod Set': 80,
                'Seed Fill': 110,
                'Maturity': 135,
                'Ripening': 150
            }
        };
        return stageMap[this.crop_type] || stageMap['Wheat'];
    }

    // Water Requirements
    getWaterRequirements() {
        const stageCoefficients = {
            'Germination': 0.3,
            'Seedling': 0.5,
            'Tillering': 0.7,
            'Stem Elongation': 0.8,
            'Booting': 0.9,
            'Heading': 1.0,
            'Flowering': 1.0,
            'Grain Fill': 0.9,
            'Maturity': 0.6,
            'Ripening': 0.3
        };

        const cropCoefficients = {
            'Wheat': 0.85,
            'Corn': 1.0,
            'Tomato': 1.1,
            'Soybean': 0.9,
            'Potato': 0.95
        };

        const baseWater = 5; // mm/day
        const stageCoeff = stageCoefficients[this.growth.current_stage] || 0.7;
        const cropCoeff = cropCoefficients[this.crop_type] || 1.0;
        
        const dailyRequirement = baseWater * stageCoeff * cropCoeff;
        
        return {
            daily_requirement: Math.round(dailyRequirement * 10) / 10,
            weekly_requirement: Math.round(dailyRequirement * 7 * 10) / 10,
            monthly_requirement: Math.round(dailyRequirement * 30 * 10) / 10,
            stage: this.growth.current_stage,
            coefficient: stageCoeff,
            total_to_date: this.inputs.irrigation.total_applied
        };
    }

    // Nutrient Requirements
    getNutrientRequirements() {
        const baseRequirements = {
            'Wheat': { nitrogen: 120, phosphorus: 60, potassium: 80 },
            'Corn': { nitrogen: 180, phosphorus: 80, potassium: 120 },
            'Tomato': { nitrogen: 150, phosphorus: 60, potassium: 200 },
            'Soybean': { nitrogen: 60, phosphorus: 50, potassium: 100 },
            'Potato': { nitrogen: 140, phosphorus: 70, potassium: 180 }
        };

        const stageFactors = {
            'Germination': { nitrogen: 0.1, phosphorus: 0.2, potassium: 0.1 },
            'Seedling': { nitrogen: 0.3, phosphorus: 0.3, potassium: 0.2 },
            'Tillering': { nitrogen: 0.5, phosphorus: 0.5, potassium: 0.5 },
            'Stem Elongation': { nitrogen: 0.7, phosphorus: 0.6, potassium: 0.6 },
            'Booting': { nitrogen: 0.8, phosphorus: 0.7, potassium: 0.7 },
            'Heading': { nitrogen: 0.9, phosphorus: 0.8, potassium: 0.8 },
            'Flowering': { nitrogen: 1.0, phosphorus: 1.0, potassium: 1.0 },
            'Grain Fill': { nitrogen: 0.8, phosphorus: 0.9, potassium: 0.9 },
            'Maturity': { nitrogen: 0.5, phosphorus: 0.7, potassium: 0.8 },
            'Ripening': { nitrogen: 0.2, phosphorus: 0.5, potassium: 0.6 }
        };

        const base = baseRequirements[this.crop_type] || baseRequirements['Wheat'];
        const factors = stageFactors[this.growth.current_stage] || stageFactors['Vegetative'];

        return {
            nitrogen: Math.round(base.nitrogen * factors.nitrogen),
            phosphorus: Math.round(base.phosphorus * factors.phosphorus),
            potassium: Math.round(base.potassium * factors.potassium),
            stage: this.growth.current_stage,
            total_requirements: base,
            stage_factors: factors
        };
    }

    // Yield Prediction
    predictYield(weatherData, soilData) {
        let baseYield = {
            'Wheat': 45,
            'Corn': 175,
            'Tomato': 20,
            'Soybean': 45,
            'Potato': 20
        }[this.crop_type] || 40;

        // Adjust based on growth stage
        const stageFactor = {
            'Seedling': 0.3,
            'Tillering': 0.5,
            'Stem Elongation': 0.7,
            'Booting': 0.8,
            'Heading': 0.85,
            'Flowering': 0.9,
            'Grain Fill': 0.95,
            'Maturity': 1.0,
            'Ripening': 1.0
        }[this.growth.current_stage] || 0.5;

        // Soil health factor
        const soilFactor = soilData?.organic_matter && soilData.organic_matter > 3 ? 1.1 :
                          soilData?.organic_matter && soilData.organic_matter > 2 ? 1.0 : 0.9;

        // Weather factor
        const weatherFactor = weatherData?.avg_temp && weatherData.avg_temp > 20 ? 1.0 :
                             weatherData?.avg_temp && weatherData.avg_temp > 15 ? 0.9 : 0.8;

        // Health factor
        const healthFactor = this.health.overall_score / 100;

        const predicted = baseYield * stageFactor * soilFactor * weatherFactor * healthFactor;

        this.yield.estimated_yield = Math.round(predicted * 10) / 10;
        this.yield.yield_potential = Math.round(baseYield * 1.2 * 10) / 10;
        this.yield.yield_gap = Math.round((this.yield.yield_potential - this.yield.estimated_yield) * 10) / 10;

        return this.yield;
    }

    // Stress Assessment
    assessStress(weatherData, soilData) {
        const stressFactors = [];
        let stressScore = 0;

        // Water stress
        if (soilData) {
            const moisture = soilData.moisture || 60;
            if (moisture < 30) {
                stressFactors.push('Severe water stress');
                stressScore += 30;
            } else if (moisture < 50) {
                stressFactors.push('Moderate water stress');
                stressScore += 15;
            }
        }

        // Temperature stress
        if (weatherData) {
            const temp = weatherData.temp || 25;
            if (temp > 35) {
                stressFactors.push('Extreme heat stress');
                stressScore += 25;
            } else if (temp > 30) {
                stressFactors.push('Heat stress');
                stressScore += 10;
            }
            if (temp < 5) {
                stressFactors.push('Cold stress');
                stressScore += 20;
            }
        }

        // Nutrient stress
        if (this.health.chlorophyll_content < 30) {
            stressFactors.push('Nutrient deficiency');
            stressScore += 15;
        }

        // Pest and disease stress
        if (this.health.disease_incidence > 10) {
            stressFactors.push('Disease pressure');
            stressScore += 10;
        }
        if (this.health.pest_incidence > 8) {
            stressFactors.push('Pest pressure');
            stressScore += 10;
        }

        const stressLevel = stressScore > 50 ? 'High' : stressScore > 25 ? 'Moderate' : 'Low';

        return {
            stress_score: stressScore,
            stress_level: stressLevel,
            factors: stressFactors,
            recommendations: this.generateStressRecommendations(stressFactors)
        };
    }

    generateStressRecommendations(stressFactors) {
        const recommendations = [];

        stressFactors.forEach(factor => {
            if (factor.includes('water stress')) {
                recommendations.push('Increase irrigation frequency and amount');
                recommendations.push('Apply organic mulch to conserve moisture');
            }
            if (factor.includes('heat stress')) {
                recommendations.push('Provide temporary shade where possible');
                recommendations.push('Apply irrigation during cooler periods');
                recommendations.push('Avoid stressing plants with additional operations');
            }
            if (factor.includes('cold stress')) {
                recommendations.push('Delay planting until temperatures warm');
                recommendations.push('Use frost protection measures');
            }
            if (factor.includes('nutrient deficiency')) {
                recommendations.push('Apply appropriate fertilizers');
                recommendations.push('Test soil and adjust application rates');
            }
            if (factor.includes('Disease pressure')) {
                recommendations.push('Apply appropriate fungicides');
                recommendations.push('Improve air circulation');
            }
            if (factor.includes('Pest pressure')) {
                recommendations.push('Apply appropriate pesticides');
                recommendations.push('Monitor pest populations closely');
            }
        });

        return [...new Set(recommendations)];
    }

    // Economics
    calculateEconomics(marketPrice = null) {
        const price = marketPrice || this.economics.market_price || 4.25;
        const estimatedYield = this.yield.estimated_yield || 40;
        
        this.economics.market_price = price;
        this.economics.projected_revenue = Math.round(estimatedYield * price * 100) / 100;
        this.economics.production_cost = this.calculateProductionCosts();
        this.economics.breakeven_yield = Math.round((this.economics.production_cost / price) * 100) / 100;
        this.economics.profitability = this.economics.projected_revenue > this.economics.production_cost ?
            'Profitable' : 'Not profitable';

        return this.economics;
    }

    calculateProductionCosts() {
        const costs = {
            seed: 50,
            fertilizer: 80,
            chemical: 60,
            irrigation: 40,
            labor: 100,
            machinery: 75,
            land: 150,
            other: 35
        };

        // Adjust based on crop type
        if (this.crop_type === 'Corn') {
            costs.fertilizer = 120;
            costs.seed = 70;
        } else if (this.crop_type === 'Tomato') {
            costs.labor = 150;
            costs.irrigation = 60;
        }

        return Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    }

    // Quality Assessment
    assessQuality() {
        const factors = [];
        let qualityScore = 85;

        // Assess based on growth stage
        if (this.growth.current_stage === 'Maturity' || this.growth.current_stage === 'Ripening') {
            qualityScore += 5;
            factors.push('Optimal harvest stage');
        }

        // Assess based on health
        if (this.health.overall_score > 80) {
            qualityScore += 10;
            factors.push('Excellent crop health');
        } else if (this.health.overall_score < 60) {
            qualityScore -= 10;
            factors.push('Crop health concerns');
        }

        // Assess based on disease/pest incidence
        if (this.health.disease_incidence > 15) {
            qualityScore -= 10;
            factors.push('Disease impact on quality');
        }
        if (this.health.pest_incidence > 10) {
            qualityScore -= 8;
            factors.push('Pest damage');
        }

        // Environment impact
        if (this.environment.heat_stress_days > 5) {
            qualityScore -= 5;
            factors.push('Heat stress impact');
        }

        return {
            score: Math.min(100, Math.max(0, qualityScore)),
            factors: factors,
            grade: qualityScore > 90 ? 'Premium' : qualityScore > 75 ? 'Good' : qualityScore > 60 ? 'Standard' : 'Reject'
        };
    }

    // Validation
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.crop_type) errors.push('Crop type is required');
        if (!this.variety) warnings.push('Variety information is recommended');
        if (!this.planting.date) errors.push('Planting date is required');

        if (this.planting.seed_rate <= 0) {
            warnings.push('Seed rate should be specified');
        }

        if (this.health.overall_score < 50) {
            warnings.push('Crop health is below 50% - immediate attention needed');
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
            id: this.id,
            field_id: this.field_id,
            crop_type: this.crop_type,
            variety: this.variety,
            scientific_name: this.scientific_name,
            planting: this.planting,
            growth: this.growth,
            health: this.health,
            yield: this.yield,
            inputs: this.inputs,
            environment: this.environment,
            economics: this.economics,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_scouted: this.last_scouted,
            next_scouting: this.next_scouting,
            status: this.status,
            season: this.season
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
        this.updated_at = new Date().toISOString();
        return this;
    }

    clone() {
        return new CropModel(this.toJSON());
    }

    static createSampleCrop() {
        return new CropModel({
            crop_type: 'Wheat',
            variety: 'Pioneer 34R07',
            scientific_name: 'Triticum aestivum',
            planting: {
                date: new Date().toISOString(),
                method: 'Direct Seeding',
                seed_rate: 120,
                row_spacing: 20,
                plant_spacing: 2.5,
                planting_depth: 4
            },
            growth: {
                current_stage: 'Vegetative',
                days_after_planting: 45
            },
            health: {
                overall_score: 85,
                ndvi: 0.65
            }
        });
    }
}

window.CropModel = CropModel;