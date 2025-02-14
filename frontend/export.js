// Detectar si estamos en local o en internet
function getServerURL() {
    const localURL = "http://127.0.0.1:6060";
    const remoteURL = "http://82.165.43.137:5050"; // Cambia esto a tu dominio/IP del servidor público

    // Si la URL actual contiene "localhost" o "127.0.0.1", usa localURL, de lo contrario, usa remoteURL
    return window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1") 
        ? localURL 
        : remoteURL;
}

// Obtener el server_id ingresado por el usuario (desde un input en la UI)
function getServerID() {
    return document.getElementById("serverIP")?.value || "default_server";
}

function exportCSV() {
    const serverID = getServerID();
    const url = `${getServerURL()}/download/csv/${serverID}`;
    console.log("Solicitando CSV desde:", url);  // Log para depuración

    fetch(url)
        .then(response => {
            console.log("Respuesta del servidor:", response);  // Log para depuración
            if (!response.ok) {
                throw new Error(`Error en exportación CSV: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            console.log("Archivo CSV recibido:", blob);  // Log para depuración
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${serverID}_metrics.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("Archivo CSV descargado correctamente");  // Log para depuración
        })
        .catch(error => {
            console.error("Error en exportación CSV:", error);
            alert("No se pudo descargar el archivo CSV. Verifica la consola para más detalles.");
        });
}

// Función para exportar JSON
function exportJSON() {
    const serverID = getServerID();
    const url = `${getServerURL()}/download/json/${serverID}`;
    console.log("Solicitando JSON desde:", url);  // Log para depuración

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en exportación JSON: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${serverID}_metrics.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("Archivo JSON descargado correctamente");  // Log para depuración
        })
        .catch(error => {
            console.error("Error en exportación JSON:", error);
            alert("No se pudo descargar el archivo JSON. Verifica la consola para más detalles.");
        });
}

// Asignar eventos a los botones de exportación
document.addEventListener("DOMContentLoaded", () => {
    const exportCsvButton = document.getElementById("exportCsvButton");
    const exportJsonButton = document.getElementById("exportJsonButton");

    if (exportCsvButton) {
        exportCsvButton.addEventListener("click", exportCSV);
    }

    if (exportJsonButton) {
        exportJsonButton.addEventListener("click", exportJSON);
    }
});