/**
 * Forms Component - Reusable Form Components
 * Provides form creation, validation, and handling utilities
 */

class FormsComponent {
    constructor(options = {}) {
        this.options = {
            containerId: 'formContainer',
            forms: [],
            validation: {
                validateOnBlur: true,
                validateOnChange: true,
                showErrors: true,
                errorClass: 'has-error'
            },
            ...options
        };
        
        this.container = null;
        this.forms = {};
        this.fieldValidators = {};
        
        this.initialize();
    }

    initialize() {
        console.log('📝 Forms Component initializing...');
        
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.warn('Form container not found');
            return;
        }
        
        this.initializeValidators();
        this.renderForms();
        
        console.log('✅ Forms Component initialized');
    }

    initializeValidators() {
        // Built-in validators
        this.fieldValidators = {
            required: (value) => ({
                valid: value !== undefined && value !== null && value !== '',
                message: 'This field is required'
            }),
            email: (value) => ({
                valid: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message: 'Please enter a valid email address'
            }),
            phone: (value) => ({
                valid: /^\+?[\d\s-()]{10,15}$/.test(value),
                message: 'Please enter a valid phone number'
            }),
            number: (value) => ({
                valid: !isNaN(parseFloat(value)) && isFinite(value),
                message: 'Please enter a valid number'
            }),
            integer: (value) => ({
                valid: Number.isInteger(Number(value)),
                message: 'Please enter a whole number'
            }),
            min: (value, min) => ({
                valid: parseFloat(value) >= min,
                message: `Value must be at least ${min}`
            }),
            max: (value, max) => ({
                valid: parseFloat(value) <= max,
                message: `Value must be at most ${max}`
            }),
            minLength: (value, min) => ({
                valid: String(value).length >= min,
                message: `Must be at least ${min} characters`
            }),
            maxLength: (value, max) => ({
                valid: String(value).length <= max,
                message: `Must be at most ${max} characters`
            }),
            pattern: (value, pattern) => ({
                valid: new RegExp(pattern).test(value),
                message: 'Invalid format'
            }),
            confirm: (value, field) => ({
                valid: value === document.querySelector(`[name="${field}"]`)?.value,
                message: 'Values do not match'
            })
        };
    }

    renderForms() {
        this.container.innerHTML = '';
        
        this.options.forms.forEach((formData, index) => {
            const form = this.createForm(formData, index);
            this.container.appendChild(form);
            this.forms[formData.id || `form-${index}`] = {
                element: form,
                data: formData,
                errors: {},
                touched: {}
            };
        });
    }

    createForm(data, index) {
        const form = document.createElement('form');
        form.id = data.id || `form-${index}`;
        form.className = `form-component ${data.className || ''}`;
        form.method = data.method || 'POST';
        form.action = data.action || '#';
        form.enctype = data.enctype || 'application/x-www-form-urlencoded';
        
        // Add form title
        if (data.title) {
            const title = document.createElement('h2');
            title.className = 'form-title';
            title.textContent = data.title;
            form.appendChild(title);
        }
        
        if (data.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'form-subtitle';
            subtitle.textContent = data.subtitle;
            form.appendChild(subtitle);
        }
        
        // Add fields
        if (data.fields) {
            const fieldsContainer = document.createElement('div');
            fieldsContainer.className = 'form-fields';
            
            data.fields.forEach(field => {
                const fieldGroup = this.createField(field, data);
                fieldsContainer.appendChild(fieldGroup);
            });
            
            form.appendChild(fieldsContainer);
        }
        
        // Add actions
        if (data.actions) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'form-actions';
            
            data.actions.forEach(action => {
                const button = document.createElement('button');
                button.type = action.type || 'button';
                button.className = action.className || 'btn-primary';
                button.textContent = action.label;
                
                if (action.onClick) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        action.onClick(form);
                    });
                }
                
                if (action.type === 'submit') {
                    button.addEventListener('click', (e) => {
                        if (this.validateForm(form.id)) {
                            this.handleSubmit(form, data);
                        } else {
                            e.preventDefault();
                        }
                    });
                }
                
                actionsContainer.appendChild(button);
            });
            
            form.appendChild(actionsContainer);
        }
        
        // Setup validation
        if (this.options.validation.validateOnChange || this.options.validation.validateOnBlur) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (this.options.validation.validateOnChange) {
                    input.addEventListener('change', () => this.validateField(input));
                }
                if (this.options.validation.validateOnBlur) {
                    input.addEventListener('blur', () => this.validateField(input));
                }
            });
        }
        
        return form;
    }

    createField(field, formData) {
        const group = document.createElement('div');
        group.className = `form-group ${field.required ? 'required' : ''} ${field.className || ''}`;
        group.dataset.field = field.name;
        
        // Label
        if (field.label) {
            const label = document.createElement('label');
            label.htmlFor = field.id || field.name;
            label.textContent = field.label;
            if (field.required) {
                const required = document.createElement('span');
                required.className = 'required-star';
                required.textContent = ' *';
                label.appendChild(required);
            }
            group.appendChild(label);
        }
        
        // Help text
        if (field.help) {
            const help = document.createElement('span');
            help.className = 'field-help';
            help.textContent = field.help;
            group.appendChild(help);
        }
        
        // Input
        const input = document.createElement(this.getInputElement(field.type));
        input.id = field.id || field.name;
        input.name = field.name;
        input.className = `form-control ${field.inputClass || ''}`;
        
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.value !== undefined) input.value = field.value;
        if (field.required) input.required = true;
        if (field.disabled) input.disabled = true;
        if (field.readonly) input.readonly = true;
        
        // Type-specific attributes
        switch (field.type) {
            case 'number':
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                if (field.step !== undefined) input.step = field.step;
                break;
            case 'textarea':
                if (field.rows) input.rows = field.rows;
                if (field.cols) input.cols = field.cols;
                break;
            case 'select':
                if (field.options) {
                    field.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt.value;
                        option.textContent = opt.label || opt.value;
                        if (opt.selected) option.selected = true;
                        input.appendChild(option);
                    });
                }
                break;
            case 'checkbox':
            case 'radio':
                input.type = field.type;
                if (field.checked) input.checked = true;
                break;
            default:
                input.type = field.type || 'text';
        }
        
        group.appendChild(input);
        
        // Error message container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-error';
        errorContainer.id = `${field.name}-error`;
        group.appendChild(errorContainer);
        
        return group;
    }

    getInputElement(type) {
        switch (type) {
            case 'textarea': return 'textarea';
            case 'select': return 'select';
            case 'checkbox':
            case 'radio':
                return 'input';
            default: return 'input';
        }
    }

    validateField(input) {
        const form = input.closest('form');
        if (!form) return true;
        
        const formId = form.id;
        const formData = this.forms[formId];
        if (!formData) return true;
        
        const fieldName = input.name;
        const fieldConfig = formData.data.fields?.find(f => f.name === fieldName);
        if (!fieldConfig) return true;
        
        const value = this.getInputValue(input);
        const errors = [];
        
        // Run validators
        if (fieldConfig.validators) {
            fieldConfig.validators.forEach(validator => {
                if (typeof validator === 'string') {
                    const validatorFn = this.fieldValidators[validator];
                    if (validatorFn) {
                        const result = validatorFn(value);
                        if (!result.valid) {
                            errors.push(result.message);
                        }
                    }
                } else if (typeof validator === 'object') {
                    const validatorFn = this.fieldValidators[validator.type];
                    if (validatorFn) {
                        const result = validatorFn(value, validator.params);
                        if (!result.valid) {
                            errors.push(validator.message || result.message);
                        }
                    }
                } else if (typeof validator === 'function') {
                    const result = validator(value, fieldConfig);
                    if (result !== true) {
                        errors.push(result || 'Invalid value');
                    }
                }
            });
        }
        
        // Update error display
        const errorContainer = input.parentElement.querySelector('.field-error');
        if (errorContainer) {
            if (errors.length > 0) {
                errorContainer.textContent = errors[0];
                errorContainer.style.display = 'block';
                input.parentElement.classList.add(this.options.validation.errorClass);
                formData.errors[fieldName] = errors;
            } else {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
                input.parentElement.classList.remove(this.options.validation.errorClass);
                delete formData.errors[fieldName];
            }
        }
        
        return errors.length === 0;
    }

    validateForm(formId) {
        const formData = this.forms[formId];
        if (!formData) return false;
        
        const fields = formData.data.fields || [];
        let isValid = true;
        
        fields.forEach(field => {
            const input = formData.element.querySelector(`[name="${field.name}"]`);
            if (input && field.required) {
                const valid = this.validateField(input);
                if (!valid) isValid = false;
            }
        });
        
        return isValid && Object.keys(formData.errors).length === 0;
    }

    getInputValue(input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.type === 'checkbox') {
                return input.checked ? input.value : false;
            }
            const form = input.closest('form');
            if (form) {
                const checked = form.querySelector(`[name="${input.name}"]:checked`);
                return checked ? checked.value : null;
            }
            return input.checked ? input.value : null;
        }
        if (input.type === 'select-multiple') {
            return Array.from(input.selectedOptions).map(opt => opt.value);
        }
        return input.value;
    }

    getFormValues(formId) {
        const formData = this.forms[formId];
        if (!formData) return null;
        
        const form = formData.element;
        const values = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                const value = this.getInputValue(input);
                if (input.type === 'checkbox' && input.checked === false && !input.value) {
                    // Skip unchecked checkboxes without value
                } else {
                    values[input.name] = value;
                }
            }
        });
        
        return values;
    }

    setFormValues(formId, values) {
        const formData = this.forms[formId];
        if (!formData) return false;
        
        const form = formData.element;
        Object.entries(values).forEach(([name, value]) => {
            const inputs = form.querySelectorAll(`[name="${name}"]`);
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = value === true || value === input.value;
                } else if (input.type === 'radio') {
                    input.checked = input.value === value;
                } else if (input.type === 'select-multiple') {
                    Array.from(input.options).forEach(opt => {
                        opt.selected = Array.isArray(value) ? value.includes(opt.value) : opt.value === value;
                    });
                } else {
                    input.value = value !== undefined ? value : '';
                }
            });
        });
        
        return true;
    }

    resetForm(formId) {
        const formData = this.forms[formId];
        if (!formData) return false;
        
        const form = formData.element;
        form.reset();
        
        // Clear errors
        const errorContainers = form.querySelectorAll('.field-error');
        errorContainers.forEach(container => {
            container.textContent = '';
            container.style.display = 'none';
        });
        
        const errorGroups = form.querySelectorAll(`.${this.options.validation.errorClass}`);
        errorGroups.forEach(group => {
            group.classList.remove(this.options.validation.errorClass);
        });
        
        formData.errors = {};
        formData.touched = {};
        
        return true;
    }

    handleSubmit(form, data) {
        const values = this.getFormValues(form.id);
        
        if (data.onSubmit) {
            data.onSubmit(values, form);
        }
        
        this.dispatchEvent('submit', { 
            formId: form.id, 
            values: values,
            data: data
        });
        
        if (data.action && data.action !== '#') {
            // Submit form normally
            form.submit();
        }
    }

    addForm(id, data) {
        const form = this.createForm({ id, ...data }, Object.keys(this.forms).length);
        this.container.appendChild(form);
        this.forms[id] = {
            element: form,
            data: data,
            errors: {},
            touched: {}
        };
        return form;
    }

    removeForm(id) {
        if (this.forms[id]) {
            this.forms[id].element.remove();
            delete this.forms[id];
            return true;
        }
        return false;
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`forms-${eventName}`, { 
            detail: { ...detail, timestamp: new Date().toISOString() } 
        });
        document.dispatchEvent(event);
    }

    destroy() {
        this.container.innerHTML = '';
        this.forms = {};
        this.container = null;
        console.log('📝 Forms Component destroyed');
    }
}

// Export for use in other files
window.FormsComponent = FormsComponent;