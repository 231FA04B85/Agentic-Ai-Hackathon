/**
 * Market Intelligence Page Controller
 * Commodity prices, historical chart, sell/hold recommendations, breakeven analysis
 */
class MarketIntelligencePage {
    constructor() {
        this.marketData = {};
        this.selectedCrop = 'Wheat';
        this.priceChart = null;
        this.updateInterval = null;
        this.crops = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato'];
        this.initialize();
    }

    initialize() {
        console.log('📈 Market Intelligence Page initializing…');
        this.setupEventListeners();
        this.loadMarketData();
        this.startAutoUpdate();
        console.log('✅ Market Intelligence Page initialized');
    }

    setupEventListeners() {
        document.getElementById('refreshMarketBtn')?.addEventListener('click', () => this.loadMarketData(true));
        document.getElementById('exportMarketBtn')?.addEventListener('click', () => this.exportData());
    }

    async loadMarketData(force = false) {
        try {
            let allData = {};
            if (window.marketAgent) {
                const raw = await window.marketAgent.getMarketData();
                if (raw) allData = raw;
            }
            if (Object.keys(allData).length === 0) {
                allData = this.generateSampleMarketData();
            }
            this.marketData = allData;
            this.renderCommodityCards();
            this.selectCrop(this.selectedCrop);
            this.renderMarketTable();
            document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        } catch (err) {
            console.error('Market data error:', err);
            this.marketData = this.generateSampleMarketData();
            this.renderCommodityCards();
            this.selectCrop(this.selectedCrop);
            this.renderMarketTable();
        }
    }

    generateSampleMarketData() {
        const now = new Date();
        const data = {};
        const configs = {
            Wheat:   { base: 4.52, trend: 'bullish',  unit: '$/bu', change: +3.2 },
            Corn:    { base: 3.85, trend: 'neutral',  unit: '$/bu', change: -0.8 },
            Soybean: { base: 12.45, trend: 'bullish', unit: '$/bu', change: +2.1 },
            Tomato:  { base: 0.92, trend: 'bearish',  unit: '$/kg', change: -4.5 },
            Potato:  { base: 0.38, trend: 'neutral',  unit: '$/kg', change: +0.3 }
        };

        for (const [crop, cfg] of Object.entries(configs)) {
            const history = [];
            let price = cfg.base * 0.92;
            for (let i = 89; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                price = Math.max(price * (1 + (Math.random() - 0.49) * 0.02), 0.1);
                history.push({ date: d.toISOString().slice(0,10), price: +price.toFixed(2) });
            }
            const last30 = history.slice(-30).map(h => h.price);
            const avg30 = last30.reduce((s, v) => s + v, 0) / 30;
            const forecast = [];
            let fp = price;
            for (let i = 1; i <= 14; i++) {
                fp = fp * (1 + (Math.random() - 0.48) * 0.015);
                const fd = new Date(now);
                fd.setDate(fd.getDate() + i);
                forecast.push({ date: fd.toISOString().slice(0,10), price: +fp.toFixed(2) });
            }

            data[crop] = {
                name: crop,
                currentPrice: cfg.base,
                unit: cfg.unit,
                change7d: cfg.change,
                trend: cfg.trend,
                avg30d: +avg30.toFixed(2),
                history,
                forecast,
                volume: Math.round(80000 + Math.random() * 50000),
                indicators: [
                    { label: 'USDA Report', value: cfg.trend === 'bullish' ? 'Positive' : 'Neutral', positive: cfg.trend === 'bullish' },
                    { label: 'Export Demand', value: cfg.trend === 'bullish' ? 'Strong' : 'Moderate', positive: cfg.trend === 'bullish' },
                    { label: 'Supply Outlook', value: cfg.trend === 'bearish' ? 'Surplus' : 'Balanced', positive: cfg.trend !== 'bearish' },
                    { label: 'Weather Risk', value: 'Moderate', positive: false }
                ]
            };
        }
        return data;
    }

    renderCommodityCards() {
        const container = document.getElementById('commodityCards');
        if (!container) return;
        container.innerHTML = this.crops.map(crop => {
            const d = this.marketData[crop];
            if (!d) return '';
            const chg = d.change7d || 0;
            const dir = chg > 0 ? 'up' : chg < 0 ? 'down' : 'flat';
            const arrow = chg > 0 ? '▲' : chg < 0 ? '▼' : '—';
            return `
            <div class="commodity-card ${crop === this.selectedCrop ? 'active' : ''}" data-crop="${crop}" onclick="marketPage.selectCrop('${crop}')">
                <div class="commodity-name">${crop}</div>
                <div class="commodity-price">$${d.currentPrice}</div>
                <div class="commodity-unit">${d.unit}</div>
                <div class="commodity-change ${dir}">${arrow} ${Math.abs(chg).toFixed(1)}% (7d)</div>
                <span class="commodity-trend ${d.trend}">${d.trend.toUpperCase()}</span>
            </div>`;
        }).join('');
    }

    selectCrop(crop) {
        this.selectedCrop = crop;
        document.querySelectorAll('.commodity-card').forEach(c => c.classList.toggle('active', c.dataset.crop === crop));
        const d = this.marketData[crop];
        if (!d) return;
        document.getElementById('detailCropName').textContent = crop;
        document.getElementById('breakevenCrop').textContent = crop;
        this.renderSellRecommendation(crop, d);
        this.renderDetailMetrics(d);
        this.renderPriceChart(crop, d);
        this.renderEconomicIndicators(d);
        this.renderBreakeven(crop, d);
    }

    renderSellRecommendation(crop, d) {
        const container = document.getElementById('sellRecommendation');
        if (!container) return;
        let action = 'MONITOR', cls = 'monitor', icon = 'fa-eye', msg = '';
        if (d.trend === 'bullish') {
            const fAvg = d.forecast?.slice(0,7).reduce((s,f) => s+f.price, 0) / 7 || d.currentPrice;
            if (fAvg > d.currentPrice * 1.02) {
                action = 'HOLD'; cls = 'hold'; icon = 'fa-hand-paper';
                msg = `Price forecast to rise ${((fAvg/d.currentPrice-1)*100).toFixed(1)}% over next 7 days. Hold for better returns.`;
            } else {
                action = 'SELL'; cls = 'sell'; icon = 'fa-dollar-sign';
                msg = 'Price at seasonal peak. Consider selling now to lock in gains.';
            }
        } else if (d.trend === 'bearish') {
            action = 'SELL'; cls = 'sell'; icon = 'fa-dollar-sign';
            msg = 'Bearish trend — prices expected to fall. Sell now to minimize losses.';
        } else {
            msg = 'Price is stable. Monitor daily and set a target sell price.';
        }
        container.innerHTML = `
            <div class="recommendation-banner ${cls}" style="margin-bottom:var(--spacing-md)">
                <i class="fas ${icon}" style="font-size:28px"></i>
                <div>
                    <div class="rec-action ${cls}">${action}</div>
                    <div style="font-size:var(--font-size-sm)">${msg}</div>
                </div>
            </div>`;
    }

    renderDetailMetrics(d) {
        const container = document.getElementById('detailMetrics');
        if (!container) return;
        const fAvg = d.forecast?.slice(0,7).reduce((s,f)=>s+f.price,0)/7 || d.currentPrice;
        container.innerHTML = `
            <div class="detail-item"><div class="detail-label">Current Price</div><div class="detail-value" style="color:var(--primary-green)">$${d.currentPrice}</div><div class="detail-sub">${d.unit}</div></div>
            <div class="detail-item"><div class="detail-label">7-Day Change</div><div class="detail-value" style="color:${d.change7d>=0?'var(--success-green)':'var(--danger-red)'}">${d.change7d>=0?'+':''}${d.change7d?.toFixed(1)}%</div><div class="detail-sub">vs last week</div></div>
            <div class="detail-item"><div class="detail-label">30-Day Avg</div><div class="detail-value">$${d.avg30d}</div><div class="detail-sub">moving average</div></div>
            <div class="detail-item"><div class="detail-label">7-Day Forecast</div><div class="detail-value" style="color:var(--secondary-blue)">$${fAvg.toFixed(2)}</div><div class="detail-sub">AI projection</div></div>
            <div class="detail-item"><div class="detail-label">Volume</div><div class="detail-value">${(d.volume/1000).toFixed(0)}K</div><div class="detail-sub">bushels</div></div>
            <div class="detail-item"><div class="detail-label">Market Trend</div><div class="detail-value"><span class="commodity-trend ${d.trend}">${d.trend?.toUpperCase()}</span></div><div class="detail-sub">90-day analysis</div></div>`;
    }

    renderPriceChart(crop, d) {
        if (this.priceChart) { this.priceChart.destroy(); this.priceChart = null; }
        const canvas = document.getElementById('priceChart');
        if (!canvas || !d.history) return;

        const histLabels = d.history.slice(-60).map(h => h.date);
        const histPrices = d.history.slice(-60).map(h => h.price);
        const foreLabels = (d.forecast || []).slice(0,7).map(f => f.date);
        const forePrices = (d.forecast || []).slice(0,7).map(f => f.price);

        // Pad historical nulls for forecast dataset alignment
        const allLabels = [...histLabels, ...foreLabels];
        const historicalFull = [...histPrices, ...Array(foreLabels.length).fill(null)];
        const forecastFull = [...Array(histLabels.length - 1).fill(null), histPrices[histPrices.length - 1], ...forePrices];

        this.priceChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    { label: `${crop} Price (${d.unit})`, data: historicalFull, borderColor: '#2E7D32', backgroundColor: 'rgba(46,125,50,0.08)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'Forecast', data: forecastFull, borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.08)', borderDash: [6, 3], fill: true, tension: 0.3, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { usePointStyle: true } }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    x: { ticks: { maxTicksLimit: 10, maxRotation: 0 } },
                    y: { title: { display: true, text: d.unit } }
                }
            }
        });
    }

    renderEconomicIndicators(d) {
        const container = document.getElementById('economicIndicators');
        if (!container) return;
        container.innerHTML = `
            <div style="margin-top:var(--spacing-md)">
                <h3 style="font-size:var(--font-size-sm);font-weight:600;margin-bottom:var(--spacing-sm)">Economic Indicators</h3>
                <div class="indicator-row">
                    ${(d.indicators || []).map(ind => `
                    <div class="indicator-chip ${ind.positive ? 'positive' : 'negative'}">
                        <i class="fas fa-${ind.positive ? 'arrow-up' : 'arrow-down'}"></i>
                        ${ind.label}: <strong>${ind.value}</strong>
                    </div>`).join('')}
                </div>
            </div>`;
    }

    renderBreakeven(crop, d) {
        const costs = { 'Land rent': 30, 'Machinery': 15, 'Seed': 10, 'Chemicals': 12, 'Fertilizer': 16, 'Labour': 10, 'Other': 7 };
        const totalCostPerBu = 3.45;
        const profit = d.currentPrice - totalCostPerBu;
        const margin = ((profit / d.currentPrice) * 100).toFixed(1);

        document.getElementById('costBreakdown').innerHTML = `
            <h3 style="font-size:var(--font-size-base);margin-bottom:var(--spacing-md)">Cost Breakdown</h3>
            <div class="prop-table">
                ${Object.entries(costs).map(([k,v]) => `
                <div class="cost-row">
                    <span style="display:flex;align-items:center;gap:var(--spacing-sm)">
                        <span style="width:${v}%;height:8px;background:var(--primary-green);border-radius:2px;display:inline-block;opacity:${0.4+v/30}"></span>
                        ${k}
                    </span>
                    <span>${v}% <span style="color:var(--text-secondary)">($${(totalCostPerBu*v/100).toFixed(2)}/bu)</span></span>
                </div>`).join('')}
                <div class="cost-row"><span><strong>Total Cost</strong></span><span><strong>$${totalCostPerBu.toFixed(2)}/bu</strong></span></div>
            </div>`;

        document.getElementById('profitSummary').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:var(--spacing-sm)">
                <div class="cost-row"><span>Current Market Price</span><span style="color:var(--primary-green);font-weight:700">$${d.currentPrice}</span></div>
                <div class="cost-row"><span>Total Production Cost</span><span>$${totalCostPerBu.toFixed(2)}</span></div>
                <div class="cost-row"><span>Gross Profit</span><span style="color:${profit>0?'var(--success-green)':'var(--danger-red)'};font-weight:700">$${profit.toFixed(2)}/bu</span></div>
                <div class="cost-row"><span>Profit Margin</span><span style="color:${profit>0?'var(--success-green)':'var(--danger-red)'};font-weight:700">${margin}%</span></div>
                <div style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:${profit>0?'#C8E6C9':'#FFCDD2'};border-radius:var(--radius-md)">
                    <i class="fas fa-${profit>0?'check-circle':'exclamation-circle'}" style="color:${profit>0?'var(--success-green)':'var(--danger-red)'}"></i>
                    <strong style="font-size:var(--font-size-sm);margin-left:4px">
                        ${profit > 0 ? `Profitable at current prices. Break-even: $${totalCostPerBu.toFixed(2)}/bu` : 'Below break-even. Consider cost reduction or delayed sale.'}
                    </strong>
                </div>
            </div>`;
    }

    renderMarketTable() {
        const tbody = document.getElementById('marketTable');
        if (!tbody) return;
        tbody.innerHTML = this.crops.map(crop => {
            const d = this.marketData[crop];
            if (!d) return '';
            const chg = d.change7d || 0;
            const fAvg = d.forecast?.slice(0,7).reduce((s,f)=>s+f.price,0)/7 || d.currentPrice;
            let rec = 'MONITOR', recColor = 'var(--secondary-blue)';
            if (d.trend === 'bullish') { rec = fAvg > d.currentPrice * 1.01 ? 'HOLD' : 'SELL'; recColor = rec==='SELL'?'var(--success-green)':'var(--warning-amber)'; }
            else if (d.trend === 'bearish') { rec = 'SELL'; recColor = 'var(--success-green)'; }
            return `
            <tr style="cursor:pointer" onclick="marketPage.selectCrop('${crop}')">
                <td><strong>${crop}</strong></td>
                <td><strong style="color:var(--primary-green)">$${d.currentPrice} ${d.unit}</strong></td>
                <td style="color:${chg>=0?'var(--success-green)':'var(--danger-red)'}">${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(1)}%</td>
                <td>$${d.avg30d}</td>
                <td><span class="commodity-trend ${d.trend}">${d.trend.toUpperCase()}</span></td>
                <td><strong style="color:${recColor}">${rec}</strong></td>
            </tr>`;
        }).join('');
    }

    exportData() {
        const blob = new Blob([JSON.stringify({ market: this.marketData, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market_data_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => this.loadMarketData(), 300000); // 5 min
    }

    destroy() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.priceChart) this.priceChart.destroy();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.marketPage = new MarketIntelligencePage();
});
