/**
 * Recommendation Engine API
 * Handles generation, explanation, and feedback for farm recommendations
 */

class RecommendationAPI {
    constructor() {
        this.config = {
            baseUrl: CONFIG.API.RECOMMENDATION.BASE_URL || 'http://localhost:5000/api/v1',
            endpoints: CONFIG.API.RECOMMENDATION.ENDPOINTS || {
                GENERATE: '/recommendations/generate',
                EXPLAIN: '/recommendations/explain',
                FEEDBACK: '/recommendations/feedback',
                HISTORY: '/recommendations/history',
                STATUS: '/recommendations/status'
            }
        };

        this.recommendations = [];
        this.feedbackHistory = [];
    }

    /**
     * Generate integrated recommendations
     * @param {Object} data - Farm data for recommendation generation
     * @param {Object} data.field - Field information
     * @param {Object} data.weather - Weather data
     * @param {Object} data.soil - Soil data
     * @param {Object} data.pest - Pest risk data
     * @param {Object} data.market - Market data
     * @param {Object} data.crop - Crop analysis data
     * @returns {Promise<Array>} Generated recommendations
     */
    async generateRecommendations(data) {
        try {
            const recommendations = this.simulateRecommendationGeneration(data);
            this.recommendations = recommendations;
            return recommendations;
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    /**
     * Get explanation for a recommendation
     * @param {string} recommendationId - Recommendation identifier
     * @param {Object} context - Context data for explanation
     * @returns {Promise<Object>} Explanation data
     */
    async getRecommendationExplanation(recommendationId, context = {}) {
        try {
            const recommendation = this.recommendations.find(r => r.id === recommendationId);
            if (!recommendation) {
                throw new Error('Recommendation not found');
            }

            const explanation = this.generateExplanation(recommendation, context);
            return explanation;
        } catch (error) {
            console.error('Failed to get explanation:', error);
            return this.getFallbackExplanation();
        }
    }

    /**
     * Submit feedback for a recommendation
     * @param {string} recommendationId - Recommendation identifier
     * @param {Object} feedback - Feedback data
     * @param {string} feedback.rating - Rating (Helpful, Somewhat Helpful, Not Helpful)
     * @param {string} feedback.comment - User comment
     * @param {string} feedback.outcome - Implementation outcome
     * @returns {Promise<Object>} Feedback response
     */
    async submitFeedback(recommendationId, feedback) {
        try {
            const response = {
                success: true,
                message: 'Feedback submitted successfully',
                feedback_id: `fb-${Date.now()}`,
                timestamp: new Date().toISOString()
            };
            
            this.feedbackHistory.push({
                recommendation_id: recommendationId,
                ...feedback,
                ...response,
                submitted_at: new Date().toISOString()
            });
            
            return response;
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            return {
                success: false,
                message: 'Failed to submit feedback',
                error: error.message
            };
        }
    }

    /**
     * Get recommendation history
     * @param {string} fieldId - Field identifier (optional)
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>} Recommendation history
     */
    async getRecommendationHistory(fieldId = null, limit = 50) {
        try {
            let history = this.recommendations.slice(-limit);
            if (fieldId) {
                history = history.filter(r => r.field_id === fieldId);
            }
            return history;
        } catch (error) {
            console.error('Failed to get recommendation history:', error);
            return [];
        }
    }

    /**
     * Update recommendation status
     * @param {string} recommendationId - Recommendation identifier
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated recommendation
     */
    async updateRecommendationStatus(recommendationId, status) {
        try {
            const recommendation = this.recommendations.find(r => r.id === recommendationId);
            if (recommendation) {
                recommendation.status = status;
                recommendation.updated_at = new Date().toISOString();
                return recommendation;
            }
            throw new Error('Recommendation not found');
        } catch (error) {
            console.error('Failed to update recommendation status:', error);
            return null;
        }
    }

    /**
     * Simulate recommendation generation
     * @param {Object} data - Farm data
     * @returns {Array} Simulated recommendations
     */
    simulateRecommendationGeneration(data) {
        const recommendations = [];
        const { weather, soil, field, pest, market } = data;
        
        // Irrigation recommendations
        if (soil && soil.moisture < 70) {
            const irrigationAmount = Math.round(25 * (1 - soil.moisture / 100));
            recommendations.push({
                id: `rec-${Date.now()}-001`,
                field_id: field?.id || 'field-001',
                category: 'irrigation',
                title: 'Irrigation Required',
                description: `Soil moisture is at ${soil.moisture}%, below optimal levels`,
                priority: soil.moisture < 50 ? 'high' : 'medium',
                recommended_action: `Apply ${irrigationAmount}mm of irrigation within 48 hours`,
                confidence: 0.85,
                status: 'pending',
                created_at: new Date().toISOString(),
                factors: [
                    { name: 'Soil Moisture', value: `${soil.moisture}%`, impact: 'High' },
                    { name: 'Crop Water Requirement', value: `${Math.round(5 * 1.1)} mm/day`, impact: 'High' },
                    { name: 'Forecast Rainfall', value: `${weather?.precipitation || 0}mm`, impact: 'Low' }
                ],
                alternatives: [
                    'Apply 75% of recommended amount if rain expected',
                    'Split application into two sessions'
                ],
                icon: 'fa-water',
                time: 'Now'
            });
        }

        // Fertilization recommendations
        if (soil && soil.npk && soil.npk.nitrogen < 25) {
            recommendations.push({
                id: `rec-${Date.now()}-002`,
                field_id: field?.id || 'field-001',
                category: 'fertilization',
                title: 'Nitrogen Application',
                description: `Nitrogen levels at ${soil.npk.nitrogen} ppm, below optimal range`,
                priority: 'medium',
                recommended_action: 'Apply 50-70 kg N/ha as Urea or Ammonium Nitrate',
                confidence: 0.78,
                status: 'pending',
                created_at: new Date().toISOString(),
                factors: [
                    { name: 'Nitrogen Level', value: `${soil.npk.nitrogen} ppm`, impact: 'High' },
                    { name: 'Crop Stage', value: field?.growthStage || 'Vegetative', impact: 'High' },
                    { name: 'Soil Type', value: soil.soil_type || 'Loam', impact: 'Medium' }
                ],
                alternatives: [
                    'Apply organic nitrogen source for longer release',
                    'Split application over 2 weeks'
                ],
                icon: 'fa-flask',
                time: 'Within 3 days'
            });
        }

        // Pest control recommendations
        if (pest && pest.risk > 5) {
            recommendations.push({
                id: `rec-${Date.now()}-003`,
                field_id: field?.id || 'field-001',
                category: 'pest_control',
                title: `${pest.type || 'Pest'} Management Required`,
                description: `Pest risk level at ${pest.risk}/10. ${pest.type || 'Pest'} activity detected.`,
                priority: pest.risk > 7 ? 'high' : 'medium',
                recommended_action: pest.recommendation || 'Apply appropriate pesticide within 48 hours',
                confidence: 0.72,
                status: 'pending',
                created_at: new Date().toISOString(),
                factors: [
                    { name: 'Pest Risk', value: `${pest.risk}/10`, impact: 'High' },
                    { name: 'Temperature', value: `${weather?.temp || 25}°C`, impact: 'Medium' },
                    { name: 'Humidity', value: `${weather?.humidity || 65}%`, impact: 'Medium' }
                ],
                alternatives: [
                    'Use biological control agents',
                    'Implement cultural practices to deter pests'
                ],
                icon: 'fa-bug',
                time: 'Within 48 hours'
            });
        }

        // Harvest recommendations
        if (field && field.growthStage === 'Maturity' && field.ripeness > 80) {
            recommendations.push({
                id: `rec-${Date.now()}-004`,
                field_id: field.id || 'field-001',
                category: 'harvest',
                title: 'Harvest Planning',
                description: `Crop ripeness at ${field.ripeness}%. Market conditions favorable.`,
                priority: 'high',
                recommended_action: 'Begin harvest within 7-14 days',
                confidence: 0.90,
                status: 'pending',
                created_at: new Date().toISOString(),
                factors: [
                    { name: 'Crop Ripeness', value: `${field.ripeness}%`, impact: 'High' },
                    { name: 'Market Price', value: market?.currentPrice ? `$${market.currentPrice}` : '$4.25', impact: 'High' },
                    { name: 'Weather Forecast', value: 'Favorable', impact: 'Medium' }
                ],
                alternatives: [
                    'Wait 5-7 days for higher prices if weather permits',
                    'Harvest in stages to manage labor costs'
                ],
                icon: 'fa-tractor',
                time: '7-14 days'
            });
        }

        // Add a general monitoring recommendation if no specific recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                id: `rec-${Date.now()}-005`,
                field_id: field?.id || 'field-001',
                category: 'monitoring',
                title: 'Continue Monitoring',
                description: 'All parameters are within optimal ranges. Continue regular monitoring.',
                priority: 'low',
                recommended_action: 'Schedule regular crop inspections and continue current management practices',
                confidence: 0.95,
                status: 'pending',
                created_at: new Date().toISOString(),
                factors: [
                    { name: 'Overall Health', value: 'Good', impact: 'Low' },
                    { name: 'Risk Level', value: 'Low', impact: 'Low' }
                ],
                alternatives: [],
                icon: 'fa-eye',
                time: 'Ongoing'
            });
        }

        return recommendations;
    }

    /**
     * Generate explanation for a recommendation
     * @param {Object} recommendation - Recommendation object
     * @param {Object} context - Context data
     * @returns {Object} Explanation data
     */
    generateExplanation(recommendation, context = {}) {
        const explanations = {
            irrigation: this.explainIrrigation,
            fertilization: this.explainFertilization,
            pest_control: this.explainPestControl,
            harvest: this.explainHarvest,
            monitoring: this.explainMonitoring
        };

        const explainFn = explanations[recommendation.category] || this.explainDefault;
        return explainFn(recommendation, context);
    }

    explainIrrigation(rec, context) {
        return {
            summary: `Soil moisture is at ${this.getFactorValue(rec, 'Soil Moisture')}, which is below optimal levels. ${rec.title}`,
            key_factors: rec.factors || [],
            reasoning: [
                'Soil moisture deficit affects crop water uptake and photosynthesis',
                'Timely irrigation prevents yield loss and ensures optimal growth',
                'Crop water requirement is based on current growth stage and weather conditions'
            ],
            confidence: rec.confidence || 0.85,
            sources: ['Soil sensor data', 'Weather forecast', 'Crop water requirements'],
            assumptions: [
                'Irrigation system is operational',
                'Water availability is not restricted',
                'No rainfall expected in the next 48 hours'
            ],
            alternatives: rec.alternatives || []
        };
    }

    explainFertilization(rec, context) {
        return {
            summary: `Nutrient levels are below optimal range. ${rec.title}`,
            key_factors: rec.factors || [],
            reasoning: [
                'Nutrient deficiency limits crop growth and yield potential',
                'Application timing affects nutrient uptake efficiency',
                'Soil type influences fertilizer requirements and application rates'
            ],
            confidence: rec.confidence || 0.78,
            sources: ['Soil analysis results', 'Crop nutrient requirements', 'Local fertilizer recommendations'],
            assumptions: [
                'Soil tests accurately represent field conditions',
                'Fertilizer application equipment is calibrated',
                'Weather conditions favor nutrient uptake'
            ],
            alternatives: rec.alternatives || []
        };
    }

    explainPestControl(rec, context) {
        return {
            summary: `${rec.description || 'Pest activity detected with risk level indicated'}`,
            key_factors: rec.factors || [],
            reasoning: [
                'Pest pressure can cause significant yield loss if not controlled',
                'Environmental conditions favor pest development',
                'Early intervention reduces damage and treatment costs'
            ],
            confidence: rec.confidence || 0.72,
            sources: ['Pest monitoring data', 'Weather conditions', 'Historical pest patterns'],
            assumptions: [
                'Pest identification is accurate',
                'Treatment effectiveness is at expected levels',
                'Environmental conditions remain favorable for application'
            ],
            alternatives: rec.alternatives || []
        };
    }

    explainHarvest(rec, context) {
        return {
            summary: `${rec.title} - ${rec.description || 'Crop maturity and market conditions indicate optimal harvest timing'}`,
            key_factors: rec.factors || [],
            reasoning: [
                'Crop maturity indicators show readiness for harvest',
                'Market prices are favorable for current timing',
                'Weather forecast supports harvest operations'
            ],
            confidence: rec.confidence || 0.90,
            sources: ['Crop maturity assessments', 'Market price data', 'Weather forecast'],
            assumptions: [
                'Harvest equipment is available and operational',
                'Labor resources are sufficient',
                'Storage facilities are prepared'
            ],
            alternatives: rec.alternatives || []
        };
    }

    explainMonitoring(rec, context) {
        return {
            summary: 'All parameters are within optimal ranges. Continue regular monitoring.',
            key_factors: rec.factors || [],
            reasoning: [
                'Current conditions are favorable for crop growth',
                'No immediate interventions are required',
                'Regular monitoring enables early detection of issues'
            ],
            confidence: rec.confidence || 0.95,
            sources: ['Field sensors', 'Weather data', 'Crop health assessments'],
            assumptions: [
                'Current trends continue',
                'No unforeseen events occur',
                'Monitoring equipment is functioning properly'
            ],
            alternatives: rec.alternatives || []
        };
    }

    explainDefault(rec) {
        return {
            summary: rec.description || rec.title || 'Recommendation based on current farm conditions',
            key_factors: rec.factors || [],
            reasoning: ['Recommendation based on integrated analysis of farm data'],
            confidence: rec.confidence || 0.70,
            sources: ['Farm data analysis', 'Agricultural best practices'],
            assumptions: ['Farm conditions remain stable'],
            alternatives: rec.alternatives || []
        };
    }

    getFactorValue(rec, factorName) {
        const factor = rec.factors?.find(f => f.name === factorName);
        return factor ? factor.value : 'Unknown';
    }

    /**
     * Get fallback recommendations
     * @returns {Array} Fallback recommendations
     */
    getFallbackRecommendations() {
        return [
            {
                id: `rec-${Date.now()}-001`,
                category: 'general',
                title: 'General Management',
                description: 'Continue regular farm management practices',
                priority: 'medium',
                recommended_action: 'Monitor crop health and maintain irrigation schedule',
                confidence: 0.80,
                status: 'pending',
                created_at: new Date().toISOString(),
                icon: 'fa-check',
                time: 'Ongoing'
            }
        ];
    }

    /**
     * Get fallback explanation
     * @returns {Object} Fallback explanation
     */
    getFallbackExplanation() {
        return {
            summary: 'Recommendation based on integrated analysis of farm conditions',
            key_factors: [],
            reasoning: ['Data analysis suggests this action is beneficial'],
            confidence: 0.70,
            sources: ['Farm data analysis'],
            assumptions: ['Conditions remain stable'],
            alternatives: []
        };
    }
}

// Export for use in other files
window.RecommendationAPI = RecommendationAPI;