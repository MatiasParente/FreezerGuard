# Revisión y mejoras del frontend — testing-front

Fecha: 6 de octubre de 2026. Proyecto de tesis FreezerGuard.

Se aplicaron los criterios pertinentes de las skills locales `impeccable` y `redesign-existing-projects`, ubicadas en `C:/dev/Web/.agents/skills`. La revisión incluyó dos evaluaciones independientes del código, cambios en la interfaz y comprobación visual en el navegador. `design-taste-frontend` excluye explícitamente las interfaces de producto, tablas y dashboards; sus criterios de páginas promocionales no se trasladaron a las pantallas de monitoreo.

## Hallazgos y cambios

| Prioridad | Problema observado | Resultado implementado |
| --- | --- | --- |
| Alta | El resumen podía presentar el primer dispositivo como estado de toda la instalación y mostrar valores saludables sin lecturas. | Vista de todos los dispositivos o del seleccionado, última lectura con fecha y estados explícitos de datos desconocidos. Cero grados sigue siendo un valor válido. |
| Alta | El filtro de alertas actuaba después de paginar y podía ocultar incidentes. | El servidor aplica el dispositivo antes del conteo y de la paginación; el resumen y la lista comparten el mismo alcance. |
| Alta | Las series del gráfico se identificaban por nombre, mezclando dispositivos homónimos. | Identificación por ID y etiquetas que distinguen nombres repetidos; eje temporal y datos separados por dispositivo. Las lecturas ausentes no se convierten en cero. |
| Alta | Incidentes importantes quedaban debajo del gráfico y otros datos. | Alertas pendientes y su acceso aparecen antes de la evolución de temperatura y las muestras. |
| Alta | Acordeones y filas dependían del clic; controles y diálogos carecían de nombres o asociaciones suficientes. | Botones con estado de expansión, controles nombrados, títulos de diálogo, encabezados de tabla, enlace para saltar al contenido y foco visible. Los detalles de filas tienen alternativa por teclado. |
| Media | Texto muy pequeño, controles estrechos y espacio duplicado dificultaban el uso móvil. | Tipografía mínima de 13 px para texto auxiliar, controles de al menos 44 px, navegación móvil hasta 1024 px y márgenes consistentes. Las tablas anchas conservan desplazamiento dentro de su contenedor. |
| Media | Paletas y estilos variaban entre acceso, navegación, formularios y tablas. | Azul de marca, superficies neutras y componentes compartidos. Los colores de estado acompañan etiquetas textuales. Fuente del sistema sin petición remota. |
| Media | Confirmaciones de éxito interrumpían la tarea con un modal y podían reaparecer al actualizar datos. | Mensajes en la página, accesibles y descartables, sin bloquear la operación. |
| Media | Algunos errores de formulario no eran visibles o no estaban asociados a sus campos. | Errores en línea y asociaciones accesibles en los formularios revisados. Confirmación explícita antes de modificar roles. |
| Media | El gráfico solo tenía representación visual. | Tabla equivalente de lecturas, selección accesible de dispositivos y rangos; actualización sin animaciones repetitivas. |
| Baja | Efectos, bordes y decoración competían con la información operativa. | Menos decoración y anidamiento; soporte para la preferencia de movimiento reducido. |

## Validación

- `npm run build`: compilación de producción completada.
- `npm run test:front`: 4 pruebas aprobadas sobre telemetría ausente, cero válido, dispositivos homónimos y orden/límite de lecturas.
- `php artisan test`: 31 pruebas y 112 aserciones aprobadas, incluidas dos pruebas nuevas del filtro del dashboard.
- `git diff --check`: sin errores de espacios en los cambios.
- Navegador: acceso, dashboard, muestras, alertas, mediciones, configuración y usuarios. Se comprobaron tamaños de 320, 375 y 1280 px, filtros, expansión con teclado y cancelación de diálogos. En las pantallas comprobadas no hubo desbordamiento horizontal de la página ni errores de JavaScript capturados.
- Detector de Impeccable: 7 avisos residuales revisados. Tres proceden del nombre de clases `indigo`, cuyo valor real se remapeó al azul de marca; cuatro corresponden a combinaciones de clases que el detector agrupa sin distinguir estados o reglas separadas. No se eliminaron estilos útiles solo para silenciar estos avisos.

La prueba visual empleó una base SQLite local y datos ficticios, sin envío de correo o SMS. No constituye una certificación completa de accesibilidad ni una validación del hardware, los servicios de mensajería o todas las combinaciones de permisos. Los umbrales y las políticas de alerta existentes se conservaron. La fecha de última lectura se muestra sin inventar un umbral de desconexión.

## Reproducir

Con las dependencias y el entorno Laravel configurados, ejecutar `npm run build`, `npm run test:front` y `php artisan test`. Para inspeccionar la interfaz, iniciar `php artisan serve` y acceder con un usuario local. La captura `frontend-preview.png` documenta el dashboard con datos de prueba; sus lecturas no representan equipos reales.
