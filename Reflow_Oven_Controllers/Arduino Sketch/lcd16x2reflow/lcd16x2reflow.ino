#include <LiquidCrystal.h>

// Reflow Profiles are defined in temperature_profile.h
#include "temperature_profile.h"

//  Uncomment the sensor type you are using
// Note DS18B20 may not be suitable for reflow temps, more for testing or other process controls

// #define SENSORTYPE18B20
// #define SENSORTYPEEPCOS
#define SENSORTYPEMAX6675


#ifdef SENSORTYPE18B20
#include <OneWire.h>
bool done = false;
#include "ds18b20_sensor.h"
#endif

#ifdef SENSORTYPEEPCOS
#define THERMISTOR_PIN 0
bool done = false;
#include "epcos_sensor.h"
#endif

#ifdef SENSORTYPEMAX6675
#include "max6675.h"
#include "max6675_sensor.h"
bool done = false;
#endif

LiquidCrystal lcd(7, 6, 5, 4, 3, 2);

byte degc[8] = {
  B01000,
  B10100,
  B01000,
  B00011,
  B00100,
  B00100,
  B00011,
  B00000
};

byte uparrow[8] = {
  0b00000,
  0b00100,
  0b01110,
  0b11111,
  0b00100,
  0b00100,
  0b00100,
  0b00000
};

byte downarrow[8] = {
  0b00000,
  0b00100,
  0b00100,
  0b00100,
  0b11111,
  0b01110,
  0b00100,
  0b00000
};

byte updown[8] = {
  0b00100,
  0b01110,
  0b11111,
  0b00100,
  0b00100,
  0b11111,
  0b01110,
  0b00100
};

byte ovenleft[8] = {
  0b11111,
  0b10000,
  0b10111,
  0b10100,
  0b10111,
  0b10000,
  0b11111,
  0b00100
};

byte ovenright[8] = {
  0b11111,
  0b00001,
  0b11011,
  0b01001,
  0b11011,
  0b00001,
  0b11111,
  0b00100
};

//  Solid State Relay Output and Control
const int heatPin =  8;     // the number of the LED pin.  This also controls the heater
int heatState = HIGH;         // heatState used to set the LED and heater
long previousMillis = 0;     // will store last time LED/heater was updated
const long interval = 1000;  // interval at which to sample temperature (milliseconds)
long time = 0;               // Time since start in seconds


// Setup Button Map
int downbutton = A0;
int selectbutton = A1;
int upbutton = A2;


//States for the menu.
unsigned int currentMenuItem = 1;
int lastState = 0;

void setup(void) {

  pinMode(upbutton, INPUT); // down arrow
  pinMode(selectbutton, INPUT); // enter
  pinMode(downbutton, INPUT); // up arrow


  pinMode(heatPin, OUTPUT); // Heater
  done = false;

  digitalWrite(upbutton, HIGH);  // Button for Leaded
  digitalWrite(selectbutton, HIGH);  // Button for Lead Free
  digitalWrite(downbutton, HIGH);  // Button for Drying

  // Setup Display
  lcd.begin(16, 2);
  lcd.createChar(0, degc);
  lcd.createChar(1, uparrow);
  lcd.createChar(2, downarrow);
  lcd.createChar(3, updown);
  lcd.createChar(4, ovenleft);
  lcd.createChar(5, ovenright);

  float t = temperature();

  lcd.setCursor(0,0);
  lcd.print(" Reflow Oven ");
  lcd.write((uint8_t)4);
  lcd.write((uint8_t)5);
  lcd.setCursor(0,1);
  lcd.print("Press ");
  lcd.write((uint8_t)1);
  lcd.print(" or ");
  lcd.write((uint8_t)2);


}


void loop(void) {
  mainMenu();
}


//Display Menu Option based on Index.
void displayMenu(int x) {
  switch (x) {
    case 2:
      clearPrintTitle();
      lcd.print ("> Dry PCB");
      break;
    case 3:
      clearPrintTitle();
      lcd.print ("> Solder Pb");
      break;
    case 4:
      clearPrintTitle();
      lcd.print ("> Solder PbF");
      break;
  }
}

//Print a basic header on Row 1.
void clearPrintTitle() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Set Cycle:");
  lcd.setCursor(0, 1);
   if (currentMenuItem > 3) {
    lcd.write((uint8_t)1);  
  } else if (currentMenuItem < 3) {
    lcd.write((uint8_t)2);  
  } else {
    lcd.write((uint8_t)3);  
  }
  
}

//Show the selection on Screen.
void selectMenu(int x) {
  switch (x) {

    case 2:
      //clearPrintTitle();
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print ("Drying PCB");
      delay(200);
      rundry();
      break;
    case 3:
      //clearPrintTitle();
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print ("Soldering Pb");
      delay(200);
      runpb();
      break;
    case 4:
      //clearPrintTitle();
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print ("Soldering PbF");
      delay(200);
      runpbf();

      
      break;
  }
}

void mainMenu() {
  //State = 0 every loop cycle.
  int state = 0;

  lcd.setCursor(0, 0);

  if (digitalRead(upbutton) == LOW) {
    state = 1;
  } else if (digitalRead(downbutton) == LOW) {
    state = 2;
  } else if (digitalRead(selectbutton) == LOW) {
    state = 3;
  }


//  lcd.setCursor(0, 0);
//  lcd.print(currentMenuItem);
  //If we are out of bounds on th menu then reset it.
  if (currentMenuItem > 4) {
    currentMenuItem = 4;
  }

  if (currentMenuItem < 2) {
    currentMenuItem = 2;
  }



  //If we have changed Index, saves re-draws.
  if (state != lastState) {
    if (state == 1) {
      //If Up
      currentMenuItem = currentMenuItem - 1;
      displayMenu(currentMenuItem);
    } else if (state == 2) {
      //If Down
      currentMenuItem = currentMenuItem + 1;
      displayMenu(currentMenuItem);
    } else if (state == 3) {
      //If Selected
      selectMenu(currentMenuItem);
    }
    //Save the last State to compare.
    lastState = state;
  }
  //Small delay
  delay(5);
}

int targetpb(long t)
{
  if (t <= pb[0][0])
    return pb[0][1];
  if (t >= pb[PLEN - 1][0])
  {
    done = true; // We are off the end of the time curve
    return pb[PLEN - 1][1];
  }
  for (int i = 1; i < PLEN - 1; i++)
  {
    if (t <= pb[i][0])
      return (int)(pb[i - 1][1] + ((t - pb[i - 1][0]) * (pb[i][1] - pb[i - 1][1])) /
                   (pb[i][0] - pb[i - 1][0]));
  }
  return 0;
}


int targetpbf(long t)
{
  if (t <= pbf[0][0])
    return pbf[0][1];
  if (t >= pbf[PLEN - 1][0])
  {
    done = true; // We are off the end of the time curve
    return pbf[PLEN - 1][1];
  }
  for (int i = 1; i < PLEN - 1; i++)
  {
    if (t <= pbf[i][0])
      return (int)(pbf[i - 1][1] + ((t - pbf[i - 1][0]) * (pbf[i][1] - pbf[i - 1][1])) /
                   (pbf[i][0] - pbf[i - 1][0]));
  }
  return 0;
}

int targetdry(long t)
{
  if (t <= dry[0][0])
    return dry[0][1];
  if (t >= dry[PLEN - 1][0])
  {
    done = true; // We are off the end of the time curve
    return dry[PLEN - 1][1];
  }
  for (int i = 1; i < PLEN - 1; i++)
  {
    if (t <= dry[i][0])
      return (int)(dry[i - 1][1] + ((t - dry[i - 1][0]) * (dry[i][1] - dry[i - 1][1])) /
                   (dry[i][0] - dry[i - 1][0]));
  }
  return 0;
}


// Mode Leaded
void runpb() {

  int total = pb[5][0];


  // Go round and round
  while (true)
  {
    int t;
    unsigned long currentMillis = millis();

    if (currentMillis - previousMillis > interval)
    {
      previousMillis = currentMillis; // set next time

      // Get the actual temperature
      t = temperature();
      // One second has passed
      time++;
      // Find the target temperature
      int tg = targetpb(time);
      // Simple bang-bang temperature control
      if (t < tg)
      {
        heatState = HIGH;
      } else
      {
        heatState = LOW;
      }
      // Turn the heater on or off (and the LED)
      digitalWrite(heatPin, heatState);
      // Keep the user amused
      if (done)
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Done");
        lcd.setCursor(0, 1);
      }
      else
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Time ");
        lcd.print(time);
        lcd.print("/");
        lcd.print(total);
        lcd.print("sec");

        // show temperature
        // Temp: convert to string
        char curtemp[5];
        dtostrf(t, 5, 1, curtemp);
        // Temp Display

        lcd.setCursor(0, 1);
        lcd.print("T:");
        lcd.print(curtemp);
        lcd.print("/");
        char tgt[5];
        dtostrf(tg, 5, 1, tgt);
        // Temp Display
        lcd.print(tgt);
        lcd.write((uint8_t)0);

      }
    }
  }
}



// Mode Lead Free
void runpbf() {
  int total = pbf[5][0];

  // Go round and round
  while (true)
  {
    int t;
    unsigned long currentMillis = millis();

    if (currentMillis - previousMillis > interval)
    {
      previousMillis = currentMillis; // set next time

      // Get the actual temperature
      t = temperature();
      // One second has passed
      time++;
      // Find the target temperature
      int tg = targetpb(time);
      // Simple bang-bang temperature control
      if (t < tg)
      {
        heatState = HIGH;
      } else
      {
        heatState = LOW;
      }
      // Turn the heater on or off (and the LED)
      digitalWrite(heatPin, heatState);
      // Keep the user amused
      if (done)
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Done");
        lcd.setCursor(0, 1);
      }
      else
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Time ");
        lcd.print(time);
        lcd.print("/");
        lcd.print(total);
        lcd.print("sec");

        // show temperature
        // Temp: convert to string
        char curtemp[5];
        dtostrf(t, 5, 1, curtemp);
        // Temp Display

        lcd.setCursor(0, 1);
        lcd.print("T:");
        lcd.print(curtemp);
        lcd.print("/");
        char tgt[5];
        dtostrf(tg, 5, 1, tgt);
        // Temp Display
        lcd.print(tgt);
        lcd.write((uint8_t)0);

      }
    }
  }
}

// Mode Drying
void rundry() {
  int total = dry[5][0];


  // Go round and round
  while (true)
  {
    int t;
    unsigned long currentMillis = millis();

    if (currentMillis - previousMillis > interval)
    {
      previousMillis = currentMillis; // set next time

      // Get the actual temperature
      t = temperature();
      // One second has passed
      time++;
      // Find the target temperature
      int tg = targetpb(time);
      // Simple bang-bang temperature control
      if (t < tg)
      {
        heatState = HIGH;
      } else
      {
        heatState = LOW;
      }
      // Turn the heater on or off (and the LED)
      digitalWrite(heatPin, heatState);
      // Keep the user amused
      if (done)
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Done");
        lcd.setCursor(0, 1);
      }
      else
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Time ");
        lcd.print(time);
        lcd.print("/");
        lcd.print(total);
        lcd.print("sec");

        // show temperature
        // Temp: convert to string
        char curtemp[5];
        dtostrf(t, 5, 1, curtemp);
        // Temp Display

        lcd.setCursor(0, 1);
        lcd.print("T:");
        lcd.print(curtemp);
        lcd.print("/");
        char tgt[5];
        dtostrf(tg, 5, 1, tgt);
        // Temp Display
        lcd.print(tgt);
        lcd.write((uint8_t)0);
      }
    }
  }
}
