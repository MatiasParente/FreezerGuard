#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// ============================================================
// CONFIGURACIÓN GENERAL
// ============================================================

const char* WIFI_SSID = "DispositivosIOT";
const char* WIFI_PASSWORD = "IOT_UTEC.-";

const char* SERVER_URL = "https://tip-proymf26.tipyenaccion.net/api/telemetry";
const char* API_KEY = "fg_sec_9nQBt2sF1bLJAEGlR";

const int DEVICE_ID = 1;

// ============================================================
// MODEM A7670G
// ============================================================

#define MODEM_RX 16
#define MODEM_TX 17

const int PIN_PWRKEY_MODEM = 4;

// Número obtenido dinámicamente desde el servidor
String NUMERO_DESTINO_SMS = "";

HardwareSerial modem(2);

bool modemOk = false;

// ============================================================
// PINES DE HARDWARE
// ============================================================

const int PIN_DS18B20 = 21;
const int PIN_DETECTOR = 22;

const int LED_VERDE = 5;
const int LED_ROJO = 19;
const int PIN_BUZZER = 23;

// Lógica 4N25 con INPUT_PULLUP:
// HIGH = transistor abierto (Corte de corriente / operando en batería)
// LOW  = transistor conduciendo (Corriente de red activa)
const int VALOR_CORTE = HIGH;

// ============================================================
// CONFIGURACIÓN RECIBIDA DEL SERVIDOR
// ============================================================

float temp_min_segura = -25.0;
float temp_max_segura = -10.0;

bool alerta_temperatura_activa = true;
bool alerta_bateria_activa = true;
bool alerta_vencimiento_activa = true;
bool alerta_modem_activa = true;
bool envio_sms_activo = true; // Interruptor general de SMS recibido del backend

String plantilla_sms_cuerpo = "ALERTA FREEZERGUARD: Se detectó {tipo_alerta} en {dispositivo}. Temp: {temperatura} C.";

int intervalo_telemetria = 5;

// ============================================================
// TEMPORIZADORES Y ANTI-SPAM (PROTECCIÓN DE SIM)
// ============================================================

unsigned long previoMillis = 0;
unsigned long previoBuzzerMillis = 0;
unsigned long previoImpresion = 0;
unsigned long previoLecturaTemp = 0;
unsigned long previoModemCheck = 0;

// Cooldown de envío de SMS para alertas periódicas/temperatura
unsigned long ultimoEnvioSMS = 0;
const unsigned long COOLDOWN_SMS_MS = 60000; // 60 segundos mínimos entre SMS generales
const unsigned long INTERVALO_MODEM_CHECK_MS = 60000; // Health check del módem cada 60s

// Debounce del detector 4N25 (aumentado a 2500ms para evitar falsos positivos por capacitores de fuente)
unsigned long ultimoCambioDetector = 0;
int ultimoEstadoLectura = LOW;
const unsigned long TIEMPO_DEBOUNCE_CORTE_MS = 2500; // 2.5 segundos de estabilidad requeridos

bool estadoBuzzer = false;

// ============================================================
// ESTADO DEL DISPOSITIVO
// ============================================================

float temperaturaActual = 0.0;
float ultimaLecturaValidaTemp = 0.0;
int lecturasFallidasTemp = 0;

bool enBateriaEnclavado = false;
bool estadoBateriaAnterior = false;
bool alertaTempSMSActiva = false; // Estado para controlar disparo de SMS por temperatura

// ============================================================
// SENSOR DE TEMPERATURA
// ============================================================

OneWire oneWire(PIN_DS18B20);
DallasTemperature sensors(&oneWire);

// ============================================================
// FUNCIONES AUXILIARES DEL MÓDEM
// ============================================================

void limpiarBufferModem() {
    while (modem.available()) {
        modem.read();
    }
}

// ------------------------------------------------------------

bool esperarRespuesta(
    const String& respuestaOK,
    const String& respuestaError,
    unsigned long timeout
) {
    unsigned long inicio = millis();
    String respuesta = "";

    while (millis() - inicio < timeout) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;
            Serial.write(c);

            if (respuesta.indexOf(respuestaOK) >= 0) {
                return true;
            }

            if (respuestaError.length() > 0 && respuesta.indexOf(respuestaError) >= 0) {
                return false;
            }
        }
        delay(5); // Previene sobrecarga de CPU y Watchdog Reset (WDT)
    }

    return false;
}

// ------------------------------------------------------------

bool enviarAT(
    const String& comando,
    const String& respuestaOK = "OK",
    unsigned long timeout = 3000
) {
    limpiarBufferModem();

    Serial.print("[MODEM] >> ");
    Serial.println(comando);

    modem.println(comando);

    return esperarRespuesta(respuestaOK, "ERROR", timeout);
}

// ============================================================
// GENERAR MENSAJE CON PLANTILLA DE LA PÁGINA WEB
// ============================================================

String generarMensajeSMS(String tipoAlerta) {
    if (plantilla_sms_cuerpo.length() == 0) {
        return "FREEZERGUARD: " + tipoAlerta + ". Temp: " + String(temperaturaActual, 1) + " C";
    }

    String msg = plantilla_sms_cuerpo;
    msg.replace("{tipo_alerta}", tipoAlerta);
    msg.replace("{dispositivo}", "Dispositivo #" + String(DEVICE_ID));
    msg.replace("{freezer}", "Freezer #" + String(DEVICE_ID));
    msg.replace("{temperatura}", String(temperaturaActual, 1));
    msg.replace("{fecha}", "Ahora");

    return msg;
}

// ============================================================
// VERIFICACIÓN DEL MÓDEM
// ============================================================

bool verificarModemAT() {
    limpiarBufferModem();
    modem.println("AT");

    unsigned long inicio = millis();
    String respuesta = "";

    while (millis() - inicio < 2000) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;

            if (respuesta.indexOf("OK") >= 0) {
                return true;
            }
        }
        delay(5);
    }

    return false;
}

// ============================================================
// VERIFICACIÓN DE SIM
// ============================================================

bool verificarSIM() {
    limpiarBufferModem();
    modem.println("AT+CPIN?");

    unsigned long inicio = millis();
    String respuesta = "";

    while (millis() - inicio < 3000) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;
            Serial.write(c);

            if (respuesta.indexOf("+CPIN: READY") >= 0) {
                return true;
            }

            if (respuesta.indexOf("ERROR") >= 0) {
                return false;
            }
        }
        delay(5);
    }

    return false;
}

// ============================================================
// VERIFICACIÓN DE RED
// ============================================================

bool verificarRed() {
    limpiarBufferModem();
    modem.println("AT+CEREG?");

    unsigned long inicio = millis();
    String respuesta = "";

    while (millis() - inicio < 3000) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;
            Serial.write(c);

            // Registrado en red local o roaming
            if (respuesta.indexOf("+CEREG: 0,1") >= 0 ||
                respuesta.indexOf("+CEREG: 1,1") >= 0 ||
                respuesta.indexOf("+CEREG: 0,5") >= 0 ||
                respuesta.indexOf("+CEREG: 1,5") >= 0) {
                return true;
            }
        }
        delay(5);
    }

    return false;
}

// ============================================================
// CONSULTAR SALDO DE LA SIM (VÍA USSD O SMS AL 226 / 611)
// ============================================================

bool consultarSaldoSIM(const String& numeroConsulta = "226") {
    if (!modemOk) {
        Serial.println("[SALDO] Módem no disponible para consultar saldo.");
        return false;
    }

    Serial.println();
    Serial.println("========================================");
    Serial.println("CONSULTANDO SALDO DE LA SIM");
    Serial.println("========================================");

    // Intento 1: Comando USSD al servicio (ej: *226# o *611#)
    String comandoUSSD = "AT+CUSD=1,\"*" + numeroConsulta + "#\",15";
    Serial.print("[SALDO] Enviando comando USSD: ");
    Serial.println(comandoUSSD);

    limpiarBufferModem();
    modem.println(comandoUSSD);

    unsigned long inicio = millis();
    String respuesta = "";
    bool ussdOk = false;

    while (millis() - inicio < 8000) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;
            Serial.write(c);

            if (respuesta.indexOf("+CUSD:") >= 0) {
                ussdOk = true;
                break;
            }
        }
        if (ussdOk) break;
        delay(10);
    }

    if (ussdOk) {
        Serial.println("\n[SALDO] ¡Respuesta USSD recibida con éxito!");
        return true;
    }

    // Intento 2: Enviar SMS de consulta "SALDO" al número 226 / 611
    Serial.println("\n[SALDO] Intentando consulta vía SMS al " + numeroConsulta + "...");
    String tempDestino = NUMERO_DESTINO_SMS;
    NUMERO_DESTINO_SMS = numeroConsulta;
    bool smsEnviado = enviarSMS("SALDO", true, true);
    NUMERO_DESTINO_SMS = tempDestino;

    return smsEnviado;
}

// ============================================================
// HEALTH CHECK DEL MÓDEM (CADA 60 SEGUNDOS, FUERA DE TELEMETRÍA)
// ============================================================

void verificarSaludModem() {
    if (millis() - previoModemCheck < INTERVALO_MODEM_CHECK_MS && previoModemCheck != 0) {
        return;
    }
    previoModemCheck = millis();

    if (modemOk) {
        if (!verificarModemAT()) {
            Serial.println("[MODEM] Health Check: dejó de responder a AT.");
            modemOk = false;
        }
    } else {
        // Intento de auto-recuperación si vuelve a responder AT
        if (verificarModemAT() && verificarSIM()) {
            enviarAT("AT+CMGF=1");
            Serial.println("[MODEM] Health Check: Módem recuperado.");
            modemOk = true;
        }
    }
}

// ============================================================
// INICIALIZACIÓN DEL MÓDEM
// ============================================================

bool inicializarModemSMS() {
    Serial.println();
    Serial.println("========================================");
    Serial.println("INICIALIZANDO MODEM A7670G");
    Serial.println("========================================");

    modem.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
    delay(500);

    // Encendido mediante pulso PWRKEY
    pinMode(PIN_PWRKEY_MODEM, OUTPUT);

    digitalWrite(PIN_PWRKEY_MODEM, HIGH);
    delay(100);

    digitalWrite(PIN_PWRKEY_MODEM, LOW);
    delay(1500);

    digitalWrite(PIN_PWRKEY_MODEM, HIGH);

    Serial.println("[MODEM] Esperando arranque...");
    delay(5000);

    bool conectado = false;

    for (int intento = 1; intento <= 5; intento++) {
        Serial.print("[MODEM] AT intento ");
        Serial.print(intento);
        Serial.println("/5");

        if (verificarModemAT()) {
            conectado = true;
            break;
        }

        delay(1000);
    }

    if (!conectado) {
        Serial.println("[MODEM] ERROR: no responde a AT.");
        modemOk = false;
        return false;
    }

    Serial.println("[MODEM] Comunicación AT OK.");

    Serial.println("[MODEM] Verificando SIM...");
    if (!verificarSIM()) {
        Serial.println("[MODEM] ERROR: SIM no disponible o bloqueada.");
        modemOk = false;
        return false;
    }
    Serial.println("[MODEM] SIM OK.");

    Serial.println("[MODEM] Verificando registro en red...");
    if (!verificarRed()) {
        Serial.println("[MODEM] ADVERTENCIA: aún no registrado en red celular.");
    } else {
        Serial.println("[MODEM] Red registrada.");
    }

    if (!enviarAT("AT+CMGF=1")) {
        Serial.println("[MODEM] ERROR configurando modo SMS (AT+CMGF=1).");
        modemOk = false;
        return false;
    }

    Serial.println("[MODEM] Modo SMS configurado.");
    modemOk = true;
    previoModemCheck = millis();
    Serial.println("[MODEM] Inicialización completada con éxito.");

    return true;
}

// ============================================================
// ENVÍO DE SMS (CON PROTECCIÓN ANTI-BLOQUEO SIM Y PRIORIZACIÓN)
// ============================================================

bool enviarSMS(const String& mensaje, bool esEventoPrioritario = false, bool esPrueba = false) {
    if (!modemOk) {
        // Intento rápido de recuperación antes de cancelar
        if (verificarModemAT() && verificarSIM()) {
            enviarAT("AT+CMGF=1");
            modemOk = true;
        } else {
            Serial.println("[SMS] No se envía: módem no disponible.");
            return false;
        }
    }

    if (!envio_sms_activo && !esPrueba) {
        Serial.println("[SMS] No se envía: el envío de SMS está desactivado en el servidor.");
        return false;
    }

    if (NUMERO_DESTINO_SMS.length() < 3) {
        Serial.println("[SMS] No se envía: número de destino inválido o no recibido del servidor.");
        return false;
    }

    // --------------------------------------------------------
    // PROTECCIÓN DE SIM: Cooldown de tiempo (Se salta en eventos de corte/restauración y pruebas)
    // --------------------------------------------------------
    unsigned long ahora = millis();
    if (!esPrueba && !esEventoPrioritario && (ahora - ultimoEnvioSMS < COOLDOWN_SMS_MS) && ultimoEnvioSMS != 0) {
        Serial.print("[SMS] PROTECCIÓN SIM: Cooldown activo. Omitiendo envío. Debe esperar ");
        Serial.print((COOLDOWN_SMS_MS - (ahora - ultimoEnvioSMS)) / 1000);
        Serial.println(" segundos.");
        return false;
    }

    Serial.println();
    Serial.println("========================================");
    Serial.println("ENVIANDO SMS");
    Serial.println("========================================");
    Serial.print("[SMS] Destino: "); Serial.println(NUMERO_DESTINO_SMS);
    Serial.print("[SMS] Mensaje: "); Serial.println(mensaje);

    if (!verificarModemAT()) {
        Serial.println("[SMS] ERROR: módem no responde a AT.");
        modemOk = false;
        return false;
    }

    if (!enviarAT("AT+CMGF=1")) {
        Serial.println("[SMS] ERROR configurando modo texto.");
        modemOk = false;
        return false;
    }

    limpiarBufferModem();
    String comando = "AT+CMGS=\"" + NUMERO_DESTINO_SMS + "\"";
    Serial.print("[MODEM] >> "); Serial.println(comando);
    modem.println(comando);

    // Esperar prompt ">"
    unsigned long inicioPrompt = millis();
    bool promptRecibido = false;
    String respuestaPrompt = "";

    while (millis() - inicioPrompt < 5000) {
        while (modem.available()) {
            char c = modem.read();
            respuestaPrompt += c;
            Serial.write(c);

            if (c == '>') {
                promptRecibido = true;
                break;
            }

            if (respuestaPrompt.indexOf("ERROR") >= 0) {
                Serial.println();
                Serial.println("[SMS] ERROR al solicitar CMGS.");
                return false;
            }
        }

        if (promptRecibido) break;
        delay(5);
    }

    if (!promptRecibido) {
        Serial.println();
        Serial.println("[SMS] ERROR: no se recibió prompt '>'.");
        return false;
    }

    // Enviar contenido del mensaje
    modem.print(mensaje);
    delay(100);

    Serial.println();
    Serial.println("[SMS] Enviando Ctrl+Z (ASCII 26)...");
    modem.write(26);

    // Esperar confirmación
    unsigned long inicioConfirmacion = millis();
    String respuesta = "";

    while (millis() - inicioConfirmacion < 30000) {
        while (modem.available()) {
            char c = modem.read();
            respuesta += c;
            Serial.write(c);

            if (respuesta.indexOf("+CMGS:") >= 0) {
                // Actualizar cooldown SOLO cuando el envío fue verificado y exitoso por la red
                if (!esPrueba) {
                    ultimoEnvioSMS = millis();
                }
                Serial.println();
                Serial.println("[SMS] ¡SMS ENVIADO CORRECTAMENTE!");
                modemOk = true;
                return true;
            }

            if (respuesta.indexOf("ERROR") >= 0) {
                Serial.println();
                Serial.println("[SMS] ERROR enviando SMS.");
                return false;
            }
        }
        delay(5);
    }

    Serial.println();
    Serial.println("[SMS] TIMEOUT esperando confirmación de red.");
    return false;
}

// ============================================================
// SMS DE INICIO
// ============================================================

void enviarSMSInicio() {
    String mensaje = generarMensajeSMS("DISPOSITIVO INICIADO");
    enviarSMS(mensaje, false, false);
}

// ============================================================
// SMS DE PRUEBA (IGNORA COOLDOWN)
// ============================================================

void enviarSMSPrueba() {
    Serial.println();
    Serial.println("========================================");
    Serial.println("SMS DE PRUEBA");
    Serial.println("========================================");

    String mensaje = generarMensajeSMS("PRUEBA DE SMS");
    enviarSMS(mensaje, false, true);
}

// ============================================================
// SMS DE CORTE / RESTAURACIÓN (EVENTO PRIORITARIO)
// ============================================================

void enviarSMSAlertaCorte(bool hayCorte) {
    if (!alerta_bateria_activa) {
        Serial.println("[SMS] Alerta de batería desactivada por configuración local.");
        return;
    }

    String tipo = hayCorte ? "CORTE DE CORRIENTE" : "CORRIENTE RESTAURADA";
    String mensaje = generarMensajeSMS(tipo);

    // Permite enviar corte y restauración sin trabarse por cooldown (esEventoPrioritario = true)
    enviarSMS(mensaje, true, false);
}

// ============================================================
// ALERTA DE TEMPERATURA POR SMS
// ============================================================

void verificarAlertaTemperaturaSMS() {
    if (!alerta_temperatura_activa) {
        alertaTempSMSActiva = false;
        return;
    }

    bool fueraDeRango = (temperaturaActual < temp_min_segura || temperaturaActual > temp_max_segura);

    if (fueraDeRango != alertaTempSMSActiva) {
        alertaTempSMSActiva = fueraDeRango;

        String tipo = fueraDeRango ? "TEMPERATURA FUERA DE RANGO" : "TEMPERATURA RESTAURADA";
        String mensaje = generarMensajeSMS(tipo);

        enviarSMS(mensaje, false, false);
        ejecutarEnvioTelemetria(fueraDeRango ? "ALERTA_TEMPERATURA" : "TEMPERATURA_NORMALIZADA");
    }
}

// ============================================================
// CONEXIÓN WIFI
// ============================================================

void conectarWiFi() {
    if (WiFi.status() == WL_CONNECTED) {
        return;
    }

    Serial.println();
    Serial.println("[WIFI] Conectando...");

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 25) {
        delay(500);
        Serial.print(".");
        intentos++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("[WIFI] Conectado. IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("[WIFI] No se pudo conectar.");
    }
}

// ============================================================
// PROCESAR RESPUESTA DEL SERVIDOR
// ============================================================

void procesarRespuestaServidor(String respuesta) {
    Serial.println();
    Serial.println("========================================");
    Serial.println("RESPUESTA DEL SERVIDOR");
    Serial.println("========================================");
    Serial.println(respuesta);

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, respuesta);

    if (error) {
        Serial.print("[JSON] Error al deserializar: ");
        Serial.println(error.c_str());
        return;
    }

    // --------------------------------------------------------
    // Configuración recibida
    // --------------------------------------------------------

    JsonObject configuracion = doc["configuracion"];

    if (!configuracion.isNull()) {
        if (configuracion["temp_min"].is<float>() || configuracion["temp_min"].is<int>()) {
            temp_min_segura = configuracion["temp_min"];
        }

        if (configuracion["temp_max"].is<float>() || configuracion["temp_max"].is<int>()) {
            temp_max_segura = configuracion["temp_max"];
        }

        if (configuracion["alerta_temperatura_activa"].is<bool>()) {
            alerta_temperatura_activa = configuracion["alerta_temperatura_activa"];
        }

        if (configuracion["alerta_bateria_activa"].is<bool>()) {
            alerta_bateria_activa = configuracion["alerta_bateria_activa"];
        }

        if (configuracion["alerta_vencimiento_activa"].is<bool>()) {
            alerta_vencimiento_activa = configuracion["alerta_vencimiento_activa"];
        }

        if (configuracion["alerta_modem_activa"].is<bool>()) {
            alerta_modem_activa = configuracion["alerta_modem_activa"];
        }

        if (configuracion["envio_sms_activo"].is<bool>()) {
            envio_sms_activo = configuracion["envio_sms_activo"];
        }

        if (configuracion["intervalo_telemetria"].is<int>()) {
            int interval = configuracion["intervalo_telemetria"];
            if (interval > 0) {
                intervalo_telemetria = interval;
            }
        }

        if (!configuracion["plantilla_sms_cuerpo"].isNull()) {
            plantilla_sms_cuerpo = configuracion["plantilla_sms_cuerpo"].as<String>();
            plantilla_sms_cuerpo.trim();
        }

        if (!configuracion["telefonos_sms"].isNull()) {
            NUMERO_DESTINO_SMS = configuracion["telefonos_sms"].as<String>();
            NUMERO_DESTINO_SMS.trim();
            Serial.print("[SMS] Número obtenido del servidor: ");
            Serial.println(NUMERO_DESTINO_SMS);
        }
    }

    Serial.println();
    Serial.println("[CONFIG] Valores sincronizados:");
    Serial.print("Temp mínima: "); Serial.println(temp_min_segura);
    Serial.print("Temp máxima: "); Serial.println(temp_max_segura);
    Serial.print("Alerta temperatura: "); Serial.println(alerta_temperatura_activa ? "ACTIVA" : "INACTIVA");
    Serial.print("Alerta batería: "); Serial.println(alerta_bateria_activa ? "ACTIVA" : "INACTIVA");
    Serial.print("Alerta módem: "); Serial.println(alerta_modem_activa ? "ACTIVA" : "INACTIVA");
    Serial.print("Envío SMS backend: "); Serial.println(envio_sms_activo ? "ACTIVO" : "INACTIVO");
    Serial.print("Plantilla SMS: "); Serial.println(plantilla_sms_cuerpo);
    Serial.print("Intervalo telemetría: "); Serial.print(intervalo_telemetria); Serial.println("s");
}

// ============================================================
// ENVIAR TELEMETRÍA AL SERVIDOR
// ============================================================

bool enviarTelemetriaNodeRed(String payload) {
    conectarWiFi();

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[TELEMETRIA] Sin WiFi.");
        return false;
    }

    HTTPClient http;
    http.setTimeout(8000);

    Serial.println();
    Serial.println("[TELEMETRIA] Enviando datos...");

    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-KEY", API_KEY);

    int codigo = http.POST(payload);

    Serial.print("[TELEMETRIA] HTTP: ");
    Serial.println(codigo);

    if (codigo > 0) {
        String respuesta = http.getString();
        procesarRespuestaServidor(respuesta);
        http.end();
        return codigo >= 200 && codigo < 300;
    }

    Serial.println("[TELEMETRIA] Error HTTP.");
    http.end();

    return false;
}

// ============================================================
// EJECUTAR TELEMETRÍA
// ============================================================

void ejecutarEnvioTelemetria(const String& motivo) {
    Serial.println();
    Serial.println("========================================");
    Serial.println("TELEMETRÍA");
    Serial.print("Motivo: "); Serial.println(motivo);
    Serial.println("========================================");

    Serial.print("Temperatura: "); Serial.print(temperaturaActual); Serial.println(" C");
    Serial.print("Energía: "); Serial.println(enBateriaEnclavado ? "BATERIA" : "RED");
    Serial.print("Módem: "); Serial.println(modemOk ? "OK" : "ERROR");

    // JSON Payload
    JsonDocument doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = temperaturaActual;
    doc["bateria"] = enBateriaEnclavado;
    doc["modem_ok"] = modemOk;

    String payload;
    serializeJson(doc, payload);

    Serial.print("[TELEMETRIA] JSON: ");
    Serial.println(payload);

    enviarTelemetriaNodeRed(payload);
}

// ============================================================
// SENSOR DE TEMPERATURA (CON FILTRO ANTI-RUIDO Y LECTURA ESTABLE)
// ============================================================

void leerTemperatura() {
    if (millis() - previoLecturaTemp < 1000 && previoLecturaTemp != 0) {
        return;
    }
    previoLecturaTemp = millis();

    sensors.requestTemperatures();
    float tempLeida = sensors.getTempCByIndex(0);

    // 1. Filtrar lecturas basura: -127°C (desconectado) o 85°C (no convertido) o valores imposibles
    if (tempLeida == DEVICE_DISCONNECTED_C || tempLeida == 85.0f || tempLeida < -50.0f || tempLeida > 100.0f) {
        lecturasFallidasTemp++;
        if (lecturasFallidasTemp % 10 == 0) {
            Serial.println("[TEMP] Ruido/Interrupción en bus DS18B20. Preservando última lectura válida.");
        }
        return; // Conserva la temperaturaActual anterior sin corromperla con picos falsos
    }

    // 2. Filtro de saltos bruscos (Picos de ruido OneWire ej: saltar de 20.8°C a -0.8°C en 1s)
    if (temperaturaActual != 0.0 && abs(tempLeida - temperaturaActual) > 7.0f) {
        // Exige 2 lecturas consecutivas para validar un cambio real tan abrupto
        if (abs(tempLeida - ultimaLecturaValidaTemp) < 2.0f) {
            temperaturaActual = tempLeida;
        }
        ultimaLecturaValidaTemp = tempLeida;
        return;
    }

    // Lectura válida normal
    temperaturaActual = tempLeida;
    ultimaLecturaValidaTemp = tempLeida;
    lecturasFallidasTemp = 0;
}

// ============================================================
// DETECTOR DE CORTE 4N25 (CON INPUT_PULLUP Y DEBOUNCE DE 2.5s)
// ============================================================

void procesarDetectorCorte() {
    int lectura = digitalRead(PIN_DETECTOR);

    // Si cambia el valor del pin, reiniciamos temporizador de filtro
    if (lectura != ultimoEstadoLectura) {
        ultimoCambioDetector = millis();
        ultimoEstadoLectura = lectura;
    }

    // Solo confirmamos el cambio si la lectura se mantiene estable durante 2.5 segundos
    if ((millis() - ultimoCambioDetector) >= TIEMPO_DEBOUNCE_CORTE_MS) {
        // HIGH = optoacoplador apagado / sin tensión (Corte de energía / Batería)
        // LOW  = optoacoplador conduciendo (Red eléctrica activa)
        enBateriaEnclavado = (lectura == VALOR_CORTE);
    }
}

// ============================================================
// ALARMAS FÍSICAS (LED Y BUZZER TONO 2kHz)
// ============================================================

void procesarAlarmasFisicas() {
    bool alarmaTemperatura = alerta_temperatura_activa && (temperaturaActual < temp_min_segura || temperaturaActual > temp_max_segura);
    bool alarmaBateria = alerta_bateria_activa && enBateriaEnclavado;
    bool alarmaModem = alerta_modem_activa && !modemOk;

    bool alarmaGeneral = alarmaTemperatura || alarmaBateria || alarmaModem;

    if (alarmaGeneral) {
        digitalWrite(LED_ROJO, HIGH);
        digitalWrite(LED_VERDE, LOW);

        if (millis() - previoBuzzerMillis >= 500) {
            previoBuzzerMillis = millis();
            estadoBuzzer = !estadoBuzzer;
            if (estadoBuzzer) {
                tone(PIN_BUZZER, 2000); // Emite tono de 2000 Hz en lugar de solo conmutar pin
            } else {
                noTone(PIN_BUZZER);
            }
        }
    } else {
        digitalWrite(LED_ROJO, LOW);
        digitalWrite(LED_VERDE, HIGH);
        noTone(PIN_BUZZER);
        digitalWrite(PIN_BUZZER, LOW);
        estadoBuzzer = false;
    }
}

// ============================================================
// PROCESAR COMANDOS DEL MONITOR SERIAL
// ============================================================

void procesarComandosSerial() {
    if (!Serial.available()) {
        return;
    }

    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando.equalsIgnoreCase("SMSPRUEBA")) {
        enviarSMSPrueba();
    } else if (comando.equalsIgnoreCase("SALDO") || comando.equalsIgnoreCase("CONSULTARSALDO")) {
        consultarSaldoSIM("226");
    } else {
        Serial.print("[SERIAL] Comando desconocido: ");
        Serial.println(comando);
    }
}

// ============================================================
// SETUP
// ============================================================

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println();
    Serial.println("========================================");
    Serial.println("       FREEZERGUARD ESP32");
    Serial.println("========================================");

    // Pines (CRÍTICO: INPUT_PULLUP previene pin flotante en 4N25 al estar desenchufado)
    pinMode(LED_VERDE, OUTPUT);
    pinMode(LED_ROJO, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_DETECTOR, INPUT_PULLUP);

    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_ROJO, LOW);
    noTone(PIN_BUZZER);
    digitalWrite(PIN_BUZZER, LOW);

    // Sensor de temperatura
    sensors.begin();
    sensors.requestTemperatures();
    float tempIni = sensors.getTempCByIndex(0);
    if (tempIni != DEVICE_DISCONNECTED_C && tempIni != 85.0f) {
        temperaturaActual = tempIni;
        ultimaLecturaValidaTemp = tempIni;
    }

    Serial.print("[TEMP] Temperatura inicial: ");
    Serial.print(temperaturaActual);
    Serial.println(" C");

    // Detector 4N25
    int lecturaIni = digitalRead(PIN_DETECTOR);
    ultimoEstadoLectura = lecturaIni;
    enBateriaEnclavado = (lecturaIni == VALOR_CORTE);
    estadoBateriaAnterior = enBateriaEnclavado;

    Serial.print("[ENERGIA] Estado inicial: ");
    Serial.println(enBateriaEnclavado ? "BATERIA / CORTE" : "RED");

    // Módem SIMCOM A7670G
    inicializarModemSMS();

    // WiFi
    conectarWiFi();

    // Primera telemetría (obtiene parámetros del servidor como telefonos_sms, plantilla_sms_cuerpo y envio_sms_activo)
    ejecutarEnvioTelemetria("INICIO");

    // SMS de inicio (respetando configuración y número devuelto por backend)
    if (modemOk && NUMERO_DESTINO_SMS.length() >= 3 && envio_sms_activo) {
        enviarSMSInicio();
    } else {
        Serial.println();
        Serial.println("[SMS] No se envía SMS de inicio.");
        if (!modemOk) Serial.println("[SMS] Motivo: módem no disponible.");
        if (!envio_sms_activo) Serial.println("[SMS] Motivo: envío de SMS desactivado en servidor.");
        if (NUMERO_DESTINO_SMS.length() < 3) Serial.println("[SMS] Motivo: no hay número válido configurado.");
    }

    Serial.println();
    Serial.println("========================================");
    Serial.println("FREEZERGUARD INICIADO");
    Serial.println("========================================");
    Serial.println("Comandos serial: SMSPRUEBA | SALDO");

    previoMillis = millis();
    previoImpresion = millis();
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {
    // 1. Comandos Serial
    procesarComandosSerial();

    // 2. Muestreo de Temperatura (no bloqueante + filtro anti-ruido)
    leerTemperatura();

    // 3. Detector de corte 4N25 (INPUT_PULLUP + debounce de 2.5s)
    procesarDetectorCorte();

    // 4. Alarmas físicas (LEDs y Buzzer Tono 2kHz)
    procesarAlarmasFisicas();

    // 5. Health Check periódico del módem (cada 60 segundos)
    verificarSaludModem();

    // 6. Monitorear disparo de SMS por Temperatura Fuera de Rango
    verificarAlertaTemperaturaSMS();

    // 7. Detectar cambio de estado de energía (Corte / Restauración)
    if (enBateriaEnclavado != estadoBateriaAnterior) {
        if (enBateriaEnclavado) {
            Serial.println();
            Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            Serial.println("⚠ CORTE DE CORRIENTE DETECTADO");
            Serial.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

            // SMS de alerta por corte (Prioritario: ignora cooldown)
            enviarSMSAlertaCorte(true);

            // Telemetría inmediata al servidor
            ejecutarEnvioTelemetria("CORTE");
        } else {
            Serial.println();
            Serial.println("========================================");
            Serial.println("✓ CORRIENTE RESTAURADA");
            Serial.println("========================================");

            // SMS de notificación por restauración (Prioritario: ignora cooldown)
            enviarSMSAlertaCorte(false);

            // Telemetría inmediata al servidor
            ejecutarEnvioTelemetria("RESTAURACION");
        }

        estadoBateriaAnterior = enBateriaEnclavado;
    }

    // 8. Monitoreo por consola serial periódicamente
    if (millis() - previoImpresion >= 1000) {
        previoImpresion = millis();

        Serial.print("[ESTADO] Temp: ");
        Serial.print(temperaturaActual, 1);
        Serial.print(" C | Energía: ");
        Serial.print(enBateriaEnclavado ? "BATERIA" : "RED");
        Serial.print(" | Módem: ");
        Serial.println(modemOk ? "OK" : "ERROR");
    }

    // 9. Telemetría periódica programada
    unsigned long intervaloMs = (unsigned long)(intervalo_telemetria > 0 ? intervalo_telemetria : 5) * 1000UL;

    if (millis() - previoMillis >= intervaloMs) {
        previoMillis = millis();
        ejecutarEnvioTelemetria("PERIODICA");
    }

    delay(10); // Pequeña pausa para ceder CPU y reducir consumo
}
