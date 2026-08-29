/**
 * Charts Component - Chart.js Integration
 * Provides reusable chart components with Chart.js
 */

class ChartsComponent {
    constructor(options = {}) {
        this.options = {
            containerId: 'chartContainer',
            charts: [],
            defaultOptions: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            },
            ...options
        };
        
        this.container = null;
        this.charts = {};
        this.chartInstances = {};
        
        this.initialize();
    }

    initialize() {
        console.log('📊 Charts Component initializing...');
        
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.warn('Chart container not found');
            return;
        }
        
        this.renderCharts();
        
        console.log('✅ Charts Component initialized');
    }

    renderCharts() {
        this.options.charts.forEach((chartData, index) => {
            this.createChart(chartData, index);
        });
    }

    createChart(data, index) {
        const id = data.id || `chart-${index}`;
        const container = document.createElement('div');
        container.className = `chart-container ${data.className || ''}`;
        container.id = id;
        container.style.height = data.height || '300px';
        
        const canvas = document.createElement('canvas');
        canvas.id = `${id}-canvas`;
        container.appendChild(canvas);
        
        this.container.appendChild(container);
        
        // Create Chart.js instance
        const ctx = canvas.getContext('2d');
        const config = this.buildChartConfig(data);
        
        try {
            const chart = new Chart(ctx, config);
            this.chartInstances[id] = chart;
            this.charts[id] = {
                ...data,
                instance: chart,
                container: container,
                canvas: canvas
            };
            
            // Handle resize
            const resizeObserver = new ResizeObserver(() => {
                chart.resize();
            });
            resizeObserver.observe(container);
            this.charts[id].resizeObserver = resizeObserver;
            
        } catch (error) {
            console.error(`Failed to create chart ${id}:`, error);
            container.innerHTML = `
                <div class="chart-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Failed to load chart</span>
                </div>
            `;
        }
        
        return id;
    }

    buildChartConfig(data) {
        const { type, data: chartData, options = {} } = data;
        
        // Get colors if not provided
        if (chartData.datasets) {
            chartData.datasets = chartData.datasets.map((dataset, index) => {
                if (!dataset.backgroundColor) {
                    dataset.backgroundColor = this.getColor(index, 'background');
                }
                if (!dataset.borderColor) {
                    dataset.borderColor = this.getColor(index, 'border');
                }
                return dataset;
            });
        }
        
        const config = {
            type: type || 'line',
            data: chartData || { labels: [], datasets: [] },
            options: this.mergeOptions({
                ...this.options.defaultOptions,
                ...options
            })
        };
        
        return config;
    }

    mergeOptions(options) {
        // Ensure responsive
        if (!options.responsive) options.responsive = true;
        if (!options.maintainAspectRatio) options.maintainAspectRatio = false;
        
        // Merge plugins
        if (options.plugins) {
            options.plugins = {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    },
                    ...options.plugins.legend
                },
                ...options.plugins
            };
        }
        
        return options;
    }

    getColor(index, type = 'background') {
        const colors = [
            { background: 'rgba(46, 125, 50, 0.2)', border: '#2E7D32' },
            { background: 'rgba(21, 101, 192, 0.2)', border: '#1565C0' },
            { background: 'rgba(245, 124, 0, 0.2)', border: '#F57C00' },
            { background: 'rgba(198, 40, 40, 0.2)', border: '#C62828' },
            { background: 'rgba(156, 39, 176, 0.2)', border: '#9C27B0' },
            { background: 'rgba(0, 150, 136, 0.2)', border: '#009688' },
            { background: 'rgba(233, 30, 99, 0.2)', border: '#E91E63' },
            { background: 'rgba(96, 125, 139, 0.2)', border: '#607D8B' }
        ];
        
        const color = colors[index % colors.length];
        return type === 'background' ? color.background : color.border;
    }

    updateChart(id, data) {
        const chart = this.chartInstances[id];
        if (!chart) {
            console.warn(`Chart ${id} not found`);
            return false;
        }
        
        try {
            // Update data
            if (data.labels) chart.data.labels = data.labels;
            if (data.datasets) {
                chart.data.datasets = data.datasets.map((dataset, index) => {
                    if (!dataset.backgroundColor && chart.data.datasets[index]) {
                        dataset.backgroundColor = chart.data.datasets[index].backgroundColor;
                    }
                    if (!dataset.borderColor && chart.data.datasets[index]) {
                        dataset.borderColor = chart.data.datasets[index].borderColor;
                    }
                    return dataset;
                });
            }
            
            chart.update();
            this.dispatchEvent('update', { id, data });
            return true;
            
        } catch (error) {
            console.error(`Failed to update chart ${id}:`, error);
            return false;
        }
    }

    addData(id, datasetIndex, data) {
        const chart = this.chartInstances[id];
        if (!chart) return false;
        
        try {
            chart.data.datasets[datasetIndex].data.push(data);
            chart.update();
            return true;
        } catch (error) {
            console.error(`Failed to add data to chart ${id}:`, error);
            return false;
        }
    }

    removeData(id, datasetIndex, index) {
        const chart = this.chartInstances[id];
        if (!chart) return false;
        
        try {
            chart.data.datasets[datasetIndex].data.splice(index, 1);
            chart.update();
            return true;
        } catch (error) {
            console.error(`Failed to remove data from chart ${id}:`, error);
            return false;
        }
    }

    destroyChart(id) {
        const chart = this.chartInstances[id];
        if (!chart) return false;
        
        try {
            chart.destroy();
            delete this.chartInstances[id];
            
            if (this.charts[id] && this.charts[id].resizeObserver) {
                this.charts[id].resizeObserver.disconnect();
            }
            delete this.charts[id];
            
            // Remove container
            const container = document.getElementById(id);
            if (container) container.remove();
            
            this.dispatchEvent('destroy', { id });
            return true;
            
        } catch (error) {
            console.error(`Failed to destroy chart ${id}:`, error);
            return false;
        }
    }

    destroyAll() {
        Object.keys(this.chartInstances).forEach(id => {
            this.destroyChart(id);
        });
    }

    getChart(id) {
        return this.chartInstances[id];
    }

    getChartData(id) {
        const chart = this.chartInstances[id];
        if (!chart) return null;
        return chart.data;
    }

    exportChartImage(id, format = 'png') {
        const chart = this.chartInstances[id];
        if (!chart) return null;
        
        try {
            const url = chart.canvas.toDataURL(`image/${format}`);
            return url;
        } catch (error) {
            console.error(`Failed to export chart ${id}:`, error);
            return null;
        }
    }

    downloadChartImage(id, filename = 'chart', format = 'png') {
        const url = this.exportChartImage(id, format);
        if (!url) return false;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`charts-${eventName}`, { 
            detail: { ...detail, timestamp: new Date().toISOString() } 
        });
        document.dispatchEvent(event);
    }

    // Static chart creation helpers
    static createLineChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    line: { tension: 0.3 }
                },
                ...options
            }
        });
    }

    static createBarChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
    }

    static createPieChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                ...options
            }
        });
    }

    static createDoughnutChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                ...options
            }
        });
    }

    static createRadarChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                ...options
            }
        });
    }
}

// Export for use in other files
window.ChartsComponent = ChartsComponent;