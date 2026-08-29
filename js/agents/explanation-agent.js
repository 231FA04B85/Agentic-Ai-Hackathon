/**
 * Explanation Agent - XAI Explanation Generation
 * Provides explainable AI insights for farm recommendations
 */

class ExplanationAgent {
    constructor() {
        this.explanationTemplates = {};
        this.confidenceMetrics = {};
        this.initialize();
    }

    initialize() {
        console.log('💡 Explanation Agent initialized with XAI capabilities');
        this.initializeTemplates();
        this.initializeConfidenceMetrics();
    }

    initializeTemplates() {
        this.explanationTemplates = {
            irrigation: {
                template: `Irrigation recommended because soil moisture is at {moisture}%, 
                          which is {deficit}% below optimal level of {optimal}%. 
                          The crop is currently in {growth_stage} stage, 
                          requiring {water_requirement} mm of water. 
                          Weather forecast shows {rainfall}mm of rain in next 3 days, 
                          impacting irrigation timing.`,
                factors: ['moisture', 'deficit', 'optimal', 'growth_stage', 'water_requirement', 'rainfall']
            },
            fertilization: {
                template: `Fertilizer application recommended because {nutrient} levels are at 
                          {current_level} ppm, which is below the optimal range of {optimal_range} ppm. 
                          The crop is in {growth_stage} stage, with highest demand for 
                          {nutrient} during this phase. Soil type is {soil_type}, 
                          influencing nutrient availability and application rates.`,
                factors: ['nutrient', 'current_level', 'optimal_range', 'growth_stage', 'soil_type']
            },
            pest_control: {
                template: `Pest control recommended due to {pest_type} infestation at 
                          severity level {severity}/10. Economic threshold of {threshold} 
                          has been exceeded. Environmental conditions ({temp}°C, {humidity}% humidity) 
                          favor pest development. Treatment with {treatment} is recommended 
                          within {timeframe} hours.`,
                factors: ['pest_type', 'severity', 'threshold', 'temp', 'humidity', 'treatment', 'timeframe']
            },
            harvest: {
                template: `Harvest recommended as crop is at {ripeness}% ripeness, 
                          within optimal harvest window. Current market price of \${price}/bushel 
                          is favorable, with {trend} trend predicted. Weather forecast shows 
                          {rain_days} days of favorable harvest conditions in next week. 
                          Delaying harvest beyond {max_days} days may risk quality loss.`,
                factors: ['ripeness', 'price', 'trend', 'rain_days', 'max_days']
            },
            disease_management: {
                template: `Disease management needed due to {disease_type} detected at 
                          {severity}% severity. Environmental factors ({temp}°C, {humidity}% humidity) 
                          are conducive to disease spread. Treatment with {treatment} is 
                          recommended, with {monitoring_frequency} monitoring schedule. 
                          Immediate action required to prevent spread to {impact_acreage} acres.`,
                factors: ['disease_type', 'severity', 'temp', 'humidity', 'treatment', 'monitoring_frequency', 'impact_acreage']
            },
            market_intelligence: {
                template: `Market recommendation to {action} based on current price of \${price}/bushel. 
                          Price trend shows {trend} movement with {volatility}% volatility. 
                          Forecast predicts {prediction} price direction over next {days} days. 
                          {market_factors} factors are influencing current market conditions. 
                          Optimal selling window is {optimal_window}.`,
                factors: ['action', 'price', 'trend', 'volatility', 'prediction', 'days', 'market_factors', 'optimal_window']
            },
            weather_advisory: {
                template: `Weather advisory: {weather_condition} expected over next {days} days. 
                          Temperature range of {temp_range}°C with {precipitation}mm precipitation. 
                          {impact} impact expected on farm operations. Recommended actions: 
                          {recommended_actions}. Monitor conditions closely for updates.`,
                factors: ['weather_condition', 'days', 'temp_range', 'precipitation', 'impact', 'recommended_actions']
            },
            sustainability: {
                template: `Sustainability recommendation: {action} to improve soil health. 
                          Current organic matter is {organic_matter}%, below optimal of {optimal}%. 
                          Implementation over {timeline} months will improve water retention 
                          by {water_retention}% and reduce fertilizer needs by {fertilizer_reduction}%. 
                          Expected benefits: {benefits}.`,
                factors: ['action', 'organic_matter', 'optimal', 'timeline', 'water_retention', 'fertilizer_reduction', 'benefits']
            }
        };
    }

    initializeConfidenceMetrics() {
        this.confidenceMetrics = {
            high_confidence: { threshold: 0.85, level: 'HIGH', color: '#2E7D32' },
            medium_confidence: { threshold: 0.65, level: 'MEDIUM', color: '#F57C00' },
            low_confidence: { threshold: 0.40, level: 'LOW', color: '#C62828' }
        };
    }

    async generateExplanation(recommendation, context) {
        try {
            const category = recommendation.category || 'general';
            const template = this.explanationTemplates[category] || this.explanationTemplates.general;
            
            // Build explanation from template
            const explanation = this.buildExplanation(template, recommendation, context);
            
            // Add confidence metrics
            const confidence = this.calculateConfidence(recommendation, context);
            
            // Add supporting evidence
            const evidence = this.gatherEvidence(recommendation, context);
            
            // Add alternatives
            const alternatives = this.generateAlternatives(recommendation, context);
            
            return {
                summary: explanation,
                confidence: confidence,
                evidence: evidence,
                alternatives: alternatives,
                factors: this.extractKeyFactors(recommendation, context),
                timestamp: new Date().toISOString(),
                sources: this.identifySources(recommendation, context)
            };
        } catch (error) {
            console.error('Failed to generate explanation:', error);
            return this.getFallbackExplanation(recommendation);
        }
    }

    buildExplanation(template, recommendation, context) {
        let explanation = template.template || '';
        
        // Replace placeholders with actual values
        const placeholders = explanation.match(/\{([^}]+)\}/g) || [];
        
        placeholders.forEach(placeholder => {
            const key = placeholder.slice(1, -1);
            const value = this.getPlaceholderValue(key, recommendation, context);
            explanation = explanation.replace(placeholder, value || 'N/A');
        });
        
        return explanation;
    }

    getPlaceholderValue(key, recommendation, context) {
        // Map placeholder keys to actual data sources
        const valueMap = {
            // Irrigation placeholders
            'moisture': () => context.soil?.moisture || recommendation.details?.current_moisture || 65,
            'deficit': () => Math.round(100 - (context.soil?.moisture || 65)),
            'optimal': () => '70-80%',
            'growth_stage': () => context.crop?.growthStage || recommendation.details?.crop_stage || 'Vegetative',
            'water_requirement': () => context.soil?.water_requirement || recommendation.details?.amount || 25,
            'rainfall': () => context.weather?.forecast?.slice(0,3).reduce((sum, d) => sum + (d.precipitation || 0), 0) || 0,
            
            // Fertilization placeholders
            'nutrient': () => recommendation.details?.nutrient || 'Nitrogen',
            'current_level': () => context.soil?.npk?.nitrogen || recommendation.details?.current_nitrogen || 20,
            'optimal_range': () => recommendation.details?.optimal_range || '25-40 ppm',
            'soil_type': () => context.soil?.soil_type || 'Loam',
            
            // Pest control placeholders
            'pest_type': () => recommendation.details?.pest || context.pest?.type || 'Aphids',
            'severity': () => recommendation.details?.severity || context.pest?.risk || 5,
            'threshold': () => context.pest?.economic_threshold || 3,
            'temp': () => context.weather?.temp || 25,
            'humidity': () => context.weather?.humidity || 65,
            'treatment': () => recommendation.details?.treatment || recommendation.details?.recommended_action || 'Apply treatment',
            'timeframe': () => recommendation.details?.timing || '48',
            
            // Harvest placeholders
            'ripeness': () => context.crop?.ripeness || recommendation.details?.ripeness || 85,
            'price': () => context.market?.currentPrice || recommendation.details?.market_price || 4.25,
            'trend': () => context.market?.trend || recommendation.details?.price_trend || 'Stable',
            'rain_days': () => context.weather?.forecast?.filter(d => d.precipitation < 5).length || 5,
            'max_days': () => '14',
            
            // Disease placeholders
            'disease_type': () => recommendation.details?.disease || context.pest?.disease_type || 'Rust',
            'monitoring_frequency': () => recommendation.details?.monitoring_frequency || 'Daily',
            'impact_acreage': () => context.crop?.area || 40,
            
            // Market placeholders
            'action': () => recommendation.details?.recommended_action || 'Hold/Sell',
            'volatility': () => context.market?.volatility || 5,
            'prediction': () => recommendation.details?.outlook || 'Stable',
            'days': () => '30',
            'market_factors': () => 'Supply-demand balance, export demand, currency exchange rates',
            'optimal_window': () => recommendation.details?.optimal_window || '2-4 weeks',
            
            // Weather placeholders
            'weather_condition': () => context.weather?.condition || 'Partly Cloudy',
            'temp_range': () => `${context.weather?.temp_min || 15}-${context.weather?.temp_max || 30}`,
            'precipitation': () => context.weather?.precipitation || 0,
            'impact': () => recommendation.details?.impact || 'Moderate',
            'recommended_actions': () => recommendation.details?.recommended_actions?.join(', ') || 'Monitor conditions',
            
            // Sustainability placeholders
            'organic_matter': () => context.soil?.organic_matter || 2.5,
            'optimal': () => '3-4%',
            'timeline': () => '3-5',
            'water_retention': () => '15-20',
            'fertilizer_reduction': () => '10-15',
            'benefits': () => 'Improved soil health, better water retention, enhanced carbon sequestration'
        };
        
        const valueFn = valueMap[key];
        if (valueFn) {
            try {
                return valueFn();
            } catch (error) {
                console.warn(`Failed to get value for placeholder ${key}:`, error);
                return 'N/A';
            }
        }
        
        // Direct lookup in recommendation details
        if (recommendation.details && recommendation.details[key] !== undefined) {
            return recommendation.details[key];
        }
        
        return 'N/A';
    }

    calculateConfidence(recommendation, context) {
        let confidenceScore = recommendation.confidence || 0.70;
        
        // Adjust confidence based on data availability
        let dataPoints = 0;
        let totalPoints = 0;
        
        // Check for complete data
        const requiredData = {
            weather: context.weather && context.weather.temp !== undefined,
            soil: context.soil && context.soil.moisture !== undefined,
            crop: context.crop && context.crop.health !== undefined,
            pest: context.pest && context.pest.risk !== undefined,
            market: context.market && context.market.currentPrice !== undefined
        };
        
        Object.values(requiredData).forEach(available => {
            totalPoints++;
            if (available) dataPoints++;
        });
        
        const dataCompleteness = dataPoints / totalPoints;
        
        // Adjust confidence based on data completeness
        if (dataCompleteness < 0.5) {
            confidenceScore *= 0.8;
        } else if (dataCompleteness < 0.7) {
            confidenceScore *= 0.9;
        }
        
        // Cap confidence at 0.95
        confidenceScore = Math.min(0.95, confidenceScore);
        
        // Determine confidence level
        let level = 'LOW';
        let color = '#C62828';
        if (confidenceScore >= 0.85) {
            level = 'HIGH';
            color = '#2E7D32';
        } else if (confidenceScore >= 0.65) {
            level = 'MEDIUM';
            color = '#F57C00';
        }
        
        return {
            score: Math.round(confidenceScore * 100),
            level: level,
            color: color,
            factors: {
                data_completeness: Math.round(dataCompleteness * 100),
                recommendation_confidence: Math.round((recommendation.confidence || 0.7) * 100)
            }
        };
    }

    gatherEvidence(recommendation, context) {
        const evidence = [];
        
        // Add evidence from context
        if (context.soil) {
            evidence.push({
                source: 'Soil Sensor Data',
                data: `Moisture: ${context.soil.moisture}%, Temperature: ${context.soil.temperature}°C`,
                relevance: 'Directly impacts irrigation and fertilizer recommendations'
            });
        }
        
        if (context.weather) {
            evidence.push({
                source: 'Weather Forecast',
                data: `${context.weather.temp}°C, ${context.weather.condition}, ${context.weather.precipitation}mm rain`,
                relevance: 'Influences timing of all farm operations'
            });
        }
        
        if (context.pest) {
            evidence.push({
                source: 'Pest Monitoring',
                data: `${context.pest.type || 'Pest'} at risk level ${context.pest.risk || 0}/10`,
                relevance: 'Supports pest control recommendations'
            });
        }
        
        if (context.market) {
            evidence.push({
                source: 'Market Intelligence',
                data: `Price: $${context.market.currentPrice || 0}/bushel, Trend: ${context.market.trend || 'Stable'}`,
                relevance: 'Supports market timing recommendations'
            });
        }
        
        if (context.crop) {
            evidence.push({
                source: 'Crop Monitoring',
                data: `Growth Stage: ${context.crop.growthStage || 'Unknown'}, Health: ${context.crop.health || 0}%`,
                relevance: 'Determines crop-specific requirements'
            });
        }
        
        // Add evidence from recommendation details
        if (recommendation.details) {
            Object.entries(recommendation.details).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    evidence.push({
                        source: 'Recommendation Analysis',
                        data: `${key}: ${value}`,
                        relevance: `Supports recommendation for ${key}`
                    });
                }
            });
        }
        
        return evidence.slice(0, 5); // Limit to top 5 evidence items
    }

    generateAlternatives(recommendation, context) {
        const alternatives = recommendation.alternatives || [];
        
        // Generate additional alternatives based on context
        if (recommendation.category === 'irrigation') {
            alternatives.push({
                action: 'Rainfall harvesting',
                pros: 'Conserves water, reduces costs',
                cons: 'Unreliable, requires storage infrastructure'
            });
        }
        
        if (recommendation.category === 'fertilization') {
            alternatives.push({
                action: 'Organic fertilizer application',
                pros: 'Improves soil health, long-term benefits',
                cons: 'Slower release, requires larger quantities'
            });
        }
        
        if (recommendation.category === 'pest_control') {
            alternatives.push({
                action: 'Biological control',
                pros: 'Environmentally friendly, sustainable',
                cons: 'Slower action, requires more planning'
            });
        }
        
        if (recommendation.category === 'harvest') {
            alternatives.push({
                action: 'Staggered harvest',
                pros: 'Manages labor costs, captures market peaks',
                cons: 'Requires more planning, may affect quality'
            });
        }
        
        return alternatives;
    }

    extractKeyFactors(recommendation, context) {
        const factors = [];
        
        // Extract factors from recommendation
        if (recommendation.factors && Array.isArray(recommendation.factors)) {
            factors.push(...recommendation.factors);
        }
        
        // Extract factors from context
        if (context.soil) {
            factors.push({
                name: 'Soil Moisture',
                value: `${context.soil.moisture}%`,
                impact: 'HIGH'
            });
            factors.push({
                name: 'Soil pH',
                value: context.soil.ph,
                impact: 'MEDIUM'
            });
        }
        
        if (context.weather) {
            factors.push({
                name: 'Temperature',
                value: `${context.weather.temp}°C`,
                impact: 'MEDIUM'
            });
            factors.push({
                name: 'Humidity',
                value: `${context.weather.humidity}%`,
                impact: 'LOW'
            });
        }
        
        return factors;
    }

    identifySources(recommendation, context) {
        const sources = [];
        
        // Identify data sources used in recommendation
        if (context.soil) sources.push('Soil Sensor Network');
        if (context.weather) sources.push('Weather Station');
        if (context.pest) sources.push('Pest Scouting Reports');
        if (context.market) sources.push('Market Data Feed');
        if (context.crop) sources.push('Crop Monitoring System');
        
        sources.push('AI Recommendation Engine');
        sources.push('Historical Farm Data');
        
        return sources;
    }

    getFallbackExplanation(recommendation) {
        return {
            summary: `Recommendation: ${recommendation.title || 'Farm management action'}. 
                      Based on analysis of available farm data and agricultural best practices. 
                      Please verify with local conditions before implementation.`,
            confidence: {
                score: 60,
                level: 'MEDIUM',
                color: '#F57C00',
                factors: {
                    data_completeness: 50,
                    recommendation_confidence: 70
                }
            },
            evidence: [
                {
                    source: 'Farm Data Analysis',
                    data: 'Integrated analysis of available data sources',
                    relevance: 'High'
                }
            ],
            alternatives: [
                {
                    action: 'Consult local agricultural extension service',
                    pros: 'Local expertise and site-specific advice',
                    cons: 'May require scheduling and travel'
                }
            ],
            factors: [
                {
                    name: 'Data Availability',
                    value: 'Partial',
                    impact: 'MEDIUM'
                }
            ],
            timestamp: new Date().toISOString(),
            sources: ['AI Recommendation Engine', 'Agricultural Database']
        };
    }

    async generateDetailedReport(recommendations, context) {
        const reports = [];
        
        for (const recommendation of recommendations) {
            const explanation = await this.generateExplanation(recommendation, context);
            reports.push({
                recommendation_id: recommendation.id,
                title: recommendation.title,
                category: recommendation.category,
                priority: recommendation.priority,
                explanation: explanation,
                actionable_insights: this.extractActionableInsights(explanation, recommendation),
                implementation_checklist: this.generateChecklist(explanation, recommendation)
            });
        }
        
        return reports;
    }

    extractActionableInsights(explanation, recommendation) {
        const insights = [];
        
        // Extract main action
        if (recommendation.recommended_action) {
            insights.push({
                type: 'ACTION',
                text: recommendation.recommended_action,
                priority: 'HIGH'
            });
        }
        
        // Extract timing
        if (recommendation.time) {
            insights.push({
                type: 'TIMING',
                text: `Timing: ${recommendation.time}`,
                priority: 'HIGH'
            });
        }
        
        // Extract confidence
        if (explanation.confidence) {
            insights.push({
                type: 'CONFIDENCE',
                text: `Confidence: ${explanation.confidence.score}% - ${explanation.confidence.level}`,
                priority: 'MEDIUM'
            });
        }
        
        return insights;
    }

    generateChecklist(explanation, recommendation) {
        const checklist = [];
        
        // Generate checklist items based on category
        if (recommendation.category === 'irrigation') {
            checklist.push(
                { item: 'Check irrigation system for proper operation', priority: 'HIGH' },
                { item: 'Verify water availability and pressure', priority: 'HIGH' },
                { item: 'Monitor soil moisture after irrigation', priority: 'MEDIUM' },
                { item: 'Record irrigation amounts and timing', priority: 'LOW' }
            );
        } else if (recommendation.category === 'fertilization') {
            checklist.push(
                { item: 'Check soil test results for nutrient levels', priority: 'HIGH' },
                { item: 'Calibrate fertilizer application equipment', priority: 'HIGH' },
                { item: 'Apply fertilizers during optimal weather conditions', priority: 'MEDIUM' },
                { item: 'Follow safety guidelines for handling fertilizers', priority: 'HIGH' }
            );
        } else if (recommendation.category === 'pest_control') {
            checklist.push(
                { item: 'Identify pest species accurately', priority: 'HIGH' },
                { item: 'Check economic threshold levels', priority: 'HIGH' },
                { item: 'Select appropriate treatment method', priority: 'HIGH' },
                { item: 'Apply treatment at recommended timing', priority: 'HIGH' },
                { item: 'Monitor treatment effectiveness', priority: 'MEDIUM' },
                { item: 'Record treatment details and results', priority: 'LOW' }
            );
        } else if (recommendation.category === 'harvest') {
            checklist.push(
                { item: 'Check crop maturity and ripeness', priority: 'HIGH' },
                { item: 'Prepare harvesting equipment', priority: 'HIGH' },
                { item: 'Arrange labor for harvest operations', priority: 'HIGH' },
                { item: 'Coordinate storage and transport', priority: 'HIGH' },
                { item: 'Monitor market prices for optimal timing', priority: 'MEDIUM' }
            );
        }
        
        return checklist;
    }
}

window.ExplanationAgent = ExplanationAgent;

// Auto-instantiate so pages can use window.explanationAgent directly
if (typeof window !== 'undefined' && !window.explanationAgent) {
    window.explanationAgent = new ExplanationAgent();
}
