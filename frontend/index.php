<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Monitoreo</title>

    <!-- Estilos -->
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">

    <!-- Cargar Chart.js y Plugin Zoom -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@1.2.0"></script>

    <!-- Cargar socket.io para WebSockets -->
    <script src="https://cdn.jsdelivr.net/npm/socket.io-client/dist/socket.io.js"></script>

    <!-- Cargar scripts -->
    <script src="dashboard.js" defer></script>
</head>

<body>

    <!-- Encabezado -->
    <header class="header">
        <div class="logo">⚙️ luisrocedev / monitoreo</div>
        <nav class="nav">
            <a href="history.php">📜 Historial</a>
            <a href="alerts.php">⚠️ Alertas</a>
        </nav>
    </header>

    <!-- Contenido principal -->
    <main class="main-content">
        <!-- Sección de Monitoreo -->
        <section class="monitoring-section">
            <h1>📡 Monitoreo en Tiempo Real</h1>
            <div class="monitoring-control">
                <button id="toggleMonitoringBtn" onclick="toggleMonitoring()">⏯️ Parar Monitoreo</button>
                <p class="status-text">Estado: <span id="monitoringStatus">Activo</span></p>
            </div>
        </section>

        <!-- Tarjetas de Métricas -->
        <section class="metrics-container">
            <?php
            $metrics = [
                ['id' => 'cpuCard', 'icon' => '💾', 'name' => 'CPU', 'value' => 'cpuUsage'],
                ['id' => 'memoryCard', 'icon' => '🧠', 'name' => 'RAM', 'value' => 'memoryUsage'],
                ['id' => 'diskCard', 'icon' => '💽', 'name' => 'Disco', 'value' => 'diskUsage'],
                ['id' => 'networkCard', 'icon' => '🌐', 'name' => 'Red', 'value' => 'networkUsage'],
                ['id' => 'gpuCard', 'icon' => '🎨', 'name' => 'GPU', 'value' => 'gpuUsage'],
            ];

            foreach ($metrics as $metric) {
                echo "
                <div class='metric-card' id='{$metric['id']}'>
                    <h3>{$metric['icon']} {$metric['name']}</h3>
                    <p id='{$metric['value']}'>- %</p>
                </div>
                ";
            }
            ?>
        </section>

        <!-- Gráfico de Métricas -->
        <section class="chart-section">
            <h2>📊 Gráfico de Métricas en Tiempo Real</h2>
            <div class="chart-container">
                <canvas id="summaryChart"></canvas>
            </div>
        </section>
    </main>

    <!-- Pie de página -->
    <footer class="footer">
        &copy; 2025 Dashboard Monitor | Creado con ❤️ por luisrocedev.
    </footer>

</body>

</html>