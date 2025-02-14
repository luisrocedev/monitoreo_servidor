from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from flask_socketio import SocketIO
import psutil
import sqlite3
import threading
import time
import os
import json
import csv
import socket

try:
    import GPUtil  # Para monitorear GPU
except ImportError:
    GPUtil = None  # Si no está instalada, ignoramos esta parte

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

DB_FILE = "metrics.db"

# Obtener la IP pública del servidor (para detección automática de entorno)
def get_public_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except socket.error:
        return "127.0.0.1"

SERVER_IP = get_public_ip()
monitoring_active = True  # Estado inicial del monitoreo

# Crear la base de datos con soporte para múltiples servidores
def create_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        server_id TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        cpu_usage REAL,
                        cpu_temp REAL,
                        memory_usage REAL,
                        disk_usage REAL,
                        network_sent INTEGER,
                        network_received INTEGER,
                        gpu_usage REAL
                    )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS alerts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        server_id TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        type TEXT,
                        message TEXT
                    )''')

    conn.commit()
    conn.close()

create_db()  # Asegurar que las tablas existen

# WebSocket: Alternar estado de monitoreo
@socketio.on("toggle_monitoring")
def toggle_monitoring():
    global monitoring_active
    monitoring_active = not monitoring_active  # Alternar estado
    socketio.emit("monitoring_status", {"active": monitoring_active})  # Notificar a los clientes

# Función para monitorear el sistema y enviar datos en tiempo real
def collect_metrics(server_id="default_server"):
    global monitoring_active
    while True:
        if monitoring_active:
            cpu_usage = psutil.cpu_percent(interval=1)
            cpu_temp = None
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if "coretemp" in temps:
                    cpu_temp = temps["coretemp"][0].current

            memory_usage = psutil.virtual_memory().percent
            disk_usage = psutil.disk_usage('/').percent
            net_io = psutil.net_io_counters()
            network_sent = net_io.bytes_sent
            network_received = net_io.bytes_recv

            gpu_usage = None
            if GPUtil:
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu_usage = gpus[0].load * 100

            # Guardar en la base de datos
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO metrics 
                              (server_id, cpu_usage, cpu_temp, memory_usage, disk_usage, network_sent, network_received, gpu_usage) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', 
                              (server_id, cpu_usage, cpu_temp, memory_usage, disk_usage, network_sent, network_received, gpu_usage))
            conn.commit()

            # Verificar si se deben generar alertas
            if cpu_usage > 90:
                cursor.execute('''INSERT INTO alerts (server_id, type, message) VALUES (?, ?, ?)''', 
                            (server_id, "CPU", f"Uso de CPU crítico: {cpu_usage}%"))
            if memory_usage > 80:
                cursor.execute('''INSERT INTO alerts (server_id, type, message) VALUES (?, ?, ?)''', 
                            (server_id, "RAM", f"Uso de Memoria crítica: {memory_usage}%"))

            conn.commit()
            conn.close()

            # Enviar métricas en tiempo real por WebSockets
            socketio.emit('update_metrics', {
                "server_id": server_id,
                "cpu_usage": cpu_usage,
                "cpu_temp": cpu_temp if cpu_temp is not None else "N/A",
                "memory_usage": memory_usage,
                "disk_usage": disk_usage,
                "network_sent": network_sent,
                "network_received": network_received,
                "gpu_usage": gpu_usage if gpu_usage is not None else "N/A"
            })

        time.sleep(2)

# RUTA: Obtener métricas por servidor
@app.route('/history/<server_id>', methods=['GET'])
def get_history(server_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM metrics WHERE server_id = ? ORDER BY timestamp DESC LIMIT 20", (server_id,))
    rows = cursor.fetchall()
    conn.close()

    history = [
        {
            "id": row[0],
            "server_id": row[1],
            "timestamp": row[2],
            "cpu_usage": row[3],
            "cpu_temp": row[4] if row[4] is not None else "N/A",
            "memory_usage": row[5],
            "disk_usage": row[6],
            "network_sent": row[7],
            "network_received": row[8],
            "gpu_usage": row[9] if row[9] is not None else "N/A"
        }
        for row in rows
    ]

    return jsonify(history)

# RUTA: Descargar CSV de métricas por servidor
@app.route('/download/csv/<server_id>', methods=['GET'])
def download_csv(server_id):
    csv_filename = f"{server_id}_metrics_export.csv"
    print(f"Intentando crear el archivo: {csv_filename}")  # Log para depuración

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM metrics WHERE server_id = ? ORDER BY timestamp DESC", (server_id,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        print("No hay datos para exportar")  # Log para depuración
        return jsonify({"error": "No hay datos para exportar"}), 404

    try:
        with open(csv_filename, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["ID", "Server ID", "Timestamp", "CPU Usage", "CPU Temp", "Memory Usage", "Disk Usage", "Network Sent", "Network Received", "GPU Usage"])
            writer.writerows(rows)
        print(f"Archivo creado correctamente: {csv_filename}")  # Log para depuración
    except Exception as e:
        print(f"Error al crear el archivo CSV: {e}")  # Log para depuración
        return jsonify({"error": f"Error al crear el archivo CSV: {e}"}), 500

    return send_file(csv_filename, as_attachment=True)

# RUTA: Descargar JSON de métricas por servidor
@app.route('/download/json/<server_id>', methods=['GET'])
def download_json(server_id):
    json_filename = f"{server_id}_metrics_export.json"

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM metrics WHERE server_id = ? ORDER BY timestamp DESC", (server_id,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"error": "No hay datos para exportar"}), 404

    data = [
        {
            "id": row[0],
            "server_id": row[1],
            "timestamp": row[2],
            "cpu_usage": row[3],
            "cpu_temp": row[4] if row[4] is not None else "N/A",
            "memory_usage": row[5],
            "disk_usage": row[6],
            "network_sent": row[7],
            "network_received": row[8],
            "gpu_usage": row[9] if row[9] is not None else "N/A"
        }
        for row in rows
    ]

    with open(json_filename, "w") as jsonfile:
        json.dump(data, jsonfile, indent=4)

    return send_file(json_filename, as_attachment=True)

# Iniciar el hilo de recolección de métricas en segundo plano
threading.Thread(target=lambda: collect_metrics("default_server"), daemon=True).start()


# Ejecutar limpieza cada 5 minutos
def clean_old_records():
    while True:
        time.sleep(300)
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM metrics WHERE id NOT IN (SELECT id FROM metrics ORDER BY timestamp DESC LIMIT 1000)")
        conn.commit()
        conn.close()

threading.Thread(target=clean_old_records, daemon=True).start()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=6060, debug=True)


