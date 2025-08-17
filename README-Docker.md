# 🐳 Video Markers App - Docker Deployment

Esta guía te ayudará a desplegar la aplicación Video Markers usando Docker y Docker Compose en cualquier servidor.

## 📋 Requisitos Previos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Al menos 1GB de RAM libre
- Puerto 3011 disponible (o configurar otro)

## 🚀 Despliegue Rápido

### 1. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd video-markers-app

# Copiar y configurar variables de entorno
cp .env.example .env
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env` con tus configuraciones:

```bash
# Database Configuration
DB_HOST=database
DB_USER=appuser
DB_PASSWORD=tu_password_seguro_aqui
DB_NAME=video_markers
DB_ROOT_PASSWORD=tu_root_password_aqui

# Application Configuration
SERVER_PORT=3011
NODE_ENV=production

# Docker Compose Ports
APP_PORT=3011
NGINX_PORT=80
NGINX_SSL_PORT=443
```

### 3. Levantar los Servicios

```bash
# Desarrollo/Testing (sin Nginx)
docker-compose up -d

# Producción (con Nginx)
docker-compose --profile production up -d
```

### 4. Verificar el Despliegue

```bash
# Ver logs
docker-compose logs -f

# Verificar estado de los contenedores
docker-compose ps

# Probar la aplicación
curl http://localhost:3011/markers
```

## 🔧 Configuraciones Avanzadas

### Configuración de Nginx para Producción

1. **Configurar SSL** (opcional):
   ```bash
   mkdir -p nginx/ssl
   # Copiar tus certificados SSL a nginx/ssl/
   ```

2. **Editar nginx.conf** para tu dominio:
   ```nginx
   server_name tu-dominio.com;
   ssl_certificate /etc/nginx/ssl/cert.pem;
   ssl_certificate_key /etc/nginx/ssl/key.pem;
   ```

### Backup de la Base de Datos

```bash
# Crear backup
docker-compose exec database mysqldump -u root -p video_markers > backup.sql

# Restaurar backup
docker-compose exec -T database mysql -u root -p video_markers < backup.sql
```

### Escalado y Monitoreo

```bash
# Escalar la aplicación (múltiples instancias)
docker-compose up -d --scale app=3

# Ver métricas de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f app
```

## 📁 Estructura de Archivos Docker

```
video-markers-app/
├── Dockerfile              # Imagen de la aplicación
├── docker-compose.yml      # Orquestación de servicios
├── .env.example            # Variables de entorno de ejemplo
├── .dockerignore           # Archivos excluidos del build
├── nginx/
│   └── nginx.conf          # Configuración del proxy reverso
└── init-db/
    └── 01-init.sql         # Script de inicialización de BD
```

## 🌐 Servicios Incluidos

### 1. **app** - Aplicación Node.js
- **Puerto**: 3011
- **Health Check**: GET /markers
- **Restart Policy**: unless-stopped

### 2. **database** - MariaDB 10.11
- **Puerto**: 3306
- **Volumen Persistente**: db_data
- **Health Check**: MariaDB internal

### 3. **nginx** - Proxy Reverso (Opcional)
- **Puertos**: 80, 443
- **Rate Limiting**: Configurado
- **Gzip**: Habilitado

## 🔒 Seguridad

### Configuraciones Implementadas:
- ✅ Usuario no-root en contenedores
- ✅ Health checks para todos los servicios
- ✅ Rate limiting en Nginx
- ✅ Variables de entorno para credenciales
- ✅ Red interna aislada
- ✅ Volúmenes persistentes

### Recomendaciones Adicionales:
- Cambiar todas las contraseñas por defecto
- Configurar SSL/TLS en producción
- Implementar backup automático
- Monitorear logs regularmente

## 🛠️ Comandos Útiles

```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs de un servicio específico
docker-compose logs -f app

# Ejecutar comandos en contenedores
docker-compose exec app sh
docker-compose exec database mysql -u root -p

# Actualizar la aplicación
git pull
docker-compose build app
docker-compose up -d app
```

## 🚨 Troubleshooting

### Problemas Comunes:

1. **Puerto ocupado**:
   ```bash
   # Cambiar APP_PORT en .env
   APP_PORT=3012
   ```

2. **Error de conexión a BD**:
   ```bash
   # Verificar logs de la base de datos
   docker-compose logs database
   ```

3. **Aplicación no responde**:
   ```bash
   # Verificar health checks
   docker-compose ps
   docker-compose logs app
   ```

4. **Problemas de permisos**:
   ```bash
   # Reconstruir con permisos correctos
   docker-compose build --no-cache
   ```

## 📊 Monitoreo

### Métricas Básicas:
```bash
# Uso de recursos
docker stats

# Espacio en disco
docker system df

# Logs de aplicación
docker-compose logs --tail=100 app
```

### Health Checks:
- **App**: `http://localhost:3011/markers`
- **Database**: Internal MariaDB health check
- **Nginx**: `http://localhost/health`

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# 1. Hacer backup
docker-compose exec database mysqldump -u root -p video_markers > backup-$(date +%Y%m%d).sql

# 2. Actualizar código
git pull

# 3. Reconstruir y desplegar
docker-compose build app
docker-compose up -d app

# 4. Verificar
docker-compose logs -f app
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración: `docker-compose config`
3. Consulta la documentación de Docker Compose
