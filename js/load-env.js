/**
 * Environment Configuration Loader
 * Loads API keys and configuration from .env.local file
 * 
 * Usage:
 * 1. Create a .env.local file in the root directory (copy from .env.example)
 * 2. Add this script to your HTML before other scripts that use APIs:
 *    <script src="js/load-env.js"></script>
 */

class EnvironmentLoader {
    static async load() {
        try {
            // Try to fetch .env.local file
            const response = await fetch('.env.local');
            
            if (!response.ok) {
                console.log('[EnvironmentLoader] .env.local not found (optional). Using config.js defaults.');
                return;
            }

            const envContent = await response.text();
            const envVars = this.parseEnv(envContent);
            
            // Map environment variables to CONFIG and API Key Manager
            this.applyConfiguration(envVars);
            
            console.log('[EnvironmentLoader] ✓ Environment configuration loaded');
        } catch (error) {
            console.warn('[EnvironmentLoader] Could not load .env.local:', error.message);
            console.log('[EnvironmentLoader] Using default configuration from config.js');
        }
    }

    /**
     * Parse .env file content
     * @param {string} content - File content
     * @returns {Object} Parsed environment variables
     */
    static parseEnv(content) {
        const env = {};
        const lines = content.split('\n');

        lines.forEach(line => {
            // Skip comments and empty lines
            if (line.startsWith('#') || line.trim() === '') {
                return;
            }

            // Parse KEY=VALUE
            const [key, ...rest] = line.split('=');
            const value = rest.join('=').trim();

            if (key && value) {
                // Remove quotes if present
                const cleanValue = value
                    .replace(/^["']/, '')
                    .replace(/["']$/, '')
                    .trim();
                
                env[key.trim()] = cleanValue;
            }
        });

        return env;
    }

    /**
     * Apply parsed environment variables to configuration
     * @param {Object} env - Environment variables
     */
    static applyConfiguration(env) {
        // Update CONFIG object
        if (typeof CONFIG !== 'undefined') {
            // Weather API
            if (env.WEATHER_API_KEY) {
                CONFIG.API.WEATHER.KEY = env.WEATHER_API_KEY;
            }
            if (env.WEATHER_API_BASE_URL) {
                CONFIG.API.WEATHER.BASE_URL = env.WEATHER_API_BASE_URL;
            }

            // Market API
            if (env.MARKET_API_KEY) {
                CONFIG.API.MARKET.KEY = env.MARKET_API_KEY;
            }
            if (env.MARKET_API_BASE_URL) {
                CONFIG.API.MARKET.BASE_URL = env.MARKET_API_BASE_URL;
            }

            // Image API
            if (env.IMAGE_API_KEY) {
                CONFIG.API.IMAGE.KEY = env.IMAGE_API_KEY;
            }
            if (env.IMAGE_API_BASE_URL) {
                CONFIG.API.IMAGE.BASE_URL = env.IMAGE_API_BASE_URL;
            }

            // Soil API
            if (env.SOIL_API_BASE_URL) {
                CONFIG.API.SOIL.BASE_URL = env.SOIL_API_BASE_URL;
            }

            // Recommendation API
            if (env.RECOMMENDATION_API_BASE_URL) {
                CONFIG.API.RECOMMENDATION.BASE_URL = env.RECOMMENDATION_API_BASE_URL;
            }

            // Application settings
            if (env.APP_LANGUAGE) {
                CONFIG.APP.LANGUAGE = env.APP_LANGUAGE;
            }

            if (env.DARK_MODE_ENABLED !== undefined) {
                CONFIG.APP.DARK_MODE_ENABLED = env.DARK_MODE_ENABLED === 'true';
            }

            if (env.ENABLE_REAL_TIME !== undefined) {
                CONFIG.APP.ENABLE_REAL_TIME = env.ENABLE_REAL_TIME === 'true';
            }

            // Timeout settings
            if (env.WEATHER_TIMEOUT) {
                CONFIG.API.WEATHER.TIMEOUT = parseInt(env.WEATHER_TIMEOUT, 10);
            }
            if (env.MARKET_TIMEOUT) {
                CONFIG.API.MARKET.TIMEOUT = parseInt(env.MARKET_TIMEOUT, 10);
            }
            if (env.SOIL_TIMEOUT) {
                CONFIG.API.SOIL.TIMEOUT = parseInt(env.SOIL_TIMEOUT, 10);
            }
            if (env.RECOMMENDATION_TIMEOUT) {
                CONFIG.API.RECOMMENDATION.TIMEOUT = parseInt(env.RECOMMENDATION_TIMEOUT, 10);
            }
        }

        // Set API keys using API Key Manager if available
        if (typeof apiKeyManager !== 'undefined') {
            if (env.WEATHER_API_KEY) {
                apiKeyManager.setKey('weather', env.WEATHER_API_KEY, true);
            }
            if (env.MARKET_API_KEY) {
                apiKeyManager.setKey('market', env.MARKET_API_KEY, true);
            }
            if (env.IMAGE_API_KEY) {
                apiKeyManager.setKey('image', env.IMAGE_API_KEY, true);
            }
        }

        console.log('[EnvironmentLoader] Configuration applied from .env.local');
    }
}

// Auto-load environment configuration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        EnvironmentLoader.load();
    });
} else {
    // DOM is already loaded
    EnvironmentLoader.load();
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentLoader;
}
