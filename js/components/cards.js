window.InfoCard = {
    render(title, value, className = '') {
        return `<article class="stat-card ${className}"><h3>${title}</h3><p class="stat-number">${value}</p></article>`;
    }
};
