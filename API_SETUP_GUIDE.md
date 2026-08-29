# API Configuration Guide

## Overview

This guide explains how to configure and use API keys for all external services in the Smart Agriculture Decision Agent application.

## API Key Manager

The application includes a centralized **API Key Manager** (`api-key-manager.js`) that handles:
- Loading API keys from localStorage
- Validating API keys
- Managing multiple service APIs
- Secure key storage

## Available APIs

### 1. Weather API (OpenWeatherMap)

**Service:** Weather data, forecasts, and agricultural metrics

**Status:** ✅ Requires API Key

**Configuration:**
1. Get a free API key from: https://openweathermap.org/api
2. Use one of these methods to set it:

**Method A: Using the API Key Manager (Recommended)**
```javascript
// Open browser console and run:
apiKeyManager.setKey('weather', 'YOUR_OPENWEATHERMAP_API_KEY');
```

**Method B: Update config.js**
```javascript
CONFIG.API.WEATHER.KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
```

**Method C: Environment File (see .env.example)**
```
WEATHER_API_KEY=YOUR_OPENWEATHERMAP_API_KEY
```

**Features:**
- Current weather conditions
- 7-day forecast
- Agricultural weather metrics
- Growing Degree Days calculation
- Evapotranspiration estimation
- Heat stress warnings
- Frost warnings

**API Endpoints Used:**
- `/weather` - Current weather
- `/forecast` - Weather forecast

### 2. Market API

**Service:** Commodity prices, trends, and market analysis

**Status:** 📊 Optional (Uses sample data if not configured)

**Configuration:**
1. Get API key from your market data provider
2. Set using API Key Manager:
```javascript
apiKeyManager.setKey('market', 'YOUR_MARKET_API_KEY');
```

**Features:**
- Commodity price data
- Price trends (30-day historical)
- Price forecasts
- Market analysis
- Breakeven analysis for crops
- Profit margin calculations

**Note:** If no API key is provided, the application uses realistic sample data.

### 3. Soil API (Local)

**Service:** Soil sensor readings, irrigation management, soil analysis

**Status:** 🏠 Local Service (No API key needed)

**Requirements:**
- Local backend service running on `http://localhost:5000/api/v1`
- If not available, uses generated sample data

**Configuration:**
```javascript
CONFIG.API.SOIL.BASE_URL = 'http://your-soil-api:5000/api/v1';
```

**Features:**
- Real-time soil moisture readings
- Temperature monitoring
- NPK (Nitrogen, Phosphorus, Potassium) levels
- Soil pH analysis
- Electrical conductivity
- Water stress assessment
- Irrigation recommendations
- Historical data tracking

**API Endpoints:**
- `/soil/readings` - Current readings
- `/soil/analysis` - Soil analysis data
- `/soil/irrigation` - Irrigation recommendations
- `/soil/sensors` - Sensor information
- `/soil/history` - Historical data

### 4. Image API

**Service:** Image processing and crop analysis

**Status:** 📷 Optional (For future use)

**Configuration:**
```javascript
apiKeyManager.setKey('image', 'YOUR_IMAGE_API_KEY');
```

**Features:**
- Crop disease detection
- Pest identification
- Crop health analysis
- Phenotype assessment

### 5. Recommendation API (Local)

**Service:** AI-powered farm recommendations

**Status:** 🏠 Local Service (No API key needed)

**Requirements:**
- Local backend service running on `http://localhost:5000/api/v1`

**Configuration:**
```javascript
CONFIG.API.RECOMMENDATION.BASE_URL = 'http://your-recommendation-api:5000/api/v1';
```

**Features:**
- Integrated recommendations
- Recommendation explanations
- Feedback collection
- Recommendation history
- Status tracking

## How to Set API Keys

### Option 1: Browser Console (Temporary - Per Session)
```javascript
// Open Developer Tools (F12) → Console tab and run:
apiKeyManager.setKey('weather', 'YOUR_API_KEY');
apiKeyManager.setKey('market', 'YOUR_API_KEY');

// Verify configuration:
apiKeyManager.getStatus();

// Export current configuration:
console.log(apiKeyManager.exportConfig());
```

### Option 2: Edit config.js (Permanent)
Edit `js/config.js` and replace:
```javascript
CONFIG.API.WEATHER.KEY = 'YOUR_API_KEY_HERE';
CONFIG.API.MARKET.KEY = 'YOUR_API_KEY_HERE';
```

### Option 3: localStorage (Persistent Per Browser)
The API Key Manager automatically saves keys to localStorage when using:
```javascript
apiKeyManager.setKey('weather', 'YOUR_KEY', true); // true = persist
```

## Managing API Keys

### Check Current Status
```javascript
// Get status of all APIs
const status = apiKeyManager.getStatus();
console.log(status);

// Output example:
// {
//   "weather": { "configured": true, "validated": false },
//   "market": { "configured": false, "validated": false },
//   "soil": { "configured": true, "validated": false },
//   ...
// }
```

### Get Configured Services
```javascript
const services = apiKeyManager.getConfiguredServices();
console.log('Configured services:', services);
```

### Validate API Keys
```javascript
// Validate specific API
const isValid = await apiKeyManager.validateKey('weather');
console.log('Weather API valid:', isValid);
```

### Clear API Keys
```javascript
// Clear specific service
apiKeyManager.clearKey('weather');

// Clear all keys
apiKeyManager.clearAll();
```

## Troubleshooting

### Weather API Issues

**Error: "API key not configured"**
- Set the API key using one of the methods above
- Verify the key is correct: https://openweathermap.org/api

**Error: "401 Unauthorized"**
- API key is invalid or expired
- Generate a new key from OpenWeatherMap dashboard

**Error: "429 Too Many Requests"**
- API rate limit exceeded
- Wait before making more requests
- Consider upgrading your OpenWeatherMap plan

**Fallback Data:** If API fails, the app returns sample data automatically

### Market API Issues

**No API Key:**
- Application uses realistic sample market data
- Real API data will be used if key is configured

### Soil API Issues

**Connection Failed:**
- Check if local backend is running on `http://localhost:5000`
- Application falls back to sample soil data if service unavailable

**Solution:** Start your local soil API service
```bash
# Example (adjust for your setup):
python server.py  # or appropriate command
```

### LocalStorage Issues

**Keys not persisting:**
- Browser may have disabled localStorage
- Check browser privacy/storage settings
- Try private/incognito mode

**Clear localStorage:**
```javascript
localStorage.clear(); // Clears all data
apiKeyManager.clearAll(); // Clears only API keys
```

## Security Best Practices

⚠️ **WARNING:** Never commit API keys to version control!

### Do's ✅
- Use environment variables for sensitive keys
- Use browser console to set keys (not stored in code)
- Use `.gitignore` for any local config files with keys
- Regenerate keys if accidentally exposed

### Don'ts ❌
- Don't hardcode API keys in source files
- Don't commit .env files or config.js with real keys
- Don't share API keys in pull requests or issues
- Don't expose keys in error messages

## Environment File Setup

Create a `.env.local` file (not tracked by git):
```
WEATHER_API_KEY=sk-xxxxxxxxxxxx
MARKET_API_KEY=your_market_key
```

Then load in your HTML:
```html
<script src="js/load-env.js"></script>
```

## Testing API Configuration

### 1. Check Console Logs
Open browser console (F12) to see API configuration logs with 🟢 ✅ success indicators

### 2. Test Weather API
```javascript
const weatherAPI = new WeatherAPI();
weatherAPI.getCurrentWeather(40.7128, -74.0060).then(data => {
    console.log('Weather data:', data);
});
```

### 3. Test Market API
```javascript
const marketAPI = new MarketAPI();
marketAPI.getCurrentPrices().then(data => {
    console.log('Market prices:', data);
});
```

### 4. Test Soil API
```javascript
const soilAPI = new SoilAPI();
soilAPI.getSoilReadings('field-001').then(data => {
    console.log('Soil readings:', data);
});
```

## API Monitoring

Check real-time status in the browser console:
```javascript
// See masked API keys and configuration
console.log(apiKeyManager.exportConfig());

// Monitor API health
const status = apiKeyManager.getStatus();
Object.entries(status).forEach(([service, info]) => {
    console.log(`${service}: ${info.configured ? '✅' : '❌'}`);
});
```

## Support

For issues:
1. Check browser console (F12) for error messages
2. Verify API keys are correct
3. Confirm services are running (for local APIs)
4. Check network connectivity
5. Refer to individual API documentation

## Additional Resources

- **OpenWeatherMap API:** https://openweathermap.org/api
- **API Documentation:** Check individual API provider websites
- **Browser Console Debugging:** Press F12 → Console tab
- **Local Backend Setup:** See backend/README.md

---

Last Updated: 2026-08-29
