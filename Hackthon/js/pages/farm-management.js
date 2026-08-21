/**
 * Farm Management Page Logic
 * Handles field management, crop planning, and farm operations
 */

class FarmManagementPage {
    constructor() {
        this.fields = [];
        this.selectedField = null;
        this.cropTypes = ['Wheat', 'Corn', 'Soybean', 'Tomato', 'Potato', 'Rice', 'Cotton', 'Sunflower'];
        this.growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
        this.soilTypes = ['Sandy', 'Silt', 'Clay', 'Loam', 'Peat', 'Chalk'];
        this.irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Subsurface'];
        
        this.initialize();
    }

    initialize() {
        console.log('🌾 Farm Management Page initializing...');
        this.setupEventListeners();
        this.loadFields();
        this.initializeCharts();
        this.setupFieldFilters();
        console.log('✅ Farm Management Page initialized');
    }

    setupEventListeners() {
        // Add Field Button
        document.getElementById('addFieldBtn')?.addEventListener('click', () => {
            this.showFieldModal();
        });

        // Field Filters
        document.getElementById('filterCrop')?.addEventListener('change', () => {
            this.filterFields();
        });
        document.getElementById('filterStatus')?.addEventListener('change', () => {
            this.filterFields();
        });

        // Search
        document.getElementById('searchField')?.addEventListener('input', (e) => {
            this.searchFields(e.target.value);
        });

        // Field form submit
        document.getElementById('addFieldForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveField();
        });

        // Export
        document.getElementById('exportFieldsBtn')?.addEventListener('click', () => {
            this.exportFields();
        });

        // Refresh
        document.getElementById('refreshFieldsBtn')?.addEventListener('click', () => {
            this.loadFields();
        });
    }

    async loadFields() {
        try {
            // Show loading
            this.showLoading(true);

            // Fetch fields from orchestrator or API
            if (window.orchestrator) {
                this.fields = await window.orchestrator.getFieldData();
            } else if (window.cropAgent) {
                this.fields = await window.cropAgent.getFieldData();
            } else {
                // Fallback sample data
                this.fields = this.generateSampleFields();
            }

            this.renderFields();
            this.updateStats();

            // Dispatch event
            document.dispatchEvent(new CustomEvent('fieldsLoaded', {
                detail: { fields: this.fields }
            }));

        } catch (error) {
            console.error('Failed to load fields:', error);
            this.showError('Failed to load field data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleFields() {
        const cropTypes = ['Wheat', 'Corn', 'Soybean', 'Tomato'];
        const stages = ['Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
        const fieldNames = ['North Field', 'South Field', 'East Field', 'West Field', 'Central Field', 'River Field', 'Hill Field', 'Valley Field'];
        
        return fieldNames.map((name, index) => ({
            id: `field-${index + 1}`,
            name: name,
            cropType: cropTypes[index % cropTypes.length],
            variety: ['Pioneer', 'Dekalb', 'Rutgers', 'Monsanto'][index % 4] + ' ' + (100 + index * 50),
            plantingDate: new Date(2026, 2 + index % 3, 15 + index * 5).toISOString(),
            growthStage: stages[index % stages.length],
            health: Math.round(55 + Math.random() * 40),
            ripeness: Math.round(20 + Math.random() * 70),
            area: Math.round(10 + Math.random() * 40),
            soilType: this.soilTypes[index % this.soilTypes.length],
            irrigationType: this.irrigationTypes[index % this.irrigationTypes.length],
            yield: Math.round((20 + Math.random() * 30) * 10) / 10,
            status: ['Active', 'Harvested', 'Fallow', 'Planted'][index % 4],
            lastHarvest: new Date(2025, 8 + index % 3, 10 + index * 7).toISOString()
        }));
    }

    renderFields() {
        const container = document.getElementById('fieldCardsGrid');
        if (!container) return;

        if (this.fields.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tractor"></i>
                    <h3>No Fields Found</h3>
                    <p>Start by adding your first field to begin farm management.</p>
                    <button class="btn-primary" onclick="farmManagement.showFieldModal()">
                        <i class="fas fa-plus"></i> Add Field
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.fields.map(field => `
            <div class="field-card card" data-id="${field.id}" onclick="farmManagement.selectField('${field.id}')">
                <div class="card-header">
                    <div class="field-status-badge status-${field.status?.toLowerCase() || 'active'}">
                        ${field.status || 'Active'}
                    </div>
                    ${field.health ? `
                        <div class="field-health">
                            <span class="health-score ${field.health > 70 ? 'healthy' : field.health > 40 ? 'warning' : 'critical'}">
                                ${field.health}%
                            </span>
                        </div>
                    ` : ''}
                </div>
                <div class="card-body">
                    <h3 class="field-name">${field.name}</h3>
                    <div class="field-details">
                        <div class="detail-item">
                            <i class="fas fa-seedling"></i>
                            <span>${field.cropType || 'No crop'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${field.growthStage || 'Unknown'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-ruler"></i>
                            <span>${field.area || 0} ha</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tint"></i>
                            <span>${field.irrigationType || 'None'}</span>
                        </div>
                    </div>
                    ${field.plantingDate ? `
                        <div class="field-planting">
                            <i class="fas fa-clock"></i>
                            Planted: ${new Date(field.plantingDate).toLocaleDateString()}
                        </div>
                    ` : ''}
                    ${field.ripeness !== undefined ? `
                        <div class="field-ripeness">
                            <span>Ripeness: ${field.ripeness}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${field.ripeness}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn-sm" onclick="event.stopPropagation(); farmManagement.viewField('${field.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); farmManagement.editField('${field.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-sm btn-danger" onclick="event.stopPropagation(); farmManagement.deleteField('${field.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalFields = this.fields.length;
        const activeFields = this.fields.filter(f => f.status === 'Active').length;
        const totalArea = this.fields.reduce((sum, f) => sum + (f.area || 0), 0);
        const avgHealth = this.fields.reduce((sum, f) => sum + (f.health || 0), 0) / (totalFields || 1);

        document.getElementById('totalFields')?.textContent = totalFields;
        document.getElementById('activeFields')?.textContent = activeFields;
        document.getElementById('totalArea')?.textContent = totalArea.toFixed(1);
        document.getElementById('avgHealth')?.textContent = Math.round(avgHealth) + '%';
    }

    filterFields() {
        const cropFilter = document.getElementById('filterCrop')?.value;
        const statusFilter = document.getElementById('filterStatus')?.value;

        let filtered = [...this.fields];

        if (cropFilter && cropFilter !== 'all') {
            filtered = filtered.filter(f => f.cropType === cropFilter);
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(f => f.status?.toLowerCase() === statusFilter);
        }

        this.renderFilteredFields(filtered);
    }

    renderFilteredFields(filtered) {
        const container = document.getElementById('fieldCardsGrid');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Matching Fields</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        // Reuse render function with filtered data
        const originalFields = this.fields;
        this.fields = filtered;
        this.renderFields();
        this.fields = originalFields;
    }

    searchFields(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.renderFields();
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = this.fields.filter(f => 
            f.name.toLowerCase().includes(term) ||
            f.cropType?.toLowerCase().includes(term) ||
            f.variety?.toLowerCase().includes(term) ||
            f.growthStage?.toLowerCase().includes(term)
        );

        this.renderFilteredFields(filtered);
    }

    setupFieldFilters() {
        // Populate crop filter dropdown
        const cropFilter = document.getElementById('filterCrop');
        if (cropFilter) {
            const uniqueCrops = [...new Set(this.fields.map(f => f.cropType).filter(Boolean))];
            uniqueCrops.forEach(crop => {
                const option = document.createElement('option');
                option.value = crop;
                option.textContent = crop;
                cropFilter.appendChild(option);
            });
        }
    }

    showFieldModal(field = null) {
        const modal = document.getElementById('addFieldModal');
        if (!modal) return;

        const isEdit = !!field;
        const title = isEdit ? 'Edit Field' : 'Add New Field';
        modal.querySelector('.modal-header h2').textContent = title;

        // Populate form
        const form = document.getElementById('addFieldForm');
        if (form) {
            form.reset();
            if (isEdit && field) {
                document.getElementById('fieldId').value = field.id;
                document.getElementById('fieldName').value = field.name || '';
                document.getElementById('cropType').value = field.cropType || '';
                document.getElementById('variety').value = field.variety || '';
                document.getElementById('plantingDate').value = field.plantingDate?.split('T')[0] || '';
                document.getElementById('area').value = field.area || '';
                document.getElementById('soilType').value = field.soilType || '';
                document.getElementById('irrigationType').value = field.irrigationType || '';
                document.getElementById('fieldNotes').value = field.notes || '';
            } else {
                document.getElementById('fieldId').value = '';
            }
        }

        modal.classList.add('active');
    }

    async saveField() {
        const form = document.getElementById('addFieldForm');
        if (!form) return;

        const formData = new FormData(form);
        const fieldData = {
            name: formData.get('fieldName'),
            cropType: formData.get('cropType'),
            variety: formData.get('variety'),
            plantingDate: formData.get('plantingDate'),
            area: parseFloat(formData.get('area')),
            soilType: formData.get('soilType'),
            irrigationType: formData.get('irrigationType'),
            notes: formData.get('fieldNotes')
        };

        // Validate
        if (!fieldData.name || !fieldData.cropType || !fieldData.area) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const fieldId = document.getElementById('fieldId').value;
            let result;

            if (fieldId) {
                // Update existing field
                if (window.cropAgent) {
                    result = await window.cropAgent.updateField(fieldId, fieldData);
                }
                this.showToast('Field updated successfully!', 'success');
            } else {
                // Add new field
                if (window.cropAgent) {
                    result = await window.cropAgent.addField(fieldData);
                }
                this.showToast('Field added successfully!', 'success');
            }

            // Close modal and refresh
            document.getElementById('addFieldModal')?.classList.remove('active');
            await this.loadFields();

        } catch (error) {
            console.error('Failed to save field:', error);
            this.showToast('Failed to save field. Please try again.', 'error');
        }
    }

    async viewField(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        if (!field) return;

        // Show field details modal
        const modal = document.getElementById('fieldDetailModal');
        if (!modal) return;

        const content = document.getElementById('fieldDetailContent');
        content.innerHTML = `
            <div class="field-detail-grid">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-row"><span>Field Name:</span> <strong>${field.name}</strong></div>
                    <div class="detail-row"><span>Crop Type:</span> <strong>${field.cropType || 'None'}</strong></div>
                    <div class="detail-row"><span>Variety:</span> <strong>${field.variety || 'Unknown'}</strong></div>
                    <div class="detail-row"><span>Growth Stage:</span> <strong>${field.growthStage || 'Unknown'}</strong></div>
                    <div class="detail-row"><span>Status:</span> <strong>${field.status || 'Active'}</strong></div>
                </div>
                <div class="detail-section">
                    <h4>Measurements</h4>
                    <div class="detail-row"><span>Area:</span> <strong>${field.area || 0} ha</strong></div>
                    <div class="detail-row"><span>Health:</span> <strong>${field.health || 0}%</strong></div>
                    <div class="detail-row"><span>Ripeness:</span> <strong>${field.ripeness || 0}%</strong></div>
                    <div class="detail-row"><span>Estimated Yield:</span> <strong>${field.yield || 'N/A'} kg/ha</strong></div>
                </div>
                <div class="detail-section">
                    <h4>Soil & Irrigation</h4>
                    <div class="detail-row"><span>Soil Type:</span> <strong>${field.soilType || 'Unknown'}</strong></div>
                    <div class="detail-row"><span>Irrigation:</span> <strong>${field.irrigationType || 'None'}</strong></div>
                </div>
                <div class="detail-section">
                    <h4>Dates</h4>
                    <div class="detail-row"><span>Planting Date:</span> <strong>${field.plantingDate ? new Date(field.plantingDate).toLocaleDateString() : 'N/A'}</strong></div>
                    <div class="detail-row"><span>Last Harvest:</span> <strong>${field.lastHarvest ? new Date(field.lastHarvest).toLocaleDateString() : 'N/A'}</strong></div>
                </div>
            </div>
            ${field.notes ? `
                <div class="detail-section">
                    <h4>Notes</h4>
                    <p>${field.notes}</p>
                </div>
            ` : ''}
        `;

        document.getElementById('detailFieldName').textContent = field.name;
        modal.classList.add('active');
    }

    async editField(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field) {
            this.showFieldModal(field);
        }
    }

    async deleteField(fieldId) {
        const confirmed = await Modal.confirm(
            'Are you sure you want to delete this field? This action cannot be undone.',
            { title: 'Delete Field' }
        );

        if (confirmed) {
            try {
                if (window.cropAgent) {
                    await window.cropAgent.deleteField(fieldId);
                }
                this.fields = this.fields.filter(f => f.id !== fieldId);
                this.renderFields();
                this.updateStats();
                this.showToast('Field deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete field:', error);
                this.showToast('Failed to delete field. Please try again.', 'error');
            }
        }
    }

    selectField(fieldId) {
        this.selectedField = this.fields.find(f => f.id === fieldId);
        if (this.selectedField) {
            document.dispatchEvent(new CustomEvent('fieldSelected', {
                detail: { field: this.selectedField }
            }));
        }
    }

    initializeCharts() {
        // Field distribution chart
        const canvas = document.getElementById('fieldDistributionChart');
        if (canvas && this.fields.length > 0) {
            const cropCounts = {};
            this.fields.forEach(f => {
                const crop = f.cropType || 'Unknown';
                cropCounts[crop] = (cropCounts[crop] || 0) + 1;
            });

            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(cropCounts),
                    datasets: [{
                        data: Object.values(cropCounts),
                        backgroundColor: ['#2E7D32', '#1565C0', '#F57C00', '#C62828', '#9C27B0', '#009688']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    }
                }
            });
        }
    }

    exportFields() {
        if (this.fields.length === 0) {
            this.showToast('No fields to export', 'warning');
            return;
        }

        const headers = ['Name', 'Crop Type', 'Variety', 'Growth Stage', 'Health', 'Area (ha)', 'Soil Type', 'Irrigation', 'Status'];
        const data = this.fields.map(f => [
            f.name || '',
            f.cropType || '',
            f.variety || '',
            f.growthStage || '',
            f.health || 0,
            f.area || 0,
            f.soilType || '',
            f.irrigationType || '',
            f.status || 'Active'
        ]);

        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fields_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Fields exported successfully!', 'success');
    }

    showLoading(show) {
        const container = document.getElementById('fieldCardsGrid');
        if (container && show) {
            container.innerHTML = `
                <div class="loading-grid">
                    ${Array(4).fill(0).map(() => `
                        <div class="card skeleton-card">
                            <div class="skeleton-line" style="height: 20px; width: 60%;"></div>
                            <div class="skeleton-line" style="height: 15px; width: 80%; margin-top: 10px;"></div>
                            <div class="skeleton-line" style="height: 15px; width: 70%;"></div>
                            <div class="skeleton-line" style="height: 10px; width: 90%; margin-top: 15px;"></div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('fieldCardsGrid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading Fields</h3>
                    <p>${message}</p>
                    <button class="btn-primary" onclick="farmManagement.loadFields()">
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
        console.log('🌾 Farm Management Page destroyed');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.farmManagement = new FarmManagementPage();
});

window.FarmManagementPage = FarmManagementPage;