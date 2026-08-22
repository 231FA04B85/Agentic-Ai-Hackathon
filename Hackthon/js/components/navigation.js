/**
 * Navigation Component — Advanced Build
 * Injects sidebar + topbar on every page dynamically.
 * Call NavComponent.init() or include this script before </body>.
 */
class NavComponent {
    static init() {
        // Detect current page
        const cur = window.location.pathname.split('/').pop() || 'index.html';

        // Build nav links config
        const links = [
            { section: 'Main' },
            { href: 'index.html',             icon: 'fa-home',        label: 'Dashboard' },
            { href: 'farm-management.html',    icon: 'fa-tractor',     label: 'Farm Management' },
            { href: 'crop-analysis.html',      icon: 'fa-leaf',        label: 'Crop Analysis' },
            { section: 'Intelligence' },
            { href: 'weather.html',            icon: 'fa-cloud-sun',   label: 'Weather' },
            { href: 'soil-irrigation.html',    icon: 'fa-water',       label: 'Soil & Irrigation' },
            { href: 'pest-disease.html',       icon: 'fa-bug',         label: 'Pest & Disease', badge: 'pestBadge' },
            { href: 'market-intelligence.html',icon: 'fa-chart-line',  label: 'Market Intel' },
            { section: 'Decisions' },
            { href: 'recommendations.html',    icon: 'fa-lightbulb',   label: 'Recommendations', badge: 'recNavBadge' },
            { href: 'explainability.html',     icon: 'fa-brain',       label: 'Explainability' },
            { href: 'farmer-feedback.html',    icon: 'fa-comments',    label: 'Feedback' }
        ];

        const navLinksHTML = links.map(l => {
            if (l.section) return `<div class="nav-section-label">${l.section}</div><ul class="nav-links">`;
            const active = l.href === cur ? 'active' : '';
            const badge = l.badge ? `<span class="nav-badge" id="${l.badge}" style="display:none">!</span>` : '';
            return `<li class="${active}"><a href="${l.href}"><i class="fas ${l.icon}"></i>${l.label}${badge}</a></li>`;
        }).join('') + '</ul>';

        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.id = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <span class="brand-text">Agri<span class="highlight">AI</span></span>
            </div>
            <div class="sidebar-farm-info">
                <div class="farm-avatar"><i class="fas fa-tractor"></i></div>
                <div class="farm-meta">
                    <div class="farm-name">Green Valley Farm</div>
                    <div class="farm-sub">95 ha · 3 active fields</div>
                </div>
            </div>
            <nav class="sidebar-nav">${navLinksHTML}</nav>
            <div class="sidebar-footer">
                <button class="btn-icon" id="themeToggle" title="Toggle theme"><i class="fas fa-moon"></i></button>
                <div style="flex:1"></div>
                <div style="font-size:10px;color:rgba(255,255,255,0.3)">v2.0</div>
            </div>`;

        // Page title map
        const titles = {
            'index.html':              ['Farm Dashboard',       'Real-time farm intelligence & AI decision support'],
            'farm-management.html':    ['Farm Management',      'Manage fields, crops, and field profiles'],
            'crop-analysis.html':      ['Crop Analysis',        'AI-powered image analysis and health assessment'],
            'weather.html':            ['Weather Intelligence', '7-day forecast and agricultural weather metrics'],
            'soil-irrigation.html':    ['Soil & Irrigation',    'Real-time soil monitoring and smart scheduling'],
            'pest-disease.html':       ['Pest & Disease',       'Risk assessment, scouting and treatment guidance'],
            'market-intelligence.html':['Market Intelligence',  'Commodity prices, forecasts and sell recommendations'],
            'recommendations.html':    ['Recommendations',      'AI-generated explainable farm management decisions'],
            'explainability.html':     ['Explainable AI',       'Understand every factor behind each recommendation'],
            'farmer-feedback.html':    ['Farmer Feedback',      'Rate recommendations and record field outcomes']
        };
        const [pageTitle, pageSub] = titles[cur] || ['AgriAI', 'Smart Agriculture Decision System'];

        const topbar = document.createElement('header');
        topbar.className = 'topbar';
        topbar.id = 'topbar';
        topbar.innerHTML = `
            <div class="topbar-left">
                <button class="topbar-mobile-toggle" id="mobileToggle"><i class="fas fa-bars"></i></button>
                <div>
                    <h1>${pageTitle}</h1>
                    <p>${pageSub}</p>
                </div>
            </div>
            <div class="topbar-right">
                <div class="topbar-time"><i class="fas fa-clock"></i><span id="liveTime">--:--</span></div>
                <div style="position:relative">
                    <button class="btn-icon" id="notificationBtn" title="Notifications">
                        <i class="fas fa-bell"></i>
                        <span class="badge" id="notificationBadge">3</span>
                    </button>
                    <div class="notification-panel" id="notificationPanel">
                        <div class="notification-panel-header">
                            <span>Alerts</span>
                            <a href="recommendations.html" style="font-size:12px;color:var(--primary-green);font-weight:600">View all</a>
                        </div>
                        <div class="notification-list" id="notificationList">
                            <div class="notification-item unread">
                                <div class="notif-icon amber"><i class="fas fa-exclamation-triangle"></i></div>
                                <div class="notif-body"><div class="notif-title">Pest Risk High</div><div class="notif-text">Fall Armyworm at 7.5/10 severity</div><div class="notif-time">Just now</div></div>
                            </div>
                            <div class="notification-item unread">
                                <div class="notif-icon red"><i class="fas fa-tint"></i></div>
                                <div class="notif-body"><div class="notif-title">Soil Moisture Low</div><div class="notif-text">North Field at 32% — irrigation needed</div><div class="notif-time">5m ago</div></div>
                            </div>
                            <div class="notification-item">
                                <div class="notif-icon green"><i class="fas fa-chart-line"></i></div>
                                <div class="notif-body"><div class="notif-title">Market Update</div><div class="notif-text">Wheat bullish — hold for 2 weeks</div><div class="notif-time">1h ago</div></div>
                            </div>
                        </div>
                        <div style="padding:10px 20px;text-align:center;border-top:1px solid var(--gray-200)">
                            <a href="recommendations.html" style="font-size:12px;color:var(--primary-green);font-weight:600">View all recommendations →</a>
                        </div>
                    </div>
                </div>
                <div class="user-chip">
                    <div class="user-avatar">FJ</div>
                    <span class="user-name">Farmer John</span>
                </div>
            </div>`;

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';

        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';

        // Inject before body content
        document.body.insertAdjacentElement('afterbegin', overlay);
        document.body.insertAdjacentElement('afterbegin', topbar);
        document.body.insertAdjacentElement('afterbegin', sidebar);
        document.body.appendChild(toastContainer);

        // Apply saved theme immediately
        const t = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', t);
        const themeIcon = sidebar.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Sidebar toggle (mobile)
        document.getElementById('mobileToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        });
        document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });

        // Notification dropdown
        const notifBtn = document.getElementById('notificationBtn');
        const notifPanel = document.getElementById('notificationPanel');
        notifBtn?.addEventListener('click', e => { e.stopPropagation(); notifPanel?.classList.toggle('active'); });
        document.addEventListener('click', () => notifPanel?.classList.remove('active'));
        notifPanel?.addEventListener('click', e => e.stopPropagation());

        // Live clock
        const clockEl = document.getElementById('liveTime');
        const updateClock = () => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
        updateClock();
        setInterval(updateClock, 1000);
    }
}

// Auto-run when DOM is ready (before DOMContentLoaded for early render)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', NavComponent.init);
} else {
    NavComponent.init();
}
