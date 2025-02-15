import os
import time
import requests

IP_OBJETIVO = "8.8.8.8"
API_ENDPOINT = "http://localhost:6060/api/monitor/ip"
INTERVALO_SEGUNDOS = 60

def hacer_ping(ip):
    return os.system(f"ping -c 1 {ip} > /dev/null 2>&1") == 0

def enviar_estado(ip, estado):
    datos = {"ip": ip, "estado": "activo" if estado else "inactivo"}
    try:
        response = requests.post(API_ENDPOINT, json=datos)
        if response.status_code == 200:
            print(f"Estado enviado: {datos}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error al conectar con el backend: {e}")

if __name__ == "__main__":
    while True:
        estado = hacer_ping(IP_OBJETIVO)
        enviar_estado(IP_OBJETIVO, estado)
        time.sleep(INTERVALO_SEGUNDOS)
