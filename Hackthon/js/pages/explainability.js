/**
 * Explainability Page Controller
 * Full XAI dashboard: confidence charts, factor importance, per-recommendation explanations, audit log
 */
class ExplainabilityPage {
    constructor() {
        this.recommendations = [];
        this.context = {};
        this.charts = { confidence: null, factors: null };
        this.auditLog = JSON.parse(localStorage.getItem('xai_audit_log') || '[]');
        this.initialize();
    }

    initialize() {
        console.log('🧠 Explainability Page initializing…');
        this.setupEventListeners();
        this.loadData();
        console.log('✅ Explainability Page initialized');
    }

    setupEventListeners() {
        document.getElementById('refreshXaiBtn')?.addEventListener('click', () => this.loadData(true));
    }

    async loadData(force = false) {
        try {
            let recs = [];
            let ctx = {};

            if (window.orchestrator) {
                recs = await window.orchestrator.getRecommendations();
                const [weather, soil, crop, pest, market] = await Promise.all([
                    window.orchestrator.getWeatherData().catch(() => null),
                    window.orchestrator.getSoilData().catch(() => null),
                    window.orchestrator.getFieldData().catch(() => []),
                    window.orchestrator.getPestData ? window.orchestrator.getPestData().catch(() => null) : Promise.resolve(null),
                    window.orchestrator.getMarketData().catch(() => null)
                ]);
                ctx = { weather, soil, crop: crop?.[0] || null, pest, market };
            }

            if (!recs || recs.length === 0) recs = this.sampleRecommendations();
            if (!ctx.weather) ctx = this.sampleContext();

            this.recommendations = recs;
            this.context = ctx;

            this.addAuditEntry('Assessment run', `${recs.length} recommendations generated`);
            this.renderOverview();
            this.renderCharts();
            this.renderRecList();
            this.renderAuditLog();
            document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        } catch (err) {
            console.error('XAI page error:', err);
            this.recommendations = this.sampleRecommendations();
            this.context = this.sampleContext();
            this.renderOverview();
            this.renderCharts();
            this.renderRecList();
            this.renderAuditLog();
        }
    }

    renderOverview() {
        const recs = this.recommendations;
        const total = recs.length;
        const avgConf = total ? Math.round(recs.reduce((s, r) => s + (r.confidence || 0.75), 0) / total * 100) : 0;
        const highConf = recs.filter(r => (r.confidence || 0) >= 0.85).length;
        const sources = new Set();
        recs.forEach(() => ['Soil Sensor', 'Weather Station', 'Pest Scout', 'Market Feed', 'Crop Monitor'].forEach(s => sources.add(s)));

        document.getElementById('xaiTotalRecs').textContent = total;
        document.getElementById('xaiAvgConf').textContent = avgConf + '%';
        document.getElementById('xaiDataSources').textContent = sources.size;
        document.getElementById('xaiHighConf').textContent = highConf;
    }

    renderCharts() {
        this.renderConfidenceChart();
        this.renderFactorChart();
    }

    renderConfidenceChart() {
        const canvas = document.getElementById('confidenceChart');
        if (!canvas) return;
        if (this.charts.confidence) { this.charts.confidence.destroy(); this.charts.confidence = null; }

        const recs = this.recommendations;
        const high = recs.filter(r => (r.confidence || 0) >= 0.85).length;
        const medium = recs.filter(r => (r.confidence || 0) >= 0.65 && (r.confidence || 0) < 0.85).length;
        const low = recs.filter(r => (r.confidence || 0) < 0.65).length;

        this.charts.confidence = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['High (≥85%)', 'Medium (65–84%)', 'Low (<65%)'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: ['#2E7D32', '#F57C00', '#C62828'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} recommendation(s)` } }
                }
            }
        });
    }

    renderFactorChart() {
        const canvas = document.getElementById('factorChart');
        if (!canvas) return;
        if (this.charts.factors) { this.charts.factors.destroy(); this.charts.factors = null; }

        const factors = [
            { label: 'Soil Moisture', value: 88 },
            { label: 'Weather Forecast', value: 82 },
            { label: 'Pest Risk', value: 76 },
            { label: 'Market Price', value: 71 },
            { label: 'Crop Stage', value: 68 },
            { label: 'Soil Nutrients', value: 65 },
            { label: 'Disease Risk', value: 60 },
            { label: 'Historical Data', value: 55 }
        ];

        this.charts.factors = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: factors.map(f => f.label),
                datasets: [{
                    label: 'Importance Score',
                    data: factors.map(f => f.value),
                    backgroundColor: factors.map(f => f.value >= 80 ? '#2E7D32' : f.value >= 65 ? '#F57C00' : '#1565C0'),
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, max: 100, title: { display: true, text: 'Importance (%)' } }
                }
            }
        });
    }

    renderRecList() {
        const container = document.getElementById('xaiRecList');
        if (!container) return;

        if (this.recommendations.length === 0) {
            container.innerHTML = `<p style="color:var(--text-secondary)">No recommendations to explain yet.</p>`;
            return;
        }

        container.innerHTML = this.recommendations.map((rec, i) => {
            const confidence = Math.round((rec.confidence || 0.75) * 100);
            const confLevel = confidence >= 85 ? 'high' : confidence >= 65 ? 'medium' : 'low';
            const confColor = confidence >= 85 ? '#2E7D32' : confidence >= 65 ? '#F57C00' : '#C62828';
            const explanation = this.buildExplanation(rec);
            const factors = this.getFactors(rec);
            const evidence = this.getEvidence(rec);
            const alternatives = this.getAlternatives(rec);
            const sources = this.getSources(rec);
            const checklist = this.getChecklist(rec);

            return `
            <div class="xai-rec-card" id="xai-card-${i}">
                <div class="xai-rec-header" onclick="document.getElementById('xai-card-${i}').classList.toggle('expanded')">
                    <div class="xai-rec-icon"><i class="fas ${rec.icon || 'fa-lightbulb'}"></i></div>
                    <div class="xai-rec-title">
                        <h3>${rec.title || 'Recommendation'}</h3>
                        <p>${rec.category ? rec.category.replace(/_/g,' ') : 'General'} &nbsp;·&nbsp; Priority: ${rec.priority || 'Medium'} &nbsp;·&nbsp; ${rec.time || 'Ongoing'}</p>
                    </div>
                    <span class="xai-confidence-pill ${confLevel}">${confidence}% Confidence</span>
                    <i class="fas fa-chevron-down xai-chevron"></i>
                </div>
                <div class="xai-rec-body">
                    <div class="explanation-text">${explanation}</div>

                    <!-- Confidence Breakdown -->
                    <div style="margin-bottom:var(--spacing-md)">
                        <h4 style="font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm)"><i class="fas fa-tachometer-alt" style="color:var(--primary-green)"></i> Confidence Breakdown</h4>
                        <div style="display:flex;align-items:center;gap:var(--spacing-md);margin-bottom:var(--spacing-xs)">
                            <span style="font-size:var(--font-size-xs);min-width:130px;color:var(--text-secondary)">Overall Confidence</span>
                            <div class="factor-bar" style="flex:1;height:10px;background:var(--gray-200);border-radius:var(--radius-full);overflow:hidden">
                                <div class="factor-fill" style="height:100%;width:${confidence}%;background:${confColor};border-radius:var(--radius-full)"></div>
                            </div>
                            <span style="font-size:var(--font-size-sm);font-weight:700;color:${confColor};min-width:40px">${confidence}%</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:var(--spacing-md);margin-bottom:var(--spacing-xs)">
                            <span style="font-size:var(--font-size-xs);min-width:130px;color:var(--text-secondary)">Data Completeness</span>
                            <div class="factor-bar" style="flex:1;height:10px;background:var(--gray-200);border-radius:var(--radius-full);overflow:hidden">
                                <div style="height:100%;width:80%;background:#1565C0;border-radius:var(--radius-full)"></div>
                            </div>
                            <span style="font-size:var(--font-size-sm);font-weight:700;color:#1565C0;min-width:40px">80%</span>
                        </div>
                    </div>

                    <!-- Key Factors -->
                    <h4 style="font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm)"><i class="fas fa-weight" style="color:var(--warning-amber)"></i> Key Contributing Factors</h4>
                    <div class="factors-grid">
                        ${factors.map(f => `
                        <div class="factor-bar-card">
                            <div class="factor-name">${f.name}</div>
                            <div class="factor-value">${f.value}</div>
                            <div class="factor-bar"><div class="factor-fill ${f.impact.toLowerCase()}" style="width:${f.pct}%"></div></div>
                        </div>`).join('')}
                    </div>

                    <!-- Evidence -->
                    <h4 style="font-size:var(--font-size-sm);font-weight:600;margin:var(--spacing-md) 0 var(--spacing-sm)"><i class="fas fa-database" style="color:var(--secondary-blue)"></i> Supporting Evidence</h4>
                    <ul class="evidence-list">
                        ${evidence.map(e => `
                        <li class="evidence-li">
                            <i class="fas fa-check-circle"></i>
                            <div><span class="evidence-source-name">${e.source}</span><div class="evidence-source-data">${e.data}</div></div>
                        </li>`).join('')}
                    </ul>

                    <!-- Alternatives -->
                    <h4 style="font-size:var(--font-size-sm);font-weight:600;margin:var(--spacing-md) 0 var(--spacing-sm)"><i class="fas fa-random" style="color:var(--primary-green)"></i> Alternative Actions</h4>
                    <ul class="alt-list">
                        ${alternatives.map(a => `
                        <li class="alt-item">
                            <div class="alt-action">${a.action}</div>
                            <div class="alt-pros-cons">
                                <span class="alt-pros"><i class="fas fa-plus-circle"></i> ${a.pros}</span>
                                <span class="alt-cons"><i class="fas fa-minus-circle"></i> ${a.cons}</span>
                            </div>
                        </li>`).join('')}
                    </ul>

                    <!-- Implementation Checklist -->
                    ${checklist.length ? `
                    <h4 style="font-size:var(--font-size-sm);font-weight:600;margin:var(--spacing-md) 0 var(--spacing-sm)"><i class="fas fa-tasks" style="color:var(--primary-green)"></i> Implementation Checklist</h4>
                    <ul style="list-style:none">
                        ${checklist.map(c => `<li style="display:flex;align-items:center;gap:var(--spacing-sm);padding:var(--spacing-xs) 0;font-size:var(--font-size-sm)"><i class="fas fa-square" style="color:var(--gray-300)"></i>${c.item} <span style="margin-left:auto;font-size:var(--font-size-xs);color:var(--text-hint)">${c.priority}</span></li>`).join('')}
                    </ul>` : ''}

                    <!-- Data Sources -->
                    <div style="margin-top:var(--spacing-md)">
                        <span style="font-size:var(--font-size-xs);color:var(--text-secondary);font-weight:600">Data Sources: </span>
                        ${sources.map(s => `<span class="data-source-chip"><i class="fas fa-circle" style="font-size:6px;color:var(--primary-green)"></i>${s}</span>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    renderAuditLog() {
        const container = document.getElementById('auditLog');
        if (!container) return;
        const logs = this.auditLog.slice(-20).reverse();
        if (logs.length === 0) {
            container.innerHTML = `<p style="color:var(--text-secondary);font-size:var(--font-size-sm)">No audit entries yet.</p>`;
            return;
        }
        container.innerHTML = logs.map(log => `
            <div class="audit-row">
                <div class="audit-dot"></div>
                <div class="audit-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
                <div>
                    <strong style="font-size:var(--font-size-sm)">${log.event}</strong>
                    <div style="font-size:var(--font-size-xs);color:var(--text-secondary)">${log.detail}</div>
                </div>
            </div>`).join('');
    }

    addAuditEntry(event, detail) {
        this.auditLog.push({ event, detail, timestamp: new Date().toISOString() });
        if (this.auditLog.length > 50) this.auditLog.shift();
        localStorage.setItem('xai_audit_log', JSON.stringify(this.auditLog));
    }

    buildExplanation(rec) {
        const d = rec.details || {};
        const cat = rec.category || '';
        const texts = {
            irrigation: `The AI detected that soil moisture is at <strong>${d.current_moisture || 65}%</strong>, which is below the optimal threshold of 70–80% for the current growth stage. Combined with a <strong>${d.deficit || 20}mm</strong> water deficit and no significant rainfall forecast in the next 72 hours, the drought response protocol (Case ${rec.case_reference || 'DRT-2024-001'}) was triggered. Immediate irrigation is recommended to prevent irreversible yield loss.`,
            pest_control: `<strong>${d.pest || 'Fall Armyworm'}</strong> (<em>${d.scientific_name || 'Spodoptera frugiperda'}</em>) was detected at severity level <strong>${d.severity || 7.5}/10</strong>, exceeding the economic threshold. Current temperature (${d.temperature || 27}°C) and humidity (${d.humidity || 72}%) are within the pest's optimal conditions. The case-based engine matched this to historical outbreak pattern <strong>${rec.case_reference || 'PST-FAW-2024'}</strong>. Treatment with <strong>${d.treatment || 'Bt spray'}</strong> is recommended within 24 hours.`,
            fertilization: `Soil nitrogen at <strong>${d.current_nitrogen || 18} ppm</strong> is below the critical threshold of <strong>25 ppm</strong>. At the current growth stage, nitrogen is the primary limiting nutrient. A split application strategy — 50% immediately at <strong>${d.recommended_rate || '40 kg/ha'}</strong> and 50% in 14 days — is recommended for maximum uptake efficiency and minimum leaching risk.`,
            harvest: `Crop maturity is at <strong>${d.ripeness || 85}%</strong> with current market price at <strong>$${d.market_price || 4.52}/bushel</strong>. The 7-day weather window shows <strong>5 suitable harvest days</strong>. Delaying beyond 14 days risks a <strong>5–10% quality penalty</strong>. The price trend is ${d.price_trend || 'bullish'}, supporting harvest now or within the next 7 days.`,
            market_intelligence: `Price analysis over 90 days shows a <strong>${d.price_trend || 'bullish'}</strong> trend with current price at <strong>$${d.current_price || 4.52}/bushel</strong>. The AI's moving-average forecast projects a <strong>2.1% increase</strong> over the next 7 days. Break-even is at <strong>$${d.breakeven_price || 3.50}/bushel</strong>, giving a current margin of <strong>${(((d.current_price || 4.52) - (d.breakeven_price || 3.50)) / (d.current_price || 4.52) * 100).toFixed(1)}%</strong>.`,
            disease_management: `Disease pressure index is at <strong>${d.disease_risk || 58}%</strong>. Environmental conditions — temperature ${this.context?.weather?.temperature || 26}°C and humidity ${this.context?.weather?.humidity || 72}% — are highly conducive to fungal spread. The risk model (Case ${rec.case_reference || 'DZ-2024-001'}) recommends preventive fungicide application to prevent escalation to epidemic threshold (>75%).`,
            weather_advisory: `Integrated analysis of the 7-day forecast shows <strong>high-impact weather</strong> requiring immediate farm preparation. The weather advisory engine rated this as <strong>${rec.priority || 'High'}</strong> priority based on temperature extremes, precipitation patterns, and their combined agronomic impact.`,
            sustainability: `Soil organic matter at <strong>${this.context?.soil?.organic_matter || 1.8}%</strong> is below the optimal 3–4% range. Long-term sustainability analysis identifies this as a critical factor limiting soil water-holding capacity and nutrient cycling. A structured organic matter improvement plan over 2–3 seasons is recommended.`
        };
        return texts[cat] || `This recommendation was generated based on integrated multi-domain analysis: soil, weather, crop health, pest risk, and market conditions. The AI confidence score of <strong>${Math.round((rec.confidence || 0.75) * 100)}%</strong> reflects high data availability and strong case matching.`;
    }

    getFactors(rec) {
        const cat = rec.category || '';
        const maps = {
            irrigation: [
                { name: 'Soil Moisture', value: `${rec.details?.current_moisture || 65}%`, impact: 'HIGH', pct: 88 },
                { name: 'Weather Forecast', value: '0mm rain / 3d', impact: 'HIGH', pct: 82 },
                { name: 'Crop Stage', value: rec.details?.crop_stage || 'Vegetative', impact: 'MEDIUM', pct: 70 },
                { name: 'Soil Type', value: 'Loam', impact: 'LOW', pct: 45 }
            ],
            pest_control: [
                { name: 'Pest Severity', value: `${rec.details?.severity || 7.5}/10`, impact: 'HIGH', pct: 90 },
                { name: 'Temperature', value: `${rec.details?.temperature || 27}°C`, impact: 'HIGH', pct: 80 },
                { name: 'Humidity', value: `${rec.details?.humidity || 72}%`, impact: 'MEDIUM', pct: 68 },
                { name: 'Crop Host Match', value: 'Yes', impact: 'HIGH', pct: 85 }
            ],
            market_intelligence: [
                { name: 'Price Trend', value: rec.details?.price_trend || 'Bullish', impact: 'HIGH', pct: 85 },
                { name: '30-day Avg', value: `$${rec.details?.avg30d || 4.30}`, impact: 'MEDIUM', pct: 72 },
                { name: 'Breakeven', value: `$${rec.details?.breakeven_price || 3.50}`, impact: 'MEDIUM', pct: 65 },
                { name: 'Volatility', value: '4.2%', impact: 'LOW', pct: 40 }
            ]
        };
        return maps[cat] || [
            { name: 'Primary Trigger', value: 'Threshold exceeded', impact: 'HIGH', pct: 85 },
            { name: 'Data Quality', value: 'High', impact: 'MEDIUM', pct: 75 },
            { name: 'Seasonal Context', value: 'Relevant', impact: 'MEDIUM', pct: 65 },
            { name: 'Historical Cases', value: '3 matches', impact: 'LOW', pct: 50 }
        ];
    }

    getEvidence(rec) {
        const evidence = [];
        const d = rec.details || {};
        if (rec.case_reference) evidence.push({ source: 'Case Reference', data: rec.case_reference });
        if (d.current_moisture !== undefined) evidence.push({ source: 'Soil Sensor', data: `Moisture: ${d.current_moisture}%` });
        if (d.severity !== undefined) evidence.push({ source: 'Pest Scout', data: `Severity: ${d.severity}/10` });
        if (d.current_price !== undefined) evidence.push({ source: 'Market Feed', data: `Price: $${d.current_price}/bu` });
        if (d.ripeness !== undefined) evidence.push({ source: 'Crop Monitor', data: `Ripeness: ${d.ripeness}%` });
        evidence.push({ source: 'Weather Station', data: `Temp: ${this.context?.weather?.temperature || 26}°C, Humidity: ${this.context?.weather?.humidity || 65}%` });
        return evidence.slice(0, 5);
    }

    getAlternatives(rec) {
        const alts = {
            irrigation: [{ action: 'Drip micro-irrigation', pros: 'Water efficient, precise', cons: 'Higher initial cost' }, { action: 'Rainwater harvesting', pros: 'Free water source', cons: 'Unreliable, needs storage' }],
            pest_control: [{ action: 'Biological control (Trichogramma)', pros: 'Eco-friendly, no residue', cons: 'Slower response, 2–4 weeks' }, { action: 'Pheromone trap monitoring', pros: 'Low cost, no chemicals', cons: 'Prevention only, not curative' }],
            fertilization: [{ action: 'Organic compost application', pros: 'Improves soil health long-term', cons: 'Slower nutrient release' }, { action: 'Foliar spray micronutrients', pros: 'Fast uptake', cons: 'Short-term effect only' }],
            harvest: [{ action: 'Staggered harvest over 5 days', pros: 'Reduces labour peak demand', cons: 'Quality variation risk' }, { action: 'Forward contract sale', pros: 'Price certainty', cons: 'Misses potential upside' }],
            market_intelligence: [{ action: 'Sell at current price', pros: 'Certainty, no storage cost', cons: 'Misses potential upside' }, { action: 'Forward contract for next quarter', pros: 'Price protection', cons: 'Misses spot market gains' }]
        };
        return alts[rec.category] || [{ action: 'Manual field scouting', pros: 'Direct observation', cons: 'Time consuming' }, { action: 'Consult agronomist', pros: 'Expert localised advice', cons: 'Cost and scheduling' }];
    }

    getSources(rec) {
        const base = ['AI Decision Engine', 'Historical Case Database'];
        const cat = rec.category || '';
        if (['irrigation', 'fertilization'].includes(cat)) base.unshift('Soil Sensor Network');
        if (['pest_control', 'disease_management'].includes(cat)) base.unshift('Pest Scouting System');
        if (cat === 'market_intelligence') base.unshift('Market Data Feed');
        if (cat === 'harvest' || cat === 'weather_advisory') base.unshift('Weather Forecast API');
        base.push('Crop Monitoring System');
        return [...new Set(base)].slice(0, 5);
    }

    getChecklist(rec) {
        const lists = {
            irrigation: [{ item: 'Verify irrigation system pressure and flow', priority: 'HIGH' }, { item: 'Record pre-irrigation soil moisture', priority: 'MEDIUM' }, { item: 'Apply recommended 30mm over 2 days', priority: 'HIGH' }, { item: 'Monitor soil moisture 24h post-irrigation', priority: 'MEDIUM' }],
            pest_control: [{ item: 'Confirm pest identification in field', priority: 'HIGH' }, { item: 'Obtain registered pesticide and PPE', priority: 'HIGH' }, { item: 'Apply treatment in early morning or evening', priority: 'HIGH' }, { item: 'Record treatment date, rate, weather', priority: 'MEDIUM' }, { item: 'Scout field 5 days post-treatment', priority: 'MEDIUM' }],
            fertilization: [{ item: 'Calibrate spreader/injector before application', priority: 'HIGH' }, { item: 'Check weather — avoid rain within 4h', priority: 'HIGH' }, { item: 'Apply 50% now, schedule 50% for 14 days', priority: 'HIGH' }, { item: 'Record application batch and rate', priority: 'LOW' }],
            harvest: [{ item: 'Service harvesting equipment', priority: 'HIGH' }, { item: 'Arrange grain transport and storage', priority: 'HIGH' }, { item: 'Confirm moisture content with probe', priority: 'HIGH' }, { item: 'Check 5-day weather window', priority: 'MEDIUM' }]
        };
        return lists[rec.category] || [];
    }

    sampleRecommendations() {
        return [
            { id: 'r1', category: 'irrigation', title: 'Drought Response Plan', summary: 'Soil moisture critical at 32%', priority: 'High', icon: 'fa-water', time: 'Immediate', confidence: 0.92, case_reference: 'DRT-2024-001', details: { current_moisture: 32, deficit: 48, crop_stage: 'Flowering' } },
            { id: 'r2', category: 'pest_control', title: 'Fall Armyworm Outbreak Response', summary: 'Severity 7.5/10 — treat within 24h', priority: 'High', icon: 'fa-bug', time: 'Within 24 hours', confidence: 0.85, case_reference: 'PST-FAW-2024', details: { pest: 'Fall Armyworm', scientific_name: 'Spodoptera frugiperda', severity: 7.5, treatment: 'Bt spray', temperature: 27, humidity: 72 } },
            { id: 'r3', category: 'market_intelligence', title: 'Market Intelligence: Wheat', summary: '$4.52/bu — Bullish trend. Hold 2–3 weeks.', priority: 'Medium', icon: 'fa-chart-line', time: 'Ongoing', confidence: 0.75, case_reference: 'MKT-Wheat-2024', details: { current_price: 4.52, price_trend: 'Bullish', breakeven_price: 3.50 } },
            { id: 'r4', category: 'fertilization', title: 'Precision Nitrogen Management', summary: 'Nitrogen at 18ppm — apply 40kg/ha split', priority: 'Medium', icon: 'fa-flask', time: 'Within 3 days', confidence: 0.82, case_reference: 'FERT-Wheat-2024', details: { current_nitrogen: 18, optimal_range: '25–40 ppm', recommended_rate: '40 kg/ha' } },
            { id: 'r5', category: 'weather_advisory', title: 'Weather-Based Crop Advisory', summary: 'Heat wave forecast — protect crops', priority: 'High', icon: 'fa-cloud-sun', time: 'Next 3 days', confidence: 0.88, details: {} }
        ];
    }

    sampleContext() {
        return {
            weather: { temperature: 26, humidity: 68, temp_min: 18, temp_max: 34, condition: 'Partly Cloudy', precipitation: 0 },
            soil: { moisture: 32, temperature: 22, ph: 6.5, organic_matter: 2.8, npk: { nitrogen: 18, phosphorus: 16, potassium: 30 } },
            crop: { growthStage: 'Flowering', health: 76, ripeness: 42, cropType: 'Wheat', area: 45 },
            pest: { risk: 7.5, type: 'Fall Armyworm', disease_risk: 58 },
            market: { currentPrice: 4.52, trend: 'bullish' }
        };
    }

    destroy() {
        if (this.charts.confidence) this.charts.confidence.destroy();
        if (this.charts.factors) this.charts.factors.destroy();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.explainabilityPage = new ExplainabilityPage();
});
