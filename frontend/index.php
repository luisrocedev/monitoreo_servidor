<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Monitoreo</title>
    <link rel="stylesheet" href="style.css">

    <!-- Cargar Chart.js y Plugin Zoom -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@1.2.0"></script>

    <!-- Cargar socket.io para WebSockets -->
    <script src="https://cdn.jsdelivr.net/npm/socket.io-client/dist/socket.io.js"></script>

    <!-- Cargar scripts -->
    <script src="dashboard.js" defer></script>
</head>

<body>
    <h1>Dashboard de Monitoreo</h1>

    <!-- Selector de Servidor -->
    <div class="server-selector">
        <label for="serverIP">IP del Servidor:</label>
        <input type="text" id="serverIP" placeholder="Ej: 192.168.1.10">
        <button onclick="changeServerIP()">Conectar</button>
        <p>Servidor actual: <span id="currentServerIP">Ninguno</span></p>
    </div>

    <!-- Botón para Pausar/Reanudar Monitoreo -->
    <div class="monitoring-control">
        <button id="toggleMonitoringBtn" onclick="toggleMonitoring()">⏸️ Parar Monitoreo</button>
        <p>Estado: <span id="monitoringStatus">Activo</span></p>
    </div>

    <!-- Tarjetas de métricas -->
    <div class="metrics-container">
        <div class="metric-card" id="cpuCard">
            <h3>CPU</h3>
            <p id="cpuUsage">- %</p>
        </div>
        <div class="metric-card" id="memoryCard">
            <h3>RAM</h3>
            <p id="memoryUsage">- %</p>
        </div>
        <div class="metric-card" id="diskCard">
            <h3>Disco</h3>
            <p id="diskUsage">- %</p>
        </div>
        <div class="metric-card" id="networkCard">
            <h3>Red</h3>
            <p id="networkUsage">- Bytes</p>
        </div>
        <div class="metric-card" id="gpuCard">
            <h3>GPU</h3>
            <p id="gpuUsage">- %</p>
        </div>
    </div>

    <!-- Gráfico Resumen -->
    <h2>Gráfico Resumen en Tiempo Real</h2>
    <div style="width: 80%; height: 400px; margin: auto;">
        <canvas id="summaryChart"></canvas>
    </div>

    <!-- Accesos Directos -->
    <h2>Accesos Directos</h2>
    <div class="shortcuts">
        <a href="history.php" class="button">🔍 Ver Historial de Métricas</a>
        <a href="alerts.php" class="button">⚠️ Ver Historial de Alertas</a>
    </div>

</body>

</html>