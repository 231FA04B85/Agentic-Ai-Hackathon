/**
 * Export Helpers - Data Export Utilities
 * Provides functionality for exporting data in various formats
 */

class ExportHelpers {
    /**
     * Export data as CSV
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} CSV string
     */
    static exportCSV(data, options = {}) {
        if (!data || data.length === 0) {
            return 'No data to export';
        }

        const {
            headers = Object.keys(data[0]),
            delimiter = ',',
            includeHeaders = true
        } = options;

        let csv = '';

        // Add headers
        if (includeHeaders) {
            csv += headers.map(h => this.escapeCSV(h)).join(delimiter) + '\n';
        }

        // Add data rows
        data.forEach(row => {
            const rowData = headers.map(header => {
                const value = row[header];
                return this.escapeCSV(value !== undefined ? value : '');
            });
            csv += rowData.join(delimiter) + '\n';
        });

        return csv;
    }

    /**
     * Escape CSV value
     * @param {*} value - Value to escape
     * @returns {string} Escaped value
     */
    static escapeCSV(value) {
        if (value === undefined || value === null) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Export data as JSON
     * @param {Object|Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} JSON string
     */
    static exportJSON(data, options = {}) {
        const {
            pretty = true,
            indent = 2
        } = options;

        return pretty ? JSON.stringify(data, null, indent) : JSON.stringify(data);
    }

    /**
     * Export data as Excel (CSV with Excel-specific formatting)
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} Excel-formatted CSV string
     */
    static exportExcel(data, options = {}) {
        // Excel uses different encoding and formatting
        const csv = this.exportCSV(data, options);
        // Add BOM for Excel UTF-8 support
        return '\uFEFF' + csv;
    }

    /**
     * Export data as HTML table
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} HTML string
     */
    static exportHTML(data, options = {}) {
        if (!data || data.length === 0) {
            return '<p>No data available</p>';
        }

        const {
            headers = Object.keys(data[0]),
            tableClass = 'export-table',
            includeHeaders = true,
            caption = ''
        } = options;

        let html = `<table class="${tableClass}">`;

        if (caption) {
            html += `<caption>${caption}</caption>`;
        }

        if (includeHeaders) {
            html += '<thead><tr>';
            headers.forEach(header => {
                html += `<th>${this.escapeHTML(header)}</th>`;
            });
            html += '</tr></thead>';
        }

        html += '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                const value = row[header] !== undefined ? row[header] : '';
                html += `<td>${this.escapeHTML(value)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        return html;
    }

    /**
     * Escape HTML entities
     * @param {*} value - Value to escape
     * @returns {string} Escaped value
     */
    static escapeHTML(value) {
        if (value === undefined || value === null) return '';
        const str = String(value);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Export as PDF (generates HTML that can be printed as PDF)
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} HTML string ready for PDF
     */
    static exportPDF(data, options = {}) {
        const {
            title = 'Data Export',
            headers = Object.keys(data[0] || {}),
            includeTimestamp = true
        } = options;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .timestamp { color: #666; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${includeTimestamp ? `<div class="timestamp">Generated: ${new Date().toLocaleString()}</div>` : ''}
                ${this.exportHTML(data, { headers, ...options })}
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Export as GeoJSON (for field boundaries)
     * @param {Array} features - GeoJSON features
     * @param {Object} options - Export options
     * @returns {string} GeoJSON string
     */
    static exportGeoJSON(features, options = {}) {
        const {
            name = 'Export',
            includeProperties = true
        } = options;

        const geojson = {
            type: 'FeatureCollection',
            name: name,
            crs: {
                type: 'name',
                properties: {
                    name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
                }
            },
            features: features
        };

        if (!includeProperties) {
            geojson.features = features.map(f => ({
                type: f.type,
                geometry: f.geometry
            }));
        }

        return JSON.stringify(geojson, null, 2);
    }

    /**
     * Export as KML
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} KML string
     */
    static exportKML(data, options = {}) {
        const {
            name = 'Export',
            description = 'Data exported from Agriculture AI System'
        } = options;

        let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
    <name>${this.escapeXML(name)}</name>
    <description>${this.escapeXML(description)}</description>`;

        data.forEach(item => {
            if (item.coordinates) {
                kml += `
    <Placemark>
        <name>${this.escapeXML(item.name || '')}</name>
        <description>${this.escapeXML(item.description || '')}</description>
        <Point>
            <coordinates>${item.coordinates.lng},${item.coordinates.lat},0</coordinates>
        </Point>
    </Placemark>`;
            }
        });

        kml += `
</Document>
</kml>`;

        return kml;
    }

    /**
     * Escape XML entities
     * @param {string} value - Value to escape
     * @returns {string} Escaped value
     */
    static escapeXML(value) {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Download data as file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Download CSV
     * @param {Array} data - Data to export
     * @param {string} filename - File name
     * @param {Object} options - Export options
     */
    static downloadCSV(data, filename = 'export.csv', options = {}) {
        const csv = this.exportCSV(data, options);
        this.downloadFile(csv, filename, 'text/csv');
    }

    /**
     * Download JSON
     * @param {Object|Array} data - Data to export
     * @param {string} filename - File name
     * @param {Object} options - Export options
     */
    static downloadJSON(data, filename = 'export.json', options = {}) {
        const json = this.exportJSON(data, options);
        this.downloadFile(json, filename, 'application/json');
    }

    /**
     * Download Excel
     * @param {Array} data - Data to export
     * @param {string} filename - File name
     * @param {Object} options - Export options
     */
    static downloadExcel(data, filename = 'export.xlsx', options = {}) {
        const excel = this.exportExcel(data, options);
        this.downloadFile(excel, filename, 'application/vnd.ms-excel');
    }

    /**
     * Download HTML
     * @param {Array} data - Data to export
     * @param {string} filename - File name
     * @param {Object} options - Export options
     */
    static downloadHTML(data, filename = 'export.html', options = {}) {
        const html = this.exportHTML(data, options);
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Export</title>
                <style>
                    .export-table { width: 100%; border-collapse: collapse; }
                    .export-table th { background: #4CAF50; color: white; padding: 12px; }
                    .export-table td { padding: 10px; border: 1px solid #ddd; }
                    .export-table tr:nth-child(even) { background: #f2f2f2; }
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;
        this.downloadFile(fullHTML, filename, 'text/html');
    }

    /**
     * Print data
     * @param {Array} data - Data to print
     * @param {Object} options - Print options
     */
    static printData(data, options = {}) {
        const html = this.exportPDF(data, options);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    }

    /**
     * Copy data to clipboard
     * @param {Array} data - Data to copy
     * @param {Object} options - Copy options
     * @returns {Promise} Copy result
     */
    static async copyToClipboard(data, options = {}) {
        const csv = this.exportCSV(data, options);
        try {
            await navigator.clipboard.writeText(csv);
            return { success: true, message: 'Data copied to clipboard' };
        } catch (error) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = csv;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return { success: true, message: 'Data copied to clipboard' };
            } catch (err) {
                document.body.removeChild(textarea);
                return { success: false, message: 'Failed to copy data' };
            }
        }
    }

    /**
     * Get filename with timestamp
     * @param {string} prefix - Filename prefix
     * @param {string} extension - File extension
     * @param {string} format - Date format
     * @returns {string} Generated filename
     */
    static getTimestampFilename(prefix, extension = 'csv', format = 'YYYYMMDD_HHmmss') {
        const now = new Date();
        const timestamp = now.getFullYear() +
                         String(now.getMonth() + 1).padStart(2, '0') +
                         String(now.getDate()).padStart(2, '0') + '_' +
                         String(now.getHours()).padStart(2, '0') +
                         String(now.getMinutes()).padStart(2, '0') +
                         String(now.getSeconds()).padStart(2, '0');
        
        return `${prefix}_${timestamp}.${extension}`;
    }

    /**
     * Get export data from chart
     * @param {Object} chart - Chart.js instance
     * @returns {Array} Chart data
     */
    static getChartData(chart) {
        if (!chart || !chart.data) return [];

        const { labels, datasets } = chart.data;
        const data = [];

        labels.forEach((label, index) => {
            const row = { label };
            datasets.forEach(dataset => {
                row[dataset.label || 'Value'] = dataset.data[index];
            });
            data.push(row);
        });

        return data;
    }
}

// Export for use in other files
window.ExportHelpers = ExportHelpers;