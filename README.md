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

Este repositorio específico aloja el código fuente implementado en Arduino IDE para el dispositivo físico encargado de:

* Implementar un módulo de hardware embebido para la adquisición automatizada de datos térmicos y de estado del freezer, garantizando un método de lectura no intrusivo.

* Desarrollar un mecanismo de detección de fallas operativas, orientado a identificar interrupciones en el suministro eléctrico y pérdidas de conectividad de los dispositivos de campo.

* Transmitir la información recolectada de manera inalámbrica para posibilitar una visualización remota y en tiempo real.

---

## Aplicación Web – Manual de Uso

### 1. Iniciar Sesión
Los usuarios acceden a la aplicación mediante la página **/login**. Se ingresan **correo electrónico** y **contraseña**. Opcionalmente, se puede marcar **Recordarme** para mantener la sesión activa.

### 2. Dashboard (Resumen)
Una vez autenticado, el usuario es redirigido al **Dashboard** que muestra un resumen general:
- Estado actual del freezer (temperatura, conexión).
- Últimas mediciones.
- Alertas críticas recientes.

### 3. Muestras y Mediciones
- **Muestras**: listado de las muestras almacenadas, con información de identificación y rango de temperatura requerido.
- **Mediciones**: tabla de lecturas históricas (fecha/hora, temperatura, humedad). Se pueden filtrar por rango de fechas o por muestra.

### 4. Configuración del Dispositivo
En la sección **Configuración** se pueden definir parámetros del dispositivo:
- Umbrales de temperatura y humedad.
- Intervalo de envío de datos.
- Actualizar el firmware del módulo Arduino (subiendo un archivo binario).

### 5. Gestión de Usuarios
Solo usuarios con rol **Administrador** pueden:
- Crear, editar o eliminar cuentas.
- Asignar roles (Administrador, Operador, Visor).
- Restablecer contraseñas.

### 6. Alertas
El sistema genera **alertas** automáticas cuando se supera algún umbral o se pierde la conexión. En la sección **Alertas** el usuario puede:
- Ver listado de alertas activas.
- Marcar una alerta como **resuelta** (se envía notificación por email).
- Configurar canales de notificación (email, SMS).

### 7. Comunicación con el Dispositivo
El frontend se comunica con el backend vía API REST. El backend, a su vez, mantiene una conexión MQTT con el módulo Arduino instalado en el freezer. Cada medida es publicada en un tópico MQTT y el servidor la persiste en la base de datos, permitiendo su visualización en tiempo real.

### 8. Flujo de Trabajo Típico
1. El usuario inicia sesión.
2. Revisa el **Dashboard** para confirmar que el freezer está dentro de los parámetros.
3. Si hay una alerta, la inspecciona en la sección **Alertas** y toma acción (ej. ajustar temperatura, revisar conexión).
4. Consulta o exporta mediciones desde **Mediciones** para generar informes.
5. Mantiene la configuración del dispositivo al día en **Configuración**.

---

## Arquitectura del Sistema
- **Frontend**: React + InertiaJS, utiliza componentes Blade para renderizado.
- **Backend**: Laravel PHP, API REST y controlador de eventos MQTT.
- **Dispositivo**: Arduino con módulo Wi‑Fi, envía datos vía MQTT.
- **Base de datos**: MySQL para almacenar usuarios, mediciones y alertas.

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

## Notas finales
- Las colas y los schedules deben ejecutarse en producción con un proceso supervisado (por ejemplo `supervisord` o `systemd`).
- Para envíos de correos, verifica la configuración de `MAIL_` en el archivo `.env` y asegura que el servicio de correo sea accesible desde el contenedor.
- Mantén actualizado el firmware del dispositivo subiendo el binario mediante la sección **Configuración** de la web.