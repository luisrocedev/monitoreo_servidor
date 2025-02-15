// --- dashboard.js ---
let socket;
let summaryChart;
let monitoringActive = true; // Estado del monitoreo en el frontend
const MAX_DATA_POINTS = 50;

// Función para actualizar el gráfico resumen con datos nuevos y eliminar los más antiguos
function updateSummaryChart(data) {
    if (!monitoringActive) return; // Si el monitoreo está pausado, no actualizar

    let time = new Date().toLocaleTimeString();

    if (!summaryChart) {
        console.error("⚠️ Error: summaryChart no está inicializado.");
        return;
    }

    // Agregar nuevos valores a cada dataset
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

// Crear el gráfico resumen (usando Chart.js)
function createSummaryChart() {
    let ctx = document.getElementById("summaryChart").getContext("2d");
    summaryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "CPU (%)", borderColor: "red",   data: [], tension: 0.3, fill: false },
                { label: "RAM (%)", borderColor: "blue",  data: [], tension: 0.3, fill: false },
                { label: "Disco (%)", borderColor: "green", data: [], tension: 0.3, fill: false },
                { label: "Red (Bytes)", borderColor: "purple", data: [], tension: 0.3, fill: false },
                { label: "GPU (%)", borderColor: "orange", data: [], tension: 0.3, fill: false }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                  title: { display: true, text: "Tiempo" }
                },
                y: { 
                  title: { display: true, text: "Uso (%) o Bytes" }
                }
            }
        }
    });
}

// Obtener la IP almacenada o usar una por defecto
function getServerIP() {
    const storedIP = localStorage.getItem("serverIP");
    if (storedIP) {
        return storedIP;
    }
    // Si estamos en localhost, usar 127.0.0.1 como valor por defecto
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "127.0.0.1";
    }
    return window.location.hostname;
}

// Guardar IP ingresada por el usuario y recargar
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

    // Si estás sirviendo tu sitio con HTTPS, podrías necesitar wss://
    // Aquí forzamos ws:// para localhost, pero ajusta según tu entorno
    console.log(`🌍 Conectando a: ws://${serverIP}:6060`);

    socket = io(`ws://${serverIP}:6060`, { transports: ["websocket", "polling"] });

    // Manejo de eventos
    socket.on("connect", () => {
        console.log(`✅ Conectado a ${serverIP}`);
    });

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
    document.getElementById("networkUsage").innerText = formatBytes(data.network_received);
    document.getElementById("gpuUsage").innerText = data.gpu_usage !== "N/A" ? `${data.gpu_usage}%` : "N/A";
}

// Convertir Bytes a un formato legible
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

// Función para actualizar el estado de la IP
function actualizarEstadoIP() {
    fetch("http://localhost:6060/api/monitor/ip/status", {
        method: 'GET',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        const lista = document.getElementById("ipStatusList");
        lista.innerHTML = "";
        data.forEach(entry => {
            const item = document.createElement("li");
            item.textContent = `[${entry.timestamp}] IP: ${entry.ip} - Estado: ${entry.estado}`;
            lista.appendChild(item);
        });
    })
    .catch(error => {
        console.error("Error al obtener el estado de IP:", error);
    });
}

// Inicializar la aplicación una vez que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    createSummaryChart();
    connectWebSocket();
    
    // Ejecutar actualización de estado de IP al iniciar y cada 60 segundos
    actualizarEstadoIP();
    setInterval(actualizarEstadoIP, 60000);
});
