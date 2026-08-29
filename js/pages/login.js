/**
 * Login Page - OTP Authentication
 * Handles mobile number input and OTP verification
 */

class LoginPage {
    constructor() {
        this.currentPhone = null;
        this.formattedPhone = null;
        this.otpAttempts = 0;

        // Demo credentials
        this.demoPhone = '9876543210';
        this.demoOtp = '123456';

        this.init();
    }

    init() {
        this.setupElements();
        this.attachEventListeners();
        this.loadStoredPhone();
        this.restoreStepIfNeeded();
    }

    setupElements() {
        // Mobile Step
        this.mobileStep = document.getElementById('mobileStep');
        this.mobileForm = document.getElementById('mobileForm');
        this.mobileInput = document.getElementById('mobileNumber');
        this.sendOtpBtn = document.getElementById('sendOtpBtn');
        this.mobileError = document.getElementById('mobileError');

        // OTP Step
        this.otpStep = document.getElementById('otpStep');
        this.otpForm = document.getElementById('otpForm');
        this.otpInput = document.getElementById('otpInput');
        this.otpDisplay = document.getElementById('otpDisplay');
        this.verifyOtpBtn = document.getElementById('verifyOtpBtn');
        this.otpError = document.getElementById('otpError');
        this.displayPhone = document.getElementById('displayPhone');
        this.changePhoneBtn = document.getElementById('changePhoneBtn');
        this.resendOtpBtn = document.getElementById('resendOtpBtn');
        this.resendTimer = document.getElementById('resendTimer');
    }

    attachEventListeners() {
        // Mobile form
        this.mobileForm.addEventListener('submit', (e) => this.handleMobileSubmit(e));
        this.mobileInput.addEventListener('input', (e) => this.handleMobileInput(e));
        this.mobileInput.addEventListener('keypress', (e) => this.handleMobileKeypress(e));

        // OTP form
        this.otpForm.addEventListener('submit', (e) => this.handleOtpSubmit(e));
        this.otpInput.addEventListener('input', (e) => this.handleOtpInput(e));
        this.otpInput.addEventListener('keypress', (e) => this.handleOtpKeypress(e));

        // Buttons
        this.changePhoneBtn.addEventListener('click', () => this.changePhone());
        this.resendOtpBtn.addEventListener('click', () => this.resendOtp());
    }

    /**
     * Handle mobile number input
     */
    handleMobileInput(e) {
        // Only allow digits
        e.target.value = e.target.value.replace(/\D/g, '');

        // Limit to 10 digits
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }

        // Clear error on input
        this.clearError(this.mobileError);
    }

    handleMobileKeypress(e) {
        if (e.key === 'Enter' && this.mobileInput.value.length === 10) {
            this.handleMobileSubmit(new Event('submit'));
        }
    }

    /**
     * Handle mobile form submission - Send OTP
     */
    async handleMobileSubmit(e) {
        e.preventDefault();

        const phoneNumber = this.mobileInput.value.trim();

        // Validate phone number
        const validation = otpManager.validatePhoneNumber(phoneNumber);
        if (!validation.valid) {
            this.showError(this.mobileError, validation.message);
            return;
        }

        this.currentPhone = phoneNumber;
        this.formattedPhone = otpManager.formatPhoneNumber(phoneNumber);

        // Disable button
        this.sendOtpBtn.disabled = true;
        this.sendOtpBtn.classList.add('loading');

        try {
            // Simulate API delay
            await this.delay(1000);

            // Generate OTP
            const result = otpManager.generateOTP(phoneNumber);

            // Show success notification
            this.showNotification(
                'OTP Sent',
                `OTP sent to ${this.formattedPhone}`,
                'success'
            );

            // Log OTP for demo (remove in production)
            console.log(`[LOGIN] Demo OTP: ${result.otp}`);

            // Move to OTP step
            this.switchToOtpStep(phoneNumber);

            // Start resend timer
            this.startResendTimer();

            // Auto-focus OTP input
            setTimeout(() => this.otpInput.focus(), 300);

        } catch (error) {
            this.showError(this.mobileError, 'Failed to send OTP. Please try again.');
            console.error('Error sending OTP:', error);
        } finally {
            this.sendOtpBtn.disabled = false;
            this.sendOtpBtn.classList.remove('loading');
        }
    }

    /**
     * Switch to OTP step
     */
    switchToOtpStep(phoneNumber) {
        // Add fade-out animation to mobile step
        this.mobileStep.classList.add('fade-out');

        setTimeout(() => {
            this.mobileStep.style.display = 'none';
            this.otpStep.style.display = 'block';
            this.displayPhone.textContent = otpManager.formatPhoneNumber(phoneNumber);
            this.otpInput.value = '';
            this.otpError.textContent = '';

            // Save phone to session
            sessionStorage.setItem('loginPhone', phoneNumber);

            // Scroll to top
            document.querySelector('.login-form-container').scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }

    /**
     * Handle OTP input
     */
    handleOtpInput(e) {
        // Only allow digits
        e.target.value = e.target.value.replace(/\D/g, '');

        // Limit to 6 digits
        if (e.target.value.length > 6) {
            e.target.value = e.target.value.slice(0, 6);
        }

        // Update OTP display
        this.updateOtpDisplay(e.target.value);

        // Clear error on input
        this.clearError(this.otpError);

        // Auto-submit when 6 digits entered
        if (e.target.value.length === 6) {
            setTimeout(() => {
                this.verifyOtpBtn.disabled = false;
            }, 100);
        }
    }

    handleOtpKeypress(e) {
        if (e.key === 'Enter' && this.otpInput.value.length === 6) {
            this.handleOtpSubmit(new Event('submit'));
        }
    }

    /**
     * Update OTP display dots
     */
    updateOtpDisplay(otp) {
        this.otpDisplay.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const span = document.createElement('span');
            if (i < otp.length) {
                span.textContent = '●';
            }
            this.otpDisplay.appendChild(span);
        }
    }

    /**
     * Handle OTP form submission - Verify OTP
     */
    async handleOtpSubmit(e) {
        e.preventDefault();

        const enteredOtp = this.otpInput.value.trim();

        if (enteredOtp.length !== 6) {
            this.showError(this.otpError, 'Please enter a 6-digit OTP');
            return;
        }

        this.verifyOtpBtn.disabled = true;
        this.verifyOtpBtn.classList.add('loading');

        try {
            // Simulate API delay
            await this.delay(1500);

            // Verify OTP
            const result = otpManager.verifyOTP(this.currentPhone, enteredOtp);

            if (result.success) {
                // Show success notification
                this.showNotification(
                    'Login Successful',
                    'Redirecting to dashboard...',
                    'success'
                );

                // Save user session
                this.saveUserSession(this.currentPhone);

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } else {
                // Show error
                this.showError(this.otpError, result.message);

                // Handle specific errors
                if (result.error === 'TOO_MANY_ATTEMPTS') {
                    this.verifyOtpBtn.disabled = true;
                    this.otpInput.disabled = true;
                    this.resendOtpBtn.disabled = false;
                } else if (result.error === 'OTP_EXPIRED') {
                    this.otpInput.disabled = true;
                    this.verifyOtpBtn.disabled = true;
                    this.resendOtpBtn.disabled = false;
                }

                // Shake the input on error
                this.shakeElement(this.otpInput);
            }

        } catch (error) {
            this.showError(this.otpError, 'Verification failed. Please try again.');
            console.error('Error verifying OTP:', error);
        } finally {
            this.verifyOtpBtn.disabled = false;
            this.verifyOtpBtn.classList.remove('loading');
        }
    }

    /**
     * Change phone number
     */
    changePhone() {
        otpManager.clearOTP(this.currentPhone);
        otpManager.stopResendTimer(this.currentPhone);

        this.currentPhone = null;
        this.mobileInput.value = '';
        this.otpInput.value = '';
        this.otpDisplay.innerHTML = '';
        this.clearError(this.mobileError);
        this.clearError(this.otpError);

        this.otpStep.style.display = 'none';
        this.mobileStep.style.display = 'block';
        this.mobileStep.classList.remove('fade-out');

        sessionStorage.removeItem('loginPhone');

        setTimeout(() => this.mobileInput.focus(), 300);
    }

    /**
     * Resend OTP
     */
    async resendOtp() {
        const canResend = otpManager.canResendOTP(this.currentPhone);

        if (!canResend.canResend) {
            this.showNotification(
                'Please Wait',
                canResend.message,
                'warning'
            );
            return;
        }

        this.resendOtpBtn.disabled = true;

        try {
            // Simulate API delay
            await this.delay(1000);

            // Generate new OTP
            const result = otpManager.generateOTP(this.currentPhone);

            // Reset input
            this.otpInput.value = '';
            this.otpDisplay.innerHTML = '';
            this.otpInput.disabled = false;
            this.verifyOtpBtn.disabled = true;
            this.clearError(this.otpError);

            // Show notification
            this.showNotification(
                'OTP Resent',
                `New OTP sent to ${this.formattedPhone}`,
                'success'
            );

            // Log OTP for demo
            console.log(`[LOGIN] Demo OTP: ${result.otp}`);

            // Start timer again
            this.startResendTimer();

            // Auto-focus OTP input
            this.otpInput.focus();

        } catch (error) {
            this.showNotification(
                'Error',
                'Failed to resend OTP. Please try again.',
                'error'
            );
            console.error('Error resending OTP:', error);
        } finally {
            this.resendOtpBtn.disabled = false;
        }
    }

    /**
     * Start resend timer
     */
    startResendTimer() {
        this.resendOtpBtn.disabled = true;

        otpManager.startResendTimer(
            this.currentPhone,
            (secondsRemaining) => {
                this.resendTimer.textContent = `(${secondsRemaining}s)`;
            },
            () => {
                this.resendOtpBtn.disabled = false;
                this.resendTimer.textContent = '';
            }
        );
    }

    /**
     * Save user session
     */
    saveUserSession(phoneNumber) {
        const user = {
            phoneNumber: phoneNumber,
            loginTime: new Date().toISOString(),
            sessionId: 'session_' + Date.now()
        };

        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('authenticated', 'true');
    }

    /**
     * Load stored phone (for returning users)
     */
    loadStoredPhone() {
        const storedPhone = localStorage.getItem('lastLoginPhone');
        if (storedPhone) {
            // Could pre-fill or show suggestion
            console.log('[LOGIN] Stored phone found:', storedPhone);
        }
    }

    /**
     * Restore step if user refreshes page during OTP verification
     */
    restoreStepIfNeeded() {
        const storedPhone = sessionStorage.getItem('loginPhone');
        if (storedPhone) {
            this.currentPhone = storedPhone;
            this.formattedPhone = otpManager.formatPhoneNumber(storedPhone);
            this.switchToOtpStep(storedPhone);
            this.startResendTimer();
        }
    }

    /**
     * Show error message
     */
    showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
        this.shakeElement(element.parentElement);
    }

    /**
     * Clear error message
     */
    clearError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }

    /**
     * Show notification toast
     */
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.contains(toast)) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Shake animation for elements
     */
    shakeElement(element) {
        element.classList.remove('shake');
        setTimeout(() => {
            element.classList.add('shake');
        }, 10);
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
    
    // Set theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
});
