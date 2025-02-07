function loadAlertHistory() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    let apiUrl = "http://127.0.0.1:5050/alert_history";

    if (startDate && endDate) {
        apiUrl += `?start_date=${startDate}&end_date=${endDate}`;
    }

    console.log("Consultando API:", apiUrl);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Alertas recibidas:", data);
            const tableBody = document.getElementById("alertHistoryTable");
            tableBody.innerHTML = "";

            data.forEach(alert => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${alert.id}</td>
                    <td>${alert.timestamp}</td>
                    <td>${alert.type}</td>
                    <td>${alert.message}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error al cargar alertas:", error));
}

// Exportar alertas a CSV
function exportCSV() {
    window.location.href = "http://127.0.0.1:5050/export_alerts/csv";
}

// Exportar alertas a JSON
function exportJSON() {
    window.location.href = "http://127.0.0.1:5050/export_alerts/json";
}

// Descargar CSV de alertas
function downloadCSV() {
    window.location.href = "http://127.0.0.1:5050/download_alerts/csv";
}

// Descargar JSON de alertas
function downloadJSON() {
    window.location.href = "http://127.0.0.1:5050/download_alerts/json";
}

// Cargar alertas al iniciar la página
document.addEventListener("DOMContentLoaded", loadAlertHistory);
