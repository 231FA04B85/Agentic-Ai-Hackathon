# Smart Agriculture API Configuration Summary

## Quick Start

### 1. **Get API Keys**
- OpenWeatherMap: https://openweathermap.org/api (FREE)
- Market API: Check your provider's documentation

### 2. **Configure Keys (Choose One Method)**

**Option A: Browser Console (Recommended for Testing)**
```javascript
// Open browser DevTools (F12) → Console tab
apiKeyManager.setKey('weather', 'YOUR_OPENWEATHERMAP_KEY');
apiKeyManager.getStatus(); // Verify
```

**Option B: config.js (Edit directly)**
```javascript
CONFIG.API.WEATHER.KEY = 'YOUR_OPENWEATHERMAP_KEY';
CONFIG.API.MARKET.KEY = 'YOUR_MARKET_KEY';
```

**Option C: Environment File (Recommended for Production)**
1. Copy `.env.example` to `.env.local`
2. Fill in your API keys
3. Add to HTML: `<script src="js/load-env.js"></script>`

### 3. **Test Configuration**
```javascript
// Verify keys are configured
apiKeyManager.getConfiguredServices();

// Test Weather API
const weatherAPI = new WeatherAPI();
weatherAPI.getCurrentWeather().then(data => console.log(data));
```

## File Structure

```
Hackthon/
├── js/
│   ├── api-key-manager.js       ← NEW: Centralized key management
│   ├── load-env.js              ← NEW: Environment file loader
│   ├── config.js                ← UPDATED: Added all API configs
│   ├── api/
│   │   ├── weather-api.js       ← UPDATED: Uses API key manager
│   │   ├── market-api.js        ← UPDATED: Uses API key manager
│   │   ├── soil-api.js          ← UPDATED: Enhanced with retry logic
│   │   ├── image-api.js         ← UPDATED: Uses API key manager
│   │   └── recommendation-api.js ← LOCAL: No key needed
│   └── ...
├── API_SETUP_GUIDE.md           ← NEW: Complete setup guide
├── .env.example                 ← NEW: Environment template
├── .gitignore                   ← NEW/UPDATED: Prevents key commits
└── ...
```

## API Reference

### Weather API ✅ (Requires Key)
```javascript
const weatherAPI = new WeatherAPI();

// Current weather
const current = await weatherAPI.getCurrentWeather(lat, lon);

// Forecast
const forecast = await weatherAPI.getWeatherForecast(lat, lon, 7);

// Agricultural metrics
const agriWeather = await weatherAPI.getAgriculturalWeather(lat, lon, 'Wheat');
```

### Market API 📊 (Optional - Uses Sample Data)
```javascript
const marketAPI = new MarketAPI();

// Price data
const prices = await marketAPI.getCurrentPrices(['Wheat', 'Corn']);

// Trends
const trends = await marketAPI.getPriceTrends('Wheat', 30);

// Forecast
const forecast = await marketAPI.getPriceForecast('Wheat', 30);
```

### Soil API 🏠 (Local - No Key Needed)
```javascript
const soilAPI = new SoilAPI();

// Soil readings
const readings = await soilAPI.getSoilReadings('field-001');

// Analysis
const analysis = await soilAPI.getSoilAnalysis('field-001');

// Irrigation recommendations
const irrigation = await soilAPI.getIrrigationRecommendation('field-001');

// Water stress
const stress = await soilAPI.getWaterStressAssessment('field-001');
```

### Recommendation API 🏠 (Local - No Key Needed)
```javascript
// Requires local backend running on localhost:5000
```

## Security Checklist

- ✅ Never commit `.env.local` to git
- ✅ Use `.env.example` as template only
- ✅ Regenerate keys if exposed
- ✅ Use browser console for testing (keys not in code)
- ✅ Review .gitignore regularly

## Features

### ✅ API Key Manager
- Centralized key management
- localStorage persistence
- Key validation
- Multiple service support
- Security masking

### ✅ Retry Logic
- Automatic retry on failure
- Exponential backoff
- Configurable retry count
- Timeout handling

### ✅ Caching
- Response caching
- TTL (Time To Live) support
- Cache invalidation
- Reduces API calls

### ✅ Fallback Data
- Sample data when API unavailable
- Graceful degradation
- Consistent user experience

### ✅ Error Handling
- Comprehensive error messages
- Console logging with prefixes
- Validation before API calls
- Helpful troubleshooting info

## Troubleshooting

### "API key not configured"
→ Run: `apiKeyManager.setKey('weather', 'YOUR_KEY')`

### "401 Unauthorized"
→ Check API key validity at service provider

### "Connection refused" (Soil/Recommendation API)
→ Start local backend: `python server.py`

### "429 Too Many Requests"
→ API rate limit exceeded. Wait and retry.

### Keys not persisting
→ Check browser localStorage settings
→ Try: `localStorage.setItem('test', 'value')`

## Monitoring

```javascript
// Check system status
const status = apiKeyManager.getStatus();

// View configuration
const config = apiKeyManager.exportConfig();

// Validate services
Object.keys(status).forEach(async service => {
    const isValid = await apiKeyManager.validateKey(service);
    console.log(`${service}: ${isValid ? '✅' : '❌'}`);
});
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `WEATHER_API_KEY` | OpenWeatherMap API key | Yes | `sk_key_...` |
| `MARKET_API_KEY` | Market data API key | No | `market_key_...` |
| `IMAGE_API_KEY` | Image processing API key | No | `img_key_...` |
| `WEATHER_TIMEOUT` | Weather API timeout (ms) | No | `10000` |
| `SOIL_API_BASE_URL` | Local soil API URL | No | `http://localhost:5000/api/v1` |
| `RECOMMENDATION_API_BASE_URL` | Local recommendation API | No | `http://localhost:5000/api/v1` |

## Support Resources

- **OpenWeatherMap Docs:** https://openweathermap.org/api
- **Browser DevTools:** Press `F12` for console
- **Setup Guide:** See `API_SETUP_GUIDE.md`
- **Configuration File:** See `js/config.js`

## Next Steps

1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Get OpenWeatherMap API key
3. ✅ Set key using preferred method
4. ✅ Test using console commands
5. ✅ Deploy with environment configuration

---

**Version:** 1.0  
**Last Updated:** 2026-08-29  
**Status:** Production Ready ✅
