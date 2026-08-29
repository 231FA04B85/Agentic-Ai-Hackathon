/**
 * Farmer Feedback Page Controller
 * Star ratings, outcome tracking, feedback history, outcome pie chart, localStorage persistence
 */
class FarmerFeedbackPage {
    constructor() {
        this.selectedRating = 0;
        this.selectedOutcome = '';
        this.feedbackHistory = JSON.parse(localStorage.getItem('farmer_feedback') || '[]');
        this.outcomeChart = null;
        this.recommendations = [];
        this.initialize();
    }

    initialize() {
        console.log('💬 Farmer Feedback Page initializing…');
        this.loadRecommendations();
        this.setupStarRating();
        this.setupOutcomeButtons();
        this.setupSubmit();
        this.renderStats();
        this.renderOutcomeChart();
        this.renderHistory();
        console.log('✅ Farmer Feedback Page initialized');
    }

    async loadRecommendations() {
        try {
            let recs = [];
            if (window.orchestrator) {
                recs = await window.orchestrator.getRecommendations();
            }
            if (!recs || recs.length === 0) {
                recs = this.sampleRecommendations();
            }
            this.recommendations = recs;
        } catch (e) {
            this.recommendations = this.sampleRecommendations();
        }
        this.populateRecSelect();
    }

    populateRecSelect() {
        const sel = document.getElementById('recSelect');
        if (!sel) return;
        this.recommendations.forEach(rec => {
            const opt = document.createElement('option');
            opt.value = rec.id;
            opt.textContent = `${rec.title} (${rec.priority || 'Medium'})`;
            sel.appendChild(opt);
        });
        // Also add generic options
        const extras = [
            'Weather Advisory — Heat Wave Warning',
            'Soil Health — Organic Matter Low',
            'Disease Management — Late Blight Risk',
            'Harvest Timing — Wheat Ready'
        ];
        extras.forEach((label, i) => {
            const opt = document.createElement('option');
            opt.value = `generic-${i}`;
            opt.textContent = label;
            sel.appendChild(opt);
        });
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingLabel = document.getElementById('ratingLabel');
        const labels = ['', 'Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'];

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= this.selectedRating));
            });
            star.addEventListener('click', () => {
                this.selectedRating = parseInt(star.dataset.val);
                stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= this.selectedRating));
                if (ratingLabel) ratingLabel.textContent = labels[this.selectedRating] || '';
            });
        });
    }

    setupOutcomeButtons() {
        document.querySelectorAll('.outcome-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedOutcome = btn.dataset.outcome;
            });
        });
    }

    setupSubmit() {
        document.getElementById('submitFeedbackBtn')?.addEventListener('click', () => this.submitFeedback());
    }

    submitFeedback() {
        const recSelect = document.getElementById('recSelect');
        const recId = recSelect?.value;
        const recTitle = recSelect?.options[recSelect.selectedIndex]?.text || 'Unknown Recommendation';

        if (!recId) {
            alert('Please select a recommendation to rate.');
            return;
        }
        if (!this.selectedRating) {
            alert('Please select a star rating.');
            return;
        }
        if (!this.selectedOutcome) {
            alert('Please select an outcome.');
            return;
        }

        const feedback = {
            id: `fb-${Date.now()}`,
            rec_id: recId,
            rec_title: recTitle,
            rating: this.selectedRating,
            outcome: this.selectedOutcome,
            field: document.getElementById('fieldApplied')?.value || 'All Fields',
            comment: document.getElementById('feedbackText')?.value?.trim() || '',
            yield_impact: document.getElementById('yieldImpact')?.value || '',
            follow_again: document.querySelector('input[name="followAgain"]:checked')?.value || '',
            submitted_at: new Date().toISOString()
        };

        this.feedbackHistory.unshift(feedback);
        localStorage.setItem('farmer_feedback', JSON.stringify(this.feedbackHistory));

        // Reset form
        this.selectedRating = 0;
        this.selectedOutcome = '';
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        document.getElementById('ratingLabel').textContent = 'Click to rate';
        document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
        if (document.getElementById('feedbackText')) document.getElementById('feedbackText').value = '';
        if (document.getElementById('recSelect')) document.getElementById('recSelect').value = '';
        if (document.getElementById('yieldImpact')) document.getElementById('yieldImpact').value = '';
        document.querySelectorAll('input[name="followAgain"]').forEach(r => r.checked = false);

        // Show success banner
        const banner = document.getElementById('successBanner');
        if (banner) {
            banner.classList.add('show');
            setTimeout(() => banner.classList.remove('show'), 4000);
        }

        this.renderStats();
        this.renderOutcomeChart();
        this.renderHistory();
    }

    renderStats() {
        const h = this.feedbackHistory;
        document.getElementById('totalFeedback').textContent = h.length;

        if (h.length > 0) {
            const avgRating = h.reduce((s, f) => s + f.rating, 0) / h.length;
            document.getElementById('avgRating').textContent = avgRating.toFixed(1) + ' ★';

            const worked = h.filter(f => f.outcome === 'worked').length;
            const pct = Math.round((worked / h.length) * 100);
            document.getElementById('workedPct').textContent = pct + '%';
        } else {
            document.getElementById('avgRating').textContent = '—';
            document.getElementById('workedPct').textContent = '—';
        }
    }

    renderOutcomeChart() {
        const canvas = document.getElementById('outcomeChart');
        if (!canvas) return;
        if (this.outcomeChart) { this.outcomeChart.destroy(); this.outcomeChart = null; }

        const h = this.feedbackHistory;
        const counts = { worked: 0, partial: 0, 'didnt-work': 0, 'not-tried': 0 };
        h.forEach(f => { if (counts[f.outcome] !== undefined) counts[f.outcome]++; });

        this.outcomeChart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Worked Well', 'Partially', "Didn't Work", 'Not Tried Yet'],
                datasets: [{
                    data: [counts.worked, counts.partial, counts['didnt-work'], counts['not-tried']],
                    backgroundColor: ['#2E7D32', '#F57C00', '#C62828', '#9E9E9E'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } }
                }
            }
        });
    }

    renderHistory() {
        const container = document.getElementById('feedbackHistory');
        if (!container) return;

        if (this.feedbackHistory.length === 0) {
            container.innerHTML = `<p style="color:var(--text-secondary);font-size:var(--font-size-sm)">No feedback submitted yet.</p>`;
            return;
        }

        container.innerHTML = this.feedbackHistory.slice(0, 15).map(fb => {
            const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
            const outcomeLabel = { worked: 'Worked Well', partial: 'Partially', 'didnt-work': "Didn't Work", 'not-tried': 'Not Tried' }[fb.outcome] || fb.outcome;
            const outcomeClass = fb.outcome === 'worked' ? 'worked' : fb.outcome === 'partial' ? 'partial' : fb.outcome === 'didnt-work' ? 'didnt-work' : 'not-tried';
            return `
            <div class="feedback-history-item">
                <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--spacing-sm)">
                        <strong style="font-size:var(--font-size-sm)">${fb.rec_title}</strong>
                        <span class="feedback-history-stars">${stars}</span>
                    </div>
                    <div class="feedback-history-meta">
                        ${new Date(fb.submitted_at).toLocaleDateString()} &nbsp;·&nbsp; ${fb.field}
                        &nbsp;·&nbsp; <span class="outcome-badge ${outcomeClass}">${outcomeLabel}</span>
                        ${fb.yield_impact ? `&nbsp;·&nbsp; Yield: ${fb.yield_impact.replace(/_/g,' ')}` : ''}
                    </div>
                    ${fb.comment ? `<div class="feedback-history-text">"${fb.comment}"</div>` : ''}
                    ${fb.follow_again ? `<div style="font-size:var(--font-size-xs);color:var(--text-hint);margin-top:4px">Would follow again: <strong>${fb.follow_again}</strong></div>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    sampleRecommendations() {
        return [
            { id: 'r1', title: 'Drought Response Plan', priority: 'High' },
            { id: 'r2', title: 'Fall Armyworm Treatment', priority: 'High' },
            { id: 'r3', title: 'Nitrogen Fertilization', priority: 'Medium' },
            { id: 'r4', title: 'Market Intelligence — Wheat', priority: 'Medium' },
            { id: 'r5', title: 'Weather Advisory', priority: 'High' }
        ];
    }

    destroy() {
        if (this.outcomeChart) this.outcomeChart.destroy();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.farmerFeedback = new FarmerFeedbackPage();
});
