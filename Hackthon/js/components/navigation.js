/**
 * Navigation Component - Main Navigation System
 * Handles navigation, menu management, and user interface controls
 */

class NavigationComponent {
    constructor(options = {}) {
        this.options = {
            containerId: 'mainNav',
            menuId: 'navMenu',
            mobileBreakpoint: 768,
            activeClass: 'active',
            ...options
        };
        
        this.container = null;
        this.menu = null;
        this.mobileMenuToggle = null;
        this.currentPage = '';
        this.isMobile = window.innerWidth <= this.options.mobileBreakpoint;
        
        this.initialize();
    }

    initialize() {
        console.log('🧭 Navigation Component initializing...');
        
        // Get DOM elements
        this.container = document.getElementById(this.options.containerId);
        this.menu = document.getElementById(this.options.menuId);
        
        if (!this.container) {
            console.warn('Navigation container not found');
            return;
        }

        this.setupEventListeners();
        this.highlightCurrentPage();
        this.handleResize();
        this.setupMobileMenu();
        
        console.log('✅ Navigation Component initialized');
    }

    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Mobile menu toggle
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        // Close menu on overlay click
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            overlay.addEventListener('click', this.closeMobileMenu.bind(this));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && this.menu?.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        this.currentPage = currentPath;
        
        const links = this.container.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.parentElement.classList.add(this.options.activeClass);
            } else {
                link.parentElement.classList.remove(this.options.activeClass);
            }
        });
    }

    setupMobileMenu() {
        // Create mobile menu toggle if it doesn't exist
        if (!this.container.querySelector('.mobile-menu-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
            toggle.setAttribute('aria-label', 'Toggle navigation menu');
            
            const navActions = this.container.querySelector('.nav-actions');
            if (navActions) {
                navActions.insertBefore(toggle, navActions.firstChild);
            } else {
                const navContainer = this.container.querySelector('.nav-container');
                if (navContainer) {
                    navContainer.appendChild(toggle);
                }
            }
            
            this.mobileMenuToggle = toggle;
            toggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        // Create overlay if it doesn't exist
        if (!document.querySelector('.nav-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.addEventListener('click', this.closeMobileMenu.bind(this));
            document.body.appendChild(overlay);
        }
    }

    toggleMobileMenu() {
        if (!this.menu) return;
        
        const isActive = this.menu.classList.toggle('active');
        const overlay = document.querySelector('.nav-overlay');
        const toggle = this.mobileMenuToggle;
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        if (toggle) {
            toggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            toggle.setAttribute('aria-expanded', isActive);
        }
        
        // Prevent body scroll
        document.body.style.overflow = isActive ? 'hidden' : '';
        
        // Dispatch event
        this.dispatchEvent('menuToggle', { isActive });
    }

    closeMobileMenu() {
        if (this.menu && this.menu.classList.contains('active')) {
            this.menu.classList.remove('active');
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.classList.remove('active');
            
            if (this.mobileMenuToggle) {
                this.mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
            
            document.body.style.overflow = '';
            
            this.dispatchEvent('menuClose', {});
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.options.mobileBreakpoint;
        
        if (wasMobile !== this.isMobile) {
            // Close menu on resize
            if (!this.isMobile) {
                this.closeMobileMenu();
            }
            
            this.dispatchEvent('resize', { 
                isMobile: this.isMobile,
                breakpoint: this.options.mobileBreakpoint
            });
        }
    }

    navigateTo(url, options = {}) {
        const { replace = false, state = {} } = options;
        
        if (replace) {
            window.history.replaceState(state, '', url);
        } else {
            window.history.pushState(state, '', url);
        }
        
        // Update active link
        this.highlightCurrentPage();
        
        // Close mobile menu
        this.closeMobileMenu();
        
        // Dispatch navigation event
        this.dispatchEvent('navigate', { url, replace, state });
        
        // Load content dynamically if router is available
        if (window.router && typeof window.router.loadPage === 'function') {
            window.router.loadPage(url);
        } else {
            // Fallback: reload page
            window.location.href = url;
        }
    }

    addNavItem(item, position = 'end') {
        const { label, href, icon, className = '', id } = item;
        
        const li = document.createElement('li');
        if (id) li.id = id;
        if (className) li.className = className;
        
        const link = document.createElement('a');
        link.href = href;
        link.innerHTML = icon ? `<i class="fas fa-${icon}"></i> ${label}` : label;
        
        li.appendChild(link);
        
        const navLinks = this.menu?.querySelector('.nav-links');
        if (navLinks) {
            if (position === 'start') {
                navLinks.insertBefore(li, navLinks.firstChild);
            } else {
                navLinks.appendChild(li);
            }
        }
        
        // Highlight if current page
        this.highlightCurrentPage();
    }

    removeNavItem(id) {
        const item = this.container.querySelector(`#${id}`);
        if (item) {
            item.remove();
        }
    }

    updateUserProfile(userData) {
        const profile = this.container.querySelector('.user-profile');
        if (!profile) return;
        
        if (userData.name) {
            const nameSpan = profile.querySelector('.user-name');
            if (nameSpan) nameSpan.textContent = userData.name;
        }
        
        if (userData.avatar) {
            const avatar = profile.querySelector('.avatar');
            if (avatar) {
                if (userData.avatar.startsWith('http')) {
                    avatar.src = userData.avatar;
                } else {
                    avatar.textContent = userData.avatar;
                }
            }
        }
    }

    setActiveLink(href) {
        const links = this.container.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === href) {
                link.parentElement.classList.add(this.options.activeClass);
            } else {
                link.parentElement.classList.remove(this.options.activeClass);
            }
        });
    }

    getCurrentPage() {
        return this.currentPage;
    }

    isMobileMenuOpen() {
        return this.menu?.classList.contains('active') || false;
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`navigation-${eventName}`, { 
            detail: { 
                ...detail,
                timestamp: new Date().toISOString()
            } 
        });
        document.dispatchEvent(event);
    }

    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        // Clean up mobile menu
        const toggle = this.mobileMenuToggle;
        if (toggle) {
            toggle.removeEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.container = null;
        this.menu = null;
        
        console.log('🧭 Navigation Component destroyed');
    }
}

// Initialize navigation component
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new NavigationComponent();
});

// Export for use in other files
window.NavigationComponent = NavigationComponent;