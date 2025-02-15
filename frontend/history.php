<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Métricas</title>
    <link rel="stylesheet" href="history.css">

    <!-- Cargar Chart.js y Plugin Zoom -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@1.2.0"></script>

    <!-- Cargar socket.io para WebSockets -->
    <script src="https://cdn.jsdelivr.net/npm/socket.io-client/dist/socket.io.js"></script>

    <!-- Cargar scripts del proyecto -->
    <script src="history.js" defer></script>
    <script src="export.js" defer></script>
</head>

<body>
    <!-- Botón para volver al inicio -->
    <div class="back-to-home">
        <a href="index.php" class="home-button">🏠 Volver al Inicio</a>
    </div>

    <h1>Historial de Métricas</h1>

    <!-- Contenedor de alertas en tiempo real -->
    <div id="alertBox" style="display: none; padding: 15px; margin: 15px 0; font-weight: bold; text-align: center;"></div>

    <!-- Contenedor de gráfico ampliado (oculto al inicio) -->
    <div id="expandedChartContainer" class="hidden">
        <div id="expandedChartWrapper">
            <label for="chartTypeSelector">Tipo de Gráfico:</label>
            <select id="chartTypeSelector">
                <option value="line">Línea</option>
                <option value="bar">Barras</option>
                <option value="radar">Radar</option>
                <option value="pie">Pastel</option>
            </select>
            <canvas id="expandedChart"></canvas>
        </div>
    </div>

    <!-- Filtros por Fecha -->
    <div class="filters">
        <label for="startDate">Fecha Inicio:</label>
        <input type="date" id="startDate">

        <label for="endDate">Fecha Fin:</label>
        <input type="date" id="endDate">

        <button onclick="loadHistory()">Buscar</button>
    </div>

    <!-- Botones de Exportación -->
    <div class="export-buttons">
        <button onclick="exportCSV()">Exportar a CSV</button>
        <button onclick="exportJSON()">Exportar a JSON</button>
    </div>

    <!-- Selectores de tipo de gráfico -->
    <h2>Selecciona el tipo de gráfico</h2>
    <div class="chart-selectors">
        <label for="chartTypeCpu">CPU:</label>
        <select id="chartTypeCpu" onchange="updateChartType('cpuChart', this.value)">
            <option value="line" selected>Línea</option>
            <option value="bar">Barras</option>
            <option value="radar">Área</option>
        </select>

        <label for="chartTypeMemory">Memoria:</label>
        <select id="chartTypeMemory" onchange="updateChartType('memoryChart', this.value)">
            <option value="line" selected>Línea</option>
            <option value="bar">Barras</option>
            <option value="radar">Área</option>
        </select>

        <label for="chartTypeDisk">Disco:</label>
        <select id="chartTypeDisk" onchange="updateChartType('diskChart', this.value)">
            <option value="line" selected>Línea</option>
            <option value="bar">Barras</option>
            <option value="radar">Área</option>
        </select>

        <label for="chartTypeNetwork">Red:</label>
        <select id="chartTypeNetwork" onchange="updateChartType('networkChart', this.value)">
            <option value="line" selected>Línea</option>
            <option value="bar">Barras</option>
            <option value="radar">Área</option>
        </select>

        <label for="chartTypeGpu">GPU:</label>
        <select id="chartTypeGpu" onchange="updateChartType('gpuChart', this.value)">
            <option value="line" selected>Línea</option>
            <option value="bar">Barras</option>
            <option value="radar">Área</option>
        </select>
    </div>

    <!-- Checkboxes para mostrar/ocultar gráficos -->
    <h2>Selecciona las métricas a visualizar</h2>
    <div class="checkboxes">
        <label><input type="checkbox" id="cpuCheck" checked onchange="toggleChart('cpuContainer')"> CPU</label>
        <label><input type="checkbox" id="memoryCheck" checked onchange="toggleChart('memoryContainer')"> Memoria</label>
        <label><input type="checkbox" id="diskCheck" checked onchange="toggleChart('diskContainer')"> Disco</label>
        <label><input type="checkbox" id="networkCheck" checked onchange="toggleChart('networkContainer')"> Red</label>
        <label><input type="checkbox" id="gpuCheck" checked onchange="toggleChart('gpuContainer')"> GPU</label>
    </div>

    <div class="controls">
        <button id="toggleButton" onclick="toggleAutoUpdate()">Pausar Actualización</button>
        <button onclick="resetZoom()">Reset Zoom</button>
    </div>

    <!-- Contenedores de gráficos -->
    <h2>Gráficos de Métricas</h2>
    <div id="cpuContainer"><canvas id="cpuChart"></canvas></div>
    <div id="memoryContainer"><canvas id="memoryChart"></canvas></div>
    <div id="diskContainer"><canvas id="diskChart"></canvas></div>
    <div id="networkContainer"><canvas id="networkChart"></canvas></div>
    <div id="gpuContainer"><canvas id="gpuChart"></canvas></div>
</body>

<footer class="footer">
    &copy; 2025 Dashboard Monitor | Creado con ❤️ por luisrocedev.
</footer>

</html>