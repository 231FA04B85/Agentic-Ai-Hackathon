/**
 * Notification Helpers - Comprehensive Notification System
 * Provides real-time notifications, alerts, and user feedback
 */

class NotificationHelpers {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 100;
        this.listeners = [];
        this.audioEnabled = true;
        this.soundCache = {};
        this.initialize();
    }

    initialize() {
        // Setup notification container
        this.createContainer();
        // Load notification settings from localStorage
        this.loadSettings();
        // Request notification permission if available
        this.requestPermission();
    }

    createContainer() {
        // Remove existing container if any
        const existing = document.getElementById('notification-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            width: 350px;
            max-width: 90vw;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        this.container = container;
    }

    loadSettings() {
        try {
            const settings = localStorage.getItem('notificationSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.audioEnabled = parsed.audioEnabled !== undefined ? parsed.audioEnabled : true;
            }
        } catch (error) {
            console.warn('Failed to load notification settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify({
                audioEnabled: this.audioEnabled
            }));
        } catch (error) {
            console.warn('Failed to save notification settings:', error);
        }
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.warn('Notification permission request failed:', error);
                return false;
            }
        }
        return Notification.permission === 'granted';
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     * @param {Object} options - Additional options
     * @returns {Object} Notification object
     */
    show(message, type = 'info', options = {}) {
        const {
            title = 'Notification',
            duration = 5000,
            icon = null,
            actions = [],
            sound = true,
            persistent = false,
            onClick = null,
            onClose = null
        } = options;

        // Create notification object
        const notification = {
            id: this.generateId(),
            message,
            type,
            title,
            timestamp: new Date(),
            duration,
            persistent,
            actions,
            sound,
            onClick,
            onClose,
            read: false
        };

        // Add to history
        this.notifications.push(notification);
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }

        // Show browser notification if available
        this.showBrowserNotification(notification);

        // Play sound if enabled
        if (sound && this.audioEnabled) {
            this.playSound(type);
        }

        // Show UI notification
        this.showUINotification(notification);

        // Dispatch event
        this.dispatchEvent('notification', notification);

        // Trigger listeners
        this.triggerListeners('notification', notification);

        return notification;
    }

    showUINotification(notification) {
        const { id, title, message, type, persistent, duration, actions } = notification;

        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#F44336'
        };

        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };

        const element = document.createElement('div');
        element.className = `notification notification-${type}`;
        element.dataset.id = id;
        element.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 12px;
            padding: 16px;
            pointer-events: auto;
            border-left: 4px solid ${colors[type]};
            animation: slideInRight 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        // Add slide animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-fade-out {
                    animation: slideOutRight 0.3s ease forwards;
                }
            `;
            document.head.appendChild(style);
        }

        element.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="flex-shrink: 0;">
                    <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    ${title ? `<div style="font-weight: 600; margin-bottom: 4px;">${title}</div>` : ''}
                    <div style="color: #333; word-wrap: break-word;">${message}</div>
                </div>
                <button class="notification-close" style="background: none; border: none; cursor: pointer; color: #999; font-size: 16px; padding: 0 4px;" data-id="${id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${actions && actions.length > 0 ? `
                <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                    ${actions.map(action => `
                        <button class="notification-action" data-action="${action.id}" style="padding: 4px 12px; border: 1px solid ${colors[type]}; background: ${colors[type]}; color: white; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            ${!persistent ? `
                <div style="position: absolute; bottom: 0; left: 0; height: 3px; background: ${colors[type]}; width: 100%; animation: progressBar ${duration}ms linear forwards;">
                </div>
            ` : ''}
        `;

        // Add progress bar animation
        if (!persistent && !document.getElementById('progress-styles')) {
            const style = document.createElement('style');
            style.id = 'progress-styles';
            style.textContent = `
                @keyframes progressBar {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to container
        this.container.appendChild(element);

        // Set up close handler
        const closeBtn = element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeNotification(id);
            });
        }

        // Set up action handlers
        element.querySelectorAll('.notification-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.action;
                const action = actions.find(a => a.id === actionId);
                if (action && action.handler) {
                    action.handler();
                }
                if (!persistent) {
                    this.closeNotification(id);
                }
            });
        });

        // Auto close if not persistent
        if (!persistent) {
            setTimeout(() => {
                this.closeNotification(id);
            }, duration);
        }

        // Click handler
        if (notification.onClick) {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action')) {
                    notification.onClick();
                    if (!persistent) {
                        this.closeNotification(id);
                    }
                }
            });
        }

        return element;
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: notification.icon || '/assets/images/logo.png',
                tag: notification.id,
                requireInteraction: notification.persistent
            };

            const browserNotif = new Notification(notification.title || 'AgriAI Notification', options);
            browserNotif.onclick = () => {
                if (notification.onClick) notification.onClick();
                browserNotif.close();
            };
            browserNotif.onshow = () => {
                setTimeout(() => {
                    if (!notification.persistent) {
                        browserNotif.close();
                    }
                }, notification.duration);
            };
        }
    }

    closeNotification(id) {
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('notification-fade-out');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            if (notification.onClose) notification.onClose();
            this.dispatchEvent('notificationClosed', notification);
            this.triggerListeners('notificationClosed', notification);
        }
    }

    closeAll() {
        this.container.innerHTML = '';
        this.notifications.forEach(n => {
            n.read = true;
        });
    }

    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {Object} options - Additional options
     */
    success(message, options = {}) {
        return this.show(message, 'success', {
            title: options.title || 'Success',
            icon: 'fa-check-circle',
            ...options
        });
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     */
    error(message, options = {}) {
        return this.show(message, 'error', {
            title: options.title || 'Error',
            icon: 'fa-times-circle',
            duration: 8000,
            ...options
        });
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {Object} options - Additional options
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', {
            title: options.title || 'Warning',
            icon: 'fa-exclamation-triangle',
            duration: 7000,
            ...options
        });
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {Object} options - Additional options
     */
    info(message, options = {}) {
        return this.show(message, 'info', {
            title: options.title || 'Information',
            icon: 'fa-info-circle',
            ...options
        });
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Object} options - Confirmation options
     * @returns {Promise} Promise resolving to user's choice
     */
    confirm(message, options = {}) {
        const {
            title = 'Confirm',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            const actions = [
                {
                    id: 'confirm',
                    label: confirmText,
                    handler: () => resolve(true)
                },
                {
                    id: 'cancel',
                    label: cancelText,
                    handler: () => resolve(false)
                }
            ];

            this.show(message, type, {
                title,
                actions,
                persistent: true,
                duration: 0,
                ...options
            });
        });
    }

    /**
     * Play notification sound
     * @param {string} type - Notification type
     */
    playSound(type = 'info') {
        // Create audio context for web audio API
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // Different sounds for different types
            const frequencies = {
                info: 800,
                success: 1000,
                warning: 600,
                error: 400
            };

            const frequency = frequencies[type] || 800;
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // Volume
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (error) {
            // Fallback: no sound
            console.debug('Sound playback not available:', error);
        }
    }

    /**
     * Generate unique ID for notification
     * @returns {string} Unique ID
     */
    generateId() {
        return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get all notifications
     * @param {Object} filters - Filter options
     * @returns {Array} Notifications
     */
    getNotifications(filters = {}) {
        let result = this.notifications;

        if (filters.type) {
            result = result.filter(n => n.type === filters.type);
        }

        if (filters.unreadOnly) {
            result = result.filter(n => !n.read);
        }

        if (filters.limit) {
            result = result.slice(-filters.limit);
        }

        return result;
    }

    /**
     * Mark notification as read
     * @param {string} id - Notification ID
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.triggerListeners('notificationRead', notification);
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => {
            n.read = true;
        });
        this.triggerListeners('allNotificationsRead', this.notifications);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
        this.closeAll();
        this.triggerListeners('notificationsCleared', {});
    }

    /**
     * Get unread count
     * @returns {number} Unread notification count
     */
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    /**
     * Add listener for notification events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    addListener(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Remove listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    removeListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Trigger event listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    triggerListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in notification listener:', error);
                }
            });
        }
    }

    /**
     * Dispatch custom DOM event
     * @param {string} eventName - Event name
     * @param {*} detail - Event detail
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`notification-${eventName}`, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Toggle sound on/off
     * @param {boolean} enabled - Enable sound
     */
    setSoundEnabled(enabled) {
        this.audioEnabled = enabled;
        this.saveSettings();
    }

    /**
     * Check if sound is enabled
     * @returns {boolean} Sound enabled status
     */
    isSoundEnabled() {
        return this.audioEnabled;
    }

    /**
     * Update notification badge
     * @param {string} badgeId - Badge element ID
     */
    updateBadge(badgeId = 'notificationBadge') {
        const badge = document.getElementById(badgeId);
        if (badge) {
            const count = this.getUnreadCount();
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Create inline notification (embedded in page)
     * @param {string} containerId - Container element ID
     * @param {Object} options - Notification options
     */
    createInlineNotification(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const {
            message,
            type = 'info',
            title = '',
            dismissible = true,
            onDismiss = null
        } = options;

        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#F44336'
        };

        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };

        const element = document.createElement('div');
        element.className = `inline-notification inline-notification-${type}`;
        element.style.cssText = `
            background: ${colors[type]}10;
            border-left: 4px solid ${colors[type]};
            border-radius: 4px;
            padding: 12px 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        element.innerHTML = `
            <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 18px;"></i>
            <div style="flex: 1;">
                ${title ? `<div style="font-weight: 600; font-size: 14px;">${title}</div>` : ''}
                <div style="font-size: 14px;">${message}</div>
            </div>
            ${dismissible ? `<button class="inline-notification-close" style="background: none; border: none; cursor: pointer; color: #999; font-size: 14px; padding: 4px;"><i class="fas fa-times"></i></button>` : ''}
        `;

        if (dismissible) {
            const closeBtn = element.querySelector('.inline-notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    element.remove();
                    if (onDismiss) onDismiss();
                });
            }
        }

        container.appendChild(element);
        return element;
    }
}

// Initialize singleton instance
const notificationHelpers = new NotificationHelpers();

// Export for use in other files
window.NotificationHelpers = NotificationHelpers;
window.notification = notificationHelpers;