<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta Resuelta - FreezerGuard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .icon {
            width: 80px;
            height: 80px;
            background-color: #d1fae5;
            color: #10b981;
            border-radius: 50%;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
        }
        .icon svg {
            width: 40px;
            height: 40px;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .status {
            display: inline-block;
            background-color: #ecfdf5;
            color: #059669;
            padding: 8px 16px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .footer {
            color: #9ca3af;
            font-size: 14px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1>¡Incidencia Resuelta con Éxito!</h1>
        <div class="status">Estado: Resuelto</div>
        <p>Gracias por notificarnos la resolucion de la alerta. Hemos registrado la resolución de la incidencia en nuestra base de datos.</p>
        <p>El ciclo automático de notificaciones para este evento ha sido detenido de forma segura.</p>
        
        <div class="footer">
            FreezerGuard System &copy; {{ date('Y') }}
        </div>
    </div>
</body>
</html>
