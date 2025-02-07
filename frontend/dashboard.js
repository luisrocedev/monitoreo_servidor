let socket;
let summaryChart;
let monitoringActive = true; // Estado del monitoreo en frontend
const MAX_DATA_POINTS = 50;

// Función para actualizar el gráfico resumen con datos nuevos y eliminar los más antiguos
function updateSummaryChart(data) {
    if (!monitoringActive) return; // Si el monitoreo está pausado, no actualizar

    let time = new Date().toLocaleTimeString();

    if (!summaryChart) {
        console.error("⚠️ Error: summaryChart no está inicializado.");
        return;
    }

    // Agregar nuevos valores
    summaryChart.data.labels.push(time);
    summaryChart.data.datasets[0].data.push(data.cpu_usage);
    summaryChart.data.datasets[1].data.push(data.memory_usage);
    summaryChart.data.datasets[2].data.push(data.disk_usage);
    summaryChart.data.datasets[3].data.push(data.network_received);
    summaryChart.data.datasets[4].data.push(data.gpu_usage !== "N/A" ? data.gpu_usage : null);

    // Mantener el límite de puntos en el gráfico
    if (summaryChart.data.labels.length > MAX_DATA_POINTS) {
        summaryChart.data.labels.shift();
        summaryChart.data.datasets.forEach((dataset) => dataset.data.shift());
    }

    summaryChart.update();
}

// Crear el gráfico resumen
function createSummaryChart() {
    let ctx = document.getElementById("summaryChart").getContext("2d");
    summaryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "CPU (%)", borderColor: "red", data: [] },
                { label: "RAM (%)", borderColor: "blue", data: [] },
                { label: "Disco (%)", borderColor: "green", data: [] },
                { label: "Red (Bytes)", borderColor: "purple", data: [] },
                { label: "GPU (%)", borderColor: "orange", data: [] }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: "Tiempo" } },
                y: { title: { display: true, text: "Uso (%)" } }
            }
        }
    });
}

// Obtener la IP almacenada o usar una por defecto
function getServerIP() {
    const storedIP = localStorage.getItem("serverIP");

    if (storedIP) return storedIP;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "127.0.0.1";
    }
    return window.location.hostname;
}

// Guardar IP ingresada por el usuario
function changeServerIP() {
    const ipInput = document.getElementById("serverIP").value;
    if (ipInput) {
        localStorage.setItem("serverIP", ipInput);
        location.reload();
    }
}

// Conectar con WebSockets
function connectWebSocket() {
    const serverIP = getServerIP();
    console.log(`🌍 Conectando a: ws://${serverIP}:5050`);

    socket = io(`ws://${serverIP}:5050`, { transports: ["websocket", "polling"] });

    socket.on("connect", () => console.log(`✅ Conectado a ${serverIP}`));
    socket.on("disconnect", () => {
        console.log("❌ Desconectado. Intentando reconectar...");
        setTimeout(connectWebSocket, 3000);
    });

    socket.on("update_metrics", (data) => {
        if (monitoringActive) {
            updateDashboard(data);
            updateSummaryChart(data);
        }
    });

    socket.on("connect_error", (err) => {
        console.error("⚠️ Error de conexión con WebSocket:", err);
    });
}

// Función para pausar/reanudar la actualización del monitoreo
function toggleMonitoring() {
    monitoringActive = !monitoringActive;

    // Actualizar el botón
    const button = document.getElementById("toggleMonitoringBtn");
    if (monitoringActive) {
        button.innerText = "⏸️ Pausar Monitoreo";
        button.style.backgroundColor = "#d9534f";
    } else {
        button.innerText = "▶️ Reanudar Monitoreo";
        button.style.backgroundColor = "#5cb85c";
    }
}

// Actualizar métricas en el Dashboard
function updateDashboard(data) {
    document.getElementById("cpuUsage").innerText = `${data.cpu_usage}%`;
    document.getElementById("memoryUsage").innerText = `${data.memory_usage}%`;
    document.getElementById("diskUsage").innerText = `${data.disk_usage}%`;
    document.getElementById("networkUsage").innerText = `${formatBytes(data.network_received)}`;
    document.getElementById("gpuUsage").innerText = data.gpu_usage !== "N/A" ? `${data.gpu_usage}%` : "N/A";
}

// Convertir Bytes a formato legible
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    let units = ["KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return bytes.toFixed(2) + " " + units[i];
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
    createSummaryChart();
    connectWebSocket();
});
