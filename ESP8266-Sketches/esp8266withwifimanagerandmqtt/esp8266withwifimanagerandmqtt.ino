#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "WiFiManager.h"          //https://github.com/tzapu/WiFiManager
#include <PubSubClient.h>
#include "SSD1306.h" // alias for `#include "SSD1306Wire.h"` // ESP8266 OLED

WiFiClient espClient;
PubSubClient client(espClient);
const char* mqtt_server = "192.168.1.100";
char message_buff[100];
long lastMsg = 0;
char msg[50];
int value = 0;

// D3 -> SDA
// D4 -> SCL
// Initialize the OLED display using Wire library
SSD1306  display(0x3c, 4, 5);

void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 8, "NO WIFI");
  display.drawString(64, 20, "AP Mode: ON");
  display.drawString(64, 30, myWiFiManager->getConfigPortalSSID() );
  display.drawString(64, 40, "Please Setup");
  display.display();
  Serial.println(WiFi.softAPIP());
  //if you used auto generated SSID, print it
  Serial.println(myWiFiManager->getConfigPortalSSID());
}

void mqttcallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    message_buff[i] = payload[i];
  }
  
  Serial.println();

  // create character buffer with ending null terminator (string)
  String msgString = String(message_buff);
  Serial.print("MSGBuffer: ");
  Serial.println(msgString);


  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 7, topic);
  display.drawString(64, 18, msgString);
  display.display();

  // Switch on the LED if an 1 was received as first character
  if ((char)payload[0] == '1') {
    // digitalWrite(BUILTIN_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level
    // but actually the LED is on; this is because
    // it is acive low on the ESP-01)
  } else {
    // digitalWrite(BUILTIN_LED, HIGH);  // Turn the LED off by making the voltage HIGH
  }

}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  display.init();

  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 11, "Starting");
  display.drawString(64, 33, "SmartHome");
  display.display();

  
  
  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  //reset settings - for testing
  //wifiManager.resetSettings();

  //set callback that gets called when connecting to previous WiFi fails, and enters Access Point mode
  wifiManager.setAPCallback(configModeCallback);

  //fetches ssid and pass and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  //and goes into a blocking loop awaiting configuration
  if(!wifiManager.autoConnect()) {
    Serial.println("failed to connect and hit timeout");
    //reset and try again, or maybe put it to deep sleep
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);
    display.drawString(64, 8, "No WIFI");
    display.drawString(64, 18, "Resetting ESP");
    display.display();
  
    ESP.reset();
    delay(1000);
  } 

  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");
   display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 8, "WIFI OK");
//  display.drawString(64, 18, wifiManager->getSSID() );

  display.drawString(64, 18, "Connected to:");
  String mySSID = String(WiFi.SSID());
  display.drawString(64, 28, mySSID );
  
  char result[16];
  sprintf(result, "%3d.%3d.%3d.%3d", WiFi.localIP()[0], WiFi.localIP()[1], WiFi.localIP()[2], WiFi.localIP()[3]);
  display.drawString(64, 38, result );
  display.display();
  delay(1000);
  
    
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttcallback);
  client.subscribe("/home");
 
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);
    display.drawString(64, 8, "Starting MQTT");
    display.drawString(64, 18, "Connecting...");
    display.display();
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      display.clear();
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(64, 8, "MQTT Connected");
      display.drawString(64, 18, "OK");
      display.display();
      delay(1000);
      // Once connected, publish an announcement...
//    client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("inTopic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      display.clear();
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(64, 8, "No MQTT Broker");
      display.drawString(64, 18, "Retrying in");
      display.drawString(64, 28, "5 seconds");
      display.display();
      delay(1000);
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  client.publish("/home/alive", "Hello");  
  delay(1000);
  Serial.println("Loop");
  

}
