/**
 * Pest & Disease Page Controller
 * Real-time pest/disease risk dashboard with charts, scouting calendar and treatment guide
 */
class PestDiseasePage {
    constructor() {
        this.pestData = null;
        this.weatherData = null;
        this.riskChart = null;
        this.updateInterval = null;
        this.initialize();
    }

    initialize() {
        console.log('🐛 Pest & Disease Page initializing…');
        this.setupEventListeners();
        this.loadData();
        this.buildScoutingCalendar();
        this.startAutoUpdate();
        console.log('✅ Pest & Disease Page initialized');
    }

    setupEventListeners() {
        document.getElementById('refreshPestBtn')?.addEventListener('click', () => this.loadData(true));
        document.getElementById('scoutingReportBtn')?.addEventListener('click', () => this.exportScoutingReport());
    }

    async loadData(forceRefresh = false) {
        try {
            let pestData, weatherData;
            if (window.pestAgent) {
                pestData = await window.pestAgent.getRiskAssessment();
            } else {
                pestData = this.generateSamplePestData();
            }
            if (window.weatherAgent) {
                weatherData = await window.weatherAgent.getCurrentData();
            } else {
                weatherData = this.generateSampleWeather();
            }
            this.pestData = pestData;
            this.weatherData = weatherData;

            this.renderRiskGauges(pestData);
            this.renderEnvironmental(weatherData);
            this.renderPestList(pestData);
            this.renderDiseaseList(pestData);
            this.renderTreatmentGuide(pestData);
            this.renderRiskChart(pestData);
            this.showAlert(pestData);
            document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        } catch (err) {
            console.error('Pest page load error:', err);
            const fallback = this.generateSamplePestData();
            this.pestData = fallback;
            this.renderRiskGauges(fallback);
            this.renderPestList(fallback);
            this.renderDiseaseList(fallback);
            this.renderTreatmentGuide(fallback);
            this.renderRiskChart(fallback);
        }
    }

    generateSamplePestData() {
        return {
            risk: 6.8,
            type: 'Fall Armyworm',
            disease_risk: 58,
            pests: [
                { name: 'Fall Armyworm', scientific: 'Spodoptera frugiperda', severity: 7.5, crop: 'Corn', level: 'high', population: 4.2, threshold: 3, treatment: 'Bt spray or synthetic pyrethroids', early_warning: 'Irregular holes and frass on leaves', optimal_temp: '25–30°C' },
                { name: 'Aphids', scientific: 'Aphidoidea', severity: 4.2, crop: 'Wheat', level: 'moderate', population: 2.1, threshold: 5, treatment: 'Insecticidal soap or neem oil', early_warning: 'Sticky honeydew on leaves', optimal_temp: '18–25°C' },
                { name: 'Whitefly', scientific: 'Bemisia tabaci', severity: 3.1, crop: 'Tomato', level: 'moderate', population: 1.5, threshold: 4, treatment: 'Neem oil or insect growth regulators', early_warning: 'Yellowing and curling of leaves', optimal_temp: '22–30°C' }
            ],
            diseases: [
                { name: 'Late Blight', scientific: 'Phytophthora infestans', severity: 62, crop: 'Tomato', level: 'high', spread: 'Airborne spores', treatment: 'Fungicide with metalaxyl or mancozeb', signs: 'Brown spots with white fuzzy growth' },
                { name: 'Powdery Mildew', scientific: 'Erysiphaceae', severity: 35, crop: 'Wheat', level: 'moderate', spread: 'Wind-dispersed conidia', treatment: 'Sulfur-based fungicide', signs: 'White powdery coating on leaves' },
                { name: 'Rust', scientific: 'Pucciniales', severity: 28, crop: 'Wheat', level: 'low', spread: 'Wind-borne urediniospores', treatment: 'Triazole or strobilurin fungicides', signs: 'Orange/brown pustules on leaf surface' }
            ]
        };
    }

    generateSampleWeather() {
        return { temp: 27, humidity: 72, windSpeed: 15, dewPoint: 18 };
    }

    renderRiskGauges(data) {
        const pestRisk = data.risk || 0;
        const pestLevel = pestRisk >= 8 ? 'critical' : pestRisk >= 6 ? 'high' : pestRisk >= 4 ? 'moderate' : 'low';
        const diseaseRisk = data.disease_risk || 0;
        const diseaseLevel = diseaseRisk >= 75 ? 'critical' : diseaseRisk >= 50 ? 'high' : diseaseRisk >= 30 ? 'moderate' : 'low';

        const pNum = document.getElementById('pestRiskNumber');
        const pLbl = document.getElementById('pestRiskLabel');
        const pBar = document.getElementById('pestRiskBar');
        if (pNum) { pNum.textContent = pestRisk.toFixed(1) + '/10'; pNum.className = `risk-number ${pestLevel}`; }
        if (pLbl) pLbl.textContent = pestLevel.charAt(0).toUpperCase() + pestLevel.slice(1) + ' Risk — ' + (data.type || 'Multiple Pests');
        if (pBar) { pBar.style.width = (pestRisk * 10) + '%'; pBar.className = `risk-bar-fill ${pestLevel}`; }

        const dNum = document.getElementById('diseaseRiskNumber');
        const dLbl = document.getElementById('diseaseRiskLabel');
        const dBar = document.getElementById('diseaseRiskBar');
        if (dNum) { dNum.textContent = diseaseRisk + '%'; dNum.className = `risk-number ${diseaseLevel}`; }
        if (dLbl) dLbl.textContent = diseaseLevel.charAt(0).toUpperCase() + diseaseLevel.slice(1) + ' Disease Pressure';
        if (dBar) { dBar.style.width = diseaseRisk + '%'; dBar.className = `risk-bar-fill ${diseaseLevel}`; }
    }

    renderEnvironmental(w) {
        if (!w) return;
        const dew = w.dewPoint || (w.temp - ((100 - w.humidity) / 5)).toFixed(1);
        document.getElementById('envTemp').textContent = (w.temp || 0) + '°C';
        document.getElementById('envHumidity').textContent = (w.humidity || 0) + '%';
        document.getElementById('envWind').textContent = w.windSpeed || 0;
        document.getElementById('envDew').textContent = dew + '°C';
    }

    renderPestList(data) {
        const ul = document.getElementById('pestList');
        if (!ul) return;
        const pests = data.pests || [];
        if (pests.length === 0) {
            ul.innerHTML = `<li style="padding:var(--spacing-lg);text-align:center;color:var(--text-secondary)"><i class="fas fa-check-circle" style="color:var(--success-green)"></i> No active pest detections</li>`;
            return;
        }
        ul.innerHTML = pests.map(p => `
            <li class="pest-item">
                <div class="pest-icon ${p.level}"><i class="fas fa-bug"></i></div>
                <div class="pest-info">
                    <div class="pest-name">${p.name}</div>
                    <div class="pest-scientific">${p.scientific}</div>
                    <div class="pest-severity">Severity: ${p.severity}/10 — Crop: ${p.crop}</div>
                    <div class="severity-bar-sm"><div class="severity-fill ${p.level}" style="width:${p.severity*10}%"></div></div>
                    <div style="font-size:var(--font-size-xs);color:var(--text-secondary);margin-top:4px">⚠ ${p.early_warning}</div>
                </div>
                <div class="pest-actions">
                    <span class="sev-badge ${p.level}">${p.level.toUpperCase()}</span>
                    <span style="font-size:var(--font-size-xs);color:var(--text-hint)">${p.optimal_temp}</span>
                    <span style="font-size:var(--font-size-xs);color:var(--text-hint)">Pop: ${p.population} / Threshold: ${p.threshold}</span>
                </div>
            </li>`).join('');
    }

    renderDiseaseList(data) {
        const ul = document.getElementById('diseaseList');
        if (!ul) return;
        const diseases = data.diseases || [];
        if (diseases.length === 0) {
            ul.innerHTML = `<li style="padding:var(--spacing-lg);text-align:center;color:var(--text-secondary)"><i class="fas fa-check-circle" style="color:var(--success-green)"></i> No active disease detections</li>`;
            return;
        }
        ul.innerHTML = diseases.map(d => `
            <li class="disease-item">
                <div class="pest-icon ${d.level}"><i class="fas fa-viruses"></i></div>
                <div class="pest-info">
                    <div class="pest-name">${d.name}</div>
                    <div class="pest-scientific">${d.scientific}</div>
                    <div class="pest-severity">Severity: ${d.severity}% — Crop: ${d.crop}</div>
                    <div class="severity-bar-sm"><div class="severity-fill ${d.level}" style="width:${d.severity}%"></div></div>
                    <div style="font-size:var(--font-size-xs);color:var(--text-secondary);margin-top:4px">Signs: ${d.signs}</div>
                </div>
                <div class="pest-actions">
                    <span class="sev-badge ${d.level}">${d.level.toUpperCase()}</span>
                    <span style="font-size:var(--font-size-xs);color:var(--text-hint)">Spread: ${d.spread}</span>
                </div>
            </li>`).join('');
    }

    renderTreatmentGuide(data) {
        const container = document.getElementById('treatmentGuide');
        if (!container) return;
        const items = [...(data.pests || []), ...(data.diseases || [])].filter(i => i.level === 'high' || i.level === 'critical');
        if (items.length === 0) {
            container.innerHTML = `<div style="padding:var(--spacing-lg);text-align:center;color:var(--success-green)"><i class="fas fa-shield-alt" style="font-size:32px"></i><p style="margin-top:var(--spacing-sm)">No urgent treatment required. Continue regular scouting.</p></div>`;
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="treatment-card">
                <h4><i class="fas fa-spray-can" style="color:var(--primary-green)"></i> ${item.name} — Treatment Protocol</h4>
                <p><strong>Treatment:</strong> ${item.treatment}</p>
                <p style="margin-top:4px;font-size:var(--font-size-xs);color:var(--text-secondary)">
                    <strong>Crop:</strong> ${item.crop} &nbsp;|&nbsp;
                    <strong>Severity:</strong> ${item.severity}${typeof item.severity === 'number' && item.severity <= 10 ? '/10' : '%'}
                </p>
                <ul style="margin-top:var(--spacing-sm);padding-left:var(--spacing-lg);font-size:var(--font-size-sm);color:var(--text-secondary)">
                    <li>Apply during early morning or late evening</li>
                    <li>Wear full PPE during application</li>
                    <li>Monitor for 7 days post-treatment</li>
                    <li>Record application date, rate, and weather conditions</li>
                </ul>
            </div>`).join('');
    }

    renderRiskChart(data) {
        const canvas = document.getElementById('riskTrendChart');
        if (!canvas) return;
        if (this.riskChart) { this.riskChart.destroy(); }

        const labels = [];
        const pestVals = [];
        const diseaseVals = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const basePest = (data.risk || 5) + (Math.random() - 0.5) * 2;
            const baseDis = (data.disease_risk || 40) + (Math.random() - 0.5) * 10;
            pestVals.push(Math.min(10, Math.max(0, basePest)).toFixed(1));
            diseaseVals.push(Math.min(100, Math.max(0, baseDis)).toFixed(1));
        }

        this.riskChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Pest Risk (/10)', data: pestVals, borderColor: '#C62828', backgroundColor: 'rgba(198,40,40,0.08)', fill: true, tension: 0.3, yAxisID: 'y' },
                    { label: 'Disease Risk (%)', data: diseaseVals, borderColor: '#F57C00', backgroundColor: 'rgba(245,124,0,0.08)', fill: true, tension: 0.3, yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { usePointStyle: true } } },
                scales: {
                    y: { beginAtZero: true, max: 10, title: { display: true, text: 'Pest Risk' } },
                    y1: { position: 'right', beginAtZero: true, max: 100, grid: { drawOnChartArea: false }, title: { display: true, text: 'Disease Risk (%)' } }
                }
            }
        });
    }

    buildScoutingCalendar() {
        const container = document.getElementById('scoutingCalendar');
        if (!container) return;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) html += `<div class="cal-day"></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === today.getDate();
            const isScout = d % 7 === 1 || d % 7 === 4; // Scout twice a week
            const isSpray = d % 10 === 3 || d % 10 === 8; // Spray windows
            let cls = 'cal-day';
            if (isToday) cls += ' today';
            if (isScout) cls += ' scout';
            else if (isSpray) cls += ' spray';
            html += `<div class="${cls}" title="${isScout ? 'Scouting Day' : isSpray ? 'Spray Window' : ''}">${d}</div>`;
        }
        container.innerHTML = html;
    }

    showAlert(data) {
        const bar = document.getElementById('alertBar');
        if (!bar) return;
        const risk = data.risk || 0;
        if (risk >= 7) {
            bar.style.display = 'flex';
            document.getElementById('alertTitle').textContent = 'HIGH PEST RISK:';
            document.getElementById('alertMessage').textContent = `${data.type || 'Pest'} at ${risk.toFixed(1)}/10 — immediate action required.`;
        } else if ((data.disease_risk || 0) >= 60) {
            bar.style.display = 'flex';
            bar.className = 'alert-bar info';
            document.getElementById('alertTitle').textContent = 'DISEASE ALERT:';
            document.getElementById('alertMessage').textContent = `Disease risk at ${data.disease_risk}% — apply preventive fungicide.`;
        } else {
            bar.style.display = 'none';
        }
    }

    exportScoutingReport() {
        if (!this.pestData) return;
        const report = {
            date: new Date().toISOString(),
            pest_risk: this.pestData.risk,
            disease_risk: this.pestData.disease_risk,
            pests: this.pestData.pests,
            diseases: this.pestData.diseases,
            environmental: this.weatherData
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scouting_report_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => this.loadData(), 600000); // 10 min
    }

    destroy() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.riskChart) this.riskChart.destroy();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pestDiseasePage = new PestDiseasePage();
});
