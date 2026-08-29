# API Integration Verification Guide

## Quick Verification Checklist

Use this guide to verify that all APIs are properly configured and working.

### ✅ Step 1: Verify API Key Manager

**In browser console (F12):**

```javascript
// Should return true if initialized
apiKeyManager.initialized

// Should show configuration status
apiKeyManager.getStatus()

// Example output:
// {
//   "weather": { "configured": false, "validated": false },
//   "market": { "configured": false, "validated": false },
//   "soil": { "configured": true, "validated": false },
//   "image": { "configured": false, "validated": false },
//   "recommendation": { "configured": true, "validated": false }
// }
```

**Expected Result:** ✅ Should output status of all services

---

### ✅ Step 2: Check Configuration

```javascript
// View masked configuration
apiKeyManager.exportConfig()

// Example output:
// {
//   "weather": {
//     "configured": false,
//     "keyLength": 18,
//     "masked": "YOU...HERE"
//   }
// }
```

**Expected Result:** ✅ Should show configuration without exposing full keys

---

### ✅ Step 3: Get List of Configured Services

```javascript
// List all services with API keys configured
apiKeyManager.getConfiguredServices()

// Example output: ["soil", "recommendation"]
```

**Expected Result:** ✅ Should list services with configured keys

---

### ✅ Step 4: Set Weather API Key

**Get your free key:**
1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Get your API key

**Set in browser:**

```javascript
// Set API key
apiKeyManager.setKey('weather', 'YOUR_OPENWEATHERMAP_API_KEY')

// Verify it was set
apiKeyManager.hasKey('weather')  // Should return true

// Check configuration
apiKeyManager.getStatus()  // Should show weather: configured = true
```

**Expected Result:** ✅ `hasKey('weather')` returns `true`

---

### ✅ Step 5: Validate Weather API Key

```javascript
// Validate the key with OpenWeatherMap
const isValid = await apiKeyManager.validateKey('weather')

console.log('Weather API valid:', isValid)  // Should be true
```

**Expected Result:** ✅ Should return `true` if key is correct

---

### ✅ Step 6: Test Weather API

```javascript
// Create Weather API instance
const weatherAPI = new WeatherAPI()

// Test current weather
weatherAPI.getCurrentWeather()
    .then(data => {
        console.log('✅ Weather data received:')
        console.log(data)
    })
    .catch(error => {
        console.error('❌ Weather API error:', error)
    })

// Test forecast
weatherAPI.getWeatherForecast()
    .then(data => {
        console.log('✅ Forecast received:')
        console.log(data)
    })
    .catch(error => {
        console.error('❌ Forecast error:', error)
    })
```

**Expected Result:** ✅ Should return weather data (not fallback data)

---

### ✅ Step 7: Test Market API

```javascript
// Create Market API instance
const marketAPI = new MarketAPI()

// Test prices
marketAPI.getCurrentPrices(['Wheat', 'Corn', 'Soybean'])
    .then(data => {
        console.log('✅ Market prices received:')
        console.log(data)
    })
    .catch(error => {
        console.error('❌ Market API error:', error)
    })
```

**Expected Result:** ✅ Should return price data (may be sample data if no API key)

---

### ✅ Step 8: Test Soil API

```javascript
// Create Soil API instance
const soilAPI = new SoilAPI()

// Test soil readings
soilAPI.getSoilReadings('field-001')
    .then(data => {
        console.log('✅ Soil readings received:')
        console.log(data)
    })
    .catch(error => {
        console.error('❌ Soil API error:', error)
    })

// Test irrigation recommendation
soilAPI.getIrrigationRecommendation('field-001')
    .then(data => {
        console.log('✅ Irrigation recommendation received:')
        console.log(data)
    })
    .catch(error => {
        console.error('❌ Irrigation API error:', error)
    })
```

**Expected Result:** ✅ Should return soil data (sample or real based on local API)

---

### ✅ Step 9: Check Console Logs

**Look for these in browser console:**

```
[APIKeyManager] Initialized with available API keys
[APIKeyManager] API key set for weather
[WeatherAPI] ✓ Current weather data fetched successfully
[MarketAPI] ✓ Price data fetched successfully
[SoilAPI] ✓ Soil readings fetched successfully
```

**Expected Result:** ✅ Should see success indicators (✓) not error indicators (✗)

---

### ✅ Step 10: Monitor Cache

```javascript
// Check if caching is working
// Make two API calls quickly, second should use cache

const weatherAPI = new WeatherAPI()

// First call - goes to API
console.log('Call 1...')
await weatherAPI.getCurrentWeather()

// Second call - should use cache
console.log('Call 2...')
await weatherAPI.getCurrentWeather()  // Check console - should say "Returning cached data"
```

**Expected Result:** ✅ Second call should use cache (faster, no API call)

---

## Troubleshooting Tests

### Test 1: Missing API Key

```javascript
// Attempt to use API without key
apiKeyManager.clearKey('weather')

const weatherAPI = new WeatherAPI()
weatherAPI.getCurrentWeather()
    .then(data => console.log(data))
    .catch(error => {
        console.log('✅ Expected error:', error.message)
        // Should show error about missing API key
    })
```

**Expected Result:** ✅ Should show helpful error message

---

### Test 2: Invalid API Key

```javascript
// Set invalid key
apiKeyManager.setKey('weather', 'INVALID_KEY_12345')

const weatherAPI = new WeatherAPI()
weatherAPI.getCurrentWeather()
    .then(data => console.log('Fallback data:', data))
    .catch(error => console.error('Error:', error.message))

// Should either error or return fallback data
```

**Expected Result:** ✅ Should handle gracefully (error or fallback)

---

### Test 3: Retry Logic

```javascript
// Test retry logic by checking console logs
const marketAPI = new MarketAPI()
marketAPI.getCurrentPrices()

// Watch console - if connection fails, should see:
// [MarketAPI] Retry 1/3
// [MarketAPI] Retry 2/3
// [MarketAPI] Retry 3/3
```

**Expected Result:** ✅ Should show retry attempts in console

---

### Test 4: Timeout Handling

```javascript
// Test timeout by setting very low value
const soilAPI = new SoilAPI()
soilAPI.config.timeout = 1  // 1ms timeout

soilAPI.getSoilReadings()
    .then(data => console.log('Data:', data))
    .catch(error => console.log('✅ Timeout handled:', error.message))

// Should timeout and return fallback data or error
```

**Expected Result:** ✅ Should handle timeout gracefully

---

## Performance Tests

### Test 1: API Response Time

```javascript
const startTime = performance.now()

const weatherAPI = new WeatherAPI()
const data = await weatherAPI.getCurrentWeather()

const endTime = performance.now()
console.log(`API call took: ${(endTime - startTime).toFixed(2)}ms`)

// Should be < 3000ms typically
```

**Expected Result:** ✅ Response time should be reasonable

---

### Test 2: Cache Performance

```javascript
const weatherAPI = new WeatherAPI()

// First call - uncached
console.time('API call (uncached)')
await weatherAPI.getCurrentWeather()
console.timeEnd('API call (uncached)')

// Second call - cached
console.time('API call (cached)')
await weatherAPI.getCurrentWeather()
console.timeEnd('API call (cached)')

// Cached should be MUCH faster (< 10ms)
```

**Expected Result:** ✅ Cached call should be significantly faster

---

## Full Integration Test

### Complete Verification Script

```javascript
// Run this in browser console for complete verification

async function verifyAPIIntegration() {
    console.log('🔍 Starting API Integration Verification...\n')
    
    // 1. Check API Key Manager
    console.log('1️⃣ API Key Manager Status:')
    console.log(apiKeyManager.getStatus())
    
    // 2. Check Configuration
    console.log('\n2️⃣ Configuration:')
    console.log(apiKeyManager.exportConfig())
    
    // 3. Check Configured Services
    console.log('\n3️⃣ Configured Services:')
    console.log(apiKeyManager.getConfiguredServices())
    
    // 4. Test Weather API
    console.log('\n4️⃣ Testing Weather API...')
    try {
        const weather = new WeatherAPI()
        const data = await weather.getCurrentWeather()
        console.log('✅ Weather API:', data.temp ? 'WORKING' : 'Sample Data')
    } catch (e) {
        console.log('❌ Weather API:', e.message)
    }
    
    // 5. Test Market API
    console.log('\n5️⃣ Testing Market API...')
    try {
        const market = new MarketAPI()
        const data = await market.getCurrentPrices()
        console.log('✅ Market API: WORKING')
    } catch (e) {
        console.log('❌ Market API:', e.message)
    }
    
    // 6. Test Soil API
    console.log('\n6️⃣ Testing Soil API...')
    try {
        const soil = new SoilAPI()
        const data = await soil.getSoilReadings()
        console.log('✅ Soil API: WORKING')
    } catch (e) {
        console.log('❌ Soil API:', e.message)
    }
    
    console.log('\n✅ Verification Complete!')
}

// Run the verification
verifyAPIIntegration()
```

---

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Working correctly |
| ⚠️ | Warning or fallback data |
| ❌ | Error - needs attention |
| 🔍 | Testing/Verification |
| 📊 | Configuration/Status |

---

## Common Success Indicators

### Browser Console Shows:
```
✓ [APIKeyManager] Initialized
✓ [WeatherAPI] Current weather data fetched successfully
✓ [MarketAPI] Price data fetched successfully
✓ [SoilAPI] Soil readings fetched successfully
```

### API Tests Return:
```
✓ Non-null data objects
✓ Proper data structure
✓ No error messages
✓ Fast response times (< 5 seconds)
```

### Configuration Checks:
```
✓ apiKeyManager.initialized = true
✓ getConfiguredServices() returns list of services
✓ getStatus() shows services as configured
✓ exportConfig() shows masked keys
```

---

## Quick Fix Commands

### Reset All API Keys
```javascript
apiKeyManager.clearAll()
```

### Set All Keys at Once
```javascript
apiKeyManager.setKey('weather', 'YOUR_WEATHER_KEY')
apiKeyManager.setKey('market', 'YOUR_MARKET_KEY')
apiKeyManager.setKey('image', 'YOUR_IMAGE_KEY')
```

### Force Reload Configuration
```javascript
location.reload()  // Reload page
```

### Clear Browser Cache
```javascript
localStorage.clear()  // Clear all localStorage
```

---

## Next Steps After Verification

✅ **If all tests pass:**
- APIs are properly configured
- Ready for production use
- Monitor console for any errors

⚠️ **If some tests show fallback data:**
- API keys may not be configured
- Local APIs may not be running
- Check setup guide for configuration

❌ **If tests show errors:**
- Check API key validity
- Verify network connectivity
- Review console messages for details
- Follow troubleshooting guide

---

## Production Checklist

Before deploying to production:

- [ ] All API keys verified and working
- [ ] .env.local file created and secured
- [ ] .gitignore includes .env.local
- [ ] Environment variables tested
- [ ] Local APIs running (if applicable)
- [ ] Timeout values appropriate
- [ ] Retry logic tested
- [ ] Error handling verified
- [ ] Console logs reviewed
- [ ] Performance acceptable

---

**For detailed help:** See [API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)

**For quick reference:** See [API_CONFIGURATION.md](API_CONFIGURATION.md)

**For implementation details:** See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
