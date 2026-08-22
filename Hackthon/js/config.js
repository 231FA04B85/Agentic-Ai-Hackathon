const CONFIG = {
    API: {
        WEATHER: {
            BASE_URL: 'https://api.openweathermap.org/data/2.5',
            KEY: 'YOUR_API_KEY_HERE',
            ENDPOINTS: { CURRENT: '/weather', FORECAST: '/forecast' }
        },
        MARKET: {
            BASE_URL: 'https://api.commoditymarket.com/v1',
            KEY: 'YOUR_API_KEY_HERE',
            ENDPOINTS: { PRICES: '/prices', TRENDS: '/trends' }
        },
        RECOMMENDATION: {
            BASE_URL: 'http://localhost:5000/api/v1',
            ENDPOINTS: { GENERATE: '/recommendations/generate', FEEDBACK: '/recommendations/feedback' }
        }
    },
    APP: {
        NAME: 'AI Smart Agriculture Decision Agent',
        VERSION: '1.0.0',
        UPDATE_INTERVAL: 300000,
        MAX_UPLOAD_SIZE: 20 * 1024 * 1024,
        SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/tiff'],
        LANGUAGE: 'en',
        DARK_MODE_ENABLED: true,
        ENABLE_REAL_TIME: true
    },
    DEFAULTS: {
        CROP_TYPES: ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato', 'Rice', 'Cotton'],
        GROWTH_STAGES: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'],
        SOIL_TYPES: ['Sandy', 'Silt', 'Clay', 'Loam', 'Peat'],
        IRRIGATION_TYPES: ['Drip', 'Sprinkler', 'Flood', 'Furrow']
    },
    CHART: {
        COLORS: {
            primary: '#2E7D32',
            secondary: '#1565C0',
            warning: '#F57C00',
            danger: '#C62828',
            success: '#2E7D32'
        }
    },
    NOTIFICATIONS: {
        TYPES: { INFO: 'info', SUCCESS: 'success', WARNING: 'warning', ERROR: 'error' },
        DURATION: 5000,
        MAX_STORED: 100
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}