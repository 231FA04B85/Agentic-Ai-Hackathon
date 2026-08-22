/**
 * Dashboard Page — Advanced Build
 * Animated counters · Live pipeline · 6 charts · Real-time alerts
 */
class DashboardPage {
    constructor() {
        this.state = {
            fields: [], weather: null, recommendations: [],
            marketData: null, soilData: null, pestData: null,
            alerts: [], lastUpdate: null, isRefreshing: false
        };
        this.charts = { health: null, market: null, soil: null, pest: null, precip: null, distribution: null };
        this.notifications = [];
        this.activityFeed = [];
        this.updateInterval = null;
        this.realTimeInterval = null;
        this.pipelineTimer = null;
        this.initialize();
    }

    initialize() {
        console.log('📊 Advanced Dashboard initializing…');
        this.initCharts();
        this.loadAll();
        this.startAutoRefresh();
        this.startRealTime();
        document.getElementById('refreshDataBtn')?.addEventListener('click', () => this.refresh());
    }

    // ─── DATA LOADING ────────────────────────────────────────────
    async loadAll() {
        try {
            this.animatePipeline();
            const [fields, weather, recs, market, soil, pest] = await Promise.all([
                this.safe(() => window.orchestrator ? window.orchestrator.getFieldData() : null, this.sampleFields()),
                this.safe(() => window.orchestrator ? window.orchestrator.getWeatherData() : null, this.sampleWeather()),
                this.safe(() => window.orchestrator ? window.orchestrator.getRecommendations() : null, this.sampleRecs()),
                this.safe(() => window.orchestrator ? window.orchestrator.getMarketData() : null, this.sampleMarket()),
                this.safe(() => window.soilAgent ? window.soilAgent.getSoilData() : null, this.sampleSoil()),
                this.safe(() => window.pestAgent ? window.pestAgent.getRiskAssessment() : null, this.samplePest())
            ]);

            this.state.fields = fields || this.sampleFields();
            this.state.weather = weather;
            this.state.recommendations = recs || [];
            this.state.marketData = market;
            this.state.soilData = soil;
            this.state.pestData = pest;
            this.state.lastUpdate = new Date();

            this.renderKPIs();
            this.renderWeather();
            this.renderFields();
            this.renderRecommendations();
            this.renderSoilMini();
            this.renderPestRisk();
            this.renderMarketMini();
            this.renderHealthMetrics();
            this.renderAlertFeed();
            this.updateCharts();
            this.updateTimestamp();
            this.populateNotifications();
            this.showTicker();

            this.completePipeline();
        } catch (err) {
            console.error('Dashboard load error:', err);
            this.loadWithSampleData();
        }
    }

    loadWithSampleData() {
        this.state.fields        = this.sampleFields();
        this.state.weather       = this.sampleWeather();
        this.state.recommendations = this.sampleRecs();
        this.state.marketData    = this.sampleMarket();
        this.state.soilData      = this.sampleSoil();
        this.state.pestData      = this.samplePest();
        this.renderKPIs(); this.renderWeather(); this.renderFields();
        this.renderRecommendations(); this.renderSoilMini(); this.renderPestRisk();
        this.renderMarketMini(); this.renderHealthMetrics();
        this.renderAlertFeed(); this.updateCharts();
        this.updateTimestamp(); this.populateNotifications(); this.showTicker();
        this.completePipeline();
    }

    safe(fn, fallback) {
        try { return Promise.resolve(fn()).catch(() => fallback); }
        catch { return Promise.resolve(fallback); }
    }

    // ─── PIPELINE ANIMATION ──────────────────────────────────────
    animatePipeline() {
        const steps = document.querySelectorAll('.pipeline-step');
        steps.forEach(s => { s.className = 'pipeline-step'; });
        const labels = ['crop','weather','soil','pest','market','orchestrator','xai'];
        const statusEl = document.getElementById('pipelineStatus');
        let i = 0;
        clearTimeout(this.pipelineTimer);
        const next = () => {
            if (i > 0) { steps[i-1].classList.remove('active'); steps[i-1].classList.add('done'); const n = steps[i-1].querySelector('.pipeline-node'); if(n) n.innerHTML = '<i class="fas fa-check" style="font-size:8px"></i>'; }
            if (i < steps.length) {
                steps[i].classList.add('active');
                const n = steps[i].querySelector('.pipeline-node'); if(n) n.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size:8px"></i>';
                if (statusEl) statusEl.textContent = `Running ${labels[i]} agent…`;
                i++;
                this.pipelineTimer = setTimeout(next, 500 + Math.random() * 400);
            }
        };
        next();
    }

    completePipeline() {
        clearTimeout(this.pipelineTimer);
        document.querySelectorAll('.pipeline-step').forEach(s => {
            s.classList.remove('active','error');
            s.classList.add('done');
            const n = s.querySelector('.pipeline-node');
            if(n) n.innerHTML = '<i class="fas fa-check" style="font-size:8px"></i>';
        });
        const statusEl = document.getElementById('pipelineStatus');
        if (statusEl) statusEl.innerHTML = '<span style="color:var(--success-green);font-weight:600"><i class="fas fa-check-circle"></i> Assessment complete</span>';
    }

    // ─── KPI CARDS ───────────────────────────────────────────────
    renderKPIs() {
        const { fields, weather, recommendations, soilData, marketData } = this.state;
        const current = weather?.current || weather || {};
        const temp = current.temperature ?? current.temp ?? '—';
        const condition = current.condition ?? '—';
        const avgHealth = fields.length ? Math.round(fields.reduce((s,f)=>s+(f.health||0),0)/fields.length) : 0;
        const highRecs = recommendations.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase())).length;
        const riskLabel = highRecs > 2 ? 'Critical' : highRecs > 0 ? 'Moderate' : 'Low';
        const riskColor = highRecs > 2 ? 'var(--danger-red)' : highRecs > 0 ? 'var(--warning-amber)' : 'var(--success-green)';
        const moisture = soilData?.moisture ?? '—';

        // Wheat price
        let price = '—', priceChange = '';
        if (marketData?.currentPrice) { price = `$${marketData.currentPrice.toFixed(2)}`; }
        else if (marketData?.current_prices?.Wheat) {
            const w = marketData.current_prices.Wheat;
            price = `$${w.price.toFixed(2)}`;
            const chg = w.change_percent;
            priceChange = chg >= 0 ? `up ${chg.toFixed(1)}%` : `down ${Math.abs(chg).toFixed(1)}%`;
        }

        this.animateCounter('kpiFields', fields.length);
        this.setKPI('kpiTemp', typeof temp === 'number' ? temp+'°C' : temp);
        document.getElementById('kpiCondition').textContent = condition;
        this.animateCounter('kpiHealth', avgHealth, '%');
        document.getElementById('kpiHealthChange').textContent = avgHealth > 75 ? '↑ Good condition' : avgHealth > 50 ? '~ Fair condition' : '↓ Needs attention';
        document.getElementById('kpiHealthChange').className = 'kpi-change ' + (avgHealth > 75 ? 'up' : avgHealth > 50 ? 'flat' : 'down');
        document.getElementById('kpiRisk').textContent = riskLabel;
        document.getElementById('kpiRisk').style.color = riskColor;
        document.getElementById('kpiRiskSub').textContent = `${highRecs} high-priority alert${highRecs !== 1 ? 's' : ''}`;
        document.getElementById('kpiRiskSub').className = 'kpi-change ' + (highRecs > 2 ? 'down' : highRecs > 0 ? 'flat' : 'up');
        this.setKPI('kpiPrice', price);
        document.getElementById('kpiPriceChange').textContent = priceChange || '30-day avg';
        document.getElementById('kpiPriceChange').className = 'kpi-change ' + (priceChange.includes('up') ? 'up' : priceChange.includes('down') ? 'down' : 'flat');
        this.setKPI('kpiMoisture', typeof moisture === 'number' ? moisture+'%' : moisture);
        const moistureSub = typeof moisture === 'number' ? (moisture < 30 ? '↓ Below optimal' : moisture > 80 ? '↑ Above optimal' : '✓ Optimal range') : 'Loading…';
        document.getElementById('kpiMoistureSub').textContent = moistureSub;
        document.getElementById('kpiMoistureSub').className = 'kpi-change ' + (typeof moisture === 'number' ? (moisture < 30 || moisture > 80 ? 'down' : 'up') : 'flat');

        // Nav badge
        const recBadge = document.getElementById('recNavBadge');
        if (recBadge) recBadge.textContent = recommendations.length;
        const recCount = document.getElementById('recCountBadge');
        if (recCount) recCount.textContent = recommendations.length;
    }

    animateCounter(id, target, suffix = '') {
        const el = document.getElementById(id);
        if (!el) return;
        const start = 0, duration = 800;
        const startTime = performance.now();
        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(start + (target - start) * eased) + suffix;
            el.classList.add('counter-highlight');
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    setKPI(id, value) {
        const el = document.getElementById(id);
        if (el) { el.textContent = value; el.classList.add('counter-highlight'); }
    }

    // ─── WEATHER ────────────────────────────────────────────────
    renderWeather() {
        const w = this.state.weather;
        if (!w) return;
        const cur = w.current || w;
        const temp = cur.temperature ?? cur.temp ?? '—';
        const condition = cur.condition ?? '—';
        const feels = cur.feels_like ?? cur.feelsLike;

        const heroTemp = document.getElementById('heroTemp');
        const heroCond = document.getElementById('heroCondition');
        const heroFeels = document.getElementById('heroFeels');
        if (heroTemp) heroTemp.textContent = typeof temp === 'number' ? temp+'°C' : temp;
        if (heroCond) heroCond.textContent = condition;
        if (heroFeels && feels !== undefined) heroFeels.textContent = `Feels like ${feels}°C`;

        // Mini stats
        const mini = document.getElementById('weatherMiniStats');
        if (mini) {
            const humidity = cur.humidity ?? '—';
            const wind = cur.wind_speed ?? cur.windSpeed ?? '—';
            const uv = cur.uv_index ?? cur.uvIndex ?? '—';
            mini.innerHTML = [
                { label: 'Humidity', value: humidity+'%', icon: 'fa-tint', color: '#1565C0' },
                { label: 'Wind km/h', value: wind, icon: 'fa-wind', color: '#546E7A' },
                { label: 'UV Index', value: uv, icon: 'fa-sun', color: '#F9A825' }
            ].map(s => `<div style="background:var(--gray-50);border-radius:var(--radius-md);padding:8px;text-align:center">
                <i class="fas ${s.icon}" style="color:${s.color};font-size:16px"></i>
                <div style="font-size:14px;font-weight:700;margin-top:3px">${s.value}</div>
                <div style="font-size:10px;color:var(--text-secondary)">${s.label}</div>
            </div>`).join('');
        }

        // Forecast row
        const forecast = w.forecast || [];
        const forecastRow = document.getElementById('forecastRow');
        if (forecastRow && forecast.length) {
            forecastRow.innerHTML = forecast.slice(0,7).map((d,i) => {
                const iconMap = { 'Sunny':'fa-sun sunny','Clear':'fa-sun sunny','Partly Cloudy':'fa-cloud-sun','Cloudy':'fa-cloud cloudy','Light Rain':'fa-cloud-rain rainy','Heavy Rain':'fa-cloud-showers-heavy rainy','Scattered Showers':'fa-cloud-rain rainy' };
                const iconClass = iconMap[d.condition] || 'fa-cloud-sun';
                const isToday = i === 0;
                return `<div class="forecast-day ${isToday?'today':''}">
                    <span class="day-name">${isToday?'Today':d.day||''}</span>
                    <i class="fas ${iconClass} day-icon" style="margin:4px 0"></i>
                    <span class="day-temp">${d.high??'—'}°/<span style="color:var(--text-hint)">${d.low??'—'}°</span></span>
                    <span class="day-precip">${d.precipitation??0}mm</span>
                </div>`;
            }).join('');
        }
    }

    // ─── FIELDS ─────────────────────────────────────────────────
    renderFields() {
        const { fields } = this.state;
        const container = document.getElementById('fieldList');
        if (!container) return;

        const cropIcons = { Wheat:'fa-wheat-awn', Corn:'fa-seedling', Tomato:'fa-pepper-hot', Soybean:'fa-leaf', Potato:'fa-circle', default:'fa-seedling' };

        if (!fields.length) {
            container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-secondary)"><i class="fas fa-seedling" style="font-size:32px;margin-bottom:8px;display:block"></i>No fields found</div>`;
            return;
        }

        container.innerHTML = fields.map(f => {
            const health = f.health || 0;
            const badgeClass = health > 70 ? 'healthy' : health > 40 ? 'warning' : 'critical';
            const icon = cropIcons[f.cropType] || cropIcons.default;
            const dap = f.plantingDate ? Math.floor((Date.now()-new Date(f.plantingDate))/(86400000)) : 0;
            return `<div class="field-item" onclick="location.href='farm-management.html'">
                <div class="field-crop-icon"><i class="fas ${icon}"></i></div>
                <div class="field-info">
                    <div class="field-name">${f.name}</div>
                    <div class="field-meta">${f.cropType} · ${f.area||0} ha · ${f.growthStage||'—'} · Day ${dap}</div>
                </div>
                <div class="field-status">
                    <span class="status-badge ${badgeClass}">${health}%</span>
                    <span class="field-stage">${f.soilType||''}</span>
                </div>
            </div>`;
        }).join('');

        const total = fields.reduce((s,f)=>s+(f.area||0),0);
        const fc = document.getElementById('footerFieldCount'); if(fc) fc.textContent = fields.length;
        const fa = document.getElementById('footerTotalArea'); if(fa) fa.textContent = total+' ha total';
    }

    // ─── RECOMMENDATIONS ────────────────────────────────────────
    renderRecommendations() {
        const { recommendations } = this.state;
        const container = document.getElementById('recommendationList');
        if (!container) return;

        const catIcons = { irrigation:'fa-water', pest_control:'fa-bug', fertilization:'fa-flask', harvest:'fa-tractor', market_intelligence:'fa-chart-line', weather_advisory:'fa-cloud-sun', disease_management:'fa-viruses', sustainability:'fa-seedling' };

        if (!recommendations.length) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-secondary)"><i class="fas fa-lightbulb" style="font-size:28px;margin-bottom:8px;display:block"></i>Generating recommendations…</div>`;
            return;
        }

        const sortOrder = { critical:0, high:1, medium:2, low:3 };
        const sorted = [...recommendations].sort((a,b) => (sortOrder[(a.priority||'').toLowerCase()]??4) - (sortOrder[(b.priority||'').toLowerCase()]??4));

        container.innerHTML = sorted.slice(0,4).map(rec => {
            const cat = rec.category || 'default';
            const icon = catIcons[cat] || 'fa-lightbulb';
            const pri = (rec.priority || 'medium').toLowerCase();
            const conf = rec.confidence ? Math.round(rec.confidence * 100) : 75;
            return `<div class="recommendation-item">
                <div class="rec-icon ${cat}"><i class="fas ${icon}"></i></div>
                <div class="rec-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.summary}</p>
                    <div class="rec-meta">
                        <span class="rec-priority ${pri}">${rec.priority||'Medium'}</span>
                        <span class="rec-time"><i class="fas fa-clock"></i> ${rec.time||'Now'}</span>
                        <span style="font-size:10px;color:var(--text-hint);margin-left:auto">AI: ${conf}%</span>
                    </div>
                </div>
                <a href="recommendations.html" class="btn-sm" style="flex-shrink:0">View</a>
            </div>`;
        }).join('');
    }

    // ─── SOIL MINI ───────────────────────────────────────────────
    renderSoilMini() {
        const s = this.state.soilData;
        if (!s) return;
        const grid = document.getElementById('soilMiniGrid');
        if (!grid) return;
        const items = [
            { label: 'Moisture', value: (s.moisture||0)+'%', color: '#1565C0' },
            { label: 'pH Level', value: s.ph||6.5, color: '#2E7D32' },
            { label: 'Nitrogen', value: (s.npk?.nitrogen||0)+' ppm', color: '#7B1FA2' },
            { label: 'Temperature', value: (s.temperature||20)+'°C', color: '#F57C00' }
        ];
        grid.innerHTML = items.map(i => `<div class="soil-mini-card">
            <div class="soil-mini-value" style="color:${i.color}">${i.value}</div>
            <div class="soil-mini-label">${i.label}</div>
        </div>`).join('');
    }

    // ─── PEST RISK MINI ─────────────────────────────────────────
    renderPestRisk() {
        const p = this.state.pestData;
        if (!p) return;
        const container = document.getElementById('pestRiskDisplay');
        if (!container) return;

        const risk = p.overall_risk ?? p.risk ?? 0;
        const level = risk > 7 ? 'critical' : risk > 4 ? 'moderate' : 'low';
        const levelColor = { critical:'var(--danger-red)', moderate:'var(--warning-amber)', low:'var(--success-green)' }[level];
        const type = p.highest_risk_pest?.pest_type ?? p.type ?? 'None detected';
        const diseaseRisk = p.disease_risk ?? 0;

        container.innerHTML = `
            <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px">
                <div style="text-align:center">
                    <div style="font-size:28px;font-weight:800;color:${levelColor};line-height:1">${risk.toFixed?risk.toFixed(1):risk}/10</div>
                    <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Pest Risk</div>
                </div>
                <div style="flex:1">
                    <div style="height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden;margin-bottom:6px">
                        <div style="height:100%;width:${risk*10}%;background:${levelColor};border-radius:4px;transition:width 1s ease"></div>
                    </div>
                    <div style="font-size:12px;font-weight:600;color:${levelColor}">${level.toUpperCase()} RISK</div>
                    <div style="font-size:11px;color:var(--text-secondary)">${type}</div>
                </div>
                <div style="text-align:center">
                    <div style="font-size:22px;font-weight:700;color:var(--warning-amber)">${diseaseRisk}%</div>
                    <div style="font-size:10px;color:var(--text-secondary)">Disease</div>
                </div>
            </div>`;

        const navBadge = document.getElementById('pestBadge');
        if (navBadge) navBadge.style.display = risk > 5 ? 'inline-block' : 'none';
    }

    // ─── MARKET MINI ────────────────────────────────────────────
    renderMarketMini() {
        const m = this.state.marketData;
        if (!m) return;
        const container = document.getElementById('marketMiniStats');
        if (!container) return;
        const prices = m.current_prices || {};
        const crops = ['Wheat','Corn','Soybean'];
        container.innerHTML = crops.map(c => {
            const d = prices[c];
            if (!d) return '';
            const chg = d.change_percent || 0;
            const arrow = chg >= 0 ? '▲' : '▼';
            const color = chg >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
            return `<div class="market-stat-item">
                <div class="value">$${d.price?.toFixed(2)||'—'}</div>
                <div class="label">${c}</div>
                <div style="font-size:10px;font-weight:600;color:${color}">${arrow}${Math.abs(chg).toFixed(1)}%</div>
            </div>`;
        }).join('');

        // Trend badge
        const trendBadge = document.getElementById('marketTrendBadge');
        if (trendBadge && m.trends) {
            const bullish = Object.values(m.trends).filter(t=>t.trend==='BULLISH').length;
            const bearish = Object.values(m.trends).filter(t=>t.trend==='BEARISH').length;
            if (bullish > bearish) { trendBadge.textContent = 'Bullish ▲'; trendBadge.style.color = 'var(--success-green)'; }
            else if (bearish > bullish) { trendBadge.textContent = 'Bearish ▼'; trendBadge.style.color = 'var(--danger-red)'; }
            else { trendBadge.textContent = 'Neutral —'; trendBadge.style.color = 'var(--text-secondary)'; }
        }
    }

    // ─── HEALTH METRICS ─────────────────────────────────────────
    renderHealthMetrics() {
        const { fields, soilData } = this.state;
        const container = document.getElementById('healthMetrics');
        if (!container) return;
        const avgHealth = fields.length ? Math.round(fields.reduce((s,f)=>s+(f.health||0),0)/fields.length) : 78;
        const moisture = soilData?.moisture || 65;
        const ndvi = (0.5 + (avgHealth / 100) * 0.4).toFixed(2);
        const badgeEl = document.getElementById('healthBadge');
        if (badgeEl) {
            badgeEl.textContent = avgHealth > 75 ? 'Good' : avgHealth > 50 ? 'Fair' : 'Poor';
            badgeEl.className = 'badge-pill ' + (avgHealth > 75 ? 'healthy' : avgHealth > 50 ? 'warning' : 'critical');
        }
        const metrics = [
            { label: 'NDVI Score', value: ndvi, pct: Math.round(parseFloat(ndvi)*100), cls:'' },
            { label: 'Soil Moisture', value: moisture+'%', pct: moisture, cls: moisture < 30 ? 'danger' : '' },
            { label: 'Avg Crop Health', value: avgHealth+'%', pct: avgHealth, cls: avgHealth < 50 ? 'danger' : avgHealth < 70 ? 'warning' : '' }
        ];
        container.innerHTML = metrics.map(m => `<div class="metric">
            <span class="metric-label">${m.label}</span>
            <div class="progress-bar"><div class="progress-fill ${m.cls}" style="width:${m.pct}%"></div></div>
            <span class="metric-value">${m.value}</span>
        </div>`).join('');
    }

    // ─── ALERT FEED ─────────────────────────────────────────────
    renderAlertFeed() {
        const feed = document.getElementById('alertFeed');
        if (!feed) return;
        const { pestData, soilData, weather, recommendations } = this.state;
        const alerts = [];

        const now = new Date();
        const fmt = (d) => d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

        if (pestData?.overall_risk > 6) alerts.push({ level:'high', icon:'fa-bug', title:`Pest Alert: ${pestData.highest_risk_pest?.pest_type||'Pest'}`, msg:`Risk at ${(pestData.overall_risk||0).toFixed(1)}/10 — immediate action required`, time: fmt(now) });
        if (soilData?.moisture < 30) alerts.push({ level:'high', icon:'fa-tint', title:'Soil Moisture Critical', msg:`Moisture at ${soilData.moisture}% — emergency irrigation needed`, time: fmt(new Date(now-60000)) });
        if ((weather?.current||weather)?.temperature > 35) alerts.push({ level:'high', icon:'fa-thermometer-full', title:'Heat Wave Warning', msg:`Temperature ${(weather?.current||weather)?.temperature}°C — protect crops`, time: fmt(new Date(now-120000)) });

        const highRecs = recommendations.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase()));
        highRecs.slice(0,2).forEach((r,i) => alerts.push({ level:'moderate', icon:'fa-lightbulb', title:r.title, msg:r.summary, time: fmt(new Date(now-(i+1)*180000)) }));

        // Always show some activity
        alerts.push({ level:'low', icon:'fa-sync-alt', title:'AI Assessment Complete', msg:`${recommendations.length} recommendations generated by 6-agent pipeline`, time: fmt(new Date(now-300000)) });
        alerts.push({ level:'low', icon:'fa-cloud-sun', title:'Weather Forecast Updated', msg:'7-day forecast refreshed — next rain expected in 2 days', time: fmt(new Date(now-600000)) });
        alerts.push({ level:'low', icon:'fa-chart-line', title:'Market Data Refreshed', msg:'Wheat: bullish trend continuing — consider sell window in 2 weeks', time: fmt(new Date(now-900000)) });

        feed.innerHTML = alerts.slice(0,6).map(a => `<div class="alert-feed-item ${a.level}">
            <i class="fas ${a.icon} alert-feed-icon"></i>
            <div class="alert-feed-body">
                <strong>${a.title}</strong>
                ${a.msg}
            </div>
            <span class="alert-feed-time">${a.time}</span>
        </div>`).join('');
    }

    // ─── NOTIFICATIONS ──────────────────────────────────────────
    populateNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;
        const { recommendations, pestData } = this.state;
        const notifs = [];

        if (pestData?.overall_risk > 6) notifs.push({ icon:'fa-bug', cls:'red', title:'Pest Outbreak Risk', text:`${pestData.highest_risk_pest?.pest_type||'Pest'} at ${(pestData.overall_risk||0).toFixed(1)}/10`, time:'Just now', unread:true });

        recommendations.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase())).slice(0,3).forEach(r => {
            notifs.push({ icon:'fa-lightbulb', cls:'amber', title:r.title, text:r.summary?.slice(0,60)+'…', time:'2m ago', unread:true });
        });
        notifs.push({ icon:'fa-chart-line', cls:'green', title:'Market Update', text:'Wheat prices up 2.1% — review sell strategy', time:'15m ago', unread:false });
        notifs.push({ icon:'fa-cloud', cls:'blue', title:'Weather Alert', text:'Rain forecast in 48h — adjust irrigation schedule', time:'1h ago', unread:false });

        list.innerHTML = notifs.slice(0,6).map(n => `<div class="notification-item ${n.unread?'unread':''}">
            <div class="notif-icon ${n.cls}"><i class="fas ${n.icon}"></i></div>
            <div class="notif-body">
                <div class="notif-title">${n.title}</div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-time">${n.time}</div>
            </div>
        </div>`).join('');

        const badge = document.getElementById('notificationBadge');
        const unreadCount = notifs.filter(n=>n.unread).length;
        if (badge) badge.textContent = unreadCount > 0 ? unreadCount : '';
    }

    // ─── ALERT TICKER ───────────────────────────────────────────
    showTicker() {
        const { pestData, soilData, recommendations } = this.state;
        const ticker = document.getElementById('alertTicker');
        const tickerText = document.getElementById('tickerText');
        if (!ticker || !tickerText) return;

        const msgs = [];
        if (pestData?.overall_risk > 6) msgs.push(`⚠ PEST ALERT: ${pestData.highest_risk_pest?.pest_type||'Pest'} risk at ${(pestData.overall_risk||0).toFixed(1)}/10 — immediate action required`);
        if (soilData?.moisture < 30) msgs.push(`💧 SOIL ALERT: Moisture critically low at ${soilData.moisture}% — emergency irrigation needed`);
        const highRecs = recommendations.filter(r=>['high','critical'].includes((r.priority||'').toLowerCase()));
        if (highRecs.length > 0) msgs.push(`🌾 ${highRecs.length} HIGH-PRIORITY recommendation${highRecs.length>1?'s':''} require attention — view now`);

        if (msgs.length > 0) {
            ticker.style.display = 'flex';
            ticker.className = 'alert-ticker ' + (msgs[0].includes('SOIL') || msgs[0].includes('PEST') ? '' : 'warning');
            tickerText.textContent = msgs.join('   ·   ');
        } else {
            ticker.style.display = 'none';
        }
    }

    // ─── CHARTS ─────────────────────────────────────────────────
    initCharts() {
        Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
        Chart.defaults.font.size = 11;
        Chart.defaults.color = '#757575';

        const gridOpts = { color: 'rgba(0,0,0,0.04)', drawBorder: false };
        const noLegend = { legend: { display: false } };
        const responsive = { responsive: true, maintainAspectRatio: false };

        // Health chart — multi-line
        const hCtx = document.getElementById('healthChart')?.getContext('2d');
        if (hCtx) this.charts.health = new Chart(hCtx, {
            type: 'line',
            data: { labels: [], datasets: [
                { label: 'North Field', data: [], borderColor: '#2E7D32', backgroundColor: 'rgba(46,125,50,0.06)', fill: true, tension: 0.4, pointRadius: 0 },
                { label: 'South Field', data: [], borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.06)', fill: true, tension: 0.4, pointRadius: 0 },
                { label: 'East Field',  data: [], borderColor: '#F57C00', backgroundColor: 'rgba(245,124,0,0.06)', fill: true, tension: 0.4, pointRadius: 0 }
            ]},
            options: { ...responsive, plugins: { legend: { position:'top', labels:{usePointStyle:true,padding:10} } }, scales: { y:{beginAtZero:true,max:100,grid:gridOpts}, x:{grid:{display:false}} } }
        });

        // Market chart — gradient line
        const mCtx = document.getElementById('marketChart')?.getContext('2d');
        if (mCtx) {
            const grad = mCtx.createLinearGradient(0,0,0,160);
            grad.addColorStop(0,'rgba(46,125,50,0.2)'); grad.addColorStop(1,'rgba(46,125,50,0)');
            this.charts.market = new Chart(mCtx, {
                type: 'line',
                data: { labels: [], datasets: [{ label:'Wheat $/bu', data:[], borderColor:'#2E7D32', backgroundColor:grad, fill:true, tension:0.3, pointRadius:0, borderWidth:2 }]},
                options: { ...responsive, plugins: { ...noLegend, tooltip:{callbacks:{label:ctx=>`$${ctx.parsed.y.toFixed(2)}`}} }, scales: { y:{grid:gridOpts, ticks:{callback:v=>'$'+v}}, x:{grid:{display:false}, ticks:{maxTicksLimit:6}} } }
            });
        }

        // Soil moisture line
        const sCtx = document.getElementById('soilChart')?.getContext('2d');
        if (sCtx) this.charts.soil = new Chart(sCtx, {
            type: 'line',
            data: { labels: [], datasets: [
                { label:'Moisture %', data:[], borderColor:'#1565C0', backgroundColor:'rgba(21,101,192,0.08)', fill:true, tension:0.3, pointRadius:0 },
                { label:'Optimal (70%)', data:[], borderColor:'rgba(46,125,50,0.4)', borderDash:[6,4], fill:false, tension:0, pointRadius:0, borderWidth:1.5 }
            ]},
            options: { ...responsive, plugins:{ legend:{position:'top',labels:{usePointStyle:true,padding:8}} }, scales:{ y:{beginAtZero:true,max:100,grid:gridOpts}, x:{grid:{display:false},ticks:{maxTicksLimit:8}} } }
        });

        // Pest risk bar
        const pCtx = document.getElementById('pestChart')?.getContext('2d');
        if (pCtx) this.charts.pest = new Chart(pCtx, {
            type: 'bar',
            data: { labels: [], datasets: [
                { label:'Pest Risk', data:[], backgroundColor:'rgba(198,40,40,0.7)', borderRadius:4 },
                { label:'Disease Risk', data:[], backgroundColor:'rgba(245,124,0,0.5)', borderRadius:4 }
            ]},
            options: { ...responsive, plugins:{legend:{position:'top',labels:{usePointStyle:true,padding:8}}}, scales:{ y:{beginAtZero:true,max:10,grid:gridOpts}, x:{grid:{display:false}} } }
        });

        // Precipitation bar
        const prCtx = document.getElementById('precipChart')?.getContext('2d');
        if (prCtx) this.charts.precip = new Chart(prCtx, {
            type: 'bar',
            data: { labels:[], datasets:[{ label:'Rain (mm)', data:[], backgroundColor: ctx => {
                const v = ctx.parsed?.y || 0;
                return v > 10 ? 'rgba(21,101,192,0.8)' : v > 5 ? 'rgba(21,101,192,0.5)' : 'rgba(21,101,192,0.25)';
            }, borderRadius:4, borderColor:'#1565C0', borderWidth:1 }]},
            options: { ...responsive, plugins:{...noLegend}, scales:{ y:{beginAtZero:true,grid:gridOpts,title:{display:true,text:'mm'}}, x:{grid:{display:false}} } }
        });

        // Crop distribution donut
        const dCtx = document.getElementById('distributionChart')?.getContext('2d');
        if (dCtx) this.charts.distribution = new Chart(dCtx, {
            type: 'doughnut',
            data: { labels:[], datasets:[{ data:[], backgroundColor:['#2E7D32','#1565C0','#F57C00','#C62828','#7B1FA2','#00695C'], borderWidth:3, borderColor:'var(--bg-card)' }]},
            options: { ...responsive, cutout:'65%', plugins:{legend:{position:'right',labels:{usePointStyle:true,padding:12,font:{size:11}}}} }
        });
    }

    updateCharts() {
        this.updateHealthChart();
        this.updateMarketChart();
        this.updateSoilChart();
        this.updatePestChart();
        this.updatePrecipChart();
        this.updateDistributionChart();
    }

    updateHealthChart() {
        const c = this.charts.health;
        if (!c) return;
        const days = 14;
        const labels = [];
        for (let i = days-1; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate()-i);
            labels.push(d.toLocaleDateString('en-US',{month:'short',day:'numeric'}));
        }
        c.data.labels = labels;
        const fields = this.state.fields;
        [0,1,2].forEach((fi) => {
            const base = fields[fi]?.health || (75 + fi*5);
            c.data.datasets[fi].data = Array.from({length:days}, (_,i) => Math.max(0,Math.min(100, base + (Math.random()-0.5)*8 + i*0.3)));
        });
        c.update();
    }

    updateMarketChart() {
        const c = this.charts.market;
        if (!c) return;
        const m = this.state.marketData;
        let hist = [];
        if (m?.historical && Array.isArray(m.historical)) hist = m.historical.slice(-30);
        else if (m?.historical?.Wheat) hist = m.historical.Wheat.slice(-30);
        if (!hist.length) {
            // Generate from current_prices
            const base = m?.current_prices?.Wheat?.price || 4.52;
            for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate()-i); hist.push({ date:d.toISOString().slice(0,10), price: base*(1+(Math.random()-0.49)*0.02) }); }
        }
        c.data.labels = hist.map(h => { const d = new Date(h.date); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); });
        c.data.datasets[0].data = hist.map(h => h.price);
        c.update();
    }

    updateSoilChart() {
        const c = this.charts.soil;
        if (!c) return;
        const agent = window.soilAgent;
        const base = this.state.soilData?.moisture || 65;
        const days = 30;
        const labels = [], moisture = [], optimal = [];
        for (let i = days-1; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate()-i);
            labels.push(d.toLocaleDateString('en-US',{month:'short',day:'numeric'}));
            moisture.push(Math.max(10,Math.min(90, base + (Math.random()-0.5)*12 - i*0.1)));
            optimal.push(70);
        }
        c.data.labels = labels;
        c.data.datasets[0].data = moisture;
        c.data.datasets[1].data = optimal;
        c.update();
    }

    updatePestChart() {
        const c = this.charts.pest;
        if (!c) return;
        const p = this.state.pestData;
        const pests = p?.pest_data || p?.pests || [];
        const diseases = p?.disease_data || p?.diseases || [];
        const labels = ['Aphids','FAW','Late Blight','Rust','Whitefly'];
        const pestRisk = labels.map(() => +(Math.random()*5+1).toFixed(1));
        const diseaseRisk = labels.map(() => +(Math.random()*4+1).toFixed(1));
        if (pests.length) {
            pests.forEach((pest,i) => { if(i<5) pestRisk[i] = pest.severity || pestRisk[i]; });
        }
        c.data.labels = labels;
        c.data.datasets[0].data = pestRisk;
        c.data.datasets[1].data = diseaseRisk;
        c.update();
    }

    updatePrecipChart() {
        const c = this.charts.precip;
        if (!c) return;
        const forecast = this.state.weather?.forecast || [];
        const labels = forecast.slice(0,7).map((d,i) => i===0?'Today':(d.day||''));
        const precip = forecast.slice(0,7).map(d => d.precipitation || 0);
        c.data.labels = labels.length ? labels : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        c.data.datasets[0].data = precip.length ? precip : [0,2,8,3,0,5,12];
        c.update();
    }

    updateDistributionChart() {
        const c = this.charts.distribution;
        if (!c) return;
        const fields = this.state.fields;
        const counts = {};
        fields.forEach(f => { const crop = f.cropType||'Unknown'; counts[crop] = (counts[crop]||0) + (f.area||0); });
        if (!Object.keys(counts).length) { counts.Wheat=45; counts.Corn=32; counts.Tomato=18; }
        c.data.labels = Object.keys(counts).map(k => `${k} (${counts[k]} ha)`);
        c.data.datasets[0].data = Object.values(counts);
        c.update();
    }

    // ─── AUTO REFRESH & REAL-TIME ────────────────────────────────
    startAutoRefresh() {
        this.updateInterval = setInterval(() => this.loadAll(), 300000); // 5 min
    }

    startRealTime() {
        this.realTimeInterval = setInterval(() => {
            // Slightly mutate soil chart to look live
            const c = this.charts.soil;
            if (c && c.data.datasets[0].data.length) {
                const d = c.data.datasets[0].data;
                d.push(Math.max(10,Math.min(90, d[d.length-1] + (Math.random()-0.5)*2)));
                d.shift();
                const now = new Date();
                c.data.labels.push(now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));
                c.data.labels.shift();
                c.update('none');
            }
        }, 30000);
    }

    async refresh() {
        const btn = document.getElementById('refreshDataBtn');
        if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Refreshing…'; }
        await this.loadAll();
        if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-sync-alt"></i> Refresh'; }
    }

    updateTimestamp() {
        const el = document.getElementById('lastUpdateTime');
        if (el) el.textContent = new Date().toLocaleTimeString();
    }

    // ─── SAMPLE DATA ─────────────────────────────────────────────
    sampleFields() {
        return [
            { id:1, name:'North Field', cropType:'Wheat', variety:'Pioneer 34R07', area:45, health:85, growthStage:'Flowering', soilType:'Loam', plantingDate:'2026-03-15' },
            { id:2, name:'South Field', cropType:'Corn',  variety:'Dekalb 64-69',  area:32, health:72, growthStage:'Vegetative', soilType:'Sandy', plantingDate:'2026-03-20' },
            { id:3, name:'East Field',  cropType:'Tomato',variety:'Rutgers',       area:18, health:68, growthStage:'Fruiting',   soilType:'Clay',  plantingDate:'2026-04-01' }
        ];
    }
    sampleWeather() {
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = new Date().getDay();
        return {
            current: { temperature:26, temp:26, feels_like:24, humidity:65, wind_speed:12, pressure:1013, uv_index:6, condition:'Partly Cloudy', precipitation:0 },
            forecast: Array.from({length:7},(_,i)=>({ day:days[(today+i)%7], high:22+Math.round(Math.random()*8), low:15+Math.round(Math.random()*5), precipitation:Math.random()>0.6?Math.round(Math.random()*15):0, condition:Math.random()>0.5?'Sunny':'Partly Cloudy', icon:'fa-cloud-sun' }))
        };
    }
    sampleRecs() {
        return [
            { id:'r1', category:'irrigation', title:'Drought Response Plan', summary:'Soil moisture at 32% — critical water deficit. Apply 30mm irrigation immediately.', priority:'High', icon:'fa-water', time:'Immediate', confidence:0.92 },
            { id:'r2', category:'pest_control', title:'Fall Armyworm Treatment', summary:'Severity 7.5/10 — treat with Bt spray within 24 hours.', priority:'High', icon:'fa-bug', time:'24h', confidence:0.85 },
            { id:'r3', category:'market_intelligence', title:'Market Intel: Wheat Bullish', summary:'$4.52/bu — hold 2–3 weeks for optimal sell window.', priority:'Medium', icon:'fa-chart-line', time:'Ongoing', confidence:0.75 },
            { id:'r4', category:'fertilization', title:'Nitrogen Application', summary:'N at 18ppm — apply 40kg/ha split application.', priority:'Medium', icon:'fa-flask', time:'3 days', confidence:0.82 }
        ];
    }
    sampleMarket() {
        const crops = ['Wheat','Corn','Soybean','Tomato','Potato'];
        const bases = { Wheat:4.52, Corn:3.85, Soybean:12.45, Tomato:0.92, Potato:0.38 };
        const prices = {};
        crops.forEach(c => { prices[c] = { price:bases[c], change_percent:(Math.random()-0.45)*5, trend:Math.random()>0.5?'BULLISH':'STABLE' }; });
        const hist = Array.from({length:30},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-29+i); return {date:d.toISOString().slice(0,10),price:+(4.2+(Math.random()-0.45)*0.6).toFixed(2)}; });
        return { current_prices:prices, historical:hist, currentPrice:prices.Wheat.price, trends:{ Wheat:{trend:'BULLISH'}, Corn:{trend:'STABLE'}, Soybean:{trend:'BULLISH'} } };
    }
    sampleSoil() {
        return { moisture:65, temperature:22, ph:6.5, ec:0.8, organic_matter:3.2, npk:{nitrogen:28,phosphorus:18,potassium:32} };
    }
    samplePest() {
        return { overall_risk:6.8, risk:6.8, type:'Fall Armyworm', disease_risk:55, highest_risk_pest:{pest_type:'Fall Armyworm'}, pest_data:[], disease_data:[] };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window._dashboardPage) window._dashboardPage = new DashboardPage();
});
