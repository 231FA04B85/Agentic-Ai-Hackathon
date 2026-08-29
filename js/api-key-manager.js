/**
 * API Key Manager
 * Centralized management of API keys with validation and security features
 * Supports loading from environment variables, localStorage, or config file
 */

class APIKeyManager {
    constructor() {
        this.keys = {};
        this.validated = {};
        this.initialized = false;
    }

    /**
     * Initialize API Key Manager
     * Load keys from localStorage, environment, or config
     */
    initialize() {
        if (this.initialized) return;

        // First, try to load from localStorage (user-provided keys)
        this.loadFromLocalStorage();
        
        // Then merge with CONFIG defaults (from config.js)
        this.mergeWithConfig();
        
        this.initialized = true;
        console.log('[APIKeyManager] Initialized with available API keys');
        return this;
    }

    /**
     * Load API keys from localStorage
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('apiKeys');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.keys = { ...this.keys, ...parsed };
                console.log('[APIKeyManager] Loaded keys from localStorage');
            }
        } catch (error) {
            console.warn('[APIKeyManager] Failed to load from localStorage:', error);
        }
    }

    /**
     * Merge with CONFIG object from config.js
     */
    mergeWithConfig() {
        if (typeof CONFIG !== 'undefined' && CONFIG.API) {
            const configKeys = {
                weather: CONFIG.API.WEATHER?.KEY,
                market: CONFIG.API.MARKET?.KEY,
                soil: CONFIG.API.SOIL?.KEY,
                image: CONFIG.API.IMAGE?.KEY,
                recommendation: CONFIG.API.RECOMMENDATION?.KEY
            };
            
            Object.entries(configKeys).forEach(([service, key]) => {
                if (key && !this.keys[service]) {
                    this.keys[service] = key;
                }
            });
        }
    }

    /**
     * Set API key for a service
     * @param {string} service - Service name (weather, market, soil, image, etc.)
     * @param {string} key - API key
     * @param {boolean} persist - Whether to persist to localStorage
     */
    setKey(service, key, persist = true) {
        if (!key || typeof key !== 'string') {
            throw new Error(`Invalid API key for ${service}`);
        }
        
        this.keys[service] = key;
        this.validated[service] = false; // Reset validation status
        
        if (persist) {
            this.saveToLocalStorage();
        }
        
        console.log(`[APIKeyManager] API key set for ${service}`);
        return this;
    }

    /**
     * Get API key for a service
     * @param {string} service - Service name
     * @param {boolean} required - Whether the key is required
     * @returns {string|null} API key or null if not found
     */
    getKey(service, required = true) {
        const key = this.keys[service];
        
        if (!key && required) {
            console.warn(`[APIKeyManager] Missing required API key for: ${service}`);
            throw new Error(`API key not configured for ${service}. Please set it using setKey() or configure in settings.`);
        }
        
        return key || null;
    }

    /**
     * Check if API key is configured
     * @param {string} service - Service name
     * @returns {boolean} True if key is configured and not a placeholder
     */
    hasKey(service) {
        const key = this.keys[service];
        return !!(key && key !== 'YOUR_API_KEY_HERE' && key !== 'YOUR_API_KEY');
    }

    /**
     * Validate API key (perform a test call to verify the key works)
     * @param {string} service - Service name
     * @returns {Promise<boolean>} True if validation passes
     */
    async validateKey(service) {
        if (this.validated[service]) {
            return true; // Already validated in this session
        }

        const key = this.getKey(service, false);
        if (!key) {
            console.warn(`[APIKeyManager] No key to validate for ${service}`);
            return false;
        }

        try {
            const result = await this.performValidation(service, key);
            this.validated[service] = result;
            
            if (result) {
                console.log(`[APIKeyManager] ✓ API key validated for ${service}`);
            } else {
                console.warn(`[APIKeyManager] ✗ API key validation failed for ${service}`);
            }
            
            return result;
        } catch (error) {
            console.error(`[APIKeyManager] Validation error for ${service}:`, error.message);
            this.validated[service] = false;
            return false;
        }
    }

    /**
     * Perform service-specific validation
     * @private
     */
    async performValidation(service, key) {
        try {
            switch (service) {
                case 'weather':
                    return await this.validateWeatherKey(key);
                case 'market':
                    return await this.validateMarketKey(key);
                case 'image':
                    return await this.validateImageKey(key);
                default:
                    return true; // Skip validation for unknown services
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate OpenWeatherMap API key
     * @private
     */
    async validateWeatherKey(key) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}`;
        const response = await fetch(url);
        return response.status === 200;
    }

    /**
     * Validate Market API key (if applicable)
     * @private
     */
    async validateMarketKey(key) {
        // Most market APIs require specific endpoints, add your validation here
        return true; // Placeholder
    }

    /**
     * Validate Image API key (if applicable)
     * @private
     */
    async validateImageKey(key) {
        // Add service-specific validation here
        return true; // Placeholder
    }

    /**
     * Save API keys to localStorage
     */
    saveToLocalStorage() {
        try {
            // Only save non-placeholder keys
            const keysToSave = {};
            Object.entries(this.keys).forEach(([service, key]) => {
                if (key && key !== 'YOUR_API_KEY_HERE' && key !== 'YOUR_API_KEY') {
                    keysToSave[service] = key;
                }
            });
            
            localStorage.setItem('apiKeys', JSON.stringify(keysToSave));
            console.log('[APIKeyManager] Keys saved to localStorage');
        } catch (error) {
            console.error('[APIKeyManager] Failed to save to localStorage:', error);
        }
    }

    /**
     * Clear all stored API keys
     */
    clearAll() {
        this.keys = {};
        this.validated = {};
        try {
            localStorage.removeItem('apiKeys');
            console.log('[APIKeyManager] All API keys cleared');
        } catch (error) {
            console.error('[APIKeyManager] Failed to clear localStorage:', error);
        }
    }

    /**
     * Clear API key for specific service
     * @param {string} service - Service name
     */
    clearKey(service) {
        delete this.keys[service];
        delete this.validated[service];
        this.saveToLocalStorage();
        console.log(`[APIKeyManager] API key cleared for ${service}`);
    }

    /**
     * Get all configured services
     * @returns {Array} List of services with configured keys
     */
    getConfiguredServices() {
        return Object.entries(this.keys)
            .filter(([_, key]) => key && key !== 'YOUR_API_KEY_HERE' && key !== 'YOUR_API_KEY')
            .map(([service]) => service);
    }

    /**
     * Get status of all APIs
     * @returns {Object} Status report of all API configurations
     */
    getStatus() {
        const services = ['weather', 'market', 'soil', 'image', 'recommendation'];
        const status = {};

        services.forEach(service => {
            status[service] = {
                configured: this.hasKey(service),
                validated: this.validated[service] || false
            };
        });

        return status;
    }

    /**
     * Export current configuration
     * @returns {Object} Current configuration (excluding actual keys)
     */
    exportConfig() {
        const config = {};
        Object.entries(this.keys).forEach(([service, key]) => {
            config[service] = {
                configured: !!key,
                keyLength: key ? key.length : 0,
                masked: key ? key.substring(0, 3) + '...' + key.substring(key.length - 3) : 'NOT_SET'
            };
        });
        return config;
    }
}

// Create global instance
const apiKeyManager = new APIKeyManager();

// Auto-initialize when available
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        apiKeyManager.initialize();
    });
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyManager;
}
