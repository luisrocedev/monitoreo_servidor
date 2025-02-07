// Detectar si estamos en local o en internet
function getServerURL() {
    const localURL = "http://127.0.0.1:5050";
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

// Función para exportar CSV
function exportCSV() {
    const serverID = getServerID();
    fetch(`${getServerURL()}/download/csv/${serverID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en exportación CSV: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${serverID}_metrics.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => console.error("Error en exportación CSV:", error));
}

// Función para exportar JSON
function exportJSON() {
    const serverID = getServerID();
    fetch(`${getServerURL()}/download/json/${serverID}`)
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
        })
        .catch(error => console.error("Error en exportación JSON:", error));
}
