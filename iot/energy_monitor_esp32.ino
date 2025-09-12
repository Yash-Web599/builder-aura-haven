#include <WiFi.h>
#include <HTTPClient.h>

// LDR on ADC pin
const int LDR_PIN = 34; // ADC1_CH6

// WiFi & Firebase
const char* WIFI_SSID = "";
const char* WIFI_PASS = "";
const char* RTDB_HOST = ""; // e.g. https://your-project-id-default-rtdb.firebaseio.com
const char* ROOM_ID = "room-101";

// thresholds and usage model
const int THRESHOLD = 1800; // adjust based on divider
bool lightOn = false;
float usageWh = 0.0f;
unsigned long lastSample = 0;
unsigned long lastPost = 0;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println(" connected");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSample > 500) {
    int raw = analogRead(LDR_PIN);
    bool on = raw > THRESHOLD;
    if (on) {
      // crude model: add 0.0083 Wh per 500ms (~60W bulb)
      usageWh += 0.0083f;
    }
    lightOn = on;
    lastSample = now;
  }

  if (now - lastPost > 5000) {
    postEnergy();
    lastPost = now;
  }
}

void postEnergy() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (strlen(RTDB_HOST) == 0) return;
  HTTPClient http;
  String url = String(RTDB_HOST) + "/energy/" + ROOM_ID + ".json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  String body = String("{\"lightOn\":") + (lightOn ? "true" : "false") + ",\"usage\":" + String(usageWh, 1) + ",\"updatedAt\":" + String((unsigned long) (millis())) + "}";
  int code = http.PATCH(body);
  Serial.printf("PATCH %s -> %d\n", url.c_str(), code);
  http.end();
}
