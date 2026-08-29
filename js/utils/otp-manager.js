/**
 * OTP Manager
 * Handles OTP generation, validation, and timer management
 */

class OTPManager {
    constructor(options = {}) {
        this.otpLength = options.otpLength || 6;
        this.otpValidity = options.otpValidity || 600000; // 10 minutes in ms
        this.maxAttempts = options.maxAttempts || 5;
        this.resendCooldown = options.resendCooldown || 30000; // 30 seconds in ms
        
        this.otpStore = new Map(); // Store: phoneNumber -> { otp, timestamp, attempts, blocked }
        this.resendTimers = new Map(); // Store: phoneNumber -> timer
    }

    /**
     * Generate OTP for a phone number
     * @param {string} phoneNumber - Phone number
     * @returns {object} Generated OTP object
     */
    generateOTP(phoneNumber) {
        // Clear previous OTP if exists
        if (this.otpStore.has(phoneNumber)) {
            clearInterval(this.resendTimers.get(phoneNumber));
        }

        // Generate random 6-digit OTP
        const otp = Math.floor(Math.random() * Math.pow(10, this.otpLength))
            .toString()
            .padStart(this.otpLength, '0');

        const otpData = {
            otp: otp,
            timestamp: Date.now(),
            attempts: 0,
            blocked: false,
            blockedUntil: null
        };

        this.otpStore.set(phoneNumber, otpData);
        
        console.log(`[OTPManager] OTP generated for ${phoneNumber}: ${otp}`);
        
        return {
            otp: otp,
            validityInSeconds: this.otpValidity / 1000,
            success: true
        };
    }

    /**
     * Verify OTP for a phone number
     * @param {string} phoneNumber - Phone number
     * @param {string} enteredOtp - OTP entered by user
     * @returns {object} Verification result
     */
    verifyOTP(phoneNumber, enteredOtp) {
        if (!this.otpStore.has(phoneNumber)) {
            return {
                success: false,
                message: 'OTP not found. Please request a new OTP.',
                error: 'OTP_NOT_FOUND'
            };
        }

        const otpData = this.otpStore.get(phoneNumber);

        // Check if blocked due to multiple attempts
        if (otpData.blocked) {
            if (Date.now() < otpData.blockedUntil) {
                const remainingSeconds = Math.ceil((otpData.blockedUntil - Date.now()) / 1000);
                return {
                    success: false,
                    message: `Too many attempts. Please try again in ${remainingSeconds} seconds.`,
                    error: 'TOO_MANY_ATTEMPTS',
                    remainingSeconds: remainingSeconds
                };
            } else {
                // Unblock
                otpData.blocked = false;
                otpData.blockedUntil = null;
                otpData.attempts = 0;
            }
        }

        // Check if OTP expired
        const currentTime = Date.now();
        const isExpired = (currentTime - otpData.timestamp) > this.otpValidity;

        if (isExpired) {
            this.otpStore.delete(phoneNumber);
            return {
                success: false,
                message: 'OTP has expired. Please request a new OTP.',
                error: 'OTP_EXPIRED'
            };
        }

        // Verify OTP
        if (enteredOtp === otpData.otp) {
            console.log(`[OTPManager] OTP verified successfully for ${phoneNumber}`);
            this.otpStore.delete(phoneNumber);
            
            return {
                success: true,
                message: 'OTP verified successfully',
                phoneNumber: phoneNumber
            };
        } else {
            // Increment attempts
            otpData.attempts++;

            if (otpData.attempts >= this.maxAttempts) {
                otpData.blocked = true;
                otpData.blockedUntil = currentTime + this.resendCooldown;
                
                return {
                    success: false,
                    message: `Too many attempts. Please try again in ${this.resendCooldown / 1000} seconds.`,
                    error: 'TOO_MANY_ATTEMPTS',
                    attempts: otpData.attempts,
                    maxAttempts: this.maxAttempts,
                    blockedUntil: otpData.blockedUntil
                };
            }

            const remainingAttempts = this.maxAttempts - otpData.attempts;
            return {
                success: false,
                message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
                error: 'INVALID_OTP',
                attempts: otpData.attempts,
                remainingAttempts: remainingAttempts,
                maxAttempts: this.maxAttempts
            };
        }
    }

    /**
     * Get OTP validity status
     * @param {string} phoneNumber - Phone number
     * @returns {object} Validity status
     */
    getOTPStatus(phoneNumber) {
        if (!this.otpStore.has(phoneNumber)) {
            return {
                exists: false,
                message: 'No OTP found for this number'
            };
        }

        const otpData = this.otpStore.get(phoneNumber);
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - otpData.timestamp) / 1000);
        const remainingSeconds = Math.max(0, Math.floor((this.otpValidity - (currentTime - otpData.timestamp)) / 1000));
        const isExpired = remainingSeconds <= 0;

        return {
            exists: true,
            isExpired: isExpired,
            elapsedSeconds: elapsedSeconds,
            remainingSeconds: remainingSeconds,
            attempts: otpData.attempts,
            maxAttempts: this.maxAttempts,
            isBlocked: otpData.blocked,
            blockedUntil: otpData.blockedUntil
        };
    }

    /**
     * Check if resend is allowed
     * @param {string} phoneNumber - Phone number
     * @returns {object} Resend status
     */
    canResendOTP(phoneNumber) {
        const status = this.getOTPStatus(phoneNumber);
        
        if (!status.exists) {
            return {
                canResend: true,
                message: 'You can request a new OTP'
            };
        }

        if (status.isBlocked) {
            const remainingSeconds = Math.ceil((status.blockedUntil - Date.now()) / 1000);
            return {
                canResend: false,
                message: `Please wait ${remainingSeconds} seconds before resending`,
                remainingSeconds: remainingSeconds
            };
        }

        // Allow resend if more than 30 seconds have passed
        if (status.elapsedSeconds >= 30) {
            return {
                canResend: true,
                message: 'You can resend OTP',
                elapsedSeconds: status.elapsedSeconds
            };
        }

        const cooldownRemaining = 30 - status.elapsedSeconds;
        return {
            canResend: false,
            message: `Please wait ${cooldownRemaining} seconds before resending`,
            remainingSeconds: cooldownRemaining
        };
    }

    /**
     * Start resend timer
     * @param {string} phoneNumber - Phone number
     * @param {function} onTick - Callback for each tick
     * @param {function} onComplete - Callback when complete
     */
    startResendTimer(phoneNumber, onTick = null, onComplete = null) {
        // Clear existing timer
        if (this.resendTimers.has(phoneNumber)) {
            clearInterval(this.resendTimers.get(phoneNumber));
        }

        let secondsRemaining = 30;

        const timer = setInterval(() => {
            secondsRemaining--;

            if (onTick) {
                onTick(secondsRemaining);
            }

            if (secondsRemaining <= 0) {
                clearInterval(timer);
                this.resendTimers.delete(phoneNumber);
                if (onComplete) {
                    onComplete();
                }
            }
        }, 1000);

        this.resendTimers.set(phoneNumber, timer);
    }

    /**
     * Stop resend timer
     * @param {string} phoneNumber - Phone number
     */
    stopResendTimer(phoneNumber) {
        if (this.resendTimers.has(phoneNumber)) {
            clearInterval(this.resendTimers.get(phoneNumber));
            this.resendTimers.delete(phoneNumber);
        }
    }

    /**
     * Format phone number for display
     * @param {string} phoneNumber - Phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return '****';
        
        // Remove any non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');
        
        if (digits.length === 10) {
            return `+91 ${digits.substring(0, 4)} XXXXXX`;
        }
        
        return `+91 ${digits}`;
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number
     * @returns {object} Validation result
     */
    validatePhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');

        if (cleaned.length !== 10) {
            return {
                valid: false,
                message: 'Phone number must be 10 digits',
                length: cleaned.length
            };
        }

        // Indian phone number validation (basic)
        if (!/^[6-9]/.test(cleaned)) {
            return {
                valid: false,
                message: 'Phone number must start with 6-9'
            };
        }

        return {
            valid: true,
            message: 'Phone number is valid',
            phoneNumber: cleaned
        };
    }

    /**
     * Clear all OTPs
     */
    clearAllOTPs() {
        this.otpStore.clear();
        this.resendTimers.forEach(timer => clearInterval(timer));
        this.resendTimers.clear();
        console.log('[OTPManager] All OTPs cleared');
    }

    /**
     * Clear OTP for specific phone number
     * @param {string} phoneNumber - Phone number
     */
    clearOTP(phoneNumber) {
        this.otpStore.delete(phoneNumber);
        this.stopResendTimer(phoneNumber);
        console.log(`[OTPManager] OTP cleared for ${phoneNumber}`);
    }

    /**
     * Get OTP (for demo/testing only)
     * @param {string} phoneNumber - Phone number
     * @returns {string} OTP
     */
    getOTP(phoneNumber) {
        if (this.otpStore.has(phoneNumber)) {
            return this.otpStore.get(phoneNumber).otp;
        }
        return null;
    }
}

// Create global instance
const otpManager = new OTPManager({
    otpLength: 6,
    otpValidity: 600000, // 10 minutes
    maxAttempts: 5,
    resendCooldown: 30000 // 30 seconds
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OTPManager;
}
