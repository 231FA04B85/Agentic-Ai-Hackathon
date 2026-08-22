/**
 * Field Model - Real-world Farm Field Data Structure
 * Represents agricultural field with comprehensive management data
 */

class FieldModel {
    constructor(data = {}) {
        // Basic Information
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.farm_id = data.farm_id || '';
        this.owner_id = data.owner_id || '';
        
        // Location & Geography
        this.location = {
            latitude: data.location?.latitude || 0,
            longitude: data.location?.longitude || 0,
            elevation: data.location?.elevation || 0, // meters
            address: data.location?.address || '',
            county: data.location?.county || '',
            state: data.location?.state || '',
            country: data.location?.country || 'USA',
            soil_type: data.location?.soil_type || 'Loam',
            soil_ph: data.location?.soil_ph || 6.5,
            soil_organic_matter: data.location?.soil_organic_matter || 3.2
        };
        
        // Field Specifications
        this.specifications = {
            total_area: data.specifications?.total_area || 0, // hectares
            cultivated_area: data.specifications?.cultivated_area || 0, // hectares
            shape: data.specifications?.shape || 'Rectangular',
            slope: data.specifications?.slope || 0, // percentage
            aspect: data.specifications?.aspect || 'Flat',
            drainage: data.specifications?.drainage || 'Good',
            irrigation_type: data.specifications?.irrigation_type || 'Sprinkler',
            irrigation_capacity: data.specifications?.irrigation_capacity || 0, // mm/hour
            fencing: data.specifications?.fencing || 'Complete',
            access_roads: data.specifications?.access_roads || 'Good'
        };
        
        // Current Crop Information
        this.current_crop = data.current_crop || null;
        
        // Crop History
        this.crop_history = data.crop_history || [];
        
        // Management Data
        this.management = {
            field_conditions: data.management?.field_conditions || 'Good',
            weed_pressure: data.management?.weed_pressure || 'Low',
            pest_pressure: data.management?.pest_pressure || 'Low',
            disease_pressure: data.management?.disease_pressure || 'Low',
            fertility_level: data.management?.fertility_level || 'Medium',
            crop_rotation_plan: data.management?.crop_rotation_plan || '',
            conservation_practices: data.management?.conservation_practices || []
        };
        
        // Soil Analysis Data
        this.soil_analysis = {
            sample_date: data.soil_analysis?.sample_date || new Date().toISOString(),
            ph: data.soil_analysis?.ph || 6.5,
            ec: data.soil_analysis?.ec || 0.8,
            organic_matter: data.soil_analysis?.organic_matter || 3.2,
            nitrogen: data.soil_analysis?.nitrogen || 25,
            phosphorus: data.soil_analysis?.phosphorus || 20,
            potassium: data.soil_analysis?.potassium || 30,
            calcium: data.soil_analysis?.calcium || 500,
            magnesium: data.soil_analysis?.magnesium || 150,
            sulfur: data.soil_analysis?.sulfur || 20,
            zinc: data.soil_analysis?.zinc || 0.8,
            iron: data.soil_analysis?.iron || 5,
            manganese: data.soil_analysis?.manganese || 12,
            copper: data.soil_analysis?.copper || 1.5,
            boron: data.soil_analysis?.boron || 0.6,
            cec: data.soil_analysis?.cec || 15 // Cation Exchange Capacity
        };
        
        // Production History
        this.production_history = data.production_history || [];
        
        // Financial Records
        this.financial = {
            land_cost: data.financial?.land_cost || 0, // $/acre
            production_costs: data.financial?.production_costs || {},
            revenue_history: data.financial?.revenue_history || [],
            crop_insurance: data.financial?.crop_insurance || null
        };
        
        // Equipment & Resources
        this.equipment = {
            owned: data.equipment?.owned || [],
            leased: data.equipment?.leased || [],
            available_capacity: data.equipment?.available_capacity || {}
        };
        
        // Environmental Data
        this.environmental = {
            water_usage: data.environmental?.water_usage || 0, // cubic meters/year
            carbon_footprint: data.environmental?.carbon_footprint || 0,
            biodiversity_score: data.environmental?.biodiversity_score || 0,
            conservation_areas: data.environmental?.conservation_areas || []
        };
        
        // Sensors & Monitoring
        this.sensors = {
            installed: data.sensors?.installed || [],
            active: data.sensors?.active || [],
            last_readings: data.sensors?.last_readings || null
        };
        
        // Timestamps
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.last_harvest = data.last_harvest || null;
        this.next_planting = data.next_planting || null;
        
        // Status
        this.status = data.status || 'Active';
        this.ownership_type = data.ownership_type || 'Owned';
    }

    generateId() {
        return `FLD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Field Management Methods
    addCropHistory(cropData) {
        this.crop_history.push({
            ...cropData,
            date: new Date().toISOString(),
            field_id: this.id
        });
        this.updateTimestamps();
    }

    updateCurrentCrop(cropData) {
        this.current_crop = {
            ...cropData,
            planted_date: cropData.planted_date || new Date().toISOString(),
            field_id: this.id
        };
        this.updateTimestamps();
    }

    addProductionRecord(record) {
        this.production_history.push({
            ...record,
            field_id: this.id,
            date: record.date || new Date().toISOString()
        });
        this.updateTimestamps();
    }

    updateSoilAnalysis(analysisData) {
        this.soil_analysis = {
            ...this.soil_analysis,
            ...analysisData,
            sample_date: new Date().toISOString()
        };
        this.updateTimestamps();
    }

    // Financial Methods
    calculateCosts() {
        const totalCosts = {
            variable: 0,
            fixed: 0,
            total: 0
        };

        if (this.financial.production_costs) {
            Object.entries(this.financial.production_costs).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    if (['seed', 'fertilizer', 'chemical', 'irrigation', 'labor'].includes(key)) {
                        totalCosts.variable += value;
                    } else {
                        totalCosts.fixed += value;
                    }
                }
            });
        }

        totalCosts.total = totalCosts.variable + totalCosts.fixed;
        return totalCosts;
    }

    calculateYieldStats() {
        if (this.production_history.length === 0) return null;

        const yields = this.production_history
            .filter(record => record.yield && record.yield > 0)
            .map(record => record.yield);

        if (yields.length === 0) return null;

        return {
            average_yield: yields.reduce((a, b) => a + b, 0) / yields.length,
            max_yield: Math.max(...yields),
            min_yield: Math.min(...yields),
            median_yield: this.calculateMedian(yields),
            total_production: yields.reduce((a, b) => a + b, 0)
        };
    }

    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    // Validation Methods
    validate() {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!this.name) errors.push('Field name is required');
        if (!this.location.latitude || !this.location.longitude) {
            errors.push('Field location coordinates are required');
        }
        if (this.specifications.total_area <= 0) {
            errors.push('Total area must be greater than 0');
        }

        // Warnings
        if (this.soil_analysis.ph < 5.5 || this.soil_analysis.ph > 7.5) {
            warnings.push('Soil pH is outside optimal range (6.0-7.0)');
        }
        if (this.soil_analysis.organic_matter < 2) {
            warnings.push('Low organic matter content (< 2%)');
        }
        if (this.management.weed_pressure === 'High') {
            warnings.push('High weed pressure detected - consider management action');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    // Get Status Methods
    getOverallHealth() {
        let score = 100;
        let factors = [];

        // Check soil health
        if (this.soil_analysis.organic_matter > 3) {
            score += 5;
            factors.push('Good organic matter');
        } else if (this.soil_analysis.organic_matter < 2) {
            score -= 10;
            factors.push('Low organic matter');
        }

        // Check pH
        if (this.soil_analysis.ph >= 6.0 && this.soil_analysis.ph <= 7.0) {
            score += 5;
            factors.push('Optimal pH');
        } else {
            score -= 5;
            factors.push('pH needs adjustment');
        }

        // Check drainage
        if (this.specifications.drainage === 'Good') {
            score += 5;
            factors.push('Good drainage');
        } else if (this.specifications.drainage === 'Poor') {
            score -= 10;
            factors.push('Poor drainage - needs improvement');
        }

        // Check management factors
        if (this.management.weed_pressure === 'High') {
            score -= 10;
            factors.push('High weed pressure');
        }
        if (this.management.pest_pressure === 'High') {
            score -= 10;
            factors.push('High pest pressure');
        }

        // Check crop rotation
        if (this.crop_history.length > 1) {
            const uniqueCrops = new Set(this.crop_history.map(c => c.crop_type));
            if (uniqueCrops.size >= 3) {
                score += 10;
                factors.push('Good crop rotation diversity');
            }
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            factors: factors,
            status: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Poor'
        };
    }

    getNutrientStatus() {
        const nutrients = {
            nitrogen: { current: this.soil_analysis.nitrogen, optimal: [20, 40], unit: 'ppm' },
            phosphorus: { current: this.soil_analysis.phosphorus, optimal: [15, 30], unit: 'ppm' },
            potassium: { current: this.soil_analysis.potassium, optimal: [25, 45], unit: 'ppm' },
            calcium: { current: this.soil_analysis.calcium, optimal: [400, 800], unit: 'ppm' },
            magnesium: { current: this.soil_analysis.magnesium, optimal: [100, 300], unit: 'ppm' },
            sulfur: { current: this.soil_analysis.sulfur, optimal: [15, 30], unit: 'ppm' },
            zinc: { current: this.soil_analysis.zinc, optimal: [0.5, 1.5], unit: 'ppm' },
            iron: { current: this.soil_analysis.iron, optimal: [4, 10], unit: 'ppm' },
            manganese: { current: this.soil_analysis.manganese, optimal: [5, 20], unit: 'ppm' },
            copper: { current: this.soil_analysis.copper, optimal: [0.5, 2.0], unit: 'ppm' },
            boron: { current: this.soil_analysis.boron, optimal: [0.5, 1.0], unit: 'ppm' }
        };

        const status = {};
        let deficiencyCount = 0;
        let excessCount = 0;

        Object.entries(nutrients).forEach(([nutrient, data]) => {
            const status_level = data.current < data.optimal[0] ? 'Deficient' :
                                 data.current > data.optimal[1] ? 'Excess' : 'Optimal';
            
            status[nutrient] = {
                current: data.current,
                optimal_min: data.optimal[0],
                optimal_max: data.optimal[1],
                unit: data.unit,
                status: status_level,
                recommended_action: this.getNutrientAction(nutrient, status_level, data.current, data.optimal)
            };

            if (status_level === 'Deficient') deficiencyCount++;
            if (status_level === 'Excess') excessCount++;
        });

        return {
            nutrients: status,
            summary: {
                total_nutrients: Object.keys(status).length,
                deficient_count: deficiencyCount,
                excess_count: excessCount,
                optimal_count: Object.keys(status).length - deficiencyCount - excessCount,
                overall_status: deficiencyCount > 3 ? 'Multiple deficiencies' :
                               excessCount > 2 ? 'Nutrient excess' :
                               deficiencyCount > 0 ? 'Minor deficiencies' : 'Balanced'
            }
        };
    }

    getNutrientAction(nutrient, status, current, optimal) {
        const actions = {
            nitrogen: {
                Deficient: `Apply ${Math.round((optimal[0] - current) * 2)} kg/ha of nitrogen fertilizer`,
                Excess: 'Reduce nitrogen application and consider cover crops'
            },
            phosphorus: {
                Deficient: `Apply ${Math.round((optimal[0] - current) * 1.5)} kg/ha of phosphorus fertilizer`,
                Excess: 'Reduce phosphorus application and consider phosphorus-fixing crops'
            },
            potassium: {
                Deficient: `Apply ${Math.round((optimal[0] - current) * 1.2)} kg/ha of potassium fertilizer`,
                Excess: 'Reduce potassium application and monitor levels'
            }
        };

        return actions[nutrient]?.[status] || `Monitor ${nutrient} levels and adjust as needed`;
    }

    // Data Export Methods
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            farm_id: this.farm_id,
            location: this.location,
            specifications: this.specifications,
            current_crop: this.current_crop,
            crop_history: this.crop_history,
            management: this.management,
            soil_analysis: this.soil_analysis,
            production_history: this.production_history,
            financial: this.financial,
            equipment: this.equipment,
            environmental: this.environmental,
            sensors: this.sensors,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_harvest: this.last_harvest,
            next_planting: this.next_planting,
            status: this.status,
            ownership_type: this.ownership_type
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
        this.updated_at = new Date().toISOString();
        return this;
    }

    // Utility Methods
    updateTimestamps() {
        this.updated_at = new Date().toISOString();
    }

    clone() {
        return new FieldModel(this.toJSON());
    }

    // Static Methods
    static createSampleField() {
        return new FieldModel({
            name: 'North Field',
            location: {
                latitude: 41.8781,
                longitude: -87.6298,
                elevation: 182,
                county: 'Cook County',
                state: 'Illinois',
                country: 'USA',
                soil_type: 'Loam',
                soil_ph: 6.5,
                soil_organic_matter: 3.2
            },
            specifications: {
                total_area: 45,
                cultivated_area: 42,
                shape: 'Rectangular',
                slope: 2,
                aspect: 'Flat',
                drainage: 'Good',
                irrigation_type: 'Sprinkler',
                irrigation_capacity: 5
            },
            current_crop: {
                crop_type: 'Wheat',
                variety: 'Pioneer 34R07',
                planting_date: new Date().toISOString(),
                growth_stage: 'Vegetative'
            },
            soil_analysis: {
                nitrogen: 28,
                phosphorus: 18,
                potassium: 32,
                organic_matter: 3.2,
                ph: 6.5
            }
        });
    }

    static validateFieldData(data) {
        const required = ['name', 'location', 'specifications'];
        const errors = [];
        const warnings = [];

        required.forEach(field => {
            if (!data[field]) errors.push(`${field} is required`);
        });

        if (data.location) {
            if (!data.location.latitude || !data.location.longitude) {
                errors.push('Location coordinates are required');
            }
        }

        if (data.specifications && data.specifications.total_area <= 0) {
            errors.push('Total area must be greater than 0');
        }

        return { valid: errors.length === 0, errors, warnings };
    }
}

// Export for use in other files
window.FieldModel = FieldModel;