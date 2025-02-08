let cpuChart, memoryChart, diskChart, networkChart, gpuChart;
let socket;
let alertSound = new Audio("alert.mp3");
let alertHistory = [];
let expandedChart = null;
let autoUpdate = true; // Control de actualización automática

// Determinar si estamos en local o en la red
const SERVER_HOST = window.location.hostname.includes("localhost") ? "127.0.0.1" : window.location.hostname;

// Asegurar que el contenedor de gráfico ampliado esté oculto al inicio
document.addEventListener("DOMContentLoaded", () => {
    const expandedChartContainer = document.getElementById("expandedChartContainer");
    if (expandedChartContainer) {
        expandedChartContainer.classList.add("hidden");
    }
    createCharts();
    connectWebSocket();
    assignChartClickEvents();
});

// Función para pausar/reanudar actualización en tiempo real
function toggleAutoUpdate() {
    autoUpdate = !autoUpdate;
    document.getElementById("toggleButton").innerText = autoUpdate ? "Pausar Actualización" : "Reanudar Actualización";
}

// Función para resetear el zoom de todos los gráficos
function resetZoom() {
    [cpuChart, memoryChart, diskChart, networkChart, gpuChart].forEach(chart => {
        if (chart && chart.resetZoom) {
            chart.resetZoom();
        }
    });
}

// Función para expandir un gráfico con opción de cambiar tipo de visualización
function expandChart(chartId) {
    const expandedContainer = document.getElementById("expandedChartContainer");
    const expandedCanvas = document.getElementById("expandedChart");
    const chartTypeSelector = document.getElementById("chartTypeSelector");

    if (!expandedContainer || !expandedCanvas || !chartTypeSelector) return;

    let ctx = expandedCanvas.getContext("2d");
    let originalChart = getChartById(chartId);
    if (!originalChart) return;

    if (expandedChart) {
        expandedChart.destroy();
    }

    function createExpandedChart(chartType) {
        if (expandedChart) {
            expandedChart.destroy();
        }
        expandedChart = new Chart(ctx, {
            type: chartType,
            data: structuredClone(originalChart.data),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: originalChart.options.scales
            }
        });
    }

    createExpandedChart(originalChart.config.type);
    expandedContainer.classList.remove("hidden");

    chartTypeSelector.onchange = function () {
        createExpandedChart(chartTypeSelector.value);
    };

    expandedContainer.onclick = function (event) {
        if (event.target === expandedContainer) {
            expandedContainer.classList.add("hidden");
            if (expandedChart) {
                expandedChart.destroy();
                expandedChart = null;
            }
        }
    };
}

// Función para asignar eventos de clic a los gráficos
function assignChartClickEvents() {
    ["cpuChart", "memoryChart", "diskChart", "networkChart", "gpuChart"].forEach(chartId => {
        let chartElement = document.getElementById(chartId);
        if (chartElement) {
            chartElement.addEventListener("click", () => expandChart(chartId));
        }
    });
}

// Función para obtener un gráfico por ID
function getChartById(chartId) {
    return {
        "cpuChart": cpuChart,
        "memoryChart": memoryChart,
        "diskChart": diskChart,
        "networkChart": networkChart,
        "gpuChart": gpuChart
    }[chartId] || null;
}

// Inicializar conexión WebSocket
function connectWebSocket() {
    if (!socket || socket.disconnected) {
        socket = io(`http://${SERVER_HOST}:5050`);

        socket.on("connect", () => console.log(`✅ Conectado a ${SERVER_HOST}`));
        socket.on("disconnect", () => console.log("❌ Desconectado de WebSocket"));

        socket.on("update_metrics", (data) => {
            if (autoUpdate) {
                console.log("📡 Datos en tiempo real recibidos:", data);
                updateCharts(
                    new Date().toLocaleTimeString(),
                    data.cpu_usage,
                    data.memory_usage,
                    data.disk_usage,
                    data.network_received,
                    data.gpu_usage
                );
            }
        });
    }
}

// Función para inicializar gráficos
function createChart(ctx, label, borderColor, chartType = "line") {
    return new Chart(ctx, {
        type: chartType,
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: borderColor,
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                zoom: {
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" }
                }
            },
            scales: {
                x: { title: { display: true, text: "Tiempo" } },
                y: { title: { display: true, text: label } }
            }
        }
    });
}

// Inicializar gráficos
function createCharts() {
    let cpuCtx = document.getElementById("cpuChart")?.getContext("2d");
    let memoryCtx = document.getElementById("memoryChart")?.getContext("2d");
    let diskCtx = document.getElementById("diskChart")?.getContext("2d");
    let networkCtx = document.getElementById("networkChart")?.getContext("2d");
    let gpuCtx = document.getElementById("gpuChart")?.getContext("2d");

    if (cpuCtx) cpuChart = createChart(cpuCtx, "CPU (%)", "red");
    if (memoryCtx) memoryChart = createChart(memoryCtx, "Memoria (%)", "blue");
    if (diskCtx) diskChart = createChart(diskCtx, "Disco (%)", "green");
    if (networkCtx) networkChart = createChart(networkCtx, "Red Recibida (Bytes)", "purple");
    if (gpuCtx) gpuChart = createChart(gpuCtx, "GPU (%)", "orange");
}

// **Función para actualizar gráficos**
function updateCharts(timestamp, cpuData, memoryData, diskData, networkData, gpuData) {
    appendDataToChart(cpuChart, timestamp, cpuData);
    appendDataToChart(memoryChart, timestamp, memoryData);
    appendDataToChart(diskChart, timestamp, diskData);
    appendDataToChart(networkChart, timestamp, networkData);
    appendDataToChart(gpuChart, timestamp, gpuData);
}

// **Función para agregar datos al gráfico**
function appendDataToChart(chart, timestamp, newData) {
    if (chart) {
        if (chart.data.labels.length > 50) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.data.labels.push(timestamp);
        chart.data.datasets[0].data.push(newData);
        chart.update();
    }
}

// **Función para cambiar el tipo de gráfico**
function updateChartType(chartId, newType) {
    let chart = getChartById(chartId);
    let ctx = document.getElementById(chartId)?.getContext("2d");

    if (chart && ctx) {
        const existingData = structuredClone(chart.data);
        chart.destroy();

        chart = new Chart(ctx, {
            type: newType,
            data: existingData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: chart.options.scales
            }
        });

        switch (chartId) {
            case "cpuChart": cpuChart = chart; break;
            case "memoryChart": memoryChart = chart; break;
            case "diskChart": diskChart = chart; break;
            case "networkChart": networkChart = chart; break;
            case "gpuChart": gpuChart = chart; break;
        }
    }
}
