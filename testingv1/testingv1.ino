void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);
  delay(1000); // Brief pause to give the serial connection time to initialize

  Serial.println("\n=================================");
  Serial.println("Hello! Code successfully uploaded to ESP32!");
  Serial.println("=================================");
}

void loop() {
  // Print continuously every 1 second to confirm the board is running
  Serial.println("Hello from NodeMCU-32S!");
  delay(1000);
}