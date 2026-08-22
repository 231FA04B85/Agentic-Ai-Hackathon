/**
 * AgriAI Application Bootstrap — Advanced Build
 * Global toast stack · Notification system · Sidebar · Theme · Agent init guard
 */
class AgriAIApp {
    constructor() {
        this.config = CONFIG;
        this._initialized = false;
        this._marketChart = null;
        this.toastQueue = [];
        this.init();
    }

    init() {
        if (this._initialized) return;
        this._initialized = true;
        console.log(`🚀 ${this.config.APP.NAME} v${this.config.APP.VERSION} — Advanced Build`);
        this.ensureToastContainer();
        this.initTheme();
        this.initNavHighlight();
        this.initOrchestrator();
        this.initRealTimeUpdates();
        // Dashboard-specific widgets only on index.html
        if (document.getElementById('fieldList')) this.loadDashboardWidgets();
        console.log('✅ AgriAI initialized');
    }

    // ── Theme ──────────────────────────────────────────────────
    initTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        this.applyThemeIcon(saved);
        document.querySelectorAll('#themeToggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const cur = document.documentElement.getAttribute('data-theme');
                const next = cur === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                this.applyThemeIcon(next);
            });
        });
    }
    applyThemeIcon(theme) {
        document.querySelectorAll('#themeToggle i').forEach(i => {
            i.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    // ── Nav highlight ──────────────────────────────────────────
    initNavHighlight() {
        const cur = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            a.closest('li')?.classList.toggle('active', href === cur);
        });
    }

    // ── Orchestrator ───────────────────────────────────────────
    initOrchestrator() {
        if (!window.orchestrator) {
            window.orchestrator = new OrchestratorAgent();
            window.orchestrator.initialize();
        }
        document.addEventListener('recommendationGenerated', e => this.handleRecommendation(e.detail));
        document.addEventListener('alertTriggered',           e => this.handleAlert(e.detail));
        document.addEventListener('emergencyAlert',           e => this.handleAlert(e.detail, 'error'));
        document.addEventListener('weatherAlert',             e => this.handleAlert(e.detail, 'warning'));
        document.addEventListener('pestOutbreak',             e => this.handleAlert(e.detail, 'error'));
    }

    initRealTimeUpdates() {
        setInterval(() => {
            if (document.getElementById('fieldList')) this.loadDashboardWidgets();
        }, this.config.APP.UPDATE_INTERVAL);
    }

    // ── Dashboard widget updates (for non-DashboardPage pages) ─
    async loadDashboardWidgets() {
        // Only run if DashboardPage isn't handling it
        if (window._dashboardPage) return;
        try {
            const [fields, weather, recs, market] = await Promise.all([
                window.orchestrator.getFieldData(),
                window.orchestrator.getWeatherData(),
                window.orchestrator.getRecommendations(),
                window.orchestrator.getMarketData()
            ]);
            this.updateFieldWidget(fields);
            this.updateWeatherWidget(weather);
            this.updateRecommendationWidget(recs);
            this.updateMarketWidget(market);
            this.updateStats(fields, weather, recs);
            this.updateLastUpdateTime();
        } catch (err) {
            console.error('Dashboard widgets error:', err);
        }
    }

    updateFieldWidget(fields) {
        const el = document.getElementById('fieldList');
        if (!el || !fields) return;
        el.innerHTML = fields.slice(0,5).map(f => `
            <div class="field-item">
                <div class="field-info">
                    <span class="field-name">${f.name}</span>
                    <span class="field-crop" style="font-size:12px;color:var(--text-secondary)">${f.cropType}</span>
                </div>
                <div class="field-status">
                    <span class="status-badge ${f.health>70?'healthy':f.health>40?'warning':'critical'}">${f.health}%</span>
                    <span class="field-stage">${f.growthStage}</span>
                </div>
            </div>`).join('');
    }

    updateWeatherWidget(weather) {
        if (!weather) return;
        const cur = weather.current || weather;
        const temp = cur.temperature ?? cur.temp ?? '—';
        const condition = cur.condition ?? '—';
        const forecast = weather.forecast || [];
        ['currentTemp','kpiTemp','heroTemp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = typeof temp==='number' ? temp+'°C' : temp;
        });
        ['weatherCondition','kpiCondition','heroCondition'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = condition;
        });
        const forecastEl = document.getElementById('weatherForecast');
        if (forecastEl && forecast.length) {
            forecastEl.innerHTML = forecast.slice(0,5).map(d => `
                <div class="forecast-day">
                    <span class="day-name">${d.day||''}</span>
                    <i class="fas ${d.icon||'fa-cloud-sun'} day-icon"></i>
                    <span class="day-temp">${d.high??'—'}°/${d.low??'—'}°</span>
                </div>`).join('');
        }
    }

    updateRecommendationWidget(recs) {
        const el = document.getElementById('recommendationList');
        if (!el || !recs?.length) return;
        const icons = {irrigation:'fa-water',pest_control:'fa-bug',fertilization:'fa-flask',harvest:'fa-tractor',market_intelligence:'fa-chart-line',weather_advisory:'fa-cloud-sun'};
        el.innerHTML = recs.slice(0,3).map(r => `
            <div class="recommendation-item">
                <div class="rec-icon ${r.category||'default'}"><i class="fas ${icons[r.category]||'fa-lightbulb'}"></i></div>
                <div class="rec-content">
                    <h4>${r.title||''}</h4>
                    <p>${r.summary||''}</p>
                    <div class="rec-meta">
                        <span class="rec-priority ${(r.priority||'medium').toLowerCase()}">${r.priority||'Medium'}</span>
                        <span class="rec-time">${r.time||''}</span>
                    </div>
                </div>
                <a href="recommendations.html" class="btn-sm">View</a>
            </div>`).join('');

        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const high = recs.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase())).length;
            badge.textContent = high > 0 ? high : '';
        }
    }

    updateMarketWidget(market) {
        if (!market) return;
        const price = market.currentPrice ?? market.current_prices?.Wheat?.price ?? null;
        if (price !== null) {
            ['marketPrice','kpiPrice'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '$'+parseFloat(price).toFixed(2);
            });
        }
        // Market chart — only on non-DashboardPage pages
        const canvas = document.getElementById('marketChart');
        if (!canvas || window._dashboardPage) return;
        let hist = Array.isArray(market.historical) ? market.historical : (market.historical?.Wheat || []);
        hist = hist.slice(-30);
        if (!hist.length) return;
        if (this._marketChart) { this._marketChart.destroy(); this._marketChart = null; }
        this._marketChart = new Chart(canvas.getContext('2d'), {
            type:'line',
            data:{ labels:hist.map(d=>d.date), datasets:[{label:'$/bu',data:hist.map(d=>d.price),borderColor:'#2E7D32',backgroundColor:'rgba(46,125,50,0.08)',tension:0.3,fill:true,pointRadius:0}]},
            options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:'rgba(0,0,0,0.04)'}},x:{grid:{display:false},ticks:{maxTicksLimit:6}}} }
        });
    }

    updateStats(fields, weather, recs) {
        const cur = weather?.current || weather || {};
        const temp = cur.temperature ?? cur.temp;
        if (temp !== undefined) {
            ['currentTemp','kpiTemp'].forEach(id => {
                const el = document.getElementById(id);
                if (el && !el.textContent.includes('°')) el.textContent = temp+'°C';
            });
        }
        const activeFields = document.getElementById('activeFields');
        if (activeFields && fields) activeFields.textContent = fields.length;
        const totalArea = document.getElementById('totalArea');
        if (totalArea && fields) totalArea.textContent = fields.reduce((s,f)=>s+(f.area||0),0)+' ha';
        const avgHealth = document.getElementById('avgHealth');
        if (avgHealth && fields?.length) avgHealth.textContent = Math.round(fields.reduce((s,f)=>s+(f.health||0),0)/fields.length)+'%';
        const riskEl = document.getElementById('riskLevel');
        if (riskEl && recs) {
            const high = recs.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase())).length;
            riskEl.textContent = high>2?'Critical':high>0?'Moderate':'Low';
            riskEl.className = 'stat-number risk-level '+(high>2?'critical':high>0?'moderate':'low');
        }
    }

    updateLastUpdateTime() {
        document.querySelectorAll('#lastUpdateTime').forEach(el => {
            el.textContent = new Date().toLocaleTimeString();
        });
    }

    // ── Event handlers ─────────────────────────────────────────
    handleRecommendation(detail) {
        if (!detail) return;
        const count = Array.isArray(detail) ? detail.length : 1;
        this.toast(`${count} new AI recommendation${count>1?'s':''} generated`, 'info', 'AI Engine');
    }

    handleAlert(detail, type = 'warning') {
        if (!detail) return;
        const msg = detail.message || detail.summary || detail.type || 'Farm alert';
        const title = detail.type || detail.severity || 'Alert';
        this.toast(msg, type, title);
    }

    // ── TOAST SYSTEM ───────────────────────────────────────────
    ensureToastContainer() {
        if (!document.getElementById('toast-container')) {
            const tc = document.createElement('div');
            tc.id = 'toast-container';
            document.body.appendChild(tc);
        }
    }

    toast(message, type = 'info', title = '') {
        const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
        const colors = { success:'var(--success-green)', error:'var(--danger-red)', warning:'var(--warning-amber)', info:'var(--secondary-blue)' };
        const tc = document.getElementById('toast-container');
        if (!tc) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]||'fa-info-circle'} toast-icon" style="color:${colors[type]||colors.info}"></i>
            <div class="toast-body">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-msg">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>`;

        toast.querySelector('.toast-close').addEventListener('click', () => this.dismissToast(toast));
        tc.appendChild(toast);

        // Limit to 5 toasts
        const toasts = tc.querySelectorAll('.toast');
        if (toasts.length > 5) this.dismissToast(toasts[0]);

        // Auto dismiss
        setTimeout(() => this.dismissToast(toast), 6000);
    }

    dismissToast(toast) {
        if (!toast?.parentNode) return;
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 320);
    }

    // Static shorthand
    static toast(message, type='info', title='') {
        window.app?.toast(message, type, title);
    }
}

// Global shorthand
window.AgriToast = (msg, type, title) => window.app?.toast(msg, type, title);

document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) window.app = new AgriAIApp();
});
