#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "WiFiManager.h"          //https://github.com/tzapu/WiFiManager
#include <PubSubClient.h>


// SmartHome Configuration
// Building/Room/Devices names are used to construct the MQTT Topic:
// for example:  /home/kitchen/extractionfan
// Management of these devices consist of: command (from network to device = command the board to do something)  or status (from the device to the network.  Usually a confirmation message in response to a command, but could also be timed sensor value broadcast, motion traps, etc)
//
//  Sub:  -t /home/kitchen/extractionfan/command  -m "1"   (Turn on, the extractionfan (device string), which is device1 (mosfet), on the Kitchen (room) controller, in the Home (building). )
//  Pub:  -t /home/kitchen/extractionfan/state   -m "1"   (extractionfan (device string), which is device1 (mosfet), on the Kitchen (room) controller, in the Home (building) is ON )
//  or for analog sensors
//  Pub:  -t /home/kitchen/lightsensor/value  -m "784"   (lightsensor (device string),........................................., on the Kitchen (room) controller, in the Home (building) is reporting a value of 784 )

//#define USEOLED 1  // Uncomment if you want to use a I2C LCD

#if defined(USEOLED)
  #include "SSD1306.h" // alias for `#include "SSD1306Wire.h"` // ESP8266 OLED
  // D3 -> SDA
  // D4 -> SCL
  // Initialize the OLED display using Wire library
  SSD1306  display(0x3c, 4, 5);
#endif

String building = "home";
String room = "Study";
// Unique but descriptive names.  Must be unique even among different controllers for best logic 
String device1 = "Light-1";

// Pinouts of the Relay
#define RELAY_PIN              12
#define LED_PIN                13
#define BUTTON_PIN             0
#define PRESSED                0
#define NOT_PRESSED            1
uint8_t lastbutton = NOT_PRESSED;
uint8_t holdcount = 0;
uint8_t multiwindow = 0;
uint8_t multipress = 0;

WiFiClient espClient;
PubSubClient client(espClient);
const char* mqtt_server = "192.168.1.100";
char message_buff[100];
long lastMsg = 0;
char msg[50];
int value = 0;



void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  #if defined(USEOLED)
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);#
    display.drawString(64, 8, "NO WIFI");
    display.drawString(64, 20, "AP Mode: ON");
    display.drawString(64, 30, myWiFiManager->getConfigPortalSSID() );
    display.drawString(64, 40, "Please Setup");
    display.display();
  #endif
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

  #if defined(USEOLED)
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);
    display.drawString(64, 7, topic);
    display.drawString(64, 18, msgString);
    display.display();
  #endif

  // Switch on the LED if an 1 was received as first character
  if(String(topic) == "/home/study/light/command"){
    Serial.println("Matched Topic");
    
    if(String(message_buff) == "1"){
      digitalWrite(RELAY_PIN, HIGH);   // Turn the LED on (Note that LOW is the voltage level
      Serial.println("On");
      client.publish("/home/study/light/state", "1");  
    } else {
     digitalWrite(RELAY_PIN, LOW);   // Turn the LED on (Note that LOW is the voltage level 
     Serial.println("Off");
     client.publish("/home/study/light/state", "0");  
    }
  }

  String deviceid = "/" + building + "/" + room + "/" + device1;
// client.publish(deviceid, digitalRead(device1pin));  


}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  #if defined(USEOLED)
    display.init();
  
    display.flipScreenVertically();
    display.setFont(ArialMT_Plain_10);
  
    display.clear();
    display.setTextAlignment(TEXT_ALIGN_CENTER);
    display.drawString(64, 11, "Starting");
    display.drawString(64, 33, "SmartHome");
    display.display();
  #endif

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

     
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
  #if defined(USEOLED)
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
  #endif
    
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttcallback);
  client.subscribe("/home/study/light/command");
 
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    #if defined(USEOLED)
      display.clear();
      display.setTextAlignment(TEXT_ALIGN_CENTER);
      display.drawString(64, 8, "Starting MQTT");
      display.drawString(64, 18, "Connecting...");
      display.display();
    #endif
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      #if defined(USEOLED)
        display.clear();
        display.setTextAlignment(TEXT_ALIGN_CENTER);
        display.drawString(64, 8, "MQTT Connected");
        display.drawString(64, 18, "OK");
        display.display();
        delay(1000);
      #endif
      // Once connected, publish an announcement...
//    client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("/home/study/light/command");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      #if defined(USEOLED)
        display.clear();
        display.setTextAlignment(TEXT_ALIGN_CENTER);
        display.drawString(64, 8, "No MQTT Broker");
        display.drawString(64, 18, "Retrying in");
        display.drawString(64, 28, "5 seconds");
        display.display();
        delay(1000);
      #endif
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

if (digitalRead(RELAY_PIN) == HIGH) {
  client.publish("/home/study/light/state", "1");  
}  else {
  client.publish("/home/study/light/state", "0");  
}

delay(1000);
//Serial.println("Loop");

  

}
