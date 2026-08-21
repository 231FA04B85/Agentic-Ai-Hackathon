/**
 * Loader Component - Loading Animations
 * Provides loading spinners, progress bars, and loading states
 */

class LoaderComponent {
    constructor(options = {}) {
        this.options = {
            containerId: 'loaderContainer',
            type: 'spinner', // spinner, progress, skeleton, pulse
            size: 'medium', // small, medium, large
            color: '#2E7D32',
            overlay: false,
            message: 'Loading...',
            progress: 0,
            className: '',
            ...options
        };
        
        this.container = null;
        this.loaders = {};
        this.progressTimers = {};
        
        this.initialize();
    }

    initialize() {
        console.log('⏳ Loader Component initializing...');
        
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.warn('Loader container not found');
            return;
        }
        
        console.log('✅ Loader Component initialized');
    }

    show(options = {}) {
        const mergedOptions = { ...this.options, ...options };
        const id = mergedOptions.id || `loader-${Date.now()}`;
        
        // Create loader element
        const loader = document.createElement('div');
        loader.className = `loader-container ${mergedOptions.className}`;
        loader.id = id;
        
        if (mergedOptions.overlay) {
            loader.className += ' loader-overlay';
        }
        
        // Build loader based on type
        const content = this.buildLoader(mergedOptions);
        loader.innerHTML = content;
        
        if (mergedOptions.overlay) {
            // Position overlay
            const parent = mergedOptions.target || document.body;
            if (typeof parent === 'string') {
                const target = document.querySelector(parent);
                if (target) {
                    target.style.position = 'relative';
                    target.appendChild(loader);
                } else {
                    document.body.appendChild(loader);
                }
            } else if (parent.appendChild) {
                parent.style.position = 'relative';
                parent.appendChild(loader);
            }
        } else if (this.container) {
            this.container.appendChild(loader);
        }
        
        this.loaders[id] = {
            element: loader,
            options: mergedOptions,
            active: true
        };
        
        return id;
    }

    buildLoader(options) {
        const { type, size, color, message, progress } = options;
        
        let html = '<div class="loader-wrapper">';
        
        switch (type) {
            case 'spinner':
                html += this.buildSpinner(size, color);
                break;
            case 'progress':
                html += this.buildProgressBar(progress, size, color);
                break;
            case 'skeleton':
                html += this.buildSkeleton(size);
                break;
            case 'pulse':
                html += this.buildPulseLoader(size, color);
                break;
            default:
                html += this.buildSpinner(size, color);
        }
        
        if (message) {
            html += `<p class="loader-message">${message}</p>`;
        }
        
        html += '</div>';
        
        return html;
    }

    buildSpinner(size, color) {
        const sizeMap = {
            small: '20px',
            medium: '40px',
            large: '60px'
        };
        
        const sizeValue = sizeMap[size] || sizeMap.medium;
        const borderSize = size === 'small' ? '3px' : size === 'large' ? '6px' : '4px';
        
        return `
            <div class="loader-spinner" style="
                width: ${sizeValue};
                height: ${sizeValue};
                border: ${borderSize} solid rgba(0,0,0,0.1);
                border-top-color: ${color};
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                display: inline-block;
            "></div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    buildProgressBar(progress, size, color) {
        const height = size === 'small' ? '4px' : size === 'large' ? '12px' : '8px';
        const progressValue = Math.min(100, Math.max(0, progress || 0));
        
        return `
            <div class="loader-progress" style="
                width: 100%;
                height: ${height};
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            ">
                <div class="loader-progress-bar" style="
                    width: ${progressValue}%;
                    height: 100%;
                    background: ${color};
                    transition: width 0.3s ease;
                    border-radius: 4px;
                "></div>
                <span class="loader-progress-text" style="
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 12px;
                    color: #333;
                ">${progressValue}%</span>
            </div>
        `;
    }

    buildSkeleton(size) {
        const count = size === 'small' ? 3 : size === 'large' ? 8 : 5;
        let html = '<div class="loader-skeleton">';
        
        for (let i = 0; i < count; i++) {
            const width = 60 + Math.random() * 35;
            const height = 12 + Math.random() * 8;
            html += `
                <div class="skeleton-item" style="
                    width: ${width}%;
                    height: ${height}px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    animation: shimmer 1.5s infinite;
                "></div>
            `;
        }
        
        html += '</div>';
        
        // Add shimmer animation
        html += `
            <style>
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            </style>
        `;
        
        return html;
    }

    buildPulseLoader(size, color) {
        const sizeMap = {
            small: '30px',
            medium: '50px',
            large: '80px'
        };
        
        const sizeValue = sizeMap[size] || sizeMap.medium;
        
        return `
            <div class="loader-pulse" style="
                display: flex;
                gap: 8px;
                justify-content: center;
            ">
                <div class="pulse-dot" style="
                    width: ${sizeValue};
                    height: ${sizeValue};
                    background: ${color};
                    border-radius: 50%;
                    animation: pulse 1.4s ease-in-out infinite;
                    animation-delay: 0s;
                "></div>
                <div class="pulse-dot" style="
                    width: ${sizeValue};
                    height: ${sizeValue};
                    background: ${color};
                    border-radius: 50%;
                    animation: pulse 1.4s ease-in-out infinite;
                    animation-delay: 0.2s;
                "></div>
                <div class="pulse-dot" style="
                    width: ${sizeValue};
                    height: ${sizeValue};
                    background: ${color};
                    border-radius: 50%;
                    animation: pulse 1.4s ease-in-out infinite;
                    animation-delay: 0.4s;
                "></div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 80%, 100% { 
                        transform: scale(0.6);
                        opacity: 0.4;
                    }
                    40% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            </style>
        `;
    }

    updateProgress(id, progress) {
        const loader = this.loaders[id];
        if (!loader) return false;
        
        const progressBar = loader.element.querySelector('.loader-progress-bar');
        const progressText = loader.element.querySelector('.loader-progress-text');
        
        if (progressBar) {
            const value = Math.min(100, Math.max(0, progress));
            progressBar.style.width = `${value}%`;
            if (progressText) {
                progressText.textContent = `${Math.round(value)}%`;
            }
        }
        
        loader.options.progress = progress;
        return true;
    }

    updateMessage(id, message) {
        const loader = this.loaders[id];
        if (!loader) return false;
        
        const messageElement = loader.element.querySelector('.loader-message');
        if (messageElement) {
            messageElement.textContent = message;
            loader.options.message = message;
        }
        
        return true;
    }

    hide(id) {
        const loader = this.loaders[id];
        if (!loader) return false;
        
        // Add fade out animation
        loader.element.style.transition = 'opacity 0.3s ease';
        loader.element.style.opacity = '0';
        
        setTimeout(() => {
            loader.element.remove();
            delete this.loaders[id];
        }, 300);
        
        loader.active = false;
        return true;
    }

    hideAll() {
        Object.keys(this.loaders).forEach(id => {
            this.hide(id);
        });
    }

    showOnElement(element, options = {}) {
        const id = `loader-${Date.now()}`;
        const elementId = typeof element === 'string' ? element : element.id;
        
        if (typeof element === 'string') {
            const target = document.querySelector(element);
            if (target) {
                this.show({
                    id: id,
                    overlay: true,
                    target: target,
                    ...options
                });
            }
        } else if (element) {
            this.show({
                id: id,
                overlay: true,
                target: element,
                ...options
            });
        }
        
        return id;
    }

    hideFromElement(elementId) {
        // Find loader associated with element
        const loaderId = Object.keys(this.loaders).find(id => {
            const loader = this.loaders[id];
            return loader.options.target && 
                   (loader.options.target === elementId || 
                    (loader.options.target.id && loader.options.target.id === elementId));
        });
        
        if (loaderId) {
            return this.hide(loaderId);
        }
        return false;
    }

    createPageLoader(options = {}) {
        // Create a full page loader
        const id = `page-loader-${Date.now()}`;
        this.show({
            id: id,
            overlay: true,
            target: document.body,
            message: options.message || 'Loading page...',
            ...options
        });
        
        return id;
    }

    hidePageLoader() {
        // Hide all page loaders
        Object.keys(this.loaders).forEach(id => {
            if (id.startsWith('page-loader-')) {
                this.hide(id);
            }
        });
    }

    isActive(id) {
        return this.loaders[id] && this.loaders[id].active;
    }

    getActiveLoaders() {
        return Object.keys(this.loaders).filter(id => this.loaders[id].active);
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`loader-${eventName}`, { 
            detail: { ...detail, timestamp: new Date().toISOString() } 
        });
        document.dispatchEvent(event);
    }

    destroy() {
        this.hideAll();
        this.container = null;
        console.log('⏳ Loader Component destroyed');
    }

    // Static helper methods
    static showGlobalLoader(message = 'Loading...') {
        const loader = new LoaderComponent({
            containerId: 'globalLoader',
            overlay: true,
            target: document.body,
            message: message
        });
        return loader.show();
    }

    static hideGlobalLoader() {
        const loaders = document.querySelectorAll('.loader-overlay');
        loaders.forEach(loader => loader.remove());
    }

    static createButtonLoader(button, options = {}) {
        const originalText = button.textContent;
        const loaderHtml = `<span class="button-loader"><i class="fas fa-spinner fa-spin"></i> ${options.text || 'Loading...'}</span>`;
        
        button.disabled = true;
        button.dataset.originalText = originalText;
        button.innerHTML = loaderHtml;
        
        return () => {
            button.disabled = false;
            button.textContent = button.dataset.originalText || originalText;
        };
    }
}

// Export for use in other files
window.LoaderComponent = LoaderComponent;