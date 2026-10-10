#include <WiFi.h>
#include <WebServer.h>

// --- Wi-Fi Credentials ---
const char* ssid     = "TestNet";
const char* password = "password123";

// --- Pin Definition ---
const int POT_PIN = 33; // Labeled P35 on NodeMCU-32S

WebServer server(80);

// Endpoint: Returns JSON reading for your laptop HTML page
void handleData() {
  int rawVal = analogRead(POT_PIN);
  float voltage = (rawVal / 4095.0) * 3.3;

  String json = "{\"pot_raw\":" + String(rawVal) + ",\"pot_volts\":" + String(voltage, 2) + "}";
  
  // CORS header to allow local laptop HTML file fetching
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Endpoint: Simple text check for browser verification
void handleRoot() {
  server.send(200, "text/plain", "ESP32 Web Server is Active!");
}

void setup() {
  Serial.begin(115200);
  pinMode(POT_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to ");
  Serial.print(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nCONNECTED!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Define routes
  server.on("/", handleRoot);
  server.on("/data", handleData);

  // Start web server on port 80
  server.begin();
  Serial.println("Web server started on Port 80!");
}

void loop() {
  // Process incoming HTTP requests continuously
  server.handleClient();
}