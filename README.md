# 📍 Video Markers App

Una aplicación web para guardar marcadores de tiempo en videos (YouTube, Google Drive, etc.) con backend en Node.js y base de datos MariaDB.

![Video Markers App](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🎯 Características

- ✅ **Marcadores de tiempo precisos** para cualquier video
- ✅ **URLs inteligentes de YouTube** con timestamp automático
- ✅ **Interfaz moderna** con tema oscuro
- ✅ **API REST completa** (CRUD operations)
- ✅ **Exportar/Importar** marcadores en JSON
- ✅ **Base de datos persistente** con MariaDB
- ✅ **Dockerizado** para fácil despliegue
- ✅ **Proxy reverso Nginx** incluido

## 🚀 Demo

### Funcionalidades principales:
- **Guardar marcadores**: Título, URL, tiempo específico y notas
- **Formatos de tiempo flexibles**: `29:34`, `1:29:34`, o `1794` segundos
- **Enlaces directos**: Para YouTube se abre en el momento exacto
- **Gestión completa**: Crear, editar, eliminar marcadores
- **Backup/Restore**: Exportar e importar datos

## 📋 Requisitos

- Node.js 18+
- MariaDB 10.11+
- Docker & Docker Compose (para despliegue con contenedores)

## 🛠️ Instalación

### Opción 1: Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/danimardo/video-markers-app.git
cd video-markers-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos

# Iniciar aplicación
npm start
```

### Opción 2: Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/danimardo/videos-luis.git
cd videos-luis

# Configurar variables de entorno
cp .env.example .env

# Despliegue estándar
docker-compose up -d

# O para producción con Nginx
docker-compose --profile production up -d
```

## 🔧 Configuración

### Variables de Entorno (.env)

```bash
# Database Configuration
DB_HOST=localhost          # o 'database' para Docker
DB_USER=appuser
DB_PASSWORD=tu_password
DB_NAME=video_markers
DB_ROOT_PASSWORD=root_password

# Application Configuration
SERVER_PORT=3011
NODE_ENV=development       # o 'production'

# Docker Ports (solo para Docker)
APP_PORT=3011
NGINX_PORT=80
NGINX_SSL_PORT=443
```

## 📚 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/markers` | Obtener todos los marcadores |
| `POST` | `/markers` | Crear nuevo marcador |
| `PUT` | `/markers/:id` | Actualizar marcador |
| `DELETE` | `/markers/:id` | Eliminar marcador |

### Ejemplo de Marcador:

```json
{
  "id": "marker_1692123456789_abc123",
  "title": "Tutorial Docker - Introducción",
  "url": "https://www.youtube.com/watch?v=3c-iBn73dDE",
  "seconds": 300,
  "note": "Explicación de contenedores",
  "created": "2024-08-17T10:30:00.000Z"
}
```

## 🐳 Docker

### Servicios Incluidos:

- **app**: Aplicación Node.js (Puerto 3011)
- **database**: MariaDB 10.11 (Puerto 3306)
- **nginx**: Proxy reverso con SSL (Puertos 80/443)

### Comandos Docker:

```bash
# Despliegue estándar
docker-compose up -d

# Despliegue producción (con Nginx)
docker-compose --profile production up -d

# Ver logs
docker-compose logs -f

# Estado de servicios
docker-compose ps

# Parar servicios
docker-compose down

# Reconstruir y desplegar
docker-compose build --no-cache
docker-compose up -d
```

## 📁 Estructura del Proyecto

```
video-markers-app/
├── 📄 server.js              # Servidor Express principal
├── 📄 database.js            # Configuración de MariaDB
├── 📄 package.json           # Dependencias Node.js
├── 📁 public/                # Frontend
│   ├── 📄 index.html         # Interfaz principal
│   └── 📄 app.js             # Lógica del frontend
├── 🐳 Dockerfile             # Imagen Docker
├── 🐳 docker-compose.yml     # Orquestación Docker
├── 📁 nginx/                 # Configuración Nginx
├── 📁 init-db/               # Scripts de inicialización DB
└── 📄 deploy.sh              # Script de despliegue
```

## 🎨 Capturas de Pantalla

### Interfaz Principal
- Formulario para crear marcadores
- Lista de marcadores guardados
- Botones de exportar/importar
- Tema oscuro moderno

### Características de la UI
- **Responsive**: Funciona en móviles y escritorio
- **Validación**: Formatos de tiempo flexibles
- **Feedback**: Mensajes de éxito/error
- **Accesibilidad**: Controles keyboard-friendly

## 🔒 Seguridad

- ✅ **Usuarios no-root** en contenedores Docker
- ✅ **Variables de entorno** para credenciales
- ✅ **Rate limiting** en Nginx
- ✅ **Health checks** automáticos
- ✅ **Red interna** aislada entre servicios
- ✅ **SSL/TLS ready** para producción

## 🚀 Despliegue en Producción

### Con Docker (Recomendado):

1. **Configurar servidor**:
   ```bash
   # Instalar Docker y Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Clonar y configurar**:
   ```bash
   git clone https://github.com/danimardo/video-markers-app.git
   cd video-markers-app
   cp .env.example .env
   # Editar .env con configuraciones de producción
   ```

3. **Desplegar**:
   ```bash
   ./deploy.sh deploy production
   ```

### SSL/HTTPS:
- Colocar certificados en `nginx/ssl/`
- Descomentar configuración HTTPS en `nginx/nginx.conf`
- Configurar dominio en variables de entorno

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Casos de Uso

- **📚 Estudiantes**: Marcar momentos importantes en videos educativos
- **🔬 Investigadores**: Referencias temporales en documentales
- **💼 Profesionales**: Secciones relevantes en capacitaciones
- **🎬 Creadores**: Organizar contenido de video
- **📖 Autodidactas**: Seguimiento de progreso en cursos online

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Base de Datos**: MariaDB
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Containerización**: Docker, Docker Compose
- **Proxy**: Nginx
- **Deployment**: Shell scripts automatizados

## 📊 Roadmap

- [ ] Autenticación de usuarios
- [ ] Categorías y etiquetas
- [ ] Búsqueda avanzada
- [ ] API de integración
- [ ] App móvil
- [ ] Sincronización en la nube

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**danimardo**
- GitHub: [@danimardo](https://github.com/danimardo)

## 🙏 Agradecimientos

- Comunidad de Node.js
- Documentación de Docker
- Iconos de la interfaz

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
