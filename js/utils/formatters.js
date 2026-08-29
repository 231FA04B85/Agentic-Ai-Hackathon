/**
 * Formatters - Data Formatting Utilities
 * Formats various data types for display and export
 */

class Formatter {
    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date string
     */
    static formatDate(date, options = {}) {
        if (!date) return 'N/A';
        
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return 'Invalid Date';

        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };

        return d.toLocaleDateString('en-US', defaultOptions);
    }

    /**
     * Format time to readable string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted time string
     */
    static formatTime(date, options = {}) {
        if (!date) return 'N/A';
        
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return 'Invalid Time';

        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };

        return d.toLocaleTimeString('en-US', defaultOptions);
    }

    /**
     * Format date and time
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date-time string
     */
    static formatDateTime(date) {
        if (!date) return 'N/A';
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency symbol
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount, currency = '$', decimals = 2) {
        if (amount === undefined || amount === null) return 'N/A';
        if (typeof amount !== 'number') amount = parseFloat(amount);
        if (isNaN(amount)) return 'Invalid Amount';

        const formatted = amount.toFixed(decimals);
        return `${currency}${formatted}`;
    }

    /**
     * Format percentage
     * @param {number} value - Value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage string
     */
    static formatPercentage(value, decimals = 1) {
        if (value === undefined || value === null) return 'N/A';
        if (typeof value !== 'number') value = parseFloat(value);
        if (isNaN(value)) return 'Invalid Value';

        return `${value.toFixed(decimals)}%`;
    }

    /**
     * Format temperature
     * @param {number} temp - Temperature in Celsius
     * @param {string} unit - Temperature unit ('C' or 'F')
     * @returns {string} Formatted temperature string
     */
    static formatTemperature(temp, unit = 'C') {
        if (temp === undefined || temp === null) return 'N/A';
        if (typeof temp !== 'number') temp = parseFloat(temp);
        if (isNaN(temp)) return 'Invalid Temperature';

        if (unit === 'F') {
            temp = (temp * 9/5) + 32;
        }
        
        return `${Math.round(temp * 10) / 10}°${unit}`;
    }

    /**
     * Format area
     * @param {number} area - Area in hectares
     * @param {string} unit - Area unit ('ha', 'acres')
     * @returns {string} Formatted area string
     */
    static formatArea(area, unit = 'ha') {
        if (area === undefined || area === null) return 'N/A';
        if (typeof area !== 'number') area = parseFloat(area);
        if (isNaN(area)) return 'Invalid Area';

        if (unit === 'acres') {
            area = area * 2.47105;
        }

        return `${area.toFixed(1)} ${unit}`;
    }

    /**
     * Format yield
     * @param {number} yield - Yield in kg/ha
     * @param {string} unit - Yield unit
     * @returns {string} Formatted yield string
     */
    static formatYield(yieldData, unit = 'kg/ha') {
        if (yieldData === undefined || yieldData === null) return 'N/A';
        if (typeof yieldData !== 'number') yieldData = parseFloat(yieldData);
        if (isNaN(yieldData)) return 'Invalid Yield';

        return `${yieldData.toFixed(1)} ${unit}`;
    }

    /**
     * Format weight
     * @param {number} weight - Weight in kg
     * @param {string} unit - Weight unit
     * @returns {string} Formatted weight string
     */
    static formatWeight(weight, unit = 'kg') {
        if (weight === undefined || weight === null) return 'N/A';
        if (typeof weight !== 'number') weight = parseFloat(weight);
        if (isNaN(weight)) return 'Invalid Weight';

        if (unit === 'lbs') {
            weight = weight * 2.20462;
        }

        return `${weight.toFixed(1)} ${unit}`;
    }

    /**
     * Format distance
     * @param {number} distance - Distance in meters
     * @param {string} unit - Distance unit
     * @returns {string} Formatted distance string
     */
    static formatDistance(distance, unit = 'm') {
        if (distance === undefined || distance === null) return 'N/A';
        if (typeof distance !== 'number') distance = parseFloat(distance);
        if (isNaN(distance)) return 'Invalid Distance';

        if (unit === 'km') {
            distance = distance / 1000;
        } else if (unit === 'miles') {
            distance = distance / 1609.34;
        }

        return `${distance.toFixed(1)} ${unit}`;
    }

    /**
     * Format speed
     * @param {number} speed - Speed in km/h
     * @param {string} unit - Speed unit
     * @returns {string} Formatted speed string
     */
    static formatSpeed(speed, unit = 'km/h') {
        if (speed === undefined || speed === null) return 'N/A';
        if (typeof speed !== 'number') speed = parseFloat(speed);
        if (isNaN(speed)) return 'Invalid Speed';

        if (unit === 'mph') {
            speed = speed * 0.621371;
        }

        return `${speed.toFixed(1)} ${unit}`;
    }

    /**
     * Format rainfall
     * @param {number} rainfall - Rainfall in mm
     * @param {string} unit - Rainfall unit
     * @returns {string} Formatted rainfall string
     */
    static formatRainfall(rainfall, unit = 'mm') {
        if (rainfall === undefined || rainfall === null) return 'N/A';
        if (typeof rainfall !== 'number') rainfall = parseFloat(rainfall);
        if (isNaN(rainfall)) return 'Invalid Rainfall';

        if (unit === 'inches') {
            rainfall = rainfall / 25.4;
        }

        return `${rainfall.toFixed(1)} ${unit}`;
    }

    /**
     * Format phone number
     * @param {string} phone - Phone number
     * @returns {string} Formatted phone number
     */
    static formatPhone(phone) {
        if (!phone) return 'N/A';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11) {
            return `+${cleaned[0]} (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
        }
        return phone;
    }

    /**
     * Format coordinate
     * @param {number} coordinate - Coordinate value
     * @param {string} type - Coordinate type ('lat' or 'lng')
     * @returns {string} Formatted coordinate
     */
    static formatCoordinate(coordinate, type = 'lat') {
        if (coordinate === undefined || coordinate === null) return 'N/A';
        if (typeof coordinate !== 'number') coordinate = parseFloat(coordinate);
        if (isNaN(coordinate)) return 'Invalid Coordinate';

        const direction = type === 'lat' 
            ? (coordinate >= 0 ? 'N' : 'S')
            : (coordinate >= 0 ? 'E' : 'W');
            
        return `${Math.abs(coordinate).toFixed(6)}° ${direction}`;
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    static formatFileSize(bytes) {
        if (bytes === undefined || bytes === null) return 'N/A';
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    }

    /**
     * Format duration
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    static formatDuration(minutes) {
        if (minutes === undefined || minutes === null) return 'N/A';
        if (typeof minutes !== 'number') minutes = parseFloat(minutes);
        if (isNaN(minutes)) return 'Invalid Duration';

        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = Math.round(minutes % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }

    /**
     * Format number with thousand separators
     * @param {number} number - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    static formatNumber(number, decimals = 0) {
        if (number === undefined || number === null) return 'N/A';
        if (typeof number !== 'number') number = parseFloat(number);
        if (isNaN(number)) return 'Invalid Number';

        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * Format string as title case
     * @param {string} str - String to format
     * @returns {string} Title case string
     */
    static formatTitleCase(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated string
     */
    static truncateString(str, maxLength = 50) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength) + '...';
    }

    /**
     * Format address
     * @param {Object} address - Address object
     * @returns {string} Formatted address
     */
    static formatAddress(address) {
        if (!address) return 'N/A';
        
        const parts = [
            address.street,
            address.city,
            address.state,
            address.zip,
            address.country
        ].filter(Boolean);

        return parts.join(', ');
    }

    /**
     * Format crop type
     * @param {string} cropType - Crop type
     * @returns {string} Formatted crop type
     */
    static formatCropType(cropType) {
        if (!cropType) return 'Unknown';
        return this.formatTitleCase(cropType);
    }

    /**
     * Format growth stage
     * @param {string} stage - Growth stage
     * @returns {string} Formatted growth stage
     */
    static formatGrowthStage(stage) {
        if (!stage) return 'Unknown';
        return this.formatTitleCase(stage);
    }

    /**
     * Format risk level with color
     * @param {string} risk - Risk level
     * @param {boolean} includeColor - Whether to include color
     * @returns {Object|string} Formatted risk level
     */
    static formatRiskLevel(risk, includeColor = true) {
        const levels = {
            'Critical': { label: 'Critical', color: '#C62828', icon: 'fa-exclamation-circle' },
            'High': { label: 'High', color: '#F57C00', icon: 'fa-exclamation-triangle' },
            'Medium': { label: 'Medium', color: '#FFA000', icon: 'fa-info-circle' },
            'Moderate': { label: 'Moderate', color: '#FFA000', icon: 'fa-info-circle' },
            'Low': { label: 'Low', color: '#2E7D32', icon: 'fa-check-circle' },
            'None': { label: 'None', color: '#2E7D32', icon: 'fa-check-circle' }
        };

        const formatted = levels[risk] || levels['Low'];
        
        if (includeColor) {
            return {
                ...formatted,
                css: `color: ${formatted.color};`
            };
        }
        
        return formatted.label;
    }

    /**
     * Format health status
     * @param {number} score - Health score (0-100)
     * @returns {Object} Formatted health status
     */
    static formatHealthStatus(score) {
        if (score === undefined || score === null) {
            return { label: 'Unknown', color: '#9E9E9E', icon: 'fa-question-circle' };
        }

        if (score >= 80) {
            return { label: 'Excellent', color: '#2E7D32', icon: 'fa-heart' };
        } else if (score >= 60) {
            return { label: 'Good', color: '#4CAF50', icon: 'fa-heart' };
        } else if (score >= 40) {
            return { label: 'Fair', color: '#FFA000', icon: 'fa-heart' };
        } else if (score >= 20) {
            return { label: 'Poor', color: '#F57C00', icon: 'fa-heart' };
        } else {
            return { label: 'Critical', color: '#C62828', icon: 'fa-heart' };
        }
    }

    /**
     * Format weather condition with icon
     * @param {string} condition - Weather condition
     * @returns {Object} Formatted weather condition
     */
    static formatWeatherCondition(condition) {
        const conditions = {
            'Clear': { icon: 'fa-sun', label: 'Clear' },
            'Sunny': { icon: 'fa-sun', label: 'Sunny' },
            'Partly Cloudy': { icon: 'fa-cloud-sun', label: 'Partly Cloudy' },
            'Cloudy': { icon: 'fa-cloud', label: 'Cloudy' },
            'Light Rain': { icon: 'fa-cloud-rain', label: 'Light Rain' },
            'Heavy Rain': { icon: 'fa-cloud-rain', label: 'Heavy Rain' },
            'Thunderstorm': { icon: 'fa-bolt', label: 'Thunderstorm' },
            'Fog': { icon: 'fa-smog', label: 'Fog' },
            'Snow': { icon: 'fa-snowflake', label: 'Snow' }
        };

        return conditions[condition] || { icon: 'fa-cloud', label: condition || 'Unknown' };
    }

    /**
     * Format list as readable string
     * @param {Array} list - List of items
     * @param {string} conjunction - Conjunction to use
     * @returns {string} Formatted list
     */
    static formatList(list, conjunction = 'and') {
        if (!Array.isArray(list) || list.length === 0) return '';
        if (list.length === 1) return list[0];
        if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`;
        
        const last = list.pop();
        return `${list.join(', ')}, ${conjunction} ${last}`;
    }

    /**
     * Format SQL date
     * @param {Date|string} date - Date to format
     * @returns {string} SQL formatted date
     */
    static formatSQLDate(date) {
        if (!date) return null;
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 19).replace('T', ' ');
    }

    /**
     * Format for CSV export
     * @param {*} value - Value to format
     * @returns {string} CSV formatted value
     */
    static formatCSV(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') {
            // Escape quotes and wrap in quotes if contains comma
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }
        if (typeof value === 'number') {
            return String(value);
        }
        if (value instanceof Date) {
            return this.formatDate(value);
        }
        if (Array.isArray(value)) {
            return this.formatCSV(value.join('; '));
        }
        if (typeof value === 'object') {
            return this.formatCSV(JSON.stringify(value));
        }
        return String(value);
    }

    /**
     * Format JSON for display
     * @param {Object} json - JSON object to format
     * @param {number} indent - Indentation spaces
     * @returns {string} Formatted JSON string
     */
    static formatJSON(json, indent = 2) {
        try {
            return JSON.stringify(json, null, indent);
        } catch {
            return 'Invalid JSON';
        }
    }
}

// Export for use in other files
window.Formatter = Formatter;