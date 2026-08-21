class AgriAIApp {
    constructor() {
        this.config = CONFIG;
        this.init();
    }
    
    init() {
        console.log(`🚀 ${this.config.APP.NAME} v${this.config.APP.VERSION} initializing...`);
        this.initializeTheme();
        this.initializeNavigation();
        this.initializeNotifications();
        this.initializeOrchestrator();
        this.initializeRealTimeUpdates();
        this.loadDashboardData();
        console.log('✅ Application initialized successfully');
    }
    
    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(newTheme);
            });
        }
        this.updateThemeIcon(savedTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    initializeNavigation() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.parentElement.classList.add('active');
            }
        });
    }
    
    initializeNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationModal = document.getElementById('notificationModal');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                notificationModal.classList.toggle('active');
            });
        }
        
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            notificationModal.classList.remove('active');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === notificationModal) {
                notificationModal.classList.remove('active');
            }
        });
    }
    
    initializeOrchestrator() {
        window.orchestrator = new OrchestratorAgent();
        window.orchestrator.initialize();
        
        document.addEventListener('recommendationGenerated', (e) => {
            this.handleRecommendation(e.detail);
        });
        
        document.addEventListener('alertTriggered', (e) => {
            this.handleAlert(e.detail);
        });
    }
    
    initializeRealTimeUpdates() {
        setInterval(() => {
            this.loadDashboardData();
        }, this.config.APP.UPDATE_INTERVAL);
    }
    
    async loadDashboardData() {
        try {
            const [fields, weather, recommendations, market] = await Promise.all([
                window.orchestrator.getFieldData(),
                window.orchestrator.getWeatherData(),
                window.orchestrator.getRecommendations(),
                window.orchestrator.getMarketData()
            ]);
            this.updateDashboard(fields, weather, recommendations, market);
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    updateDashboard(fields, weather, recommendations, market) {
        this.updateFieldWidget(fields);
        this.updateWeatherWidget(weather);
        this.updateRecommendationWidget(recommendations);
        this.updateMarketWidget(market);
        this.updateStats(fields, weather, recommendations);
    }
    
    updateFieldWidget(fields) {
        const fieldList = document.getElementById('fieldList');
        if (fieldList && fields) {
            fieldList.innerHTML = fields.slice(0, 5).map(field => `
                <div class="field-item">
                    <div class="field-info">
                        <span class="field-name">${field.name}</span>
                        <span class="field-crop">${field.cropType}</span>
                    </div>
                    <div class="field-status">
                        <span class="status-badge ${field.health > 70 ? 'healthy' : field.health > 40 ? 'warning' : 'critical'}">${field.health}%</span>
                        <span class="field-stage">${field.growthStage}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    updateWeatherWidget(weather) {
        if (weather) {
            document.getElementById('currentTemp').textContent = `${weather.temp}°C`;
            document.getElementById('weatherCondition').textContent = weather.condition;
            
            const container = document.getElementById('weatherForecast');
            if (container && weather.forecast) {
                container.innerHTML = weather.forecast.map(day => `
                    <div class="forecast-day">
                        <span class="day-name">${day.day}</span>
                        <i class="fas ${day.icon || 'fa-cloud'}"></i>
                        <span class="day-temp">${day.high}°/${day.low}°</span>
                    </div>
                `).join('');
            }
        }
    }
    
    updateRecommendationWidget(recommendations) {
        const recList = document.getElementById('recommendationList');
        if (recList && recommendations && recommendations.length > 0) {
            recList.innerHTML = recommendations.slice(0, 3).map(rec => `
                <div class="recommendation-item">
                    <div class="rec-icon"><i class="fas ${rec.icon || 'fa-lightbulb'}"></i></div>
                    <div class="rec-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.summary}</p>
                        <div class="rec-meta">
                            <span class="rec-priority ${rec.priority}">${rec.priority}</span>
                            <span class="rec-time">${rec.time}</span>
                        </div>
                    </div>
                    <button class="btn-sm" onclick="window.location.href='recommendations.html?id=${rec.id}'">View</button>
                </div>
            `).join('');
            
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                const count = recommendations.filter(r => r.priority === 'high').length;
                badge.textContent = count > 0 ? count : '';
            }
        }
    }
    
    updateMarketWidget(market) {
        if (market) {
            document.getElementById('marketPrice').textContent = `$${market.currentPrice}`;
            
            const canvas = document.getElementById('marketChart');
            if (canvas && market.historical && typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: market.historical.map(d => d.date),
                        datasets: [{
                            label: 'Price (USD)',
                            data: market.historical.map(d => d.price),
                            borderColor: '#2E7D32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        }
    }
    
    updateStats(fields, weather, recommendations) {
        document.getElementById('activeFields').textContent = fields?.length || 0;
        
        const riskLevel = document.getElementById('riskLevel');
        if (riskLevel && recommendations) {
            const highPriority = recommendations.filter(r => r.priority === 'high').length;
            if (highPriority > 2) {
                riskLevel.textContent = 'Critical';
                riskLevel.className = 'stat-number risk-level critical';
            } else if (highPriority > 0) {
                riskLevel.textContent = 'Moderate';
                riskLevel.className = 'stat-number risk-level moderate';
            } else {
                riskLevel.textContent = 'Low';
                riskLevel.className = 'stat-number risk-level low';
            }
        }
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdateTime').textContent = `Just now (${now.toLocaleTimeString()})`;
    }
    
    handleRecommendation(detail) {
        this.loadDashboardData();
    }
    
    handleAlert(detail) {
        console.warn('Alert:', detail);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AgriAIApp();
});