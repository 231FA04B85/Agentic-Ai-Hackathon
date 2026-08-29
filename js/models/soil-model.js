/**
 * Soil Model - Real-world Soil Data Structure
 * Comprehensive soil data for agricultural management
 */

class SoilModel {
    constructor(data = {}) {
        // Basic Information
        this.id = data.id || this.generateId();
        this.field_id = data.field_id || '';
        this.sample_id = data.sample_id || `SAMP-${Date.now()}`;
        this.sample_date = data.sample_date || new Date().toISOString();
        this.lab_id = data.lab_id || '';
        this.sampler = data.sampler || '';
        
        // Physical Properties
        this.physical = {
            texture: data.physical?.texture || 'Loam',
            sand: data.physical?.sand || 40, // percentage
            silt: data.physical?.silt || 35,
            clay: data.physical?.clay || 25,
            bulk_density: data.physical?.bulk_density || 1.4, // g/cm3
            particle_density: data.physical?.particle_density || 2.65,
            porosity: data.physical?.porosity || 45, // percentage
            infiltration_rate: data.physical?.infiltration_rate || 2.5, // cm/hour
            hydraulic_conductivity: data.physical?.hydraulic_conductivity || 0.8, // cm/hour
            available_water_capacity: data.physical?.available_water_capacity || 18, // percentage
            field_capacity: data.physical?.field_capacity || 25, // percentage
            wilting_point: data.physical?.wilting_point || 10, // percentage
            saturation_percentage: data.physical?.saturation_percentage || 45 // percentage
        };
        
        // Chemical Properties
        this.chemical = {
            ph: data.chemical?.ph || 6.5,
            ec: data.chemical?.ec || 0.8, // dS/m
            cec: data.chemical?.cec || 15, // meq/100g
            base_saturation: data.chemical?.base_saturation || 75, // percentage
            organic_matter: data.chemical?.organic_matter || 3.2, // percentage
            total_nitrogen: data.chemical?.total_nitrogen || 0.15, // percentage
            nitrate_nitrogen: data.chemical?.nitrate_nitrogen || 15, // ppm
            ammonium_nitrogen: data.chemical?.ammonium_nitrogen || 10, // ppm
            phosphorus: data.chemical?.phosphorus || 20, // ppm
            potassium: data.chemical?.potassium || 150, // ppm
            calcium: data.chemical?.calcium || 800, // ppm
            magnesium: data.chemical?.magnesium || 200, // ppm
            sulfur: data.chemical?.sulfur || 20, // ppm
            sodium: data.chemical?.sodium || 50, // ppm
            zinc: data.chemical?.zinc || 0.8, // ppm
            iron: data.chemical?.iron || 5, // ppm
            manganese: data.chemical?.manganese || 12, // ppm
            copper: data.chemical?.copper || 1.5, // ppm
            boron: data.chemical?.boron || 0.6, // ppm
            aluminum: data.chemical?.aluminum || 20, // ppm
            chlorine: data.chemical?.chlorine || 10 // ppm
        };
        
        // Biological Properties
        this.biological = {
            microbial_biomass: data.biological?.microbial_biomass || 200, // mg/kg
            microbial_respiration: data.biological?.microbial_respiration || 20, // mg/kg/day
            earthworm_population: data.biological?.earthworm_population || 50, // count/m2
            mycorrhizal_colonization: data.biological?.mycorrhizal_colonization || 30, // percentage
            enzyme_activity: data.biological?.enzyme_activity || 60, // percentage
            organic_carbon: data.biological?.organic_carbon || 1.8, // percentage
            active_carbon: data.biological?.active_carbon || 0.3 // percentage
        };
        
        // Water Relations
        this.water = {
            current_moisture: data.water?.current_moisture || 65, // percentage
            available_water: data.water?.available_water || 15, // percentage
            deficit: data.water?.deficit || 10, // percentage
            irrigation_need: data.water?.irrigation_need || false,
            drainage_class: data.water?.drainage_class || 'Well drained',
            water_table_depth: data.water?.water_table_depth || 200, // cm
            salinity_risk: data.water?.salinity_risk || 'Low'
        };
        
        // Fertility Ratings
        this.fertility = {
            overall_rating: data.fertility?.overall_rating || 'Medium',
            nitrogen_rating: data.fertility?.nitrogen_rating || 'Medium',
            phosphorus_rating: data.fertility?.phosphorus_rating || 'Medium',
            potassium_rating: data.fertility?.potassium_rating || 'Medium',
            micronutrient_rating: data.fertility?.micronutrient_rating || 'Medium',
            organic_matter_rating: data.fertility?.organic_matter_rating || 'Medium'
        };
        
        // Management History
        this.management_history = data.management_history || [];
        
        // Recommendations
        this.recommendations = data.recommendations || {
            lime_needed: false,
            lime_amount: 0, // tons/ha
            fertilizer_recommendations: [],
            organic_matter_recommendation: '',
            amendment_recommendations: []
        };
        
        // Classification
        this.classification = {
            soil_order: data.classification?.soil_order || '',
            soil_suborder: data.classification?.soil_suborder || '',
            soil_great_group: data.classification?.soil_great_group || '',
            soil_subgroup: data.classification?.soil_subgroup || '',
            soil_series: data.classification?.soil_series || '',
            soil_family: data.classification?.soil_family || '',
            soil_taxonomy: data.classification?.soil_taxonomy || ''
        };
        
        // Timestamps
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.next_sampling_date = data.next_sampling_date || null;
    }

    generateId() {
        return `SOIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Nutrient Availability Assessment
    assessNutrientAvailability() {
        const nutrients = {
            nitrogen: { level: this.chemical.nitrate_nitrogen + this.chemical.ammonium_nitrogen, unit: 'ppm', optimal: 25 },
            phosphorus: { level: this.chemical.phosphorus, unit: 'ppm', optimal: 20 },
            potassium: { level: this.chemical.potassium, unit: 'ppm', optimal: 150 },
            calcium: { level: this.chemical.calcium, unit: 'ppm', optimal: 700 },
            magnesium: { level: this.chemical.magnesium, unit: 'ppm', optimal: 180 },
            sulfur: { level: this.chemical.sulfur, unit: 'ppm', optimal: 20 },
            zinc: { level: this.chemical.zinc, unit: 'ppm', optimal: 0.8 },
            iron: { level: this.chemical.iron, unit: 'ppm', optimal: 5 },
            manganese: { level: this.chemical.manganese, unit: 'ppm', optimal: 10 },
            copper: { level: this.chemical.copper, unit: 'ppm', optimal: 1.5 },
            boron: { level: this.chemical.boron, unit: 'ppm', optimal: 0.6 }
        };

        const assessment = {};
        let deficiencyCount = 0;
        let excessCount = 0;

        Object.entries(nutrients).forEach(([nutrient, data]) => {
            const ratio = data.level / data.optimal;
            let status = 'Optimal';
            
            if (ratio < 0.5) {
                status = 'Deficient';
                deficiencyCount++;
            } else if (ratio < 0.75) {
                status = 'Low';
            } else if (ratio > 1.5) {
                status = 'Excess';
                excessCount++;
            } else if (ratio > 1.25) {
                status = 'High';
            }
            
            assessment[nutrient] = {
                level: data.level,
                optimal: data.optimal,
                unit: data.unit,
                status: status,
                recommendation: this.getNutrientRecommendation(nutrient, status, data.level, data.optimal)
            };
        });

        return {
            nutrients: assessment,
            summary: {
                optimal_count: Object.keys(assessment).length - deficiencyCount - excessCount,
                deficient_count: deficiencyCount,
                excess_count: excessCount,
                overall_status: deficiencyCount > 2 ? 'Multiple deficiencies' :
                                deficiencyCount > 0 ? 'Minor deficiencies' :
                                excessCount > 1 ? 'Nutrient excess' : 'Balanced'
            }
        };
    }

    getNutrientRecommendation(nutrient, status, level, optimal) {
        const recommendations = {
            nitrogen: {
                Deficient: `Apply ${Math.round((optimal - level) * 2)} kg/ha of nitrogen fertilizer`,
                Low: `Apply ${Math.round((optimal - level) * 1.5)} kg/ha of nitrogen fertilizer`,
                Excess: 'Reduce nitrogen application and consider cover crops'
            },
            phosphorus: {
                Deficient: `Apply ${Math.round((optimal - level) * 3)} kg/ha of phosphorus fertilizer`,
                Low: `Apply ${Math.round((optimal - level) * 2)} kg/ha of phosphorus fertilizer`,
                Excess: 'Reduce phosphorus application and consider phosphorus-fixing crops'
            },
            potassium: {
                Deficient: `Apply ${Math.round((optimal - level) * 2)} kg/ha of potassium fertilizer`,
                Low: `Apply ${Math.round((optimal - level) * 1.5)} kg/ha of potassium fertilizer`,
                Excess: 'Reduce potassium application and monitor levels'
            }
        };

        return recommendations[nutrient]?.[status] || `Monitor ${nutrient} levels and adjust as needed`;
    }

    // Lime Requirement
    calculateLimeRequirement(targetPh = 6.5) {
        const currentPh = this.chemical.ph;
        const bufferPh = this.chemical.cec / 10 + 6.5; // Simplified buffer pH
        
        if (currentPh >= targetPh) {
            return { needed: false, amount: 0, message: 'No lime required' };
        }
        
        // Lime requirement calculation (Simplified)
        const phDifference = targetPh - currentPh;
        const limeRate = phDifference * 2.5; // tons/ha
        
        return {
            needed: true,
            amount: Math.round(limeRate * 10) / 10,
            target_ph: targetPh,
            current_ph: currentPh,
            material: 'Agricultural limestone',
            timing: 'Apply 3-6 months before planting',
            message: `Apply ${Math.round(limeRate * 10) / 10} tons/ha of agricultural limestone`
        };
    }

    // Soil Health Assessment
    assessSoilHealth() {
        let score = 60;
        const factors = [];

        // Physical properties
        if (this.physical.bulk_density < 1.4) {
            score += 10;
            factors.push('Good soil structure');
        } else if (this.physical.bulk_density > 1.6) {
            score -= 10;
            factors.push('Compaction risk');
        }

        // Chemical properties
        if (this.chemical.ph >= 6.0 && this.chemical.ph <= 7.0) {
            score += 10;
            factors.push('Optimal pH');
        } else {
            score -= 5;
            factors.push('pH adjustment needed');
        }

        if (this.chemical.organic_matter > 3) {
            score += 15;
            factors.push('Good organic matter content');
        } else if (this.chemical.organic_matter < 2) {
            score -= 10;
            factors.push('Low organic matter');
        }

        if (this.chemical.ec < 0.8) {
            score += 5;
            factors.push('Low salinity risk');
        } else if (this.chemical.ec > 1.5) {
            score -= 10;
            factors.push('Salinity concerns');
        }

        // Biological properties
        if (this.biological.microbial_biomass > 200) {
            score += 10;
            factors.push('Active microbial community');
        }

        if (this.biological.earthworm_population > 30) {
            score += 5;
            factors.push('Healthy earthworm population');
        }

        // Water relations
        if (this.water.drainage_class === 'Well drained') {
            score += 5;
            factors.push('Good drainage');
        } else if (this.water.drainage_class === 'Poorly drained') {
            score -= 10;
            factors.push('Poor drainage');
        }

        const healthScore = Math.min(100, Math.max(0, score));

        return {
            score: healthScore,
            status: healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Poor',
            factors: factors,
            recommendations: this.generateSoilHealthRecommendations(healthScore, factors)
        };
    }

    generateSoilHealthRecommendations(score, factors) {
        const recommendations = [];

        if (score < 60) {
            recommendations.push('Implement soil health improvement program');
        }

        factors.forEach(factor => {
            if (factor.includes('pH adjustment')) {
                recommendations.push('Apply lime to adjust pH');
            }
            if (factor.includes('Low organic matter')) {
                recommendations.push('Add organic matter through compost or cover crops');
            }
            if (factor.includes('Compaction')) {
                recommendations.push('Reduce tillage intensity');
                recommendations.push('Use cover crops with deep root systems');
            }
            if (factor.includes('Salinity')) {
                recommendations.push('Improve drainage to manage salinity');
                recommendations.push('Apply gypsum if needed');
            }
            if (factor.includes('Poor drainage')) {
                recommendations.push('Install drainage systems');
                recommendations.push('Use raised beds');
            }
        });

        return recommendations;
    }

    // Water Holding Capacity
    calculateWaterHoldingCapacity() {
        const fieldCapacity = this.physical.field_capacity;
        const wiltingPoint = this.physical.wilting_point;
        const availableWater = fieldCapacity - wiltingPoint;
        const currentAvailable = this.water.current_moisture - wiltingPoint;
        const percentageAvailable = (currentAvailable / availableWater) * 100;

        return {
            field_capacity: fieldCapacity,
            wilting_point: wiltingPoint,
            available_water: availableWater,
            current_moisture: this.water.current_moisture,
            current_available: Math.max(0, currentAvailable),
            percentage_available: Math.max(0, Math.min(100, percentageAvailable)),
            deficit: Math.max(0, availableWater - currentAvailable),
            status: percentageAvailable > 60 ? 'Good' : percentageAvailable > 30 ? 'Moderate' : 'Critical',
            irrigation_needed: percentageAvailable < 40
        };
    }

    // Fertilizer Recommendation
    getFertilizerRecommendation(cropType) {
        const nutrientStatus = this.assessNutrientAvailability();
        const recommendations = [];

        // Nitrogen recommendation
        const nitrogenStatus = nutrientStatus.nutrients.nitrogen;
        if (nitrogenStatus.status === 'Deficient' || nitrogenStatus.status === 'Low') {
            recommendations.push({
                nutrient: 'Nitrogen',
                rate: nitrogenStatus.status === 'Deficient' ? '50-70 kg/ha' : '30-50 kg/ha',
                timing: 'Apply split: 50% at planting, 50% during vegetative growth',
                type: 'Urea or ammonium nitrate',
                notes: 'Apply when soil is moist for better uptake'
            });
        }

        // Phosphorus recommendation
        const phosphorusStatus = nutrientStatus.nutrients.phosphorus;
        if (phosphorusStatus.status === 'Deficient' || phosphorusStatus.status === 'Low') {
            recommendations.push({
                nutrient: 'Phosphorus',
                rate: phosphorusStatus.status === 'Deficient' ? '40-60 kg/ha' : '20-40 kg/ha',
                timing: 'Apply at planting or before seeding',
                type: 'DAP or MAP',
                notes: 'Band application recommended for better efficiency'
            });
        }

        // Potassium recommendation
        const potassiumStatus = nutrientStatus.nutrients.potassium;
        if (potassiumStatus.status === 'Deficient' || potassiumStatus.status === 'Low') {
            recommendations.push({
                nutrient: 'Potassium',
                rate: potassiumStatus.status === 'Deficient' ? '50-70 kg/ha' : '30-50 kg/ha',
                timing: 'Apply at planting or as split application',
                type: 'Potassium chloride',
                notes: 'Broadcast and incorporate into soil'
            });
        }

        return {
            crop_type: cropType,
            soil_test_results: nutrientStatus,
            recommendations: recommendations,
            total_cost_estimate: this.estimateFertilizerCost(recommendations)
        };
    }

    estimateFertilizerCost(recommendations) {
        const fertilizerPrices = {
            'Nitrogen': 0.80, // $/kg N
            'Phosphorus': 1.20, // $/kg P2O5
            'Potassium': 0.70 // $/kg K2O
        };

        let totalCost = 0;
        recommendations.forEach(rec => {
            const rate = parseFloat(rec.rate) || 0;
            const price = fertilizerPrices[rec.nutrient] || 1.0;
            totalCost += rate * price;
        });

        return Math.round(totalCost * 100) / 100;
    }

    // Validation
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.field_id) errors.push('Field ID is required');
        if (this.chemical.ph < 0 || this.chemical.ph > 14) {
            errors.push('pH out of valid range (0-14)');
        }
        if (this.chemical.ec < 0) errors.push('EC must be positive');
        if (this.water.current_moisture < 0 || this.water.current_moisture > 100) {
            errors.push('Moisture content out of range');
        }

        if (this.chemical.organic_matter < 1) {
            warnings.push('Very low organic matter content');
        }
        if (this.chemical.ph < 5.5 || this.chemical.ph > 7.5) {
            warnings.push('pH outside optimal range for most crops');
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
            sample_id: this.sample_id,
            sample_date: this.sample_date,
            lab_id: this.lab_id,
            sampler: this.sampler,
            physical: this.physical,
            chemical: this.chemical,
            biological: this.biological,
            water: this.water,
            fertility: this.fertility,
            management_history: this.management_history,
            recommendations: this.recommendations,
            classification: this.classification,
            created_at: this.created_at,
            updated_at: this.updated_at,
            next_sampling_date: this.next_sampling_date
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
        this.updated_at = new Date().toISOString();
        return this;
    }

    clone() {
        return new SoilModel(this.toJSON());
    }

    static createSampleSoil() {
        return new SoilModel({
            field_id: 'field-001',
            physical: {
                texture: 'Sandy Loam',
                sand: 60,
                silt: 25,
                clay: 15,
                bulk_density: 1.45
            },
            chemical: {
                ph: 6.5,
                ec: 0.8,
                organic_matter: 3.2,
                total_nitrogen: 0.15,
                phosphorus: 20,
                potassium: 150
            },
            water: {
                current_moisture: 65,
                drainage_class: 'Well drained'
            }
        });
    }
}

window.SoilModel = SoilModel;