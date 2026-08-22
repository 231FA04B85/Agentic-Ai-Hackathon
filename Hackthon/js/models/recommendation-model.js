/**
 * Recommendation Model - Real-world Recommendation Data Structure
 * Comprehensive recommendation system for farm management
 */

class RecommendationModel {
    constructor(data = {}) {
        // Basic Information
        this.id = data.id || this.generateId();
        this.field_id = data.field_id || '';
        this.crop_id = data.crop_id || '';
        this.user_id = data.user_id || '';
        
        // Recommendation Type
        this.category = data.category || 'General'; // irrigation, fertilization, pest_control, harvest, etc.
        this.type = data.type || 'Advisory';
        this.sub_type = data.sub_type || '';
        
        // Content
        this.title = data.title || '';
        this.description = data.description || '';
        this.summary = data.summary || '';
        
        // Priority & Timing
        this.priority = data.priority || 'Medium'; // Low, Medium, High, Critical
        this.urgency = data.urgency || 'Normal'; // Immediate, Urgent, Normal, Scheduled
        this.timing = data.timing || '';
        this.timeframe = data.timeframe || '';
        this.deadline = data.deadline || null;
        
        // Actions
        this.actions = data.actions || [];
        this.primary_action = data.primary_action || '';
        this.recommended_action = data.recommended_action || '';
        this.alternative_actions = data.alternative_actions || [];
        
        // Details
        this.details = data.details || {};
        this.parameters = data.parameters || {};
        this.quantities = data.quantities || {};
        
        // Scientific Basis
        this.scientific_basis = data.scientific_basis || '';
        this.references = data.references || [];
        
        // Data Sources
        this.sources = data.sources || [];
        this.evidence = data.evidence || [];
        
        // Confidence Metrics
        this.confidence = {
            score: data.confidence?.score || 75,
            level: data.confidence?.level || 'Medium',
            factors: data.confidence?.factors || []
        };
        
        // Economic Impact
        this.economics = {
            cost: data.economics?.cost || 0,
            benefit: data.economics?.benefit || 0,
            roi: data.economics?.roi || 0,
            risk: data.economics?.risk || 'Low'
        };
        
        // Environmental Impact
        this.environmental = {
            impact: data.environmental?.impact || 'Neutral',
            sustainability_score: data.environmental?.sustainability_score || 50,
            carbon_footprint: data.environmental?.carbon_footprint || 0
        };
        
        // Status & Tracking
        this.status = data.status || 'Pending'; // Pending, In_Progress, Implemented, Rejected, Expired
        this.progress = data.progress || 0; // 0-100
        this.implementation_notes = data.implementation_notes || '';
        this.verified = data.verified || false;
        this.verified_by = data.verified_by || '';
        
        // Feedback
        this.feedback = data.feedback || [];
        this.rating = data.rating || 0; // 1-5
        this.ratings_count = data.ratings_count || 0;
        
        // Historical Data
        this.similar_recommendations = data.similar_recommendations || [];
        this.success_rate = data.success_rate || 0;
        this.implementation_count = data.implementation_count || 0;
        
        // Machine Learning Data
        this.ml_features = data.ml_features || {};
        this.prediction_confidence = data.prediction_confidence || 0.75;
        this.model_version = data.model_version || '1.0.0';
        
        // Timestamps
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.recommended_at = data.recommended_at || new Date().toISOString();
        this.implemented_at = data.implemented_at || null;
        this.expires_at = data.expires_at || null;
        
        // Additional Metadata
        this.tags = data.tags || [];
        this.season = data.season || new Date().getFullYear().toString();
        this.weather_conditions = data.weather_conditions || null;
        this.crop_stage = data.crop_stage || '';
    }

    generateId() {
        return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Recommendation Methods
    addAction(action) {
        this.actions.push({
            ...action,
            id: `ACT-${Date.now()}-${this.actions.length + 1}`,
            created_at: new Date().toISOString()
        });
        this.updateTimestamps();
    }

    addAlternative(alternative) {
        this.alternative_actions.push({
            ...alternative,
            id: `ALT-${Date.now()}-${this.alternative_actions.length + 1}`
        });
        this.updateTimestamps();
    }

    addFeedback(feedback) {
        this.feedback.push({
            ...feedback,
            id: `FB-${Date.now()}-${this.feedback.length + 1}`,
            timestamp: new Date().toISOString()
        });
        
        this.updateRating();
        this.updateTimestamps();
    }

    updateRating() {
        if (this.feedback.length === 0) {
            this.rating = 0;
            this.ratings_count = 0;
            return;
        }

        const ratings = this.feedback.filter(f => f.rating && f.rating > 0);
        if (ratings.length === 0) {
            this.rating = 0;
            this.ratings_count = 0;
            return;
        }

        this.ratings_count = ratings.length;
        this.rating = ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length;
        this.rating = Math.round(this.rating * 10) / 10;
    }

    // Status Methods
    markAsImplemented(notes = '') {
        this.status = 'Implemented';
        this.progress = 100;
        this.implemented_at = new Date().toISOString();
        this.implementation_notes = notes;
        this.updateTimestamps();
    }

    markAsInProgress() {
        this.status = 'In_Progress';
        this.updateTimestamps();
    }

    markAsRejected(reason = '') {
        this.status = 'Rejected';
        this.implementation_notes = reason;
        this.updateTimestamps();
    }

    updateProgress(progress) {
        this.progress = Math.min(100, Math.max(0, progress));
        if (this.progress === 100) {
            this.status = 'Implemented';
            this.implemented_at = new Date().toISOString();
        } else if (this.progress > 0) {
            this.status = 'In_Progress';
        }
        this.updateTimestamps();
    }

    // Calculate Economic Impact
    calculateEconomicImpact() {
        const cost = this.economics.cost || 0;
        const benefit = this.economics.benefit || 0;
        const roi = cost > 0 ? (benefit - cost) / cost * 100 : 0;
        
        this.economics.roi = Math.round(roi * 10) / 10;
        this.economics.risk = this.calculateRiskLevel(roi);
        
        return this.economics;
    }

    calculateRiskLevel(roi) {
        if (roi > 20) return 'Low';
        if (roi > 10) return 'Medium';
        if (roi > 0) return 'High';
        return 'Very High';
    }

    // Confidence Assessment
    assessConfidence() {
        let score = 75;
        const factors = [];

        // Data completeness
        if (this.sources.length > 5) {
            score += 10;
            factors.push('Multiple data sources');
        } else if (this.sources.length > 2) {
            score += 5;
            factors.push('Multiple data sources');
        }

        // Scientific basis
        if (this.scientific_basis) {
            score += 5;
            factors.push('Scientific basis available');
        }

        // Historical success
        if (this.success_rate > 70) {
            score += 10;
            factors.push('High historical success rate');
        } else if (this.success_rate > 40) {
            score += 5;
            factors.push('Moderate historical success rate');
        }

        // Implementation count
        if (this.implementation_count > 100) {
            score += 10;
            factors.push('Widely implemented');
        } else if (this.implementation_count > 20) {
            score += 5;
            factors.push('Implemented in multiple locations');
        }

        // Feedback ratings
        if (this.rating > 4) {
            score += 10;
            factors.push('High user ratings');
        } else if (this.rating > 3) {
            score += 5;
            factors.push('Good user ratings');
        }

        // Seasonality
        if (this.season && this.season === new Date().getFullYear().toString()) {
            score += 5;
            factors.push('Current season recommendation');
        }

        this.confidence.score = Math.min(100, Math.max(0, score));
        this.confidence.level = this.confidence.score > 80 ? 'High' : 
                                this.confidence.score > 60 ? 'Medium' : 'Low';
        this.confidence.factors = factors;
        
        return this.confidence;
    }

    // Validation
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.title) errors.push('Recommendation title is required');
        if (!this.category) errors.push('Category is required');
        if (!this.primary_action && this.actions.length === 0) {
            warnings.push('No actions specified');
        }

        if (this.priority === 'Critical' && !this.deadline) {
            warnings.push('Critical recommendation should have a deadline');
        }

        if (this.confidence.score < 50) {
            warnings.push('Low confidence recommendation - consider additional data');
        }

        if (this.economics.roi < 0) {
            warnings.push('Negative ROI - review economic feasibility');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    // Generate Implementation Checklist
    generateChecklist() {
        const checklist = [];

        // General checklist items
        checklist.push({
            item: 'Read and understand the recommendation',
            completed: false,
            priority: 'High'
        });

        // Category-specific checklist items
        if (this.category === 'Irrigation') {
            checklist.push(
                { item: 'Check irrigation system functionality', completed: false, priority: 'High' },
                { item: 'Verify water availability', completed: false, priority: 'High' },
                { item: 'Monitor soil moisture during irrigation', completed: false, priority: 'Medium' },
                { item: 'Record irrigation amount and timing', completed: false, priority: 'Low' }
            );
        } else if (this.category === 'Fertilization') {
            checklist.push(
                { item: 'Calibrate fertilizer application equipment', completed: false, priority: 'High' },
                { item: 'Check weather conditions for application', completed: false, priority: 'High' },
                { item: 'Follow safety guidelines', completed: false, priority: 'High' },
                { item: 'Record application details', completed: false, priority: 'Low' }
            );
        } else if (this.category === 'Pest Control') {
            checklist.push(
                { item: 'Identify pest species accurately', completed: false, priority: 'High' },
                { item: 'Check treatment timing', completed: false, priority: 'High' },
                { item: 'Follow application guidelines', completed: false, priority: 'High' },
                { item: 'Monitor treatment effectiveness', completed: false, priority: 'Medium' },
                { item: 'Record treatment details', completed: false, priority: 'Low' }
            );
        }

        // Add action-specific checklist items
        this.actions.forEach(action => {
            if (action.checklist_items) {
                action.checklist_items.forEach(item => {
                    checklist.push({
                        item: item,
                        completed: false,
                        priority: 'Medium',
                        action_id: action.id
                    });
                });
            }
        });

        return checklist;
    }

    // Utility Methods
    updateTimestamps() {
        this.updated_at = new Date().toISOString();
    }

    isExpired() {
        if (!this.expires_at) return false;
        return new Date(this.expires_at) < new Date();
    }

    toJSON() {
        return {
            id: this.id,
            field_id: this.field_id,
            crop_id: this.crop_id,
            user_id: this.user_id,
            category: this.category,
            type: this.type,
            sub_type: this.sub_type,
            title: this.title,
            description: this.description,
            summary: this.summary,
            priority: this.priority,
            urgency: this.urgency,
            timing: this.timing,
            timeframe: this.timeframe,
            deadline: this.deadline,
            actions: this.actions,
            primary_action: this.primary_action,
            recommended_action: this.recommended_action,
            alternative_actions: this.alternative_actions,
            details: this.details,
            parameters: this.parameters,
            quantities: this.quantities,
            scientific_basis: this.scientific_basis,
            references: this.references,
            sources: this.sources,
            evidence: this.evidence,
            confidence: this.confidence,
            economics: this.economics,
            environmental: this.environmental,
            status: this.status,
            progress: this.progress,
            implementation_notes: this.implementation_notes,
            verified: this.verified,
            verified_by: this.verified_by,
            feedback: this.feedback,
            rating: this.rating,
            ratings_count: this.ratings_count,
            similar_recommendations: this.similar_recommendations,
            success_rate: this.success_rate,
            implementation_count: this.implementation_count,
            ml_features: this.ml_features,
            prediction_confidence: this.prediction_confidence,
            model_version: this.model_version,
            created_at: this.created_at,
            updated_at: this.updated_at,
            recommended_at: this.recommended_at,
            implemented_at: this.implemented_at,
            expires_at: this.expires_at,
            tags: this.tags,
            season: this.season,
            weather_conditions: this.weather_conditions,
            crop_stage: this.crop_stage
        };
    }

    fromJSON(json) {
        Object.assign(this, json);
        this.updated_at = new Date().toISOString();
        return this;
    }

    clone() {
        return new RecommendationModel(this.toJSON());
    }

    // Static Methods
    static createSampleRecommendation() {
        return new RecommendationModel({
            title: 'Irrigation Recommendation',
            category: 'Irrigation',
            priority: 'High',
            description: 'Apply irrigation to address low soil moisture levels',
            summary: 'Soil moisture is at 45%, below optimal level. Apply 25mm irrigation within 48 hours.',
            primary_action: 'Apply 25mm of irrigation water',
            recommended_action: 'Irrigate 25mm within 48 hours',
            actions: [
                { description: 'Check irrigation system', priority: 'High' },
                { description: 'Start irrigation at 6:00 AM', priority: 'High' },
                { description: 'Monitor soil moisture post-irrigation', priority: 'Medium' }
            ],
            confidence: { score: 85, level: 'High' },
            economics: { cost: 150, benefit: 350, roi: 133.3 },
            sources: ['Soil sensors', 'Weather station', 'Crop model']
        });
    }

    static createRecommendationFromTemplate(template, data) {
        const recommendation = new RecommendationModel({
            title: template.title,
            category: template.category,
            priority: template.priority,
            type: template.type,
            ...data
        });

        // Add template actions
        if (template.actions) {
            template.actions.forEach(action => {
                recommendation.addAction(action);
            });
        }

        // Add template alternatives
        if (template.alternatives) {
            template.alternatives.forEach(alt => {
                recommendation.addAlternative(alt);
            });
        }

        return recommendation;
    }
}

window.RecommendationModel = RecommendationModel;