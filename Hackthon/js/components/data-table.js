class DataTable {
    constructor(element, rows = []) {
        this.element = element;
        this.rows = rows;
    }

    render(columns) {
        if (!this.element) return;
        this.element.innerHTML = this.rows.map(row => `<tr>${columns.map(column => `<td>${row[column] ?? ''}</td>`).join('')}</tr>`).join('');
    }
}

window.DataTable = DataTable;
