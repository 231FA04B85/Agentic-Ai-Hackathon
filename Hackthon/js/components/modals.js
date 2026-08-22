/**
 * Modal Component - Reusable Modal Dialogs
 * Provides modal dialogs with various configurations
 */

class ModalComponent {
    constructor(options = {}) {
        this.options = {
            id: 'modal',
            title: '',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            closeOnOverlay: true,
            closeOnEscape: true,
            showCloseButton: true,
            showFooter: true,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: null,
            onCancel: null,
            onOpen: null,
            onClose: null,
            className: '',
            ...options
        };
        
        this.element = null;
        this.isOpen = false;
        this.callbacks = {};
        
        this.initialize();
    }

    initialize() {
        console.log('🔲 Modal Component initializing...');
        
        // Check if modal with same ID exists
        const existingModal = document.getElementById(this.options.id);
        if (existingModal) {
            this.element = existingModal;
        } else {
            this.createElement();
        }
        
        this.setupEventListeners();
        
        console.log('✅ Modal Component initialized');
    }

    createElement() {
        const modal = document.createElement('div');
        modal.id = this.options.id;
        modal.className = `modal ${this.options.className}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${this.options.id}-title`);
        
        const sizeClass = {
            'small': 'modal-sm',
            'medium': 'modal-md',
            'large': 'modal-lg',
            'fullscreen': 'modal-fullscreen'
        }[this.options.size] || 'modal-md';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ${sizeClass}">
                <div class="modal-header">
                    <h2 id="${this.options.id}-title" class="modal-title">${this.options.title}</h2>
                    ${this.options.showCloseButton ? `
                        <button class="modal-close" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">
                    ${this.options.content}
                </div>
                ${this.options.showFooter ? `
                    <div class="modal-footer">
                        <button class="btn-secondary modal-cancel">${this.options.cancelText}</button>
                        <button class="btn-primary modal-confirm">${this.options.confirmText}</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.element = modal;
    }

    setupEventListeners() {
        // Close button
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.close.bind(this));
        }
        
        // Overlay click
        const overlay = this.element.querySelector('.modal-overlay');
        if (overlay && this.options.closeOnOverlay) {
            overlay.addEventListener('click', this.close.bind(this));
        }
        
        // Escape key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleEscape.bind(this));
        }
        
        // Confirm button
        const confirmBtn = this.element.querySelector('.modal-confirm');
        if (confirmBtn && this.options.onConfirm) {
            confirmBtn.addEventListener('click', () => {
                this.options.onConfirm(this);
            });
        }
        
        // Cancel button
        const cancelBtn = this.element.querySelector('.modal-cancel');
        if (cancelBtn && this.options.onCancel) {
            cancelBtn.addEventListener('click', () => {
                this.options.onCancel(this);
            });
        }
    }

    handleEscape(event) {
        if (event.key === 'Escape' && this.isOpen && this.options.closeOnEscape) {
            this.close();
        }
    }

    open(data = null) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Dispatch open event
        if (this.options.onOpen) {
            this.options.onOpen(this, data);
        }
        this.dispatchEvent('open', { data });
        
        // Focus trap
        this.focusTrap();
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.element.classList.remove('active');
        document.body.style.overflow = '';
        
        // Dispatch close event
        if (this.options.onClose) {
            this.options.onClose(this);
        }
        this.dispatchEvent('close', {});
    }

    focusTrap() {
        const focusableElements = this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });
        
        // Focus first element after opening
        setTimeout(() => {
            firstElement.focus();
        }, 100);
    }

    setContent(content) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = content;
        }
        this.options.content = content;
    }

    setTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        this.options.title = title;
    }

    setButtons(buttons) {
        const footer = this.element.querySelector('.modal-footer');
        if (!footer) return;
        
        footer.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.className || 'btn-secondary';
            button.textContent = btn.label;
            if (btn.onClick) {
                button.addEventListener('click', () => btn.onClick(this));
            }
            footer.appendChild(button);
        });
    }

    showLoading() {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message || 'An error occurred'}</p>
                    <button class="btn-primary" onclick="this.closest('.modal').querySelector('.modal-body').innerHTML = '${this.options.content.replace(/'/g, "\\'")}'">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    showSuccess(message) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-success">
                    <i class="fas fa-check-circle"></i>
                    <p>${message || 'Success!'}</p>
                </div>
            `;
            
            // Auto close after 2 seconds
            setTimeout(() => {
                this.close();
            }, 2000);
        }
    }

    isOpenModal() {
        return this.isOpen;
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`modal-${eventName}`, { 
            detail: { ...detail, timestamp: new Date().toISOString() } 
        });
        document.dispatchEvent(event);
        
        if (this.callbacks[eventName]) {
            this.callbacks[eventName](detail);
        }
    }

    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleEscape.bind(this));
        
        // Remove element
        if (this.element) {
            this.element.remove();
        }
        
        this.element = null;
        console.log('🔲 Modal destroyed');
    }

    // Static methods for creating common modal types
    static confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = new ModalComponent({
                title: options.title || 'Confirm',
                content: `<p>${message}</p>`,
                size: options.size || 'small',
                onConfirm: () => {
                    modal.close();
                    resolve(true);
                },
                onCancel: () => {
                    modal.close();
                    resolve(false);
                },
                onClose: () => {
                    if (!modal.isOpen) {
                        resolve(false);
                    }
                },
                ...options
            });
            modal.open();
        });
    }

    static alert(message, options = {}) {
        return new Promise((resolve) => {
            const modal = new ModalComponent({
                title: options.title || 'Alert',
                content: `<p>${message}</p>`,
                size: options.size || 'small',
                showFooter: true,
                confirmText: options.confirmText || 'OK',
                cancelText: '',
                onConfirm: () => {
                    modal.close();
                    resolve(true);
                },
                ...options
            });
            modal.open();
        });
    }

    static prompt(message, options = {}) {
        return new Promise((resolve) => {
            const defaultValue = options.defaultValue || '';
            const inputType = options.inputType || 'text';
            
            const modal = new ModalComponent({
                title: options.title || 'Input Required',
                content: `
                    <p>${message}</p>
                    <input type="${inputType}" class="modal-input" value="${defaultValue}" placeholder="${options.placeholder || ''}">
                `,
                size: options.size || 'small',
                onConfirm: () => {
                    const input = modal.element.querySelector('.modal-input');
                    modal.close();
                    resolve(input ? input.value : '');
                },
                onCancel: () => {
                    modal.close();
                    resolve(null);
                },
                ...options
            });
            modal.open();
            
            // Focus input
            setTimeout(() => {
                const input = modal.element.querySelector('.modal-input');
                if (input) input.focus();
            }, 100);
        });
    }
}

// Export for use in other files
window.ModalComponent = ModalComponent;
window.Modal = ModalComponent;