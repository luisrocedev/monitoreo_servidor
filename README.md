# Monitoreo de Servidor

## 📌 Descripción
**Monitoreo de Servidor** es una aplicación para monitorear métricas de servidores locales o en la nube en tiempo real. Utiliza **Flask, WebSockets, SQLite y Chart.js** para proporcionar un dashboard interactivo con gráficos dinámicos y alertas automáticas.

## 🚀 Características Principales
- **Monitoreo en Tiempo Real** de CPU, RAM, Disco, Red y GPU (si está disponible).
- **Almacenamiento de Métricas** en una base de datos SQLite (`metrics.db`).
- **Historial de Métricas** con gráficos interactivos y filtros de fecha.
- **Sistema de Alertas** para detectar problemas en el servidor.
- **Exportación de Datos** en formato CSV y JSON.
- **WebSockets** para actualización en vivo sin recargar la página.

---

## 🔧 Instalación y Configuración
### **Requisitos**
- Python 3.8+
- PHP 7.4+
- Servidor web (Apache, Nginx o similar)
- Dependencias de Python:
  ```bash
  pip install flask flask-cors flask-socketio psutil sqlite3
  ```

### **Cómo Ejecutar el Backend**
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu_usuario/monitoreo_servidor.git
   cd monitoreo_servidor/backend
   ```

2. Iniciar el servidor Flask:
   ```bash
   python server_monitor.py
   ```

### **Cómo Acceder al Frontend**
1. Asegúrate de que el backend esté corriendo.
2. Coloca la carpeta `frontend/` en un servidor web local.
3. Abre en el navegador:
   ```
   http://localhost/frontend/index.php
   ```

## 📡 Endpoints de la API
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | `/metrics` | Obtiene métricas en tiempo real |
| GET | `/alert_history` | Devuelve el historial de alertas |
| GET | `/download/csv/<server_id>` | Exporta métricas en CSV |
| GET | `/download/json/<server_id>` | Exporta métricas en JSON |


## 🛠️ Mejoras Futuras
- ✅ Dashboard más avanzado con más opciones de personalización.
- ✅ Soporte para múltiples servidores con identificación única.
- ✅ Implementación de autenticación para usuarios.

---

## 📜 Documentación del Proyecto

Si deseas revisar el código fuente o contribuir al desarrollo:

📌 **Repositorio del Proyecto:** [[https://github.com/luisrocedev/darkorange](https://github.com/luisrocedev/monitoreo_servidor)]  

---

## 👨‍💻 Contacto

Si tienes preguntas o sugerencias, ¡contáctame en **LinkedIn** o revisa mi **GitHub**! 🚀

