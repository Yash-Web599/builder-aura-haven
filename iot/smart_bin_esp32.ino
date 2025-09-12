#include <WiFi.h>
#include <HTTPClient.h>
#include <Servo.h>

// Configure pins
const int IR_WET_PIN = 14;   // GPIO14
const int IR_DRY_PIN = 27;   // GPIO27
const int SERVO_PIN = 13;    // GPIO13

Servo servo;

// WiFi and Firebase
const char* WIFI_SSID = "";      // set your SSID
const char* WIFI_PASS = "";      // set your password
const char* RTDB_HOST = "";      // e.g. https://your-project-id-default-rtdb.firebaseio.com
const char* BIN_ID = "bin-1";    // change if multiple bins

unsigned long lastPost = 0;
volatile int wetCount = 0;
volatile int dryCount = 0;

void setup() {
  Serial.begin(115200);
  pinMode(IR_WET_PIN, INPUT_PULLUP);
  pinMode(IR_DRY_PIN, INPUT_PULLUP);
  servo.attach(SERVO_PIN);
  servo.write(90); // neutral position

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(" connected");
}

void openWet() {
  servo.write(40); // open wet compartment
  delay(800);
  servo.write(90);
}

void openDry() {
  servo.write(140); // open dry compartment
  delay(800);
  servo.write(90);
}

void loop() {
  // Simple edge detection for IR sensors (active low depending on sensor)
  static int lastWet = HIGH, lastDry = HIGH;
  int wet = digitalRead(IR_WET_PIN);
  int dry = digitalRead(IR_DRY_PIN);

  if (wet == LOW && lastWet == HIGH) {
    wetCount++;
    openWet();
    Serial.println("Wet detected");
  }
  if (dry == LOW && lastDry == HIGH) {
    dryCount++;
    openDry();
    Serial.println("Dry detected");
  }
  lastWet = wet;
  lastDry = dry;

  if (millis() - lastPost > 3000) {
    postCounts();
    lastPost = millis();
  }
}

void postCounts() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (strlen(RTDB_HOST) == 0) return;
  HTTPClient http;
  String url = String(RTDB_HOST) + "/bins/" + BIN_ID + ".json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  String body = String("{\"wet\":") + wetCount + ",\"dry\":" + dryCount + "}";
  int code = http.PATCH(body);
  Serial.printf("POST %s -> %d\n", url.c_str(), code);
  http.end();
}
