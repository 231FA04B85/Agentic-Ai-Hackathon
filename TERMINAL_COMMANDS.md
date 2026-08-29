# Terminal Commands Guide - API Integration

## 🚀 Quick Commands for API Setup

### **1. Navigate to Project Directory**
```powershell
# PowerShell
cd "C:\Users\sunny\OneDrive\Desktop\Hackthon"

# Or using shorter path
cd ~/Desktop/Hackthon
```

---

## 📋 Environment & Configuration

### **2. Create Environment File from Template**
```powershell
# Copy the template
Copy-Item .env.example .env.local

# Or using cmd
copy .env.example .env.local
```

### **3. View Environment File**
```powershell
# PowerShell - view content
Get-Content .env.local

# PowerShell - edit in notepad
notepad .env.local

# Or open in VS Code
code .env.local
```

### **4. Edit Environment Variables**
```powershell
# Using PowerShell ISE (GUI editor)
ise .env.local

# Using Visual Studio Code
code .env.local

# Using Notepad++
notepad++ .env.local
```

### **5. Verify .gitignore is Set Up**
```powershell
# Check if .gitignore exists
Test-Path .gitignore

# View .gitignore content
Get-Content .gitignore

# Ensure .env.local is in gitignore
Select-String ".env.local" .gitignore
```

---

## 🌐 Local Server Setup

### **6. Start Python Local Server (For Testing)**
```powershell
# Python 3 - Simple HTTP server
python -m http.server 8000

# Or specify port
python -m http.server 5000

# If using Python 2 (legacy)
python -m SimpleHTTPServer 8000
```

### **7. Start Node.js Server**
```powershell
# If you have Node.js installed
node server.js

# Or using npx
npx http-server
```

### **8. Check if Ports are in Use**
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Check port 3000
netstat -ano | findstr :3000

# Check port 8000
netstat -ano | findstr :8000
```

### **9. Kill Process on Specific Port**
```powershell
# Get the PID (Process ID) first using netstat command above
# Then kill it:
taskkill /PID <PID_NUMBER> /F

# Example:
taskkill /PID 1234 /F
```

---

## 🧪 Testing & Verification

### **10. Open Browser Console and Test APIs**
```powershell
# Open the application in default browser
Start-Process "http://localhost:5000"

# Then in browser, press F12 and go to Console tab
# Run these commands:

# Check API Key Manager
apiKeyManager.getStatus()

# Set Weather API key
apiKeyManager.setKey('weather', 'YOUR_OPENWEATHERMAP_KEY')

# Test Weather API
new WeatherAPI().getCurrentWeather().then(console.log)
```

### **11. Check Node.js/Python Installation**
```powershell
# Check Node.js version
node --version
npm --version

# Check Python version
python --version
python -m pip --version

# Check Git
git --version
```

### **12. View Application Files**
```powershell
# List all files in project
Get-ChildItem -Recurse

# List only JavaScript files
Get-ChildItem -Recurse -Filter "*.js"

# List only HTML files
Get-ChildItem -Recurse -Filter "*.html"

# List API files specifically
Get-ChildItem js/api/

# List configuration files
Get-ChildItem js/config.js, js/api-key-manager.js, js/load-env.js
```

### **13. Check File Sizes**
```powershell
# Check size of config file
(Get-Item js/config.js).Length

# Check all API files
Get-ChildItem js/api/ | Select-Object Name, Length

# Check project size
(Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum
```

---

## 📊 Testing & Monitoring

### **14. Monitor Network Requests (Using Chrome DevTools)**
```powershell
# Open Chrome DevTools
# F12 → Network tab
# Or Ctrl+Shift+I → Network tab

# Then perform API operations and watch the requests
```

### **15. Monitor Console Output**
```powershell
# In browser DevTools (F12)
# Go to Console tab
# Watch for API logs with [APIKeyManager], [WeatherAPI], etc.

# Filter console logs
# Type in filter: "WeatherAPI" to see only weather logs
```

### **16. Export Console Logs**
```powershell
# In browser console, run:
# console.save = function(data, filename){
#     if(!data) console.error('Console.save: No data');
#     if(!filename) filename = "console.json";
#     let dataStr = JSON.stringify(data, undefined, 4);
#     let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
#     document.createElement('a').setAttribute("href", dataUri);
# }
# Then use: console.save(console.log, 'output.json')
```

---

## 🔍 Git & Version Control

### **17. Git Commands for This Project**
```powershell
# Initialize git (if not already done)
git init

# Check git status
git status

# Add all files
git add .

# Check what will be committed
git diff --cached

# Commit changes
git commit -m "Add API key management system"

# View commit history
git log --oneline

# Push to repository
git push origin main
```

### **18. Check Git Ignore**
```powershell
# Verify .gitignore is working
git status

# Should NOT show .env.local in untracked files if properly ignored

# Check what files are ignored
git check-ignore -v .env.local
```

---

## 🛠️ Development Tools

### **19. Install Dependencies (If Using npm)**
```powershell
# Install Node dependencies
npm install

# Install specific package
npm install axios

# Install dev dependency
npm install --save-dev jest

# Update all packages
npm update
```

### **20. Create Local Backup**
```powershell
# Backup entire project
Copy-Item -Path . -Destination ".\Hackthon_backup_$(Get-Date -Format 'yyyyMMdd')" -Recurse

# Backup just configuration files
Copy-Item js/config.js "config.js.backup"
Copy-Item js/api-key-manager.js "api-key-manager.js.backup"
```

---

## 📁 File Management

### **21. Find Files by Type**
```powershell
# Find all API files
Get-ChildItem -Filter "*.js" -Path "js/api/"

# Find all CSS files
Get-ChildItem -Recurse -Filter "*.css"

# Find all JSON files
Get-ChildItem -Recurse -Filter "*.json"

# Find files modified today
Get-ChildItem -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}
```

### **22. Search File Content**
```powershell
# Search for API key references
Select-String "API_KEY" -Path "*.js" -Recurse

# Search for specific function
Select-String "apiKeyManager" -Path "js/*.js" -Recurse

# Search with line numbers
Select-String "CONFIG.API" -Path "js/config.js" -LineNumber
```

### **23. Compare Files**
```powershell
# Compare two versions
Compare-Object (Get-Content js/config.js) (Get-Content js/config.js.backup)

# Show differences side by side
Compare-Object -ReferenceObject (Get-Content original.js) -DifferenceObject (Get-Content modified.js)
```

---

## 🌐 Browser Testing

### **24. Open Application in Different Browsers**
```powershell
# Chrome
Start-Process "chrome" "http://localhost:5000"

# Edge
Start-Process "msedge" "http://localhost:5000"

# Firefox
Start-Process "firefox" "http://localhost:5000"

# Default browser
Start-Process "http://localhost:5000"
```

### **25. Open DevTools Directly**
```powershell
# In Chrome, after opening:
# F12 - Opens DevTools
# Ctrl+Shift+I - Opens DevTools
# Ctrl+Shift+J - Opens Console
# Ctrl+Shift+C - Opens Inspector
```

---

## 📝 Documentation

### **26. View Documentation Files**
```powershell
# View main documentation
Get-Content API_SETUP_GUIDE.md

# View configuration guide
Get-Content API_CONFIGURATION.md

# View implementation summary
Get-Content IMPLEMENTATION_SUMMARY.md

# View verification guide
Get-Content API_VERIFICATION_GUIDE.md

# Open in VS Code
code API_SETUP_GUIDE.md
code API_CONFIGURATION.md
```

### **27. Count Lines in Documentation**
```powershell
# Count lines in API setup guide
(Get-Content API_SETUP_GUIDE.md).Count

# Count words
(Get-Content API_SETUP_GUIDE.md | Measure-Object -Word).Words
```

---

## 🔧 Advanced Commands

### **28. Run Local Backend Server (Python)**
```powershell
# Create simple Flask server for testing
# First install Flask:
pip install flask

# Create server.py with your backend
python server.py

# Kill running server
Ctrl+C

# Run on specific port
python -m flask run --port 5000
```

### **29. Test API Endpoints Using PowerShell**
```powershell
# Test Weather API endpoint
$apiKey = "YOUR_OPENWEATHERMAP_API_KEY"
$url = "https://api.openweathermap.org/data/2.5/weather?q=London&appid=$apiKey"
Invoke-WebRequest -Uri $url | Select-Object StatusCode, Content

# Test with better formatting
$response = Invoke-WebRequest -Uri $url
$response.Content | ConvertFrom-Json | Format-List
```

### **30. Environment Variable Management**
```powershell
# Set environment variable (temporary)
$env:WEATHER_API_KEY = "YOUR_KEY"

# Get environment variable
$env:WEATHER_API_KEY

# List all environment variables
Get-ChildItem env:

# Set permanent environment variable (requires admin)
[Environment]::SetEnvironmentVariable("WEATHER_API_KEY", "YOUR_KEY", "User")
```

---

## 🐛 Debugging

### **31. Enable Verbose Logging**
```powershell
# In browser console, enable verbose logging
localStorage.setItem('debugMode', 'true')

# View logs in console
# Then reload page to see detailed logs
```

### **32. Check Browser Storage**
```powershell
# In browser console:
# View localStorage
localStorage

# Check specific key
localStorage.getItem('apiKeys')

# Clear localStorage
localStorage.clear()

# View SessionStorage
sessionStorage
```

### **33. Monitor Network Traffic**
```powershell
# Open DevTools Network tab (F12)
# In Console:
# Filter by 'XHR' to see API calls
# Filter by type: 'fetch' or 'xhr'
# Watch for 401, 429, 503 errors
```

---

## ⚡ Quick Start Script

### **34. Complete Setup Commands (Copy & Paste)**

**Create setup script file:**
```powershell
# Create a setup script
New-Item -Path "setup.ps1" -ItemType File -Force

# Add content to script
@'
# Navigate to project
cd "C:\Users\sunny\OneDrive\Desktop\Hackthon"

# Copy environment template
Copy-Item .env.example .env.local
Write-Host "✓ .env.local created"

# Check files are in place
Write-Host "✓ Checking key files..."
Test-Path js/api-key-manager.js | Write-Host
Test-Path js/load-env.js | Write-Host
Test-Path .env.local | Write-Host

# Show instructions
Write-Host ""
Write-Host "Setup Complete! Next steps:"
Write-Host "1. Edit .env.local with your API keys"
Write-Host "2. Start local server: python -m http.server 8000"
Write-Host "3. Open: http://localhost:8000"
Write-Host "4. Press F12 to open DevTools"
Write-Host "5. Run: apiKeyManager.getStatus()"
'@ | Out-File setup.ps1

# Run the script
.\setup.ps1
```

**Or run commands directly:**
```powershell
cd "C:\Users\sunny\OneDrive\Desktop\Hackthon"
Copy-Item .env.example .env.local
Get-Content .env.local
notepad .env.local
python -m http.server 8000
```

---

## 📖 Command Reference Quick List

| Task | Command |
|------|---------|
| Navigate to project | `cd ~/Desktop/Hackthon` |
| Create .env.local | `Copy-Item .env.example .env.local` |
| Edit .env.local | `notepad .env.local` |
| Start server | `python -m http.server 8000` |
| Check Node version | `node --version` |
| Check Python version | `python --version` |
| List JS files | `Get-ChildItem js/*.js` |
| View config | `Get-Content js/config.js` |
| Search in files | `Select-String "pattern" -Path "*.js" -Recurse` |
| Git status | `git status` |
| Git commit | `git commit -m "message"` |
| Open in VS Code | `code .` |
| Open DevTools | `F12` |
| Test in console | `apiKeyManager.getStatus()` |

---

## 🎯 Common Workflows

### **Workflow 1: Initial Setup**
```powershell
1. cd ~/Desktop/Hackthon
2. Copy-Item .env.example .env.local
3. notepad .env.local
   # Add your API keys
4. python -m http.server 8000
5. Start-Process "http://localhost:8000"
6. Press F12 in browser
7. Run: apiKeyManager.getStatus()
```

### **Workflow 2: Testing APIs**
```powershell
1. Open DevTools (F12)
2. Go to Console tab
3. Run test commands:
   - apiKeyManager.getStatus()
   - new WeatherAPI().getCurrentWeather().then(console.log)
   - new MarketAPI().getCurrentPrices().then(console.log)
4. Watch console for logs and errors
```

### **Workflow 3: Debugging**
```powershell
1. F12 → Console
2. Type: apiKeyManager.getStatus()
3. Type: apiKeyManager.exportConfig()
4. Type: apiKeyManager.getConfiguredServices()
5. Check Network tab for API calls
6. Look for console logs with [APIName]
```

### **Workflow 4: Deploying**
```powershell
1. Ensure .env.local exists with all keys
2. Verify .gitignore includes .env.local
3. git add .
4. git commit -m "API integration ready"
5. Deploy to server
6. Upload .env.local separately
7. Verify on production
```

---

## 📞 Quick Help

```powershell
# If you get "script execution disabled" error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Clear terminal
Clear-Host
# or
cls

# Get help for a command
Get-Help Get-ChildItem
Get-Help Start-Process -Examples

# Exit PowerShell
exit
```

---

**Ready to start?** Choose a workflow above and follow the commands! 🚀
