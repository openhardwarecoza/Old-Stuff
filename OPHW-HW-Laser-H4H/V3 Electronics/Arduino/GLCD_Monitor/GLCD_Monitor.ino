#include "U8glib.h"

U8GLIB_ST7920_128X64_4X u8g(15, 16, 17);	// SPI Com: SCK = en = 18, MOSI = rw = 16, CS = di = 17

//PIN Declarations
int CHILLER_OK = 5;
int DOOR_OK = 6;
int LIMIT2_OK = 7;
int LIMIT1_OK = 8;
int LASER_PROT = 9;
int LASER_TH = 10;
int LM35 = A0;
const int numReadings = 4;
int beam1 = 0;                // the average
int beam2 = 0;                // the average
int beam3 = 0;                // the average
int beam4 = 0;                // the average
int beam5 = 0;                // the average
int beam6 = 0;                // the average
int beam7 = 0;                // the average
int beam8 = 0;                // the average
int beam9 = 0;                // the average
int beam10 = 0;                // the average
int beam11 = 0;                // the average
int beam12 = 0;                // the average
int beam13 = 0;                // the average
int beam14 = 0;                // the average
int beam15 = 0;                // the average
int beam16 = 0;                // the average
int beam17 = 0;                // the average
int beam18 = 0;                // the average
int beam19 = 0;                // the average
int beam20 = 0;                // the average

int beamTotal = 0;

void draw(void) {
  u8g.drawFrame(0,0,64,128);
  u8g.drawFrame(0,16,64,128);
  u8g.setFont(u8g_font_7x13);
  u8g.drawStr( 4, 11, "FreeBurn");
  u8g.setFont(u8g_font_u8glib_4);
  u8g.drawStr( 19, 15, "laser cutter");

  // Measure Coolant temp
  u8g.setFont(u8g_font_5x7);
  u8g.drawStr( 4, 24, "Temp:");
  // Measure LM35 on Pin A0
  float reading = analogRead(LM35);
  float voltage = reading * 5.0; 
  voltage /= 1024.0;
  float temperatureC = (voltage -.05 )*100 ;
  int decimal,fraction;
  char temp[5];
  dtostrf(temperatureC,5,1,temp);
  // End of Measure Temp
  u8g.drawStr(35,24,temp);
  // End of Coolant temp

    // Check Pump Status
  u8g.drawStr( 4, 32, "Pump:");
  if (digitalRead(CHILLER_OK) == HIGH) 
  {
    u8g.drawStr( 41, 32, "OK");
  }
  else
  {
    u8g.drawStr( 30, 32, "NOT OK");
  }
  // End of Pump Check

    // Check door Status
  u8g.drawStr( 4, 40, "Door:");
  if (digitalRead(DOOR_OK) == HIGH) 
  {
    u8g.drawStr( 41, 40, "OK");
  }
  else
  {
    u8g.drawStr( 30, 40, "NOT OK");
  }
  // End of Door Check

  // Begin Limits Check
  u8g.drawStr( 4, 48, "Limits:");
  u8g.drawStr( 4, 56, "1-3:");
  u8g.drawStr( 4, 64, "4-6:");
  if (digitalRead(LIMIT2_OK) == HIGH) 
  {
    u8g.drawStr( 41, 56, "OK");
  }
  else
  {
    u8g.drawStr( 30, 56, "NOT OK");
  }
  if (digitalRead(LIMIT1_OK) == HIGH) 
  {
    u8g.drawStr( 41, 64, "OK");
  }
  else
  {
    u8g.drawStr( 30, 64, "NOT OK");
  }
  // End Limits Check

  // Check Laser-WP Status
  u8g.drawStr( 4, 72, "Protection:");
  if (digitalRead(LASER_PROT) == LOW) 
  {
    u8g.drawStr( 22, 80, "READY");
  }
  else
  {
    u8g.drawStr( 11, 80, "TRIGGERED");
  }
  // End of Laser-WP Check

    // Check door Status
  u8g.drawStr( 4, 88, "Beam:");
  beam1 = digitalRead(LASER_TH); 
  delay(3);
  beam2 = digitalRead(LASER_TH); 
  delay(3);
  beam3 = digitalRead(LASER_TH); 
  delay(3);
  beam4 = digitalRead(LASER_TH); 
  delay(3);
  beam5 = digitalRead(LASER_TH); 
  delay(3);
  beam6 = digitalRead(LASER_TH); 
  delay(3);
  beam7 = digitalRead(LASER_TH); 
  delay(3);
  beam8 = digitalRead(LASER_TH); 
  delay(3);
  beam9 = digitalRead(LASER_TH); 
  delay(3);
  beam10 = digitalRead(LASER_TH); 
  delay(3);
  beam11 = digitalRead(LASER_TH); 
  delay(3);
  beam12 = digitalRead(LASER_TH); 
  delay(3);
  beam13 = digitalRead(LASER_TH); 
  delay(3);
  beam14 = digitalRead(LASER_TH); 
  delay(3);
  beam15 = digitalRead(LASER_TH); 
  delay(3);
  beam16 = digitalRead(LASER_TH); 
  delay(3);
  beam17 = digitalRead(LASER_TH); 
  delay(3);
  beam18 = digitalRead(LASER_TH); 
  delay(3);
  beam19 = digitalRead(LASER_TH); 
  delay(3);
  beam20 = digitalRead(LASER_TH); 
  delay(3);

  beamTotal = beam1 + beam2 + beam3 + beam4 + beam5 + beam6 + beam7 + beam8 + beam9 + beam10 + beam11 + beam12 + beam13 + beam14 + beam15 + beam16 + beam17 + beam18 + beam19 + beam20;


  if (beamTotal >= 1 )
  {
    u8g.drawStr( 41, 88, "ON");
  }
  else
  {
    u8g.drawStr( 41, 88, "OFF");
  }
  // End of Door Check


}

void setup(void) {
  pinMode(5, INPUT);
  pinMode(6, INPUT);
  pinMode(7, INPUT);
  pinMode(8, INPUT);
  pinMode(9, INPUT);
  pinMode(10, INPUT);


  // flip screen, if required
  u8g.setRot270();

  // set SPI backup if required
  //u8g.setHardwareBackup(u8g_backup_avr_spi);

  // assign default color value
  if ( u8g.getMode() == U8G_MODE_R3G3B2 ) {
    u8g.setColorIndex(255);     // white
  }
  else if ( u8g.getMode() == U8G_MODE_GRAY2BIT ) {
    u8g.setColorIndex(3);         // max intensity
  }
  else if ( u8g.getMode() == U8G_MODE_BW ) {
    u8g.setColorIndex(1);         // pixel on
  }
  else if ( u8g.getMode() == U8G_MODE_HICOLOR ) {
    u8g.setHiColorByRGB(255,255,255);
  }
}

void loop(void) {
  // picture loop
  u8g.firstPage();  
  do {
    draw();
  } 
  while( u8g.nextPage() );

  // rebuild the picture after some delay
  delay(100);
}


