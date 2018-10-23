char volt2[5];
char vcc[5];
char temp[5];

#include "U8glib.h"
#include <stdio.h>
#include <stdlib.h>


uint8_t contrast = 8 * 14;

U8GLIB_PCD8544 u8g(13, 11, 10, 9, 8);		// SPI Com: SCK = 13, MOSI = 11, CS = 10, A0 = 9, Reset = 8


void draw(void) {
  // graphic commands to redraw the complete screen should be placed here  
  u8g.setFont(u8g_font_freedoomr10r);
  //u8g.setFont(u8g_font_osb21);
  int sensorValue = analogRead(A1);
  // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
  float volt1 = sensorValue * (5.0 / 1023.0);
  float voltage = volt1 * 2.982142857142857;
  // print out the value you read:
  dtostrf(voltage,5,1,volt2);
  u8g.drawStr( 0, 16, "BATT:");
  u8g.drawStr( 32, 16, volt2);
  u8g.drawStr( 76, 16, "V:");

  float volt3 = readVcc();
  dtostrf(volt3,4,0,vcc);
  u8g.drawStr( 0, 32, "VCC:");
  u8g.drawStr( 32, 32, vcc);
  u8g.drawStr( 76, 32, "MV:");


}

void setup(void) {

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
  u8g.setContrast(contrast);
}

void loop(void) {

  u8g.firstPage();  
  do {
    draw();
  } while( u8g.nextPage() );
  
  delay(500);
}


long readVcc() {
  long result;
  // Read 1.1V reference against AVcc
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Convert
  while (bit_is_set(ADCSRA,ADSC));
  result = ADCL;
  result |= ADCH<<8;
  result = 1126400L / result; // Back-calculate AVcc in mV
  return result;
}

