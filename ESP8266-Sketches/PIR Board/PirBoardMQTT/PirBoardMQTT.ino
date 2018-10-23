#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "WiFiManager.h"          //https://github.com/tzapu/WiFiManager
#include <PubSubClient.h>
#include "DHT.h"


// SmartHome Configuration
// Building/Room/Devices names are used to construct the MQTT Topic:
// for example:  /home/kitchen/extractionfan
// Management of these devices consist of: command (from network to device = command the board to do something)  or status (from the device to the network.  Usually a confirmation message in response to a command, but could also be timed sensor value broadcast, motion traps, etc)
//
//  Sub:  -t /home/kitchen/extractionfan/command  -m "1"   (Turn on, the extractionfan (device string), which is device1 (mosfet), on the Kitchen (room) controller, in the Home (building). )
//  Pub:  -t /home/kitchen/extractionfan/state   -m "1"   (extractionfan (device string), which is device1 (mosfet), on the Kitchen (room) controller, in the Home (building) is ON )
//  or for analog sensors
//  Pub:  -t /home/kitchen/lightsensor/value  -m "784"   (lightsensor (device string),........................................., on the Kitchen (room) controller, in the Home (building) is reporting a value of 784 )

String building = "home";
String room = "study";
// Unique but descriptive names.  Must be unique even among different controllers for best logic 

// Pinouts of the Board
// Outputs
#define WHITE_LED             14
#define BLUE_LED              4
#define RED_LED               5
#define GREEN_LED             13
#define BEEPER                15
// Inputs
#define LOOP                  16
#define DHTPIN 2     // what digital pin we're connected to
#define PIR                   12
#define BUTTON                0
#define LDR                   A0

#define PRESSED                0
#define NOT_PRESSED            1
uint8_t lastbutton = NOT_PRESSED;
int previousReading = LOW;


WiFiClient espClient;
PubSubClient client(espClient);

const char* mqtt_server = "192.168.1.100";
char message_buff[100];
long lastMsg = 0;
char msg[50];
int value = 0;

#define DHTTYPE DHT11   // DHT 11
DHT dht(DHTPIN, DHTTYPE);


void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  Serial.println(WiFi.softAPIP());
  //if you used auto generated SSID, print it
  Serial.println(myWiFiManager->getConfigPortalSSID());
}

void mqttcallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  int i = 0;
  for (i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    message_buff[i] = payload[i];
  }
   message_buff[i] = '\0';
  Serial.println();

  // create character buffer with ending null terminator (string)
  String msgString = String(message_buff);
  Serial.print("MSGBuffer: ");
  Serial.println(msgString);

  // Switch on the LED if an 1 was received as first character
  if(String(topic) == "/home/study/white/command"){
    if(String(message_buff) == "1"){
      digitalWrite(WHITE_LED, HIGH);   // Turn the LED on (Note that LOW is the voltage level
      Serial.println("On");
      client.publish("/home/study/white/state", "1");  
    } else {
     digitalWrite(WHITE_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level 
     Serial.println("Off");
     client.publish("/home/study/white/state", "0");  
    }
  }

  if(String(topic) == "/home/study/red/command"){
    if(String(message_buff) == "1"){
      digitalWrite(RED_LED, HIGH);   // Turn the LED on (Note that LOW is the voltage level
      Serial.println("On");
      client.publish("/home/study/red/state", "1");  
    } else {
     digitalWrite(RED_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level 
     Serial.println("Off");
     client.publish("/home/study/red/state", "0");  
    }
  }

  if(String(topic) == "/home/study/green/command"){
    if(String(message_buff) == "1"){
      digitalWrite(GREEN_LED, HIGH);   // Turn the LED on (Note that LOW is the voltage level
      Serial.println("On");
      client.publish("/home/study/green/state", "1");  
    } else {
     digitalWrite(GREEN_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level 
     Serial.println("Off");
     client.publish("/home/study/green/state", "0");  
    }
  }

  if(String(topic) == "/home/study/blue/command"){
    if(String(message_buff) == "1"){
      digitalWrite(BLUE_LED, HIGH);   // Turn the LED on (Note that LOW is the voltage level
      Serial.println("On");
      client.publish("/home/study/blue/state", "1");  
    } else {
     digitalWrite(BLUE_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level 
     Serial.println("Off");
     client.publish("/home/study/blue/state", "0");  
    }
  }

   if(String(topic) == "/home/study/beeper/command"){
      tone(BEEPER, String(message_buff).toInt(), 500);
  }
}

void setup() {
  tone(BEEPER, 500, 50);
  delay(50);
  tone(BEEPER, 500, 50);
  // put your setup code here, to run once:
  Serial.begin(115200);

  dht.begin();
  
  // outputs
  pinMode(WHITE_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BEEPER, OUTPUT);
  // Inputs
  pinMode(LOOP, INPUT);
  pinMode(PIR, INPUT);
  pinMode(BUTTON, INPUT);
  pinMode(LDR, INPUT);

  digitalWrite(WHITE_LED, LOW);
  digitalWrite(BLUE_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(BEEPER, LOW);
  digitalWrite(LOOP, HIGH);
  digitalWrite(PIR, HIGH);
  digitalWrite(BUTTON, HIGH);
  
     
  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  //reset settings - for testing
  //wifiManager.resetSettings();

  //set callback that gets called when connecting to previous WiFi fails, and enters Access Point mode
  wifiManager.setAPCallback(configModeCallback);

  //fetches ssid and pass and tries to connect, it does not connect it starts an access point with the specified name here  "AutoConnectAP" and goes into a blocking loop awaiting configuration
  if(!wifiManager.autoConnect()) {
    Serial.println("failed to connect and hit timeout");
    //reset and try again, or maybe put it to deep sleep
    #if defined(USEOLED)
      display.clear();
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(64, 8, "No WIFI");
      display.drawString(64, 18, "Resetting ESP");
      display.display();
    #endif
  
    ESP.reset();
    delay(1000);
  } 

  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");
     
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttcallback);
//  client.subscribe("/home/study/light/command");
//  reconnect();
  client.connect("ESP8266Client-Study");
  delay(100);
   // Subscribe
      client.subscribe("/home/study/red/command");
      client.loop();
      client.subscribe("/home/study/green/command");
      client.loop();
      client.subscribe("/home/study/blue/command");
      client.loop();
      client.subscribe("/home/study/white/command");
      client.loop();
      client.subscribe("/home/study/beeper/command");
      client.loop();
  
 
}

void reconnect() { 
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    delay(100);
    // Attempt to connect
    if (client.connect("ESP8266Client-Study")) {
      Serial.println("connected");
      // ... and resubscribe
      // Subscribe
      client.subscribe("/home/study/red/command");
      client.loop();
      client.subscribe("/home/study/green/command");
      client.loop();
      client.subscribe("/home/study/blue/command");
      client.loop();
      client.subscribe("/home/study/white/command");
      client.loop();
      client.subscribe("/home/study/beeper/command");
      client.loop();
      
      // Publish
      client.publish("/home/study/temp/value", "0");
      client.loop();
      client.publish("/home/study/humidity/value", "0");
      client.loop();
      client.publish("/home/study/motion/status", "0");
      client.loop();
      client.publish("/home/study/button/state", "0");
      client.loop();
      client.publish("/home/study/ldr/value", "0");
      client.loop();
      client.publish("/home/study/loop/status", "0");
      client.loop();

      // Capabilities
      client.publish("/home/study/red/value", "0");
      client.loop();
      client.publish("/home/study/green/value", "0");
      client.loop();
      client.publish("/home/study/blue/value", "0");
      client.loop();
      client.publish("/home/study/white/value", "0");
      client.loop();
      client.publish("/home/study/beeper/state", "0");
      client.loop();
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
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
  
  //client.publish("/home/study/light/state", String(digitalRead(RELAY_PIN));  
  
  if (digitalRead(WHITE_LED) == HIGH) {
    client.publish("/home/study/white/state", "1");  
  }  else {
    client.publish("/home/study/white/state", "0");  
  }
  delay(120);
  
  client.loop();
  if (digitalRead(RED_LED) == HIGH) {
    client.publish("/home/study/red/state", "1");  
  }  else {
    client.publish("/home/study/red/state", "0");  
  }
  delay(120);
  
  client.loop();
  if (digitalRead(GREEN_LED) == HIGH) {
    client.publish("/home/study/green/state", "1");  
  }  else {
    client.publish("/home/study/green/state", "0");  
  }
  delay(120);
  
  client.loop();
  if (digitalRead(BLUE_LED) == HIGH) {
    client.publish("/home/study/blue/state", "1");  
  }  else {
    client.publish("/home/study/blue/state", "0");  
  }
  delay(120);
  
  client.loop();
  if (digitalRead(LOOP) == HIGH) {
    client.publish("/home/study/loop/status", "0");  
  }  else {
    client.publish("/home/study/loop/status", "1");  
  }
  delay(120);
  
  client.loop();
  if (digitalRead(PIR) == HIGH) {
    client.publish("/home/study/motion/status", "1");  
  }  else {
    client.publish("/home/study/motion/status", "0");  
  }
  delay(120);

  
  
  client.loop();
  float val = analogRead(LDR);
  char lightlevel[50];
  dtostrf(val, 5, 2, lightlevel);
  client.publish("/home/study/ldr/value", lightlevel);  
  client.loop();
  delay(120);

  // Read Humidity
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
       
  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
  }
  char t2[50];
  char h2[50];
  dtostrf(t, 5, 2, t2);
  dtostrf(h, 5, 2, h2);
  client.publish("/home/study/temp/value", t2);
  client.loop();
  client.publish("/home/study/humidity/value", h2);
  client.loop();
    


 Serial.println(".");
 
 
}
