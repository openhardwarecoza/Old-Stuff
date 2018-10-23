//#include <dht22.h>
#include <Versalino.h>
#include <U8glib.h>

/*
 *  SID connected to D2
 *  CS  connected to D3
 *  SCK connected to D5
 *  No reset connected
 */
U8GLIB_SSD1306_128X64 u8g(U8G_I2C_OPT_NONE);	// HW SPI Com: CS = 10, A0 = 9 (Hardware Pins are  SCK = 13 and MOSI = 11)
//U8GLIB_ST7920_128X64 u8g(5, 2, 3, U8G_PIN_NONE);         

//dht22 DHT22;
const int LAST_ROW = 63;
const int LAST_COL = 110;
static char* TEMP_LABELS[] = {"25", "75", "125", "175", "225", "275"};
int temp;
int temp2;
char string2[5];
int dots;
int bars[LAST_COL]; 
int cnt = 0;

void setup(void) {
  // DHT22 temp sensor connected to pin D9 
  Serial.begin(9600);
   // picture loop
  u8g.firstPage(); 
  do {
    draw_splash_screen();
  } while( u8g.nextPage() );
 
  // show splash screen for a 2 seconds
pinMode(2, INPUT_PULLUP);
while(digitalRead(2)==HIGH)
{
  // Do Nothing
}

 }

void shiftBars() {
  for(int n = 1; n < LAST_COL; n++) {
    bars[n-1] = bars[n];
  }
}

void draw_splash_screen() {
    u8g.setFont(u8g_font_fub14);
    u8g.drawFrame(0,0,128,64);
    u8g.drawStr(4, 28, "Reflow Oven");
    u8g.drawStr(8, 50, "Press Start");
}

void draw(void) {
  u8g.setFont(u8g_font_04b_03);
  drawDegreeMarks();
  for(int j = 0; j < LAST_COL; j++) {
    u8g.drawVLine(16 + j, LAST_ROW - 2 - bars[j], bars[j]);
  }
 dtostrf(temp2,5,1,string2);
 u8g.drawStr(64, 12, string2);

}

void drawDegreeMarks() {
  int k = 0;
  for(int i = LAST_ROW - 3; i > 0; i = i-10) {
    u8g.drawStr(0, i + 2, TEMP_LABELS[k++]);
//    u8g.drawHLine(10, i, 4);
  }   
}

void loop(void) {
  int chk = (analogRead(0) -25);
  temp = map(chk, 1, 1024, 1, 64);
  temp2 = map(chk, 1, 1024, 25, 275);
  Serial.println(temp);
  dots = (temp);
  if(cnt <= LAST_COL - 1) {
    bars[cnt++] = dots;
  }
  else {
    bars[cnt] = dots;
    shiftBars();
    cnt = LAST_COL - 1;
  }
  u8g.firstPage();  
  do {
    draw();
  } while( u8g.nextPage() );
  // redraw once a minute
  delay(10); 
}
