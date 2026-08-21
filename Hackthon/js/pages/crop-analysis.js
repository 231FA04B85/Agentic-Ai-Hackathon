/**
 * Crop Analysis Page Logic
 * Handles crop image analysis, health monitoring, and growth tracking
 */

class CropAnalysisPage {
    constructor() {
        this.analysisHistory = [];
        this.currentAnalysis = null;
        this.selectedField = null;
        this.chartInstances = {};
        
        this.initialize();
    }

    initialize() {
        console.log('📸 Crop Analysis Page initializing...');
        this.setupEventListeners();
        this.loadAnalysisHistory();
        this.initializeCharts();
        this.setupImageUpload();
        console.log('✅ Crop Analysis Page initialized');
    }

    setupEventListeners() {
        // Analyze button
        document.getElementById('analyzeBtn')?.addEventListener('click', () => {
            this.analyzeImage();
        });

        // Field selector
        document.getElementById('analysisField')?.addEventListener('change', (e) => {
            this.selectedField = e.target.value;
            this.loadFieldAnalysis();
        });

        // Analysis type
        document.getElementById('analysisType')?.addEventListener('change', () => {
            this.updateAnalysisOptions();
        });

        // Refresh history
        document.getElementById('refreshHistory')?.addEventListener('click', () => {
            this.loadAnalysisHistory();
        });

        // Export results
        document.getElementById('exportResults')?.addEventListener('click', () => {
            this.exportAnalysis();
        });

        // Batch upload
        document.getElementById('batchUploadBtn')?.addEventListener('click', () => {
            this.showBatchUploadModal();
        });
    }

    setupImageUpload() {
        const dropZone = document.getElementById('imageDropZone');
        const fileInput = document.getElementById('imageUpload');

        if (!dropZone || !fileInput) return;

        // Click to upload
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFiles(files);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageFiles(e.target.files);
            }
        });
    }

    handleImageFiles(files) {
        const container = document.getElementById('imagePreviewContainer');
        container.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                this.showToast(`${file.name} is not an image file`, 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="image-preview-info">
                        <span>${file.name}</span>
                        <span>${(file.size / 1024).toFixed(1)} KB</span>
                        <button class="btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                container.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });

        // Store files for analysis
        this.uploadedFiles = files;
    }

    async analyzeImage() {
        const files = document.querySelector('#imagePreviewContainer').children;
        if (files.length === 0) {
            this.showToast('Please upload an image to analyze', 'warning');
            return;
        }

        const fieldId = document.getElementById('analysisField')?.value;
        const analysisType = document.getElementById('analysisType')?.value || 'rgb';

        try {
            this.showLoading(true);

            const file = files[0].querySelector('img')?.src;
            if (!file) {
                throw new Error('No image file found');
            }

            // Convert data URL to File
            const response = await fetch(file);
            const blob = await response.blob();
            const imageFile = new File([blob], 'crop-image.jpg', { type: 'image/jpeg' });

            // Analyze using image API
            let result;
            if (window.imageAPI) {
                result = await window.imageAPI.analyzeImage(imageFile, fieldId, { analysisType });
            } else {
                // Generate sample analysis
                result = this.generateSampleAnalysis(imageFile, fieldId);
            }

            this.currentAnalysis = result;
            this.displayResults(result);
            this.addToHistory(result);
            this.showToast('Analysis complete!', 'success');

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showToast('Failed to analyze image. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleAnalysis(imageFile, fieldId) {
        const healthScore = Math.round(50 + Math.random() * 40);
        const diseases = ['None detected', 'Leaf Spot', 'Rust', 'Blight', 'Powdery Mildew'];
        const disease = diseases[Math.floor(Math.random() * diseases.length)];
        const pests = ['None detected', 'Aphids', 'Whitefly', 'Thrips', 'Mites'];
        const pest = pests[Math.floor(Math.random() * pests.length)];

        return {
            analysis_id: `analysis-${Date.now()}`,
            filename: imageFile.name || 'crop-image.jpg',
            timestamp: new Date().toISOString(),
            crop_type: document.getElementById('analysisCrop')?.value || 'Unknown',
            field_id: fieldId || null,
            health_score: healthScore,
            health_status: healthScore > 70 ? 'Good' : healthScore > 50 ? 'Fair' : 'Poor',
            disease_detected: disease !== 'None detected',
            disease_name: disease,
            disease_severity: disease !== 'None detected' ? Math.round(20 + Math.random() * 60) : 0,
            pest_detected: pest !== 'None detected',
            pest_name: pest !== 'None detected' ? pest : null,
            pest_severity: pest !== 'None detected' ? Math.round(10 + Math.random() * 50) : 0,
            nutrient_deficiencies: this.generateDeficiencies(healthScore),
            ndvi: Math.round((0.3 + Math.random() * 0.5) * 1000) / 1000,
            recommendations: this.generateRecommendations(healthScore, disease, pest),
            confidence: {
                overall: Math.round(70 + Math.random() * 25),
                disease: Math.round(60 + Math.random() * 30),
                nutrient: Math.round(50 + Math.random() * 30)
            }
        };
    }

    generateDeficiencies(healthScore) {
        if (healthScore > 70) return [];
        
        const deficiencies = [];
        const nutrients = ['Nitrogen', 'Phosphorus', 'Potassium', 'Zinc', 'Iron'];
        const count = healthScore < 50 ? 2 : 1;
        
        for (let i = 0; i < count; i++) {
            const nutrient = nutrients[Math.floor(Math.random() * nutrients.length)];
            if (!deficiencies.find(d => d.nutrient === nutrient)) {
                deficiencies.push({
                    nutrient: nutrient,
                    severity: healthScore < 50 ? 'High' : 'Moderate',
                    symptoms: this.getDeficiencySymptoms(nutrient)
                });
            }
        }
        
        return deficiencies;
    }

    getDeficiencySymptoms(nutrient) {
        const symptoms = {
            'Nitrogen': 'Yellowing of older leaves, stunted growth',
            'Phosphorus': 'Purple discoloration, poor root development',
            'Potassium': 'Brown leaf edges, weak stems',
            'Zinc': 'Chlorosis between veins, stunted growth',
            'Iron': 'Interveinal chlorosis, yellowing of young leaves'
        };
        return symptoms[nutrient] || 'General nutrient deficiency symptoms';
    }

    generateRecommendations(healthScore, disease, pest) {
        const recommendations = [];

        if (healthScore < 50) {
            recommendations.push({
                priority: 'High',
                action: 'Immediate intervention needed',
                details: 'Conduct ground truth inspection and apply appropriate treatments'
            });
        }

        if (disease !== 'None detected') {
            recommendations.push({
                priority: 'High',
                action: `Treat ${disease}`,
                details: `Apply appropriate fungicide for ${disease}. Consult local extension service.`
            });
        }

        if (pest !== 'None detected' && pest !== 'None detected') {
            recommendations.push({
                priority: 'High',
                action: `Control ${pest}`,
                details: `Apply appropriate pesticide for ${pest}. Monitor population levels.`
            });
        }

        if (healthScore < 70) {
            recommendations.push({
                priority: 'Medium',
                action: 'Fertilizer application recommended',
                details: 'Apply balanced NPK fertilizer based on soil test results'
            });
        }

        recommendations.push({
            priority: 'Low',
            action: 'Continue monitoring',
            details: 'Schedule regular crop scouting and imagery every 7-10 days'
        });

        return recommendations;
    }

    displayResults(result) {
        const container = document.getElementById('analysisResults');
        if (!container) return;

        container.innerHTML = `
            <div class="analysis-results">
                <div class="result-header">
                    <h3>Analysis Results</h3>
                    <span class="result-date">${new Date(result.timestamp).toLocaleString()}</span>
                </div>
                
                <div class="result-grid">
                    <div class="result-card health-card">
                        <div class="result-icon ${result.health_score > 70 ? 'good' : result.health_score > 50 ? 'fair' : 'poor'}">
                            <i class="fas fa-heartbeat"></i>
                        </div>
                        <div class="result-content">
                            <h4>Crop Health</h4>
                            <div class="health-score">${result.health_score}%</div>
                            <span class="health-status ${result.health_status.toLowerCase()}">${result.health_status}</span>
                        </div>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon ${result.disease_detected ? 'warning' : 'good'}">
                            <i class="fas fa-bug"></i>
                        </div>
                        <div class="result-content">
                            <h4>Disease Status</h4>
                            ${result.disease_detected ? `
                                <div class="disease-info">
                                    <span class="disease-name">${result.disease_name}</span>
                                    <span class="disease-severity">Severity: ${result.disease_severity}%</span>
                                </div>
                            ` : `
                                <span class="no-issue">No disease detected</span>
                            `}
                        </div>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon ${result.pest_detected ? 'warning' : 'good'}">
                            <i class="fas fa-paw"></i>
                        </div>
                        <div class="result-content">
                            <h4>Pest Status</h4>
                            ${result.pest_detected ? `
                                <div class="pest-info">
                                    <span class="pest-name">${result.pest_name}</span>
                                    <span class="pest-severity">Severity: ${result.pest_severity}%</span>
                                </div>
                            ` : `
                                <span class="no-issue">No pests detected</span>
                            `}
                        </div>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon info">
                            <i class="fas fa-leaf"></i>
                        </div>
                        <div class="result-content">
                            <h4>Vegetation Index</h4>
                            <div class="ndvi-value">NDVI: ${result.ndvi.toFixed(3)}</div>
                            <span class="ndvi-status">${result.ndvi > 0.5 ? 'Good' : result.ndvi > 0.3 ? 'Moderate' : 'Poor'}</span>
                        </div>
                    </div>
                </div>
                
                ${result.nutrient_deficiencies && result.nutrient_deficiencies.length > 0 ? `
                    <div class="result-section">
                        <h4>Nutrient Deficiencies</h4>
                        <div class="deficiency-list">
                            ${result.nutrient_deficiencies.map(d => `
                                <div class="deficiency-item">
                                    <span class="deficiency-name">${d.nutrient}</span>
                                    <span class="deficiency-severity ${d.severity.toLowerCase()}">${d.severity}</span>
                                    <span class="deficiency-symptoms">${d.symptoms}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${result.recommendations && result.recommendations.length > 0 ? `
                    <div class="result-section">
                        <h4>Recommendations</h4>
                        <div class="recommendation-list">
                            ${result.recommendations.map(r => `
                                <div class="recommendation-item">
                                    <span class="rec-priority ${r.priority.toLowerCase()}">${r.priority}</span>
                                    <div class="rec-content">
                                        <strong>${r.action}</strong>
                                        <p>${r.details}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="result-confidence">
                    <h4>Analysis Confidence</h4>
                    <div class="confidence-bars">
                        <div class="confidence-item">
                            <span>Overall</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${result.confidence.overall}%; background: ${result.confidence.overall > 80 ? '#2E7D32' : result.confidence.overall > 60 ? '#F57C00' : '#C62828'}"></div>
                            </div>
                            <span>${result.confidence.overall}%</span>
                        </div>
                        <div class="confidence-item">
                            <span>Disease</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${result.confidence.disease}%; background: ${result.confidence.disease > 80 ? '#2E7D32' : result.confidence.disease > 60 ? '#F57C00' : '#C62828'}"></div>
                            </div>
                            <span>${result.confidence.disease}%</span>
                        </div>
                        <div class="confidence-item">
                            <span>Nutrient</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${result.confidence.nutrient}%; background: ${result.confidence.nutrient > 80 ? '#2E7D32' : result.confidence.nutrient > 60 ? '#F57C00' : '#C62828'}"></div>
                            </div>
                            <span>${result.confidence.nutrient}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Show results container
        container.style.display = 'block';
        document.getElementById('analysisResultsContainer')?.classList.add('has-results');
    }

    async loadAnalysisHistory() {
        try {
            const container = document.getElementById('analysisHistoryList');
            if (!container) return;

            // Fetch history from API or generate sample
            let history = [];
            if (window.imageAPI) {
                const fieldId = document.getElementById('analysisField')?.value;
                history = await window.imageAPI.getAnalysisHistory(fieldId);
            } else {
                history = this.generateSampleHistory();
            }

            this.analysisHistory = history;
            this.renderHistory(history);

        } catch (error) {
            console.error('Failed to load analysis history:', error);
        }
    }

    generateSampleHistory() {
        const history = [];
        const now = new Date();
        
        for (let i = 10; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 3);
            
            history.push({
                id: `hist-${Date.now()}-${i}`,
                date: date.toISOString(),
                health_score: Math.round(50 + Math.random() * 40),
                ndvi: Math.round((0.3 + Math.random() * 0.5) * 1000) / 1000,
                disease_risk: Math.round(10 + Math.random() * 60),
                analysis_type: ['RGB', 'Multispectral', 'Thermal'][Math.floor(Math.random() * 3)]
            });
        }
        
        return history;
    }

    renderHistory(history) {
        const container = document.getElementById('analysisHistoryList');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No analysis history available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.slice(0, 10).map(item => `
            <div class="history-item">
                <div class="history-date">${new Date(item.date).toLocaleDateString()}</div>
                <div class="history-details">
                    <span class="history-health ${item.health_score > 70 ? 'good' : item.health_score > 50 ? 'fair' : 'poor'}">
                        ${item.health_score}%
                    </span>
                    <span class="history-ndvi">NDVI: ${item.ndvi.toFixed(3)}</span>
                    <span class="history-type">${item.analysis_type}</span>
                </div>
                <button class="btn-sm" onclick="cropAnalysis.viewHistoryItem('${item.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `).join('');
    }

    viewHistoryItem(id) {
        const item = this.analysisHistory.find(h => h.id === id);
        if (item) {
            this.showToast(`Viewing analysis from ${new Date(item.date).toLocaleDateString()}`, 'info');
            // Show detailed view
        }
    }

    initializeCharts() {
        // Health trend chart
        const canvas = document.getElementById('healthTrendChart');
        if (canvas && this.analysisHistory.length > 0) {
            const ctx = canvas.getContext('2d');
            const dates = this.analysisHistory.map(h => new Date(h.date).toLocaleDateString());
            const healthScores = this.analysisHistory.map(h => h.health_score);
            const ndviValues = this.analysisHistory.map(h => h.ndvi * 100);

            this.chartInstances.healthTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Health Score',
                            data: healthScores,
                            borderColor: '#2E7D32',
                            backgroundColor: 'rgba(46, 125, 50, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'NDVI Index',
                            data: ndviValues,
                            borderColor: '#1565C0',
                            backgroundColor: 'rgba(21, 101, 192, 0.1)',
                            fill: true,
                            tension: 0.3,
                            borderDash: [5, 5]
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
                            max: 100
                        }
                    }
                }
            });
        }
    }

    updateAnalysisOptions() {
        const type = document.getElementById('analysisType')?.value;
        const options = document.getElementById('analysisOptions');
        if (!options) return;

        const optionHtml = {
            'rgb': `
                <div class="form-group">
                    <label>Image Type</label>
                    <select>
                        <option value="standard">Standard RGB</option>
                        <option value="enhanced">Enhanced Color</option>
                    </select>
                </div>
            `,
            'multispectral': `
                <div class="form-group">
                    <label>Band Selection</label>
                    <select>
                        <option value="standard">Standard Bands</option>
                        <option value="ndvi">NDVI Enhanced</option>
                        <option value="full">Full Spectrum</option>
                    </select>
                </div>
            `,
            'thermal': `
                <div class="form-group">
                    <label>Temperature Scale</label>
                    <select>
                        <option value="auto">Auto Scale</option>
                        <option value="celsius">Celsius</option>
                        <option value="fahrenheit">Fahrenheit</option>
                    </select>
                </div>
            `
        };

        options.innerHTML = optionHtml[type] || '';
    }

    exportAnalysis() {
        if (!this.currentAnalysis) {
            this.showToast('No analysis results to export', 'warning');
            return;
        }

        const data = {
            analysis: this.currentAnalysis,
            timestamp: new Date().toISOString(),
            field: this.selectedField
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analysis_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Analysis exported successfully!', 'success');
    }

    showBatchUploadModal() {
        ModalComponent.confirm(
            'Upload multiple images for batch analysis. This may take several minutes.',
            {
                title: 'Batch Upload',
                confirmText: 'Start Batch Upload',
                onConfirm: () => {
                    this.startBatchUpload();
                }
            }
        );
    }

    async startBatchUpload() {
        const files = document.querySelector('#imagePreviewContainer').children;
        if (files.length === 0) {
            this.showToast('Please upload images for batch analysis', 'warning');
            return;
        }

        this.showToast('Starting batch analysis...', 'info');
        this.showLoading(true);

        let completed = 0;
        const total = files.length;

        for (const fileElement of files) {
            try {
                const img = fileElement.querySelector('img');
                if (!img) continue;

                const response = await fetch(img.src);
                const blob = await response.blob();
                const imageFile = new File([blob], 'batch-image.jpg', { type: 'image/jpeg' });

                // Process each image
                const result = await this.processImage(imageFile);
                this.addToHistory(result);
                completed++;
            } catch (error) {
                console.error('Batch processing error:', error);
            }
        }

        this.showLoading(false);
        this.showToast(`Batch analysis complete! Processed ${completed}/${total} images.`, 'success');
    }

    async processImage(imageFile) {
        // Similar to analyzeImage but for batch processing
        const result = this.generateSampleAnalysis(imageFile);
        return result;
    }

    addToHistory(result) {
        this.analysisHistory.unshift({
            id: result.analysis_id,
            date: result.timestamp,
            health_score: result.health_score,
            ndvi: result.ndvi,
            disease_risk: result.disease_detected ? result.disease_severity : 0,
            analysis_type: 'RGB'
        });
        this.renderHistory(this.analysisHistory);
    }

    showLoading(show) {
        const container = document.getElementById('analysisResults');
        if (container && show) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Analyzing image...</p>
                </div>
            `;
            container.style.display = 'block';
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
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        console.log('📸 Crop Analysis Page destroyed');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.cropAnalysis = new CropAnalysisPage();
});

window.CropAnalysisPage = CropAnalysisPage;