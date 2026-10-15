## FreezerGuard

Este repositorio alberga el código fuente de la aplicación web del proyecto FreezerGuard. El proyecto constituye el trabajo final de grado para la carrera de **Tecnólogo Informático** de la **Universidad Tecnológica (UTEC)**, en conjunto con la **Universidad de la República (UDELAR)** y la **Dirección General de Educación Técnico Profesional (DGETP-UTU)**, Sede Paysandú, Uruguay.

---

## Información del Proyecto

* **Institución:** Universidad Tecnológica (UTEC) - Sede Paysandú


* **Carrera:** Tecnólogo Informático


* **Autores:** Carlos Cardozo, Jhon Guimaraens, Matías Parente


* **Tutores:** Sonia Rocha, Marcelo Scotto

---

## Descripción General

En contextos de investigación académica y profesional, la preservación de muestras biológicas y químicas se apoya en el control de ciertas variables ambientales. En entornos de laboratorios, las mencionadas muestras se deben mantener bajo estrictos rangos de temperatura y condiciones de almacenamiento controladas, resultando esto necesario para garantizar la integridad del material, y en consecuencia, la validez y continuidad de las investigaciones.

Ante las deficiencias de comunicación que presenta el equipamiento actual y la necesidad crítica de resguardar las investigaciones de la sede, se evidencia una clara oportunidad para el desarrollo de este proyecto final de carrera. La vulnerabilidad identificada y el riesgo sobre la posible pérdida del material justifican la intervención técnica.

**FreezerGuard** implementa:

* Un módulo de hardware embebido (ESP32) para la adquisición automatizada de datos térmicos y de estado del freezer, garantizando un método de lectura no intrusivo.
* Un mecanismo de detección de fallas operativas, orientado a identificar interrupciones en el suministro eléctrico y pérdidas de conectividad de los dispositivos de campo.
* Transmisión inalámbrica de la información recolectada para posibilitar una visualización remota y en tiempo real.
* Notificaciones automáticas por correo electrónico y SMS ante alertas críticas.

---

## Capturas de Pantalla

### Inicio de Sesión
![Inicio de Sesión](imagenes/Iniciar%20sesion.PNG)

### Panel de Control (Dashboard)
![Tarjetas métricas del Dashboard](imagenes/cajas.PNG)

### Gráfico de Monitoreo en Tiempo Real
![Gráfico en Tiempo Real](imagenes/grafica.PNG)

### Muestras por Vencer
![Acordeón de Muestras por Vencer](imagenes/vencimiento.PNG)

### Alertas del Dashboard
![Alertas Recientes](imagenes/alertas%20dashboard.PNG)

### Historial de Mediciones
![Historial de Mediciones](imagenes/mediciones.PNG)

### Configuración de Dispositivos
![Configuración de Dispositivos](imagenes/configuracion.PNG)

### Configurar Dispositivo Individual
![Modal de Configuración de Dispositivo](imagenes/configurar%20dispositivo.PNG)

---

## Funcionalidades Principales

### Dashboard en Tiempo Real
- **Tarjetas métricas** con temperatura actual, estado eléctrico y canales de alerta.
- **Gráfico interactivo** con actualización automática cada 4 segundos.
- **Muestras por vencer** organizadas por urgencia (vencidas, próximas, vigentes).
- **Alertas recientes** con indicador de pendientes.
- **Selector de dispositivo** para filtrar todas las métricas por freezer.

### Gestión de Muestras
- Registro de muestras con rangos térmicos, vencimiento y freezer asignado.
- Asignación de docentes responsables y alumnos participantes.
- Indicador visual de riesgo cuando un freezer tiene fallas.
- Inhabilitación lógica, historial de inactivas y restauración.
- **Notificación por correo** automática al asignar un docente a una muestra.

### Centro de Alertas
- Alertas automáticas por temperatura fuera de rango, corte de energía, vencimiento, inactividad y fallo del módulo SMS.
- Resolución remota vía enlace seguro por correo electrónico.
- Bitácora de observaciones por cada incidente.

### Sedes y Laboratorios
- Organización jerárquica: Sedes → Laboratorios → Freezers.
- Asignación de freezers a laboratorios específicos.
- Gestión de participantes de muestras (alumnos sin acceso al sistema).
- **Notificación por correo** al asignar un usuario a una sede.
- Control de acceso por sede (cada usuario solo ve los datos de sus sedes asignadas).

### Gestión de Usuarios
- Creación de usuarios con envío automático de credenciales por correo.
- Roles: Docente (usuario estándar) y Administrador General.
- Restablecimiento de contraseñas con notificación por email.
- Baja lógica, historial de inactivos y restauración.
- Asignación de sedes con notificación automática.

### Configuración de Dispositivos y Notificaciones
- Registro y parametrización de placas ESP32.
- Configuración de umbrales, teléfonos SMS y disparadores de alerta por dispositivo.
- **Prueba de SMS** individual desde la configuración de cada dispositivo.
- Plantillas personalizables para correos y SMS de alerta con variables dinámicas.
- Canales de despacho configurables (Email y SMS) con activación/desactivación global.

### Notificaciones por Correo Electrónico
El sistema envía correos automáticos en los siguientes eventos:
- **Creación de usuario:** Credenciales de acceso con botón directo para iniciar sesión.
- **Restablecimiento de contraseña:** Nueva contraseña con acceso directo a la plataforma.
- **Asignación a sede:** Notificación al usuario con las sedes asignadas.
- **Asignación a muestra:** Notificación al docente con detalles de la muestra (título, freezer, rango térmico, vencimiento).
- **Alertas críticas:** Correo con detalle del incidente y enlace de resolución remota.

---

## Arquitectura del Sistema
- **Frontend**: React + InertiaJS con Tailwind CSS.
- **Backend**: Laravel (PHP), controladores RESTful con Inertia.
- **Dispositivo**: ESP32 con sensores de temperatura y detección de red 220V, módulo SIM800L para SMS.
- **Base de datos**: PostgreSQL (Supabase) / SQLite para desarrollo local.
- **Correos**: Configuración SMTP (Gmail, Mailtrap, etc.) con plantillas Blade Markdown.

---

## Instalación Local (Desarrollo)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/MatiasParente/FreezerGuard.git
   cd FreezerGuard
   ```
2. **Instalar dependencias PHP** (requiere Composer)
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
   Edita el archivo `.env` y configura la base de datos local (por ejemplo MySQL).
3. **Instalar dependencias JavaScript** (requiere Node.js >= 18 y npm)
   ```bash
   npm install
   ```
4. **Compilar assets**
   ```bash
   npm run dev
   ```
5. **Migrar y sembrar la base de datos**
   ```bash
   php artisan migrate --seed
   ```
6. **Ejecutar el servidor de desarrollo**
   ```bash
   php artisan serve
   ```
   La aplicación estará disponible en `http://127.0.0.1:8000`.
7. **Colas y Schedules**
   - Para procesar trabajos en cola (p.ej. envío de correos) ejecuta:
     ```bash
     php artisan queue:work
     ```
   - Para activar los schedules (tareas programadas) ejecuta:
     ```bash
     php artisan schedule:work
     ```
   Puedes combinar ambos en un solo proceso con Supervisor o similar en producción.

---

## Despliegue en Producción (servidorMP)

### 2.1 Requisitos Previos
- **Git**
- **Docker & Docker Compose**
- **Tailscale** (opcional pero recomendado para acceso interno seguro)

### 2.2 Obtención del código y respaldos
1. Clonar el repositorio del servidor principal:
   ```bash
   git clone https://github.com/MatiasParente/servidorMP.git
   ```
2. Clonar este proyecto dentro de `proyectos/` del servidor:
   ```bash
   git clone https://github.com/MatiasParente/FreezerGuard.git proyectos/FreezerGuard
   ```
3. (Opcional) Copiar backups a `backups/` según sea necesario.

### 2.3 Configuración de variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con los valores de tu entorno (TZ, TAILNET_DOMAIN, DB credentials, MQTT, etc.).

### 2.4 Construcción y despliegue de contenedores
```bash
# Construir la imagen de FreezerGuard
docker build -t freezerguard:local -f docker/freezerguard/Dockerfile ./proyectos/FreezerGuard

# Levantar toda la infraestructura
docker compose up -d
```

### 2.5 Configuración de red y acceso
1. **Tailscale**
   ```bash
   docker exec -it vps_tailscale tailscale up
   ```
2. **Nginx Proxy Manager**
   - Acceder a `https://$TAILNET_DOMAIN`
   - Crear un Proxy Host que apunte a `vps_freezerguard_nginx:80`
   - Habilitar SSL con Let's Encrypt o certificado de Cloudflare.

### 2.6 DNS en Cloudflare
   - Crear registro `A` para `freezerguard.tudominio.com` apuntando a la IP pública del servidor.
   - Configurar el Proxy en Nginx Proxy Manager como se indicó.

### 2.7 Verificación
Abre en el navegador la URL configurada, por ejemplo:
```
https://freezerguard.tudominio.com
```
Deberías ver la pantalla de login de la aplicación.

---

## Documentación Completa

Para una guía detallada de todas las funcionalidades con capturas de pantalla, consulta el [Manual de Uso](MANUAL_DE_USO.md).

---

## Notas finales
- Las colas y los schedules deben ejecutarse en producción con un proceso supervisado (por ejemplo `supervisord` o `systemd`).
- Para envíos de correos, verifica la configuración de `MAIL_` en el archivo `.env` y asegura que el servicio de correo sea accesible desde el contenedor.
- Mantén actualizado el firmware del dispositivo subiendo el binario mediante la sección **Configuración** de la web.