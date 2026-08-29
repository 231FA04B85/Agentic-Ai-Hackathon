/**
 * Data Validators - Comprehensive Input Validation Utilities
 * Validates all data types used in the agricultural decision system
 */

class DataValidator {
    /**
     * Validate field data
     * @param {Object} data - Field data to validate
     * @returns {Object} Validation result
     */
    static validateField(data) {
        const errors = [];
        const warnings = [];

        // Required fields
        const required = ['name', 'cropType', 'plantingDate', 'area'];
        required.forEach(field => {
            if (!data[field]) {
                errors.push(`${field} is required`);
            }
        });

        // Area validation
        if (data.area !== undefined) {
            if (typeof data.area !== 'number' || data.area <= 0) {
                errors.push('Area must be a positive number');
            }
            if (data.area > 10000) {
                warnings.push('Area exceeds 10,000 hectares - verify input');
            }
        }

        // Date validation
        if (data.plantingDate) {
            const plantingDate = new Date(data.plantingDate);
            if (isNaN(plantingDate.getTime())) {
                errors.push('Invalid planting date');
            }
            if (plantingDate > new Date()) {
                warnings.push('Planting date is in the future');
            }
        }

        // Crop type validation
        const validCrops = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato', 'Rice', 'Cotton'];
        if (data.cropType && !validCrops.includes(data.cropType)) {
            warnings.push(`Unknown crop type: ${data.cropType}`);
        }

        // Soil type validation
        const validSoilTypes = ['Loam', 'Sandy', 'Clay', 'Silt', 'Peat', 'Chalk'];
        if (data.soilType && !validSoilTypes.includes(data.soilType)) {
            warnings.push(`Unknown soil type: ${data.soilType}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate crop data
     * @param {Object} data - Crop data to validate
     * @returns {Object} Validation result
     */
    static validateCrop(data) {
        const errors = [];
        const warnings = [];

        // Required fields
        const required = ['cropType', 'variety', 'plantingDate'];
        required.forEach(field => {
            if (!data[field]) {
                errors.push(`${field} is required`);
            }
        });

        // Growth stage validation
        const validStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
        if (data.growthStage && !validStages.includes(data.growthStage)) {
            warnings.push(`Unknown growth stage: ${data.growthStage}`);
        }

        // Health validation
        if (data.health !== undefined) {
            if (typeof data.health !== 'number' || data.health < 0 || data.health > 100) {
                errors.push('Health must be a number between 0 and 100');
            }
            if (data.health < 30) {
                warnings.push('Crop health is critically low');
            }
        }

        // Yield validation
        if (data.expectedYield !== undefined) {
            if (typeof data.expectedYield !== 'number' || data.expectedYield < 0) {
                errors.push('Expected yield must be a positive number');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate weather data
     * @param {Object} data - Weather data to validate
     * @returns {Object} Validation result
     */
    static validateWeather(data) {
        const errors = [];
        const warnings = [];

        // Required fields
        const required = ['temperature', 'humidity', 'condition'];
        required.forEach(field => {
            if (data[field] === undefined || data[field] === null) {
                errors.push(`${field} is required`);
            }
        });

        // Temperature validation
        if (data.temperature !== undefined) {
            if (typeof data.temperature !== 'number') {
                errors.push('Temperature must be a number');
            }
            if (data.temperature < -50 || data.temperature > 60) {
                errors.push('Temperature out of valid range (-50°C to 60°C)');
            }
            if (data.temperature > 40) {
                warnings.push('Extreme heat detected');
            }
            if (data.temperature < -5) {
                warnings.push('Freezing conditions detected');
            }
        }

        // Humidity validation
        if (data.humidity !== undefined) {
            if (typeof data.humidity !== 'number' || data.humidity < 0 || data.humidity > 100) {
                errors.push('Humidity must be a number between 0 and 100');
            }
            if (data.humidity > 90) {
                warnings.push('High humidity - disease risk');
            }
            if (data.humidity < 20) {
                warnings.push('Low humidity - drought risk');
            }
        }

        // Wind speed validation
        if (data.windSpeed !== undefined) {
            if (typeof data.windSpeed !== 'number' || data.windSpeed < 0) {
                errors.push('Wind speed must be a positive number');
            }
            if (data.windSpeed > 100) {
                warnings.push('Extreme wind speeds - storm risk');
            }
        }

        // Precipitation validation
        if (data.precipitation !== undefined) {
            if (typeof data.precipitation !== 'number' || data.precipitation < 0) {
                errors.push('Precipitation must be a positive number');
            }
            if (data.precipitation > 100) {
                warnings.push('Extreme rainfall - flood risk');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate soil data
     * @param {Object} data - Soil data to validate
     * @returns {Object} Validation result
     */
    static validateSoil(data) {
        const errors = [];
        const warnings = [];

        // Required fields
        const required = ['moisture', 'ph'];
        required.forEach(field => {
            if (data[field] === undefined || data[field] === null) {
                errors.push(`${field} is required`);
            }
        });

        // Moisture validation
        if (data.moisture !== undefined) {
            if (typeof data.moisture !== 'number' || data.moisture < 0 || data.moisture > 100) {
                errors.push('Moisture must be a number between 0 and 100');
            }
            if (data.moisture < 20) {
                warnings.push('Critical moisture levels - immediate irrigation needed');
            }
            if (data.moisture > 85) {
                warnings.push('Excess moisture - waterlogging risk');
            }
        }

        // pH validation
        if (data.ph !== undefined) {
            if (typeof data.ph !== 'number' || data.ph < 0 || data.ph > 14) {
                errors.push('pH must be a number between 0 and 14');
            }
            if (data.ph < 5.5 || data.ph > 7.5) {
                warnings.push('pH outside optimal range for most crops (6.0-7.0)');
            }
        }

        // NPK validation
        if (data.npk) {
            ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
                if (data.npk[nutrient] !== undefined) {
                    if (typeof data.npk[nutrient] !== 'number' || data.npk[nutrient] < 0) {
                        errors.push(`${nutrient} must be a positive number`);
                    }
                }
            });
        }

        // EC validation
        if (data.ec !== undefined) {
            if (typeof data.ec !== 'number' || data.ec < 0) {
                errors.push('EC must be a positive number');
            }
            if (data.ec > 1.5) {
                warnings.push('High EC - salinity risk');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate image file
     * @param {File} file - Image file to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateImage(file, options = {}) {
        const errors = [];
        const warnings = [];

        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors: errors, warnings: warnings };
        }

        // File size validation
        const maxSize = options.maxSize || 20 * 1024 * 1024; // 20MB default
        if (file.size > maxSize) {
            errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        }

        // File type validation
        const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            errors.push(`Unsupported file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        // Image dimensions (basic check)
        if (options.checkDimensions) {
            // This would require loading the image to check dimensions
            // Implemented as needed
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate recommendation data
     * @param {Object} data - Recommendation data to validate
     * @returns {Object} Validation result
     */
    static validateRecommendation(data) {
        const errors = [];
        const warnings = [];

        // Required fields
        const required = ['title', 'category', 'priority'];
        required.forEach(field => {
            if (!data[field]) {
                errors.push(`${field} is required`);
            }
        });

        // Category validation
        const validCategories = ['irrigation', 'fertilization', 'pest_control', 'harvest', 'weather_advisory', 'sustainability'];
        if (data.category && !validCategories.includes(data.category)) {
            warnings.push(`Unknown category: ${data.category}`);
        }

        // Priority validation
        const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
        if (data.priority && !validPriorities.includes(data.priority)) {
            warnings.push(`Unknown priority: ${data.priority}`);
        }

        // Confidence validation
        if (data.confidence !== undefined) {
            if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
                errors.push('Confidence must be a number between 0 and 100');
            }
            if (data.confidence < 30) {
                warnings.push('Low confidence recommendation');
            }
        }

        // Actions validation
        if (data.actions && !Array.isArray(data.actions)) {
            errors.push('Actions must be an array');
        }

        if (data.actions && data.actions.length === 0) {
            warnings.push('No actions specified for recommendation');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validate user input for forms
     * @param {Object} data - Form data to validate
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result
     */
    static validateForm(data, schema) {
        const errors = {};
        const warnings = {};

        Object.keys(schema).forEach(field => {
            const rules = schema[field];
            const value = data[field];

            // Required check
            if (rules.required && (!value || value === '')) {
                errors[field] = `${field} is required`;
                return;
            }

            // Type check
            if (value && rules.type) {
                const validType = this.checkType(value, rules.type);
                if (!validType) {
                    errors[field] = `${field} must be of type ${rules.type}`;
                    return;
                }
            }

            // Min/max checks
            if (value !== undefined && value !== null && value !== '') {
                if (rules.min !== undefined && value < rules.min) {
                    errors[field] = `${field} must be at least ${rules.min}`;
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors[field] = `${field} must be at most ${rules.max}`;
                }
            }

            // Pattern check
            if (value && rules.pattern && !rules.pattern.test(value)) {
                errors[field] = `${field} has invalid format`;
            }

            // Enum check
            if (value && rules.enum && !rules.enum.includes(value)) {
                errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
            }
        });

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Check value type
     * @param {*} value - Value to check
     * @param {string} type - Expected type
     * @returns {boolean} Whether value matches type
     */
    static checkType(value, type) {
        switch (type) {
            case 'string': return typeof value === 'string';
            case 'number': return typeof value === 'number' && !isNaN(value);
            case 'boolean': return typeof value === 'boolean';
            case 'date': return value instanceof Date && !isNaN(value.getTime());
            case 'array': return Array.isArray(value);
            case 'object': return typeof value === 'object' && !Array.isArray(value);
            default: return true;
        }
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Whether phone is valid
     */
    static validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} Whether URL is valid
     */
    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Validation result
     */
    static validateCoordinates(lat, lng) {
        const errors = [];

        if (typeof lat !== 'number' || lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (typeof lng !== 'number' || lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate data range
     * @param {number} value - Value to check
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} fieldName - Field name for error message
     * @returns {Object} Validation result
     */
    static validateRange(value, min, max, fieldName = 'Value') {
        const errors = [];

        if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${fieldName} must be a number`);
        } else if (value < min || value > max) {
            errors.push(`${fieldName} must be between ${min} and ${max}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Sanitize input data
     * @param {*} data - Data to sanitize
     * @returns {*} Sanitized data
     */
    static sanitize(data) {
        if (typeof data === 'string') {
            // Remove HTML tags, trim, and prevent XSS
            return data
                .replace(/<[^>]*>/g, '')
                .trim()
                .slice(0, 5000); // Limit length
        }
        
        if (typeof data === 'number') {
            return isNaN(data) ? 0 : data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitize(item));
        }

        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = this.sanitize(data[key]);
            });
            return sanitized;
        }

        return data;
    }

    /**
     * Validate field coordinates for mapping
     * @param {Array} coordinates - Array of coordinates
     * @returns {Object} Validation result
     */
    static validateFieldCoordinates(coordinates) {
        const errors = [];

        if (!Array.isArray(coordinates) || coordinates.length < 3) {
            errors.push('Field must have at least 3 coordinate points');
            return { valid: false, errors: errors };
        }

        coordinates.forEach((coord, index) => {
            if (!Array.isArray(coord) || coord.length !== 2) {
                errors.push(`Coordinate ${index} must be [lat, lng]`);
                return;
            }

            const [lat, lng] = coord;
            if (typeof lat !== 'number' || lat < -90 || lat > 90) {
                errors.push(`Coordinate ${index} has invalid latitude: ${lat}`);
            }
            if (typeof lng !== 'number' || lng < -180 || lng > 180) {
                errors.push(`Coordinate ${index} has invalid longitude: ${lng}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    static validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate crop rotation plan
     * @param {Array} crops - Array of crops in rotation
     * @returns {Object} Validation result
     */
    static validateCropRotation(crops) {
        const errors = [];
        const warnings = [];

        if (!Array.isArray(crops) || crops.length < 2) {
            errors.push('Rotation must include at least 2 crops');
        }

        // Check for consecutive same crops
        for (let i = 1; i < crops.length; i++) {
            if (crops[i] === crops[i-1]) {
                warnings.push(`Consecutive ${crops[i]} crops - consider diversifying rotation`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
}

// Export for use in other files
window.DataValidator = DataValidator;