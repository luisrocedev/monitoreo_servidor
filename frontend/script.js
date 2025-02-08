let cpuChart, memoryChart, diskChart, gpuChart, cpuTempChart;

// Configurar gráficos con Chart.js
function setupCharts() {
    const ctxCpu = document.getElementById("cpuChart").getContext("2d");
    cpuChart = createChart(ctxCpu, "Uso de CPU (%)", "red");

    const ctxMemory = document.getElementById("memoryChart").getContext("2d");
    memoryChart = createChart(ctxMemory, "Uso de Memoria (%)", "blue");

    const ctxDisk = document.getElementById("diskChart").getContext("2d");
    diskChart = createChart(ctxDisk, "Uso de Disco (%)", "green");

    const ctxGpu = document.getElementById("gpuChart").getContext("2d");
    gpuChart = createChart(ctxGpu, "Uso de GPU (%)", "purple");

    const ctxCpuTemp = document.getElementById("cpuTempChart").getContext("2d");
    cpuTempChart = createChart(ctxCpuTemp, "Temperatura CPU (°C)", "orange");
}

// Función para crear gráficos de Chart.js
function createChart(ctx, label, color) {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: false },
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

// Obtener métricas del backend remoto y actualizar gráficos
function getMetrics() {
    const ip = document.getElementById("ipInput").value;
    const url = `http://${ip}:5050/metrics`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateChart(cpuChart, data.cpu_usage);
            updateChart(memoryChart, data.memory_usage);
            updateChart(diskChart, data.disk_usage);
            updateChart(gpuChart, data.gpu_usage !== "N/A" ? data.gpu_usage : 0);
            updateChart(cpuTempChart, data.cpu_temp !== "N/A" ? data.cpu_temp : 0);
        })
        .catch(error => console.error("Error:", error));
}

// Función para actualizar datos en los gráficos
function updateChart(chart, value) {
    const now = new Date().toLocaleTimeString();
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(value);
    
    if (chart.data.labels.length > 10) { // Máximo 10 puntos en el gráfico
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

// Inicializar gráficos al cargar la página
document.addEventListener("DOMContentLoaded", setupCharts);
