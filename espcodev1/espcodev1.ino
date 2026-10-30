#include <WiFi.h>
#include <WebServer.h>

// Use the same Wi-Fi hotspot for the ESP32 and laptop.
const char* ssid = "TestNet";
const char* password = "password123";

// ADC1 pins work while Wi-Fi is active. Move the potentiometer wipers here.
// Wire each pot's outer legs to 3V3 and GND (never 5V).
const int FERMI_POT_PIN = 33;
const int TEMPERATURE_POT_PIN = 32;

WebServer server(80);

void handleRoot() {
  server.send(200, "text/plain", "ESP32 Fermi Lab controller is online. Read /data for potentiometer values.");
}

void handleData() {
  const int fermiRaw = analogRead(FERMI_POT_PIN);
  const int temperatureRaw = analogRead(TEMPERATURE_POT_PIN);

  Serial.printf("ADC raw | GPIO %d (Fermi): %d | GPIO %d (Temperature): %d\n",
                FERMI_POT_PIN, fermiRaw, TEMPERATURE_POT_PIN, temperatureRaw);

  // Browser page may be opened from file:// or a local web server.
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-store");
  String json = "{\"fermi_raw\":" + String(fermiRaw) +
                ",\"temperature_raw\":" + String(temperatureRaw) + "}";
  Serial.print("Transmitting JSON: ");
  Serial.println(json);
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12); // Values from 0 to 4095
  analogSetPinAttenuation(FERMI_POT_PIN, ADC_11db);
  analogSetPinAttenuation(TEMPERATURE_POT_PIN, ADC_11db);
  pinMode(FERMI_POT_PIN, INPUT);
  pinMode(TEMPERATURE_POT_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to hotspot ");
  Serial.print(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }

  Serial.println("\nConnected!");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", HTTP_GET, handleRoot);
  server.on("/data", HTTP_GET, handleData);
  server.begin();
  Serial.println("HTTP server started on port 80.");
}

void loop() {
  server.handleClient();
}
