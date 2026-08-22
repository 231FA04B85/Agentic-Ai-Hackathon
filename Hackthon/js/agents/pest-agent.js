/**
 * Pest & Disease Agent - Real-world Pest and Disease Assessment
 * Handles pest monitoring, disease risk assessment, and treatment recommendations
 */

class PestAgent {
    constructor() {
        this.pestData = [];
        this.diseaseData = [];
        this.pestHistory = [];
        this.treatmentProtocols = [];
        this.initialize();
    }

    initialize() {
        console.log('🐛 Pest Agent initialized with real-world pest management');
        this.initializePestProfiles();
        this.initializeDiseaseProfiles();
        this.generateInitialData();
        this.startPestMonitoring();
    }

    initializePestProfiles() {
        this.pestProfiles = {
            'Fall Armyworm': {
                scientific_name: 'Spodoptera frugiperda',
                host_plants: ['Corn', 'Soybean', 'Cotton', 'Tomato'],
                detection_method: 'Visual inspection, pheromone traps',
                economic_threshold: 3, // larvae per plant
                lifecycle_days: 30,
                treatment_options: [
                    { type: 'Chemical', name: 'Bt spray', effectiveness: 90, timing: 'Early instar larvae' },
                    { type: 'Biological', name: 'Trichogramma wasps', effectiveness: 60, timing: 'Egg stage' },
                    { type: 'Cultural', name: 'Crop rotation', effectiveness: 40, timing: 'Off-season' }
                ],
                seasonality: { peak: ['July', 'August', 'September'], low: ['December', 'January', 'February'] }
            },
            'Aphids': {
                scientific_name: 'Aphidoidea',
                host_plants: ['Wheat', 'Corn', 'Tomato', 'Soybean'],
                detection_method: 'Visual inspection, sticky traps',
                economic_threshold: 250, // insects per plant
                lifecycle_days: 15,
                treatment_options: [
                    { type: 'Chemical', name: 'Insecticidal soap', effectiveness: 85, timing: 'Early infestation' },
                    { type: 'Biological', name: 'Ladybugs', effectiveness: 70, timing: 'First sighting' },
                    { type: 'Cultural', name: 'Remove weeds', effectiveness: 30, timing: 'Ongoing' }
                ],
                seasonality: { peak: ['May', 'June', 'September'], low: ['January', 'February', 'December'] }
            },
            'Late Blight': {
                scientific_name: 'Phytophthora infestans',
                host_plants: ['Tomato', 'Potato'],
                detection_method: 'Visual inspection, weather monitoring',
                economic_threshold: 1, // lesions per plant
                lifecycle_days: 5,
                treatment_options: [
                    { type: 'Chemical', name: 'Metalaxyl fungicide', effectiveness: 80, timing: 'Before infection' },
                    { type: 'Chemical', name: 'Mancozeb fungicide', effectiveness: 65, timing: 'Early symptoms' },
                    { type: 'Cultural', name: 'Remove infected plants', effectiveness: 50, timing: 'Immediate' }
                ],
                seasonality: { peak: ['June', 'July', 'August'], low: ['December', 'January'] }
            },
            'Corn Borer': {
                scientific_name: 'Ostrinia nubilalis',
                host_plants: ['Corn'],
                detection_method: 'Visual inspection, pheromone traps',
                economic_threshold: 2, // larvae per plant
                lifecycle_days: 35,
                treatment_options: [
                    { type: 'Chemical', name: 'Bt corn', effectiveness: 95, timing: 'Pre-planting' },
                    { type: 'Biological', name: 'Trichogramma wasps', effectiveness: 65, timing: 'Egg stage' },
                    { type: 'Cultural', name: 'Crop residue destruction', effectiveness: 40, timing: 'Off-season' }
                ],
                seasonality: { peak: ['June', 'July', 'August'], low: ['January', 'February'] }
            },
            'Whitefly': {
                scientific_name: 'Bemisia tabaci',
                host_plants: ['Tomato', 'Cotton', 'Soybean'],
                detection_method: 'Visual inspection, yellow sticky traps',
                economic_threshold: 50, // insects per leaf
                lifecycle_days: 20,
                treatment_options: [
                    { type: 'Chemical', name: 'Neem oil', effectiveness: 80, timing: 'Early infestation' },
                    { type: 'Biological', name: 'Encarsia wasps', effectiveness: 65, timing: 'First adults' },
                    { type: 'Cultural', name: 'Remove weeds', effectiveness: 30, timing: 'Ongoing' }
                ],
                seasonality: { peak: ['July', 'August', 'September'], low: ['December', 'January'] }
            }
        };
    }

    initializeDiseaseProfiles() {
        this.diseaseProfiles = {
            'Rust': {
                scientific_name: 'Pucciniales',
                host_plants: ['Wheat', 'Corn'],
                detection_method: 'Visual inspection, leaf symptoms',
                environmental_factors: {
                    temperature: { min: 10, max: 30, optimum: 20 },
                    humidity: { min: 70, max: 100, optimum: 85 }
                },
                treatment_options: [
                    { type: 'Fungicide', name: 'Triazole fungicide', effectiveness: 85, timing: 'Before infection' },
                    { type: 'Cultural', name: 'Remove infected leaves', effectiveness: 40, timing: 'Early symptoms' }
                ],
                disease_cycle_days: 7,
                spread_method: 'Wind-borne spores'
            },
            'Fusarium Wilt': {
                scientific_name: 'Fusarium oxysporum',
                host_plants: ['Tomato', 'Potato', 'Soybean'],
                detection_method: 'Visual inspection, wilting symptoms',
                environmental_factors: {
                    temperature: { min: 20, max: 35, optimum: 28 },
                    humidity: { min: 60, max: 100, optimum: 75 }
                },
                treatment_options: [
                    { type: 'Biological', name: 'Fusarium suppressive compost', effectiveness: 60, timing: 'Pre-planting' },
                    { type: 'Cultural', name: 'Crop rotation', effectiveness: 70, timing: 'Field planning' }
                ],
                disease_cycle_days: 10,
                spread_method: 'Soil-borne'
            },
            'Powdery Mildew': {
                scientific_name: 'Erysiphe cichoracearum',
                host_plants: ['Wheat', 'Tomato', 'Potato'],
                detection_method: 'Visual inspection, white powdery patches',
                environmental_factors: {
                    temperature: { min: 15, max: 30, optimum: 22 },
                    humidity: { min: 50, max: 90, optimum: 70 }
                },
                treatment_options: [
                    { type: 'Fungicide', name: 'Sulfur-based fungicide', effectiveness: 80, timing: 'Early symptoms' },
                    { type: 'Biological', name: 'Bacillus subtilis', effectiveness: 55, timing: 'Preventative' }
                ],
                disease_cycle_days: 5,
                spread_method: 'Air-borne spores'
            }
        };
    }

    generateInitialData() {
        this.pestData = [
            {
                field_id: 'field-001',
                crop_type: 'Wheat',
                pest_type: 'Aphids',
                severity: 4,
                population: 150,
                detection_date: new Date().toISOString(),
                treatment: 'Monitor',
                risk_level: 'MODERATE',
                economic_threshold_reached: false
            },
            {
                field_id: 'field-002',
                crop_type: 'Corn',
                pest_type: 'Fall Armyworm',
                severity: 7,
                population: 5,
                detection_date: new Date().toISOString(),
                treatment: 'Bt spray recommended',
                risk_level: 'HIGH',
                economic_threshold_reached: true
            },
            {
                field_id: 'field-003',
                crop_type: 'Tomato',
                pest_type: 'Late Blight',
                severity: 3,
                population: 0,
                detection_date: new Date().toISOString(),
                treatment: 'Fungicide spray recommended',
                risk_level: 'MODERATE',
                economic_threshold_reached: false
            }
        ];

        this.diseaseData = [
            {
                field_id: 'field-001',
                crop_type: 'Wheat',
                disease_type: 'Rust',
                severity: 2,
                incidence: 10, // percentage
                detection_date: new Date().toISOString(),
                risk_level: 'LOW'
            },
            {
                field_id: 'field-003',
                crop_type: 'Tomato',
                disease_type: 'Fusarium Wilt',
                severity: 5,
                incidence: 25,
                detection_date: new Date().toISOString(),
                risk_level: 'HIGH'
            }
        ];

        this.treatmentProtocols = [
            {
                id: 'TX-001',
                pest_type: 'Aphids',
                treatment: 'Insecticidal soap',
                concentration: '2%',
                application_rate: '1-2 L/ha',
                timing: 'Early morning',
                frequency: 'Every 5-7 days',
                withdrawal_period: 3 // days before harvest
            },
            {
                id: 'TX-002',
                pest_type: 'Fall Armyworm',
                treatment: 'Bt spray',
                concentration: '0.5%',
                application_rate: '2-3 L/ha',
                timing: 'Late afternoon',
                frequency: 'Every 10-14 days',
                withdrawal_period: 7
            },
            {
                id: 'TX-003',
                disease_type: 'Late Blight',
                treatment: 'Metalaxyl fungicide',
                concentration: '0.2%',
                application_rate: '1.5 L/ha',
                timing: 'Before rain',
                frequency: 'Every 7 days',
                withdrawal_period: 14
            },
            {
                id: 'TX-004',
                disease_type: 'Rust',
                treatment: 'Triazole fungicide',
                concentration: '0.5%',
                application_rate: '1 L/ha',
                timing: 'Early morning',
                frequency: 'Every 10 days',
                withdrawal_period: 10
            }
        ];
    }

    startPestMonitoring() {
        // Update pest data every hour
        setInterval(() => {
            this.updatePestData();
        }, 3600000); // 1 hour

        // Check for outbreaks every 30 minutes
        setInterval(() => {
            this.checkForOutbreaks();
        }, 1800000); // 30 minutes

        // Update disease risk with weather every hour
        setInterval(() => {
            this.updateDiseaseRisk();
        }, 3600000); // 1 hour
    }

    updatePestData() {
        this.pestData = this.pestData.map(pest => {
            // Simulate population changes
            const populationChange = (Math.random() - 0.5) * 20;
            let newPopulation = Math.max(0, pest.population + populationChange);
            
            // Disease progression
            let newSeverity = pest.severity + (Math.random() - 0.3) * 0.5;
            newSeverity = Math.max(0, Math.min(10, newSeverity));

            // Check if economic threshold reached
            const thresholdReached = this.checkEconomicThreshold(
                pest.pest_type, 
                newPopulation, 
                pest.crop_type
            );

            return {
                ...pest,
                population: Math.round(newPopulation),
                severity: Math.round(newSeverity * 10) / 10,
                economic_threshold_reached: thresholdReached,
                risk_level: this.calculateRiskLevel(newSeverity, newPopulation),
                treatment: this.determineTreatment(newSeverity, newPopulation, pest.pest_type),
                last_updated: new Date().toISOString()
            };
        });

        // Record history
        this.pestHistory.push({
            timestamp: new Date().toISOString(),
            data: this.pestData.map(p => ({
                field_id: p.field_id,
                pest_type: p.pest_type,
                population: p.population,
                severity: p.severity
            }))
        });

        // Keep only last 7 days of history
        if (this.pestHistory.length > 168) { // 7 days * 24 hours
            this.pestHistory.shift();
        }
    }

    checkEconomicThreshold(pestType, population, cropType) {
        const thresholds = {
            'Aphids': { 'Wheat': 250, 'Corn': 200, 'Tomato': 100, 'Soybean': 150 },
            'Fall Armyworm': { 'Corn': 3, 'Soybean': 2, 'Cotton': 4 },
            'Late Blight': { 'Tomato': 1, 'Potato': 1 },
            'Corn Borer': { 'Corn': 2 },
            'Whitefly': { 'Tomato': 50, 'Cotton': 30, 'Soybean': 40 }
        };

        const threshold = thresholds[pestType]?.[cropType] || 100;
        return population >= threshold;
    }

    calculateRiskLevel(severity, population) {
        const riskScore = (severity / 10) * 0.6 + Math.min(1, population / 500) * 0.4;
        if (riskScore > 0.7) return 'HIGH';
        if (riskScore > 0.4) return 'MODERATE';
        return 'LOW';
    }

    determineTreatment(severity, population, pestType) {
        if (severity < 3) return 'Monitor';
        if (severity < 5) return 'Monitor with increased scouting';
        if (severity < 7) return 'Biological control recommended';
        if (severity < 9) return 'Chemical control recommended';
        return 'Emergency chemical treatment required';
    }

    checkForOutbreaks() {
        const highRiskPests = this.pestData.filter(p => p.risk_level === 'HIGH' && p.severity > 7);
        
        if (highRiskPests.length > 0) {
            highRiskPests.forEach(pest => {
                document.dispatchEvent(new CustomEvent('pestOutbreak', {
                    detail: {
                        pest: pest.pest_type,
                        field_id: pest.field_id,
                        severity: pest.severity,
                        population: pest.population,
                        recommendation: pest.treatment,
                        timestamp: new Date().toISOString()
                    }
                }));
            });
        }
    }

    updateDiseaseRisk() {
        this.diseaseData = this.diseaseData.map(disease => {
            // Simulate disease progression based on environmental factors
            const progression = this.calculateDiseaseProgression(disease);
            let newSeverity = Math.min(10, disease.severity + progression);
            let newIncidence = Math.min(100, disease.incidence + progression * 2);

            return {
                ...disease,
                severity: Math.round(newSeverity * 10) / 10,
                incidence: Math.round(newIncidence),
                risk_level: this.calculateDiseaseRisk(newSeverity, newIncidence),
                last_updated: new Date().toISOString()
            };
        });
    }

    calculateDiseaseProgression(disease) {
        // Simulate disease progression based on weather and season
        const baseProgression = (Math.random() - 0.3) * 0.2;
        const seasonality = this.getSeasonalityFactor();
        return Math.max(-0.1, Math.min(0.3, baseProgression + seasonality));
    }

    getSeasonalityFactor() {
        const month = new Date().getMonth();
        // Summer months (June-August) favor disease progression
        if (month >= 5 && month <= 7) return 0.1;
        // Spring and Fall moderate
        if (month >= 3 && month <= 4 || month >= 8 && month <= 9) return 0.05;
        // Winter slow progression
        return -0.05;
    }

    calculateDiseaseRisk(severity, incidence) {
        const riskScore = (severity / 10) * 0.6 + (incidence / 100) * 0.4;
        if (riskScore > 0.7) return 'HIGH';
        if (riskScore > 0.4) return 'MODERATE';
        return 'LOW';
    }

    async getRiskAssessment(fieldId = null) {
        let pestData = this.pestData;
        let diseaseData = this.diseaseData;

        if (fieldId) {
            pestData = pestData.filter(p => p.field_id === fieldId);
            diseaseData = diseaseData.filter(d => d.field_id === fieldId);
        }

        const highestRiskPest = pestData.reduce((max, p) => 
            p.severity > max.severity ? p : max, { severity: 0 }
        );

        const highestRiskDisease = diseaseData.reduce((max, d) => 
            d.severity > max.severity ? d : max, { severity: 0 }
        );

        const overallRisk = Math.max(
            highestRiskPest.severity || 0,
            highestRiskDisease.severity || 0
        );

        return {
            overall_risk: Math.round(overallRisk * 10) / 10,
            overall_risk_level: this.calculateOverallRiskLevel(overallRisk),
            pest_data: pestData,
            disease_data: diseaseData,
            highest_risk_pest: highestRiskPest,
            highest_risk_disease: highestRiskDisease,
            timestamp: new Date().toISOString(),
            recommendations: this.generateOverallRecommendations(pestData, diseaseData)
        };
    }

    calculateOverallRiskLevel(overallRisk) {
        if (overallRisk > 7) return 'HIGH';
        if (overallRisk > 4) return 'MODERATE';
        return 'LOW';
    }

    generateOverallRecommendations(pestData, diseaseData) {
        const recommendations = [];

        // Pest recommendations
        pestData.forEach(pest => {
            if (pest.severity > 5) {
                recommendations.push({
                    type: 'PEST',
                    pest: pest.pest_type,
                    field: pest.field_id,
                    recommendation: pest.treatment,
                    urgency: pest.severity > 7 ? 'HIGH' : 'MODERATE',
                    timeframe: pest.severity > 7 ? 'Immediate' : 'Within 48 hours'
                });
            }
        });

        // Disease recommendations
        diseaseData.forEach(disease => {
            if (disease.severity > 4) {
                recommendations.push({
                    type: 'DISEASE',
                    disease: disease.disease_type,
                    field: disease.field_id,
                    recommendation: `Apply appropriate fungicide for ${disease.disease_type}`,
                    urgency: disease.severity > 6 ? 'HIGH' : 'MODERATE',
                    timeframe: disease.severity > 6 ? 'Immediate' : 'Within 3 days'
                });
            }
        });

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'MONITOR',
                recommendation: 'Continue regular scouting. No immediate intervention needed.',
                urgency: 'LOW',
                timeframe: 'Ongoing'
            });
        }

        return recommendations;
    }

    async getPestControlRecommendation(pestType, fieldId = null) {
        const pestProfile = this.pestProfiles[pestType];
        if (!pestProfile) {
            return { error: 'Pest profile not found' };
        }

        const pestData = this.pestData.find(p => 
            p.pest_type === pestType && (fieldId ? p.field_id === fieldId : true)
        );

        return {
            pest: pestType,
            scientific_name: pestProfile.scientific_name,
            current_severity: pestData?.severity || 0,
            treatment_options: pestProfile.treatment_options,
            recommended_treatment: this.getBestTreatment(pestProfile, pestData?.severity || 0),
            timing: this.getTreatmentTiming(pestType),
            withdrawal_period: this.getWithdrawalPeriod(pestType),
            monitoring_advice: this.getMonitoringAdvice(pestType),
            prevention: this.getPreventionAdvice(pestType)
        };
    }

    getBestTreatment(pestProfile, severity) {
        if (severity > 7) {
            return pestProfile.treatment_options.find(t => t.type === 'Chemical') || pestProfile.treatment_options[0];
        } else if (severity > 4) {
            return pestProfile.treatment_options.find(t => t.type === 'Biological') || pestProfile.treatment_options[1];
        } else {
            return pestProfile.treatment_options.find(t => t.type === 'Cultural') || pestProfile.treatment_options[2];
        }
    }

    getTreatmentTiming(pestType) {
        const timingMap = {
            'Aphids': 'Early morning or late evening when beneficial insects are less active',
            'Fall Armyworm': 'Late afternoon when larvae are actively feeding',
            'Late Blight': 'Before rain event if possible',
            'Corn Borer': 'At egg hatching stage',
            'Whitefly': 'Early morning when adults are less active'
        };
        return timingMap[pestType] || 'Apply at recommended application time';
    }

    getWithdrawalPeriod(pestType) {
        const periods = {
            'Aphids': 3,
            'Fall Armyworm': 7,
            'Late Blight': 14,
            'Corn Borer': 7,
            'Whitefly': 3
        };
        return periods[pestType] || 7;
    }

    getMonitoringAdvice(pestType) {
        const advices = {
            'Aphids': 'Inspect 5-10 plants per field weekly. Focus on undersides of leaves.',
            'Fall Armyworm': 'Inspect 20 plants per field weekly. Look for feeding damage.',
            'Late Blight': 'Monitor weather conditions and inspect for symptoms daily.',
            'Corn Borer': 'Use pheromone traps for early detection.',
            'Whitefly': 'Use yellow sticky traps. Inspect 10 plants per field weekly.'
        };
        return advices[pestType] || 'Regular visual inspection recommended.';
    }

    getPreventionAdvice(pestType) {
        const advices = {
            'Aphids': 'Remove weeds, encourage beneficial insects, use reflective mulches.',
            'Fall Armyworm': 'Crop rotation, early planting, use of Bt varieties.',
            'Late Blight': 'Use resistant varieties, proper spacing for air circulation.',
            'Corn Borer': 'Crop residue destruction, use of Bt corn.',
            'Whitefly': 'Remove weeds, use insect netting, maintain healthy plants.'
        };
        return advices[pestType] || 'Implement integrated pest management practices.';
    }

    async getDiseaseManagementRecommendation(diseaseType, fieldId = null) {
        const diseaseProfile = this.diseaseProfiles[diseaseType];
        if (!diseaseProfile) {
            return { error: 'Disease profile not found' };
        }

        const diseaseData = this.diseaseData.find(d => 
            d.disease_type === diseaseType && (fieldId ? d.field_id === fieldId : true)
        );

        return {
            disease: diseaseType,
            scientific_name: diseaseProfile.scientific_name,
            current_severity: diseaseData?.severity || 0,
            current_incidence: diseaseData?.incidence || 0,
            environmental_factors: diseaseProfile.environmental_factors,
            treatment_options: diseaseProfile.treatment_options,
            recommended_treatment: this.getBestDiseaseTreatment(diseaseProfile, diseaseData?.severity || 0),
            spread_method: diseaseProfile.spread_method,
            disease_cycle: diseaseProfile.disease_cycle_days,
            prevention: this.getDiseasePreventionAdvice(diseaseType)
        };
    }

    getBestDiseaseTreatment(diseaseProfile, severity) {
        if (severity > 6) {
            return diseaseProfile.treatment_options.find(t => t.type === 'Fungicide') || diseaseProfile.treatment_options[0];
        } else if (severity > 3) {
            return diseaseProfile.treatment_options.find(t => t.type === 'Biological') || diseaseProfile.treatment_options[1];
        } else {
            return diseaseProfile.treatment_options.find(t => t.type === 'Cultural') || diseaseProfile.treatment_options[2];
        }
    }

    getDiseasePreventionAdvice(diseaseType) {
        const advices = {
            'Rust': 'Use resistant varieties, proper spacing for air circulation.',
            'Fusarium Wilt': 'Crop rotation, soil solarization, use of bio-fumigants.',
            'Powdery Mildew': 'Avoid overhead irrigation, ensure good air circulation.'
        };
        return advices[diseaseType] || 'Implement integrated disease management practices.';
    }

    async getHistoricalTrends(days = 30) {
        return this.pestHistory.slice(-days);
    }

    async getTreatmentProtocols() {
        return this.treatmentProtocols;
    }
}

window.PestAgent = PestAgent;

// Auto-instantiate so pages can use window.pestAgent directly
if (typeof window !== 'undefined' && !window.pestAgent) {
    window.pestAgent = new PestAgent();
}
