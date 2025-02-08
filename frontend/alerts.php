<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Alertas</title>
    <link rel="stylesheet" href="style.css">

    <!-- Cargar scripts -->
    <script src="alerts.js" defer></script>
</head>

<body>
    <h1>Historial de Alertas</h1>

    <!-- Filtros por Fecha -->
    <label for="startDate">Fecha Inicio:</label>
    <input type="date" id="startDate">

    <label for="endDate">Fecha Fin:</label>
    <input type="date" id="endDate">

    <button onclick="loadAlertHistory()">Buscar</button>
    <button onclick="exportCSV()">Exportar a CSV</button>
    <button onclick="exportJSON()">Exportar a JSON</button>
    <button onclick="downloadCSV()">Descargar CSV</button>
    <button onclick="downloadJSON()">Descargar JSON</button>

    <!-- Tabla de Historial de Alertas -->
    <h2>Alertas Registradas</h2>
    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Mensaje</th>
            </tr>
        </thead>
        <tbody id="alertHistoryTable">
        </tbody>
    </table>

    <br>
    <a href="index.php">⬅️ Volver al Dashboard</a>
</body>

</html>