#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// -------------------------------------------------------------------
// CONFIGURACIÓN MÓDEM CELLULAR Y SMS (A7670G)
// -------------------------------------------------------------------
#define MODEM_RX 16 // Conectado a TX del Módem
#define MODEM_TX 17 // Conectado a RX del Módem
String NUMERO_DESTINO_SMS = "+59898485023"; 
String SIM_PIN = "4877";                   
bool modemOk = true; // Estado de salud del módulo celular SMS

// -------------------------------------------------------------------
// CREDENCIALES WIFI Y SERVIDOR
// -------------------------------------------------------------------
const char* WIFI_SSID = "DispositivosIOT"; 
const char* WIFI_PASSWORD = "IOT_UTEC.-"; 
const char* SERVER_URL = "https://tip-proymf26.tipyenaccion.net/api/telemetry";
const char* API_KEY = "fg_sec_9nQBt2sF1bLJAEGlR"; 
const int DEVICE_ID = 1; 

// -------------------------------------------------------------------
// PINES DE HARDWARE
// -------------------------------------------------------------------
const int PIN_PWRKEY_MODEM = 4; 
const int PIN_DS18B20 = 21;    
const int PIN_DETECTOR = 22;   
const int LED_VERDE = 5;        
const int LED_ROJO = 19; 
const int PIN_BUZZER = 23;     

// LÓGICA 4N25: HIGH = CORTE / BATERÍA
const int VALOR_CORTE = HIGH; 

// TIEMPO DE ENCLAVAMIENTO (8 segundos continuos en 0 para confirmar que volvió la luz)
const unsigned long TIEMPO_RECUPERACION_RED_MS = 8000; 
unsigned long ultimoPicoCorteMillis = 0;

// LÍMITES Y TOGGLES DINÁMICOS (Sincronizados desde el servidor)
float temp_min_segura = -25.0;
float temp_max_segura = -10.0;
bool alerta_temperatura_activa = true;
bool alerta_bateria_activa = true;
bool alerta_vencimiento_activa = true;
bool alerta_modem_activa = true;
int intervalo_telemetria = 5; 

// TIMERS NON-BLOCKING
unsigned long previoMillis = 0;
unsigned long previoBuzzerMillis = 0;
unsigned long previoImpresion = 0;
bool estadoBuzzer = false;

// VARIABLES GLOBALES DE ESTADO
float temperaturaActual = 0.0;
bool enBateriaEnclavado = false;
bool estadoBateriaAnterior = false; 

OneWire oneWire(PIN_DS18B20);
DallasTemperature sensors(&oneWire);

// -------------------------------------------------------------------
// FUNCIONES MÓDEM A7670G (SMS)
// -------------------------------------------------------------------
void enviarComandoAT(const char* cmd, int esperaMs = 500) {
    Serial.printf("\n[Módem] -> %s\n", cmd);
    Serial2.println(cmd);
    
    unsigned long start = millis();
    while (millis() - start < (unsigned long)esperaMs) {
        while (Serial2.available()) {
            Serial.write(Serial2.read());
        }
    }
}

bool esperarPromptOOk(const char* objetivo, unsigned long timeoutMs) {
    unsigned long t = millis();
    String buffer = "";
    while (millis() - t < timeoutMs) {
        while (Serial2.available()) {
            char c = Serial2.read();
            Serial.write(c);
            buffer += c;
            if (buffer.indexOf(objetivo) != -1) {
                return true;
            }
        }
    }
    return false;
}

bool verificarModemAT() {
    while (Serial2.available()) Serial2.read();
    Serial2.println("AT");
    return esperarPromptOOk("OK", 800);
}

void inicializarModemSMS() {
    Serial.println("\n--- INICIALIZANDO MÓDEM A7670G PARA ALERTA SMS ---");
    
    pinMode(PIN_PWRKEY_MODEM, OUTPUT);
    digitalWrite(PIN_PWRKEY_MODEM, HIGH);
    delay(100);
    digitalWrite(PIN_PWRKEY_MODEM, LOW);
    delay(1500);
    digitalWrite(PIN_PWRKEY_MODEM, HIGH);
    delay(3000);

    Serial2.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
    delay(1000);

    bool respondeAT = verificarModemAT();
    if (!respondeAT) {
        Serial.println("--- [ERROR: MÓDEM NO RESPONDE (SIN ENERGÍA O NO CONECTADO)] ---");
        modemOk = false;
        return;
    }

    String cmdPin = "AT+CPIN=\"";
    cmdPin += SIM_PIN;
    cmdPin += "\"";
    enviarComandoAT(cmdPin.c_str(), 2000);

    enviarComandoAT("AT+CMEE=2", 300);
    enviarComandoAT("AT+CMGF=1", 300);
    enviarComandoAT("AT+CGSMS=1", 300);
    enviarComandoAT("AT+CEREG?", 1000);

    while (Serial2.available()) Serial2.read();
    Serial2.println("AT+CPIN?");
    bool simReady = esperarPromptOOk("READY", 2000);

    modemOk = simReady;
    if (modemOk) {
        Serial.println("--- MÓDEM CONFIGURADO Y SIM DESBLOQUEADA ---\n");
    } else {
        Serial.println("--- [ERROR: MÓDEM O SIM NO LISTA / SIN SALDO O PIN EN ERROR] ---\n");
    }
}

bool enviarSMSAlertaCorte(bool hayCorte) {
    Serial.println("\n------------------------------------------------");
    Serial.println("   DISPARANDO SMS DE EMERGENCIA POR CORTE       ");
    Serial.println("------------------------------------------------");

    if (NUMERO_DESTINO_SMS.length() < 6) {
        Serial.println("[AVISO: No hay número de destino SMS configurado]");
        return false;
    }

    while (Serial2.available()) Serial2.read();

    Serial2.printf("AT+CMGS=\"%s\"\r\n", NUMERO_DESTINO_SMS.c_str());

    if (esperarPromptOOk(">", 4000)) {
        Serial.println("\n[Prompt '>' detectado, escribiendo texto...]");

        if (hayCorte) {
            Serial2.printf("ALERTA FREEZERGUARD: Se ha detectado un CORTE DE ENERGIA ELECTRICA. El equipo opera con bateria respaldada. Temp actual: %.1f C", temperaturaActual);
        } else {
            Serial2.printf("AVISO FREEZERGUARD: La RED ELECTRICA ha sido RESTAURADA. Temp actual: %.1f C", temperaturaActual);
        }
        
        delay(300);
        Serial2.write(26); // Byte Ctrl+Z

        Serial.println("\n[Ctrl+Z enviado, esperando confirmacion de red...]");
        if (esperarPromptOOk("OK", 12000)) {
            Serial.println("\n>>> ¡SMS DE ALERTA ENVIADO Y CONFIRMADO POR LA RED! <<<");
            modemOk = true;
            return true;
        } else {
            Serial.println("\n[ERROR: Timeout o fallo al recibir confirmacion del SMS]");
            modemOk = false;
            return false;
        }
    } else {
        Serial.println("\n[ERROR: El módem no devolvió el prompt '>']");
        modemOk = false;
        return false;
    }
}

// -------------------------------------------------------------------
// FUNCIONES CONEXIÓN Y SERVIDOR WEB (HTTP/WIFI)
// -------------------------------------------------------------------
void conectarWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;

    Serial.println("\n----------------------------------");
    Serial.print("Intentando conectar a Wi-Fi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 25) {
        delay(500);
        Serial.print(".");
        intentos++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n¡Wi-Fi conectado exitosamente!");
        Serial.print("Dirección IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nError: No se pudo conectar a la red Wi-Fi en este intento.");
    }
    Serial.println("----------------------------------\n");
}

void procesarDetectorCorte() {
    int lecturaLecturaBruta = digitalRead(PIN_DETECTOR);

    if (lecturaLecturaBruta == VALOR_CORTE) {
        enBateriaEnclavado = true;
        ultimoPicoCorteMillis = millis();
    } else {
        if (enBateriaEnclavado && (millis() - ultimoPicoCorteMillis >= TIEMPO_RECUPERACION_RED_MS)) {
            enBateriaEnclavado = false;
        }
    }
}

void actualizarAlarmasFisicas(float temp, bool enBateria) {
    bool desvioTemp = alerta_temperatura_activa && (temp < temp_min_segura || temp > temp_max_segura);
    bool desvioCorte = alerta_bateria_activa && enBateria;
    bool desvioModem = alerta_modem_activa && !modemOk;

    if (desvioTemp || desvioCorte || desvioModem) {
        digitalWrite(LED_VERDE, LOW);
        digitalWrite(LED_ROJO, HIGH);

        if (millis() - previoBuzzerMillis >= 500) {
            previoBuzzerMillis = millis();
            estadoBuzzer = !estadoBuzzer;
            if (estadoBuzzer) {
                tone(PIN_BUZZER, 1000);
            } else {
                noTone(PIN_BUZZER);
            }
        }
    } else {
        digitalWrite(LED_VERDE, HIGH);
        digitalWrite(LED_ROJO, LOW);
        noTone(PIN_BUZZER);
        estadoBuzzer = false;
    }
}

void procesarRespuestaServidor(String jsonRespuesta) {
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, jsonRespuesta);

    if (error) return;

    if (doc.containsKey("configuracion")) {
        JsonObject config = doc["configuracion"];

        if (config.containsKey("temp_min")) temp_min_segura = config["temp_min"].as<float>();
        if (config.containsKey("temp_max")) temp_max_segura = config["temp_max"].as<float>();
        if (config.containsKey("alerta_temperatura_activa")) alerta_temperatura_activa = config["alerta_temperatura_activa"].as<bool>();
        if (config.containsKey("alerta_bateria_activa")) alerta_bateria_activa = config["alerta_bateria_activa"].as<bool>();
        if (config.containsKey("alerta_vencimiento_activa")) alerta_vencimiento_activa = config["alerta_vencimiento_activa"].as<bool>();
        if (config.containsKey("alerta_modem_activa")) alerta_modem_activa = config["alerta_modem_activa"].as<bool>();
        if (config.containsKey("intervalo_telemetria")) intervalo_telemetria = config["intervalo_telemetria"].as<int>();
        if (config.containsKey("sim_pin")) SIM_PIN = config["sim_pin"].as<String>();
        if (config.containsKey("telefonos_sms")) NUMERO_DESTINO_SMS = config["telefonos_sms"].as<String>();
    }
}

void enviarTelemetriaNodeRed(String payload) {
    if (WiFi.status() != WL_CONNECTED) {
        conectarWiFi();
    }

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.setTimeout(8000);
        http.begin(SERVER_URL);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("X-API-Key", API_KEY);

        int httpResponseCode = http.POST(payload);

        if (httpResponseCode > 0) {
            String respuestaServidor = http.getString();
            Serial.printf("HTTP Response: %d OK\n", httpResponseCode);
            procesarRespuestaServidor(respuestaServidor);
        } else {
            Serial.printf("Error HTTP: %s (código: %d)\n", http.errorToString(httpResponseCode).c_str(), httpResponseCode);
        }
        http.end();
    } else {
        conectarWiFi();
    }
}

void ejecutarEnvioTelemetria(const char* motivo) {
    // Comprobar si el módem responde a los comandos AT
    if (modemOk) {
        modemOk = verificarModemAT();
    }

    Serial.println("\n-----------------------------------------");
    Serial.printf("Motivo Envío: %s\n", motivo);
    Serial.printf("Temperatura Actual: %.2f °C\n", temperaturaActual);
    Serial.printf("Rango Seguro: [%.1f °C a %.1f °C]\n", temp_min_segura, temp_max_segura);
    Serial.printf("Pin 22 (Lectura Bruta): %d\n", digitalRead(PIN_DETECTOR)); 
    Serial.printf("Estado Enclavado: %s\n", enBateriaEnclavado ? "CORTE DE LUZ (EN BATERÍA)" : "OK (RED ELÉCTRICA)");
    Serial.printf("Estado Módem SMS: %s\n", modemOk ? "OK (OPERATIVO)" : "ERROR / SIN SALDO / DESCONECTADO");
    Serial.printf("Intervalo Envío: %d seg\n", intervalo_telemetria);
    
    Serial.print("Alarmas Activas -> ");
    Serial.printf("Temp: %s | ", alerta_temperatura_activa ? "SI" : "NO");
    Serial.printf("Batería: %s | ", alerta_bateria_activa ? "SI" : "NO");
    Serial.printf("Vencimiento: %s | ", alerta_vencimiento_activa ? "SI" : "NO");
    Serial.printf("Módem SMS: %s\n", alerta_modem_activa ? "SI" : "NO");
    Serial.println("-----------------------------------------");

    String payload = "{";
    payload += "\"device_id\":";
    payload += String(DEVICE_ID);
    payload += ",\"temperature\":";
    payload += String(temperaturaActual, 2);
    payload += ",\"bateria\":";
    payload += (enBateriaEnclavado ? "true" : "false");
    payload += ",\"modem_ok\":";
    payload += (modemOk ? "true" : "false");
    payload += "}";

    enviarTelemetriaNodeRed(payload);
}

// -------------------------------------------------------------------
// SETUP Y LOOP PRINCIPAL
// -------------------------------------------------------------------
void setup() {
    Serial.begin(115200);

    pinMode(LED_VERDE, OUTPUT);
    pinMode(LED_ROJO, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    
    pinMode(PIN_DETECTOR, INPUT_PULLUP); 

    digitalWrite(LED_VERDE, HIGH);
    digitalWrite(LED_ROJO, LOW);
    noTone(PIN_BUZZER);

    sensors.begin();
    
    inicializarModemSMS();
    conectarWiFi();

    // Estado inicial enclavado
    procesarDetectorCorte();
    estadoBateriaAnterior = enBateriaEnclavado;

    Serial.println("\n==================================");
    Serial.println("    --- FREEZERGUARD INICIADO ---");
    Serial.println("==================================\n");
}

void loop() {
    // 1. Muestreo de sensores en cada ciclo
    sensors.requestTemperatures();
    float tempLeida = sensors.getTempCByIndex(0);
    if (tempLeida != DEVICE_DISCONNECTED_C) {
        temperaturaActual = tempLeida;
    }

    // 2. Procesar estado del optoacoplador y alarmas
    procesarDetectorCorte();
    actualizarAlarmasFisicas(temperaturaActual, enBateriaEnclavado);

    // 3. Monitoreo por puerto serie cada 1 segundo (con contador regresivo)
    if (millis() - previoImpresion >= 1000) {
        previoImpresion = millis();

        Serial.print("Pin 22 (Bruto): ");
        Serial.print(digitalRead(PIN_DETECTOR));
        
        if (enBateriaEnclavado) {
            unsigned long transcurrido = millis() - ultimoPicoCorteMillis;
            long restante = (TIEMPO_RECUPERACION_RED_MS - transcurrido) / 1000;
            if (restante < 0) restante = 0;

            Serial.printf(" | Estado: CORTE DE LUZ / BATERÍA (Reset en: %lds)\n", restante);
        } else {
            Serial.println(" | Estado: OK (RED ELÉCTRICA)");
        }
    }

    // 4. Transición de estado (Disparo por evento)
    if (enBateriaEnclavado != estadoBateriaAnterior) {
        estadoBateriaAnterior = enBateriaEnclavado;
        
        // Se sincroniza el envío periódico para no duplicar datos
        previoMillis = millis(); 

        // Intentar envío de SMS
        bool smsEnviado = enviarSMSAlertaCorte(enBateriaEnclavado);

        // Notificación al servidor incluyendo estado del módem
        ejecutarEnvioTelemetria(enBateriaEnclavado ? "EVENTO: CORTE DETECTADO" : "EVENTO: RED RESTAURADA");

        // Se reajusta el temporizador tras el tiempo consumido por el SMS
        ultimoPicoCorteMillis = millis(); 
    }

    // 5. Envío periódico programado vía HTTP
    unsigned long intervaloMs = (unsigned long)(intervalo_telemetria > 0 ? intervalo_telemetria : 5) * 1000;
    if (millis() - previoMillis >= intervaloMs) {
        previoMillis = millis();
        ejecutarEnvioTelemetria("PERIÓDICO");
    }
}
