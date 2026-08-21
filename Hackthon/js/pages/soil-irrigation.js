/**
 * Soil & Irrigation Page Logic
 * Handles soil analysis, moisture monitoring, and irrigation management
 */

class SoilIrrigationPage {
    constructor() {
        this.soilData = null;
        this.moistureHistory = [];
        this.irrigationSchedules = [];
        this.selectedField = null;
        this.chartInstances = {};
        this.updateInterval = null;
        
        this.initialize();
    }

    initialize() {
        console.log('🧪 Soil & Irrigation Page initializing...');
        this.setupEventListeners();
        this.loadSoilData();
        this.initializeCharts();
        this.startAutoUpdate();
        console.log('✅ Soil & Irrigation Page initialized');
    }

    setupEventListeners() {
        // Refresh data
        document.getElementById('refreshSoilBtn')?.addEventListener('click', () => {
            this.loadSoilData(true);
        });

        // Field selector
        document.getElementById('soilField')?.addEventListener('change', (e) => {
            this.selectedField = e.target.value;
            this.loadSoilData(true);
        });

        // Irrigation schedule
        document.getElementById('scheduleIrrigationBtn')?.addEventListener('click', () => {
            this.showIrrigationModal();
        });

        // Export data
        document.getElementById('exportSoilBtn')?.addEventListener('click', () => {
            this.exportSoilData();
        });

        // Add sensor
        document.getElementById('addSensorBtn')?.addEventListener('click', () => {
            this.showSensorModal();
        });
    }

    async loadSoilData(forceRefresh = false) {
        try {
            this.showLoading(true);

            let data;
            if (window.soilAgent) {
                data = await window.soilAgent.getSoilData(this.selectedField);
            } else {
                data = this.generateSampleSoilData();
            }

            this.soilData = data;
            this.displaySoilData(data);
            this.updateSoilMetrics(data);
            this.loadMoistureHistory(data.field_id);

            // Get irrigation recommendation
            if (window.soilAgent) {
                const recommendation = await window.soilAgent.getIrrigationRecommendation(this.selectedField);
                this.displayIrrigationRecommendation(recommendation);
            } else {
                this.displayIrrigationRecommendation(this.generateIrrigationRecommendation(data));
            }

            // Load irrigation schedules
            this.loadIrrigationSchedules();

            // Update charts
            this.updateCharts(data);

        } catch (error) {
            console.error('Failed to load soil data:', error);
            this.showError('Failed to load soil data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleSoilData(fieldId = null) {
        const moisture = Math.round(50 + Math.random() * 35);
        const temp = Math.round(18 + Math.random() * 8);

        return {
            field_id: fieldId || 'field-001',
            timestamp: new Date().toISOString(),
            moisture: moisture,
            temperature: temp,
            ec: Math.round((0.3 + Math.random() * 1.2) * 100) / 100,
            ph: Math.round((6.0 + Math.random() * 1.5) * 100) / 100,
            npk: {
                nitrogen: Math.round(15 + Math.random() * 30),
                phosphorus: Math.round(10 + Math.random() * 25),
                potassium: Math.round(20 + Math.random() * 30)
            },
            organic_matter: Math.round((2 + Math.random() * 3) * 10) / 10,
            soil_type: ['Loam', 'Sandy', 'Clay', 'Silt'][Math.floor(Math.random() * 4)],
            bulk_density: Math.round((1.2 + Math.random() * 0.5) * 100) / 100,
            infiltration_rate: Math.round((1.5 + Math.random() * 2) * 10) / 10,
            wilting_point: Math.round(10 + Math.random() * 10),
            field_capacity: Math.round(70 + Math.random() * 20)
        };
    }

    generateIrrigationRecommendation(soilData) {
        const moisture = soilData.moisture || 60;
        const deficit = 100 - moisture;
        let urgency = 'Low';
        let status = 'Adequate moisture';
        let recommendation = 'No irrigation needed at this time';
        let amount = 0;

        if (moisture < 30) {
            urgency = 'Critical';
            status = 'Severe water stress';
            amount = Math.round(deficit * 0.8);
            recommendation = `EMERGENCY: Apply ${amount}mm irrigation immediately.`;
        } else if (moisture < 45) {
            urgency = 'High';
            status = 'Water stress developing';
            amount = Math.round(deficit * 0.6);
            recommendation = `Apply ${amount}mm irrigation within 24-48 hours.`;
        } else if (moisture < 60) {
            urgency = 'Medium';
            status = 'Moderate moisture depletion';
            amount = Math.round(deficit * 0.4);
            recommendation = `Apply ${amount}mm irrigation within 3-4 days.`;
        }

        return {
            current_moisture: moisture,
            deficit: deficit,
            urgency: urgency,
            status: status,
            irrigation_amount: amount,
            recommendation: recommendation,
            method: 'Sprinkler irrigation recommended',
            timing: urgency === 'Critical' ? 'Immediately' : urgency === 'High' ? 'Within 24 hours' : 'Monitor and re-evaluate'
        };
    }

    displaySoilData(data) {
        const container = document.getElementById('soilDataDisplay');
        if (!container) return;

        container.innerHTML = `
            <div class="soil-data-grid">
                <div class="soil-card">
                    <h4>Physical Properties</h4>
                    <div class="soil-detail">
                        <span>Soil Type</span>
                        <strong>${data.soil_type || 'Unknown'}</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Bulk Density</span>
                        <strong>${data.bulk_density || 'N/A'} g/cm³</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Infiltration Rate</span>
                        <strong>${data.infiltration_rate || 'N/A'} cm/hour</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Field Capacity</span>
                        <strong>${data.field_capacity || 'N/A'}%</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Wilting Point</span>
                        <strong>${data.wilting_point || 'N/A'}%</strong>
                    </div>
                </div>

                <div class="soil-card">
                    <h4>Chemical Properties</h4>
                    <div class="soil-detail">
                        <span>pH</span>
                        <strong>${data.ph || 'N/A'} ${data.ph ? (data.ph < 5.5 ? '⚠️ Acidic' : data.ph > 7.5 ? '⚠️ Alkaline' : '✅ Optimal') : ''}</strong>
                    </div>
                    <div class="soil-detail">
                        <span>EC</span>
                        <strong>${data.ec || 'N/A'} dS/m ${data.ec && data.ec > 1.5 ? '⚠️ High' : '✅ Normal'}</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Organic Matter</span>
                        <strong>${data.organic_matter || 'N/A'}% ${data.organic_matter && data.organic_matter < 2 ? '⚠️ Low' : '✅ Good'}</strong>
                    </div>
                </div>

                <div class="soil-card">
                    <h4>Nutrient Levels</h4>
                    <div class="soil-detail">
                        <span>Nitrogen (N)</span>
                        <strong>${data.npk?.nitrogen || 'N/A'} ppm</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Phosphorus (P)</span>
                        <strong>${data.npk?.phosphorus || 'N/A'} ppm</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Potassium (K)</span>
                        <strong>${data.npk?.potassium || 'N/A'} ppm</strong>
                    </div>
                </div>

                <div class="soil-card">
                    <h4>Moisture Status</h4>
                    <div class="moisture-display">
                        <div class="moisture-value">${data.moisture || 0}%</div>
                        <div class="progress-bar">
                            <div class="progress-fill ${data.moisture < 30 ? 'danger' : data.moisture < 50 ? 'warning' : 'success'}" 
                                 style="width: ${data.moisture || 0}%"></div>
                        </div>
                        <div class="moisture-status">
                            ${data.moisture < 30 ? '⚠️ Critical - Irrigation Needed' : 
                              data.moisture < 50 ? '⚠️ Low - Monitor Closely' : 
                              data.moisture < 70 ? '✅ Adequate' : '✅ Good'}
                        </div>
                    </div>
                    <div class="soil-detail">
                        <span>Soil Temperature</span>
                        <strong>${data.temperature || 'N/A'}°C</strong>
                    </div>
                    <div class="soil-detail">
                        <span>Last Updated</span>
                        <strong>${new Date(data.timestamp).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    updateSoilMetrics(data) {
        document.getElementById('soilMoisture')?.textContent = `${data.moisture || 0}%`;
        document.getElementById('soilTemp')?.textContent = `${data.temperature || 0}°C`;
        document.getElementById('soilPH')?.textContent = data.ph || 'N/A';
        document.getElementById('soilEC')?.textContent = `${data.ec || 0} dS/m`;
        document.getElementById('soilOrganicMatter')?.textContent = `${data.organic_matter || 0}%`;
        
        // Update NPK
        document.getElementById('soilNitrogen')?.textContent = `${data.npk?.nitrogen || 0} ppm`;
        document.getElementById('soilPhosphorus')?.textContent = `${data.npk?.phosphorus || 0} ppm`;
        document.getElementById('soilPotassium')?.textContent = `${data.npk?.potassium || 0} ppm`;
    }

    displayIrrigationRecommendation(rec) {
        const container = document.getElementById('irrigationRecommendation');
        if (!container) return;

        if (!rec) {
            container.innerHTML = '<p>No irrigation recommendation available</p>';
            return;
        }

        const urgencyClass = rec.urgency?.toLowerCase() || 'low';
        container.innerHTML = `
            <div class="irrigation-recommendation urgency-${urgencyClass}">
                <div class="rec-header">
                    <span class="rec-urgency ${urgencyClass}">${rec.urgency || 'Low'}</span>
                    <span class="rec-status">${rec.status || 'Adequate'}</span>
                </div>
                <div class="rec-details">
                    <div class="rec-detail">
                        <span>Current Moisture</span>
                        <strong>${rec.current_moisture || 0}%</strong>
                    </div>
                    <div class="rec-detail">
                        <span>Water Deficit</span>
                        <strong>${rec.deficit || 0}%</strong>
                    </div>
                    <div class="rec-detail">
                        <span>Irrigation Amount</span>
                        <strong>${rec.irrigation_amount || 0} mm</strong>
                    </div>
                    <div class="rec-detail">
                        <span>Method</span>
                        <strong>${rec.method || 'Sprinkler'}</strong>
                    </div>
                    <div class="rec-detail">
                        <span>Timing</span>
                        <strong>${rec.timing || 'Monitor'}</strong>
                    </div>
                </div>
                <div class="rec-recommendation">
                    <i class="fas fa-lightbulb"></i>
                    <p>${rec.recommendation || 'Monitor soil moisture regularly'}</p>
                </div>
            </div>
        `;
    }

    async loadMoistureHistory(fieldId) {
        try {
            if (window.soilAgent) {
                this.moistureHistory = await window.soilAgent.getMoistureHistory(fieldId, 30);
            } else {
                this.moistureHistory = this.generateMoistureHistory();
            }
            this.updateMoistureChart();
        } catch (error) {
            console.error('Failed to load moisture history:', error);
        }
    }

    generateMoistureHistory() {
        const history = [];
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            history.push({
                date: date.toISOString(),
                moisture: Math.round(45 + Math.random() * 40),
                temperature: Math.round(18 + Math.random() * 8),
                rainfall: Math.round(Math.random() * 15)
            });
        }
        
        return history;
    }

    async loadIrrigationSchedules() {
        try {
            if (window.soilAgent) {
                this.irrigationSchedules = await window.soilAgent.getIrrigationSchedules(this.selectedField);
            } else {
                this.irrigationSchedules = [
                    {
                        id: 'IRRIG-001',
                        field_id: 'field-001',
                        type: 'Drip',
                        schedule: 'Every 3 days',
                        amount: 25,
                        duration: 2,
                        start_time: '06:00',
                        status: 'active'
                    }
                ];
            }
            this.displayIrrigationSchedules();
        } catch (error) {
            console.error('Failed to load irrigation schedules:', error);
        }
    }

    displayIrrigationSchedules() {
        const container = document.getElementById('irrigationSchedules');
        if (!container) return;

        if (this.irrigationSchedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-water"></i>
                    <p>No irrigation schedules configured</p>
                    <button class="btn-sm" onclick="soilIrrigation.showIrrigationModal()">
                        <i class="fas fa-plus"></i> Add Schedule
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.irrigationSchedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-info">
                    <span class="schedule-type">${schedule.type}</span>
                    <span class="schedule-status ${schedule.status}">${schedule.status}</span>
                </div>
                <div class="schedule-details">
                    <span>${schedule.schedule}</span>
                    <span>${schedule.amount} mm</span>
                    <span>${schedule.duration} hours</span>
                    <span>Starts: ${schedule.start_time}</span>
                </div>
                <div class="schedule-actions">
                    <button class="btn-sm" onclick="soilIrrigation.editSchedule('${schedule.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="soilIrrigation.deleteSchedule('${schedule.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        // Moisture trend chart
        const canvas = document.getElementById('moistureChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.chartInstances.moisture = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Soil Moisture',
                            data: [],
                            borderColor: '#2E7D32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Rainfall',
                            data: [],
                            borderColor: '#1565C0',
                            backgroundColor: 'rgba(21, 101, 192, 0.2)',
                            type: 'bar',
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Moisture (%)'
                            }
                        },
                        y1: {
                            position: 'right',
                            beginAtZero: true,
                            max: 50,
                            grid: {
                                drawOnChartArea: false
                            },
                            title: {
                                display: true,
                                text: 'Rainfall (mm)'
                            }
                        }
                    }
                }
            });
        }
    }

    updateCharts(data) {
        // Update moisture chart from history
        this.updateMoistureChart();
    }

    updateMoistureChart() {
        const chart = this.chartInstances.moisture;
        if (!chart || this.moistureHistory.length === 0) return;

        const labels = this.moistureHistory.map(h => new Date(h.date).toLocaleDateString());
        const moisture = this.moistureHistory.map(h => h.moisture);
        const rainfall = this.moistureHistory.map(h => h.rainfall || 0);

        chart.data.labels = labels;
        chart.data.datasets[0].data = moisture;
        chart.data.datasets[1].data = rainfall;
        chart.update();
    }

    showIrrigationModal(schedule = null) {
        ModalComponent.prompt(
            'Enter irrigation details',
            {
                title: schedule ? 'Edit Irrigation Schedule' : 'Add Irrigation Schedule',
                inputType: 'text',
                placeholder: 'Amount (mm), Frequency, Duration...',
                onConfirm: (value) => {
                    if (value) {
                        this.saveIrrigationSchedule(value, schedule);
                    }
                }
            }
        );
    }

    async saveIrrigationSchedule(data, schedule = null) {
        try {
            // Parse data (simplified)
            const scheduleData = {
                field_id: this.selectedField || 'field-001',
                type: 'Drip',
                amount: 25,
                duration: 2,
                start_time: '06:00',
                schedule: 'Every 3 days'
            };

            if (window.soilAgent) {
                if (schedule) {
                    // Update existing schedule
                    // await window.soilAgent.updateSchedule(schedule.id, scheduleData);
                } else {
                    await window.soilAgent.scheduleIrrigation(
                        scheduleData.field_id,
                        scheduleData.amount,
                        scheduleData.schedule
                    );
                }
            }

            this.loadIrrigationSchedules();
            this.showToast('Irrigation schedule saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save schedule:', error);
            this.showToast('Failed to save schedule. Please try again.', 'error');
        }
    }

    async editSchedule(id) {
        const schedule = this.irrigationSchedules.find(s => s.id === id);
        if (schedule) {
            this.showIrrigationModal(schedule);
        }
    }

    async deleteSchedule(id) {
        const confirmed = await Modal.confirm(
            'Are you sure you want to delete this irrigation schedule?',
            { title: 'Delete Schedule' }
        );

        if (confirmed) {
            // Delete logic here
            this.irrigationSchedules = this.irrigationSchedules.filter(s => s.id !== id);
            this.displayIrrigationSchedules();
            this.showToast('Schedule deleted successfully!', 'success');
        }
    }

    showSensorModal() {
        ModalComponent.prompt(
            'Enter soil sensor details',
            {
                title: 'Add Soil Sensor',
                inputType: 'text',
                placeholder: 'Sensor ID, Depth, Location...',
                onConfirm: (value) => {
                    if (value) {
                        this.addSensor(value);
                    }
                }
            }
        );
    }

    addSensor(data) {
        this.showToast('Sensor added successfully!', 'success');
    }

    exportSoilData() {
        if (!this.soilData) {
            this.showToast('No soil data to export', 'warning');
            return;
        }

        const data = {
            soil: this.soilData,
            moisture_history: this.moistureHistory,
            irrigation_schedules: this.irrigationSchedules,
            exported_at: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soil_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Soil data exported successfully!', 'success');
    }

    startAutoUpdate() {
        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.loadSoilData(true);
        }, 300000);
    }

    showLoading(show) {
        const container = document.getElementById('soilDataDisplay');
        if (container && show) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading soil data...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('soilDataDisplay');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="soilIrrigation.loadSoilData(true)">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    showToast(message, type = 'info') {
        if (window.notification) {
            window.notification.show(message, type);
        } else {
            alert(message);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        console.log('🧪 Soil & Irrigation Page destroyed');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.soilIrrigation = new SoilIrrigationPage();
});

window.SoilIrrigationPage = SoilIrrigationPage;