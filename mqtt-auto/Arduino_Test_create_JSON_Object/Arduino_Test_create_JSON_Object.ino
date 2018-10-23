#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// NB!! Bump up the #define MQTT_MAX_PACKET_SIZE to 1024 in PubSubClient.h!!!!

// Update these with values suitable for your network.

const char* ssid = "OPS_2GHZ_IOT";
const char* password = "aabbccddeeff";
const char* mqtt_server = "10.3.0.254";

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[512];
int value = 0;



String room = "Office";
String idName = "officefan";
String friendlyName = "Office Fan";
String type = "switch";

String announceTopic = "{  \"room\": \"" + room + "\",   \"idName\": \"" +idName+ "\",   \"friendlyName\": \"" + friendlyName + "\",   \"type\": \"" + type + "\" ,\"topics\": { \"cmdTopic\": \"/mqtt/" + room + "/" + idName + "/cmd\", \"stateTopic\": \"/mqtt/" + room + "/" + idName + "/state\", \"pingTopic\": \"/mqtt/" + room + "/" + idName + "/ping\", \"colorTopic\": \"/mqtt/" + room + "/" + idName + "/color\" }}";
String cmdTopic = "/mqtt/" + room + "/" + idName + "/cmd";
String colorTopic = "/mqtt/" + room + "/" + idName + "/color";
String stateTopic = "/mqtt/" + room + "/" + idName + "/state";
String pingTopic = "/mqtt/" + room + "/" + idName + "/ping";

// RGB FET
#define redPIN 12
#define greenPIN 14
#define bluePIN 16


// W FET
#define w1PIN 13

// #define PWMRANGE 255
// #define PWM_VALUE 31
//int gamma_table[PWM_VALUE+1] = {
// 0, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7, 8, 10, 11, 13, 16, 19, 23,
// 27, 32, 38, 45, 54, 64, 76, 91, 108, 128, 152, 181, 215, 255
//};
 
 #define PWM_VALUE 63
//int gamma_table[PWM_VALUE+1] = {
// 0, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10,
// 11, 12, 13, 15, 17, 19, 21, 23, 26, 29, 32, 36, 40, 44, 49, 55,
// 61, 68, 76, 85, 94, 105, 117, 131, 146, 162, 181, 202, 225, 250,
// 279, 311, 346, 386, 430, 479, 534, 595, 663, 739, 824, 918, 1023
//};

int gamma_table[PWM_VALUE+1] = {
 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 10,
 11, 12, 13, 15, 17, 19, 21, 23, 26, 29, 32, 36, 40, 44, 49, 55,
 61, 68, 76, 85, 94, 105, 117, 131, 146, 162, 181, 202, 225, 250,
 279, 311, 346, 386, 430, 479, 534, 595, 663, 739, 824, 918, 1023
};



void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println(announceTopic);
  Serial.print("cmdTopic: ");
  Serial.println(cmdTopic);
  Serial.print("stateTopic: ");
  Serial.println(stateTopic);
  Serial.print("pingTopic: ");
  Serial.println(pingTopic);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 10000) {
    lastMsg = now;
    Serial.println(announceTopic);
    const char *mycharp = announceTopic.c_str();
    if (client.publish("/mqtt/announce", mycharp)) {
      //Serial.println("Publish JSON ok");
    } else {
      Serial.println("Publish JSON Failed");
    }
    
  }
  
}





void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  if(String(topic) == colorTopic){
      Serial.print("COLOR: ");
      for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
      }
      Serial.println();
  }
  else if(String(topic) == cmdTopic){
      Serial.print("CMD: ");
      for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
      }
      Serial.println();
  }
   else if(String(topic) == pingTopic){
      Serial.print("PING: ");
      for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
      }
      Serial.println();
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      const char *cmdtopic = cmdTopic.c_str();
      const char *pingtopic = pingTopic.c_str();
      const char *colortopic = colorTopic.c_str();
      client.subscribe(cmdtopic);
      client.subscribe(pingtopic);
      client.subscribe(colortopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

