window.DashboardWidgets = {
    setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
};
