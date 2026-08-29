/**
 * Recommendations Page Controller
 * Full AI recommendation feed with XAI explanations, filtering, sorting, and feedback
 */
class RecommendationsPage {
    constructor() {
        this.recommendations = [];
        this.filtered = [];
        this.activeFilter = 'all';
        this.activeSort = 'priority';
        this.feedbackMap = JSON.parse(localStorage.getItem('rec_feedback') || '{}');
        this.initialize();
    }

    initialize() {
        console.log('💡 Recommendations Page initializing…');
        this.setupEventListeners();
        this.loadRecommendations();
    }

    setupEventListeners() {
        document.getElementById('refreshRecsBtn')?.addEventListener('click', () => this.loadRecommendations());
        document.getElementById('exportRecsBtn')?.addEventListener('click', () => this.exportRecommendations());

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter;
                this.applyFilterSort();
            });
        });

        document.getElementById('sortSelect')?.addEventListener('change', e => {
            this.activeSort = e.target.value;
            this.applyFilterSort();
        });
    }

    async loadRecommendations() {
        this.showLoading(true);
        try {
            let recs = [];
            if (window.orchestrator) {
                recs = await window.orchestrator.getRecommendations();
            }
            if (!recs || recs.length === 0) {
                recs = this.generateSampleRecommendations();
            }
            this.recommendations = recs;
            this.applyFilterSort();
            this.updateSummary();
            document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        } catch (err) {
            console.error('Failed to load recommendations:', err);
            this.recommendations = this.generateSampleRecommendations();
            this.applyFilterSort();
            this.updateSummary();
        } finally {
            this.showLoading(false);
        }
    }

    applyFilterSort() {
        let list = [...this.recommendations];

        // Filter
        if (this.activeFilter !== 'all') {
            if (this.activeFilter === 'high') {
                list = list.filter(r => (r.priority || '').toLowerCase() === 'high' || (r.priority || '').toLowerCase() === 'critical');
            } else if (this.activeFilter === 'medium') {
                list = list.filter(r => (r.priority || '').toLowerCase() === 'medium');
            } else {
                list = list.filter(r => (r.category || '') === this.activeFilter);
            }
        }

        // Sort
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (this.activeSort === 'priority') {
            list.sort((a, b) => (priorityOrder[(a.priority || '').toLowerCase()] ?? 4) - (priorityOrder[(b.priority || '').toLowerCase()] ?? 4));
        } else if (this.activeSort === 'confidence') {
            list.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        } else if (this.activeSort === 'category') {
            list.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        }

        this.filtered = list;
        this.renderList();
    }

    updateSummary() {
        const recs = this.recommendations;
        document.getElementById('totalCount').textContent = recs.length;
        document.getElementById('highCount').textContent = recs.filter(r => ['high','critical'].includes((r.priority||'').toLowerCase())).length;
        document.getElementById('mediumCount').textContent = recs.filter(r => (r.priority||'').toLowerCase() === 'medium').length;
        document.getElementById('lowCount').textContent = recs.filter(r => (r.priority||'').toLowerCase() === 'low').length;
        const avg = recs.length ? Math.round(recs.reduce((s, r) => s + (r.confidence || 0.75) * 100, 0) / recs.length) : 0;
        document.getElementById('avgConfidence').textContent = avg + '%';
    }

    renderList() {
        const container = document.getElementById('recList');
        if (!container) return;

        if (this.filtered.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-lightbulb"></i><p>No recommendations match this filter.</p></div>`;
            return;
        }

        container.innerHTML = this.filtered.map(rec => this.renderCard(rec)).join('');

        // Expand/collapse
        container.querySelectorAll('.rec-card-header').forEach(header => {
            header.addEventListener('click', () => {
                header.closest('.rec-card').classList.toggle('expanded');
            });
        });

        // Feedback buttons
        container.querySelectorAll('.btn-feedback').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const recId = btn.dataset.recid;
                const type = btn.dataset.type;
                this.recordFeedback(recId, type, btn);
            });
        });
    }

    renderCard(rec) {
        const priorityClass = (rec.priority || 'medium').toLowerCase();
        const categoryClass = `icon-${rec.category || 'general'}`;
        const confidence = Math.round((rec.confidence || 0.75) * 100);
        const confLevel = confidence >= 85 ? 'high' : confidence >= 65 ? 'medium' : 'low';
        const confColor = confidence >= 85 ? '#2E7D32' : confidence >= 65 ? '#F57C00' : '#C62828';
        const feedback = this.feedbackMap[rec.id] || null;

        const actions = (rec.details?.recommended_actions || []).slice(0, 4);
        const evidence = this.buildEvidence(rec);

        return `
        <div class="rec-card" id="card-${rec.id}">
            <div class="rec-card-header">
                <div class="rec-card-icon ${categoryClass}">
                    <i class="fas ${rec.icon || 'fa-lightbulb'}"></i>
                </div>
                <div class="rec-card-meta">
                    <div class="rec-card-title">${rec.title || 'Recommendation'}</div>
                    <div class="rec-card-summary">${rec.summary || ''}</div>
                    <div class="rec-card-badges">
                        <span class="priority-badge ${priorityClass}">${rec.priority || 'Medium'}</span>
                        <span class="time-badge"><i class="fas fa-clock"></i> ${rec.time || 'Ongoing'}</span>
                        <span class="confidence-badge">Confidence: <strong style="color:${confColor}">${confidence}%</strong></span>
                        ${rec.category ? `<span class="time-badge">${rec.category.replace(/_/g,' ')}</span>` : ''}
                    </div>
                </div>
                <i class="fas fa-chevron-down rec-chevron"></i>
            </div>
            <div class="rec-card-body">
                ${actions.length ? `
                <h4 style="font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm)"><i class="fas fa-tasks" style="color:var(--primary-green)"></i> Recommended Actions</h4>
                <ul class="rec-actions-list">
                    ${actions.map(a => `<li><i class="fas fa-check-circle"></i><span>${a}</span></li>`).join('')}
                </ul>` : ''}

                <div class="explanation-block">
                    <h4><i class="fas fa-brain"></i> Why this recommendation?</h4>
                    <p style="font-size:var(--font-size-sm);line-height:1.7">${this.buildExplanationText(rec)}</p>
                    <div class="confidence-bar-wrapper" style="margin-top:var(--spacing-md)">
                        <span style="font-size:var(--font-size-xs);color:var(--text-secondary);min-width:80px">Confidence</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width:${confidence}%;background:${confColor}"></div>
                        </div>
                        <span style="font-size:var(--font-size-sm);font-weight:700;color:${confColor}">${confidence}% ${confLevel.toUpperCase()}</span>
                    </div>
                </div>

                ${evidence.length ? `
                <div style="margin-top:var(--spacing-md)">
                    <h4 style="font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm)"><i class="fas fa-database" style="color:var(--secondary-blue)"></i> Supporting Evidence</h4>
                    <div class="evidence-grid">
                        ${evidence.map(e => `
                        <div class="evidence-item">
                            <div class="evidence-source">${e.source}</div>
                            <div class="evidence-data">${e.data}</div>
                        </div>`).join('')}
                    </div>
                </div>` : ''}

                <div class="rec-footer-actions">
                    <span style="font-size:var(--font-size-xs);color:var(--text-secondary);line-height:28px">Was this helpful?</span>
                    <button class="btn-feedback ${feedback === 'helpful' ? 'helpful' : ''}" data-recid="${rec.id}" data-type="helpful">
                        <i class="fas fa-thumbs-up"></i> Helpful
                    </button>
                    <button class="btn-feedback ${feedback === 'not-helpful' ? 'not-helpful' : ''}" data-recid="${rec.id}" data-type="not-helpful">
                        <i class="fas fa-thumbs-down"></i> Not Helpful
                    </button>
                    <a href="farmer-feedback.html" class="btn-feedback" style="text-decoration:none">
                        <i class="fas fa-comment-alt"></i> Full Feedback
                    </a>
                    <a href="explainability.html" class="btn-feedback" style="text-decoration:none">
                        <i class="fas fa-brain"></i> Explain More
                    </a>
                </div>
            </div>
        </div>`;
    }

    buildExplanationText(rec) {
        const d = rec.details || {};
        const cat = rec.category || '';
        if (cat === 'irrigation') {
            return `Soil moisture is at <strong>${d.current_moisture || 65}%</strong>, which is below the optimal range of 70–80%. The crop in its current growth stage requires adequate water to maintain yield potential. ${d.recommended_actions ? 'Immediate irrigation is recommended to prevent moisture stress.' : ''}`;
        }
        if (cat === 'pest_control') {
            return `<strong>${d.pest || 'Pest'}</strong> (<em>${d.scientific_name || ''}</em>) detected at severity <strong>${d.severity || 5}/10</strong>, exceeding the economic threshold. Current temperature and humidity conditions are favorable for population growth. Treatment with <strong>${d.treatment || 'recommended pesticide'}</strong> is advised.`;
        }
        if (cat === 'fertilization') {
            return `Nitrogen levels at <strong>${d.current_nitrogen || 20} ppm</strong> are below the optimal range of <strong>${d.optimal_range || '25–40 ppm'}</strong>. At the current growth stage, adequate nitrogen is critical for canopy development and grain fill. Split application is recommended for maximum uptake efficiency.`;
        }
        if (cat === 'harvest') {
            return `Crop ripeness is at <strong>${d.ripeness || 85}%</strong> — within the optimal harvest window. Current market price of <strong>$${d.market_price || 4.25}/bushel</strong> shows a <strong>${d.price_trend || 'stable'}</strong> trend. Delaying harvest beyond 14 days risks quality degradation and weather-related losses.`;
        }
        if (cat === 'market_intelligence') {
            return `Current price of <strong>$${d.current_price || 4.25}/bushel</strong> is trending <strong>${d.price_trend || 'stable'}</strong>. Analysis of seasonal patterns and global supply/demand balance suggests <strong>${d.outlook || 'a hold strategy'}</strong>. Break-even price is estimated at <strong>$${d.breakeven_price || 3.50}</strong>.`;
        }
        if (cat === 'disease_management') {
            return `Disease risk is at <strong>${d.disease_risk || 60}%</strong> — high enough to warrant preventive action. Current weather conditions (temperature and humidity) are conducive to pathogen spread. Preventive fungicide application is recommended to protect yield.`;
        }
        if (cat === 'weather_advisory') {
            return `Weather analysis over the next 7 days shows conditions that may impact farm operations. ${rec.summary || 'Monitor conditions closely and adjust scheduled activities accordingly.'}`;
        }
        return rec.summary || 'This recommendation is based on integrated analysis of weather, soil, crop, pest, and market data collected by the AI agent network.';
    }

    buildEvidence(rec) {
        const evidence = [];
        const d = rec.details || {};
        const cat = rec.category || '';

        if (cat === 'irrigation' || cat === 'fertilization') {
            evidence.push({ source: 'Soil Sensor', data: `Moisture: ${d.current_moisture || 65}%, pH: ${d.ph || 6.5}` });
        }
        if (cat === 'pest_control' || cat === 'disease_management') {
            evidence.push({ source: 'Pest Scout', data: `${d.pest || 'Pest'} severity: ${d.severity || 5}/10` });
            evidence.push({ source: 'Weather Station', data: `Temp: ${d.temperature || 25}°C, Humidity: ${d.humidity || 65}%` });
        }
        if (cat === 'harvest') {
            evidence.push({ source: 'Crop Monitor', data: `Ripeness: ${d.ripeness || 85}%` });
            evidence.push({ source: 'Market Feed', data: `Price: $${d.market_price || 4.25}/bu` });
        }
        if (cat === 'market_intelligence') {
            evidence.push({ source: 'Market API', data: `Current: $${d.current_price || 4.25}` });
            evidence.push({ source: 'Price Model', data: `Trend: ${d.price_trend || 'Stable'}` });
        }
        if (rec.case_reference) {
            evidence.push({ source: 'Case Reference', data: rec.case_reference });
        }
        return evidence.slice(0, 4);
    }

    recordFeedback(recId, type, btn) {
        this.feedbackMap[recId] = type;
        localStorage.setItem('rec_feedback', JSON.stringify(this.feedbackMap));
        // Update button styles in DOM
        const card = document.getElementById(`card-${recId}`);
        if (card) {
            card.querySelectorAll('.btn-feedback[data-recid]').forEach(b => {
                b.classList.remove('helpful', 'not-helpful');
            });
            btn.classList.add(type === 'helpful' ? 'helpful' : 'not-helpful');
        }
    }

    exportRecommendations() {
        const data = { recommendations: this.recommendations, exported_at: new Date().toISOString(), filter: this.activeFilter };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recommendations_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading(show) {
        const loader = document.getElementById('recLoading');
        const list = document.getElementById('recList');
        if (loader) loader.style.display = show ? 'block' : 'none';
        if (list) list.style.display = show ? 'none' : 'block';
    }

    generateSampleRecommendations() {
        return [
            {
                id: 'rec-sample-001',
                category: 'irrigation',
                title: 'Drought Response Plan',
                summary: 'Soil moisture at 32% — critical water deficit. Immediate irrigation required.',
                priority: 'High',
                icon: 'fa-water',
                time: 'Immediate',
                confidence: 0.92,
                case_reference: 'DRT-2024-001',
                details: {
                    current_moisture: 32,
                    recommended_actions: [
                        'Apply emergency irrigation 30mm over 2 days',
                        'Reduce crop density through selective pruning',
                        'Apply anti-transpirants to reduce water loss',
                        'Mulch around plants to conserve soil moisture'
                    ]
                }
            },
            {
                id: 'rec-sample-002',
                category: 'pest_control',
                title: 'Fall Armyworm Outbreak Response',
                summary: 'Fall Armyworm detected at 7.5/10 severity. Treat within 24 hours.',
                priority: 'High',
                icon: 'fa-bug',
                time: 'Within 24 hours',
                confidence: 0.85,
                case_reference: 'PST-FAW-2024',
                details: {
                    pest: 'Fall Armyworm',
                    scientific_name: 'Spodoptera frugiperda',
                    severity: 7.5,
                    treatment: 'Bt spray or synthetic pyrethroids',
                    temperature: 27,
                    humidity: 72,
                    recommended_actions: [
                        'Apply Bt spray or synthetic pyrethroids immediately',
                        'Monitor for 7 days post-treatment',
                        'Remove and destroy heavily infested plants',
                        'Practice crop rotation next season'
                    ]
                }
            },
            {
                id: 'rec-sample-003',
                category: 'fertilization',
                title: 'Precision Nitrogen Management',
                summary: 'Nitrogen at 18 ppm — below optimal range. Split application recommended.',
                priority: 'Medium',
                icon: 'fa-flask',
                time: 'Within 3 days',
                confidence: 0.82,
                case_reference: 'FERT-Wheat-2024',
                details: {
                    current_nitrogen: 18,
                    optimal_range: '25–40 ppm',
                    recommended_actions: [
                        'Apply 40 kg/ha urea — split 50% now, 50% in 14 days',
                        'Broadcast and incorporate into top 5cm of soil',
                        'Monitor leaf colour for nitrogen response',
                        'Avoid application before heavy rain'
                    ]
                }
            },
            {
                id: 'rec-sample-004',
                category: 'market_intelligence',
                title: 'Market Intelligence Report: Wheat',
                summary: 'Current price $4.52/bushel — Bullish trend. Optimal sell window in 2–3 weeks.',
                priority: 'Medium',
                icon: 'fa-chart-line',
                time: 'Ongoing',
                confidence: 0.75,
                case_reference: 'MKT-Wheat-2024',
                details: {
                    current_price: 4.52,
                    price_trend: 'Bullish',
                    outlook: 'Hold for 2–3 weeks to capture price peak',
                    breakeven_price: 3.50,
                    recommended_actions: [
                        'Monitor daily price feed for trend reversal',
                        'Arrange storage for 2–3 week hold',
                        'Lock in forward contract at current levels',
                        'Review export market opportunities'
                    ]
                }
            },
            {
                id: 'rec-sample-005',
                category: 'weather_advisory',
                title: 'Weather-Based Crop Advisory',
                summary: 'Heat wave forecast next 3 days (38°C+). Protect crops and reschedule spraying.',
                priority: 'High',
                icon: 'fa-cloud-sun',
                time: 'Next 3 days',
                confidence: 0.88,
                details: {
                    recommended_actions: [
                        'Irrigate early morning to reduce heat stress',
                        'Postpone pesticide application until cooler conditions',
                        'Ensure livestock have adequate shade and water',
                        'Monitor crop canopy temperature daily'
                    ]
                }
            },
            {
                id: 'rec-sample-006',
                category: 'sustainability',
                title: 'Soil Health Improvement Plan',
                summary: 'Organic matter at 1.8% — below optimal. Implement cover cropping this season.',
                priority: 'Medium',
                icon: 'fa-seedling',
                time: 'This season',
                confidence: 0.78,
                details: {
                    recommended_actions: [
                        'Sow cover crop mix (clover + ryegrass) after harvest',
                        'Reduce tillage to preserve soil structure',
                        'Add compost at 5 t/ha to boost organic matter',
                        'Avoid compaction — limit machinery when wet'
                    ]
                }
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.recommendationsPage = new RecommendationsPage();
});
