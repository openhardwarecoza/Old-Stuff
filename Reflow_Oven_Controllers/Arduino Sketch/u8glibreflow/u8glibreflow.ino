#include "U8glib.h"

// Reflow Profiles are defined in temperature_profile.h
#include "temperature_profile.h"

//  Uncomment the sensor type you are using
// Note DS18B20 may not be suitable for reflow temps, more for testing or other process controls

// #define SENSORTYPE18B20
 #define SENSORTYPEEPCOS
// #define SENSORTYPEMAX6675


#ifdef SENSORTYPE18B20
  #include <OneWire.h>
  bool done=false;  
  #include "ds18b20_sensor.h"
#endif

#ifdef SENSORTYPEEPCOS
  #define THERMISTOR_PIN 0
  bool done=false;  
  #include "epcos_sensor.h"
#endif

#ifdef SENSORTYPEMAX6675
  #include "max6675.h"
  #include "max6675_sensor.h"
  bool done=false;  
#endif

// Define ST7920 128/64 GLCD Object
U8GLIB_ST7920_128X64_4X u8g(18, 16, 17);	// SPI Com: SCK = en = 18, MOSI = rw = 16, CS = di = 17

//  Solid State Relay Output and Control
const int heatPin =  13;     // the number of the LED pin.  This also controls the heater
int heatState = LOW;         // heatState used to set the LED and heater
long previousMillis = 0;     // will store last time LED/heater was updated
const long interval = 1000;  // interval at which to sample temperature (milliseconds)
long time = 0;               // Time since start in seconds

int targetpb(long t)
{
  if(t <= pb[0][0])
   return pb[0][1];
  if(t >= pb[PLEN-1][0])
  {
   done = true; // We are off the end of the time curve
   return pb[PLEN-1][1];
  }
  for(int i = 1; i < PLEN-1; i++)
  {
     if(t <= pb[i][0])
       return (int)(pb[i-1][1] + ((t - pb[i-1][0])*(pb[i][1] - pb[i-1][1]))/
         (pb[i][0] - pb[i-1][0]));
  }
  return 0;
}


int targetpbf(long t)
{
  if(t <= pbf[0][0])
   return pbf[0][1];
  if(t >= pbf[PLEN-1][0])
  {
   done = true; // We are off the end of the time curve
   return pbf[PLEN-1][1];
  }
  for(int i = 1; i < PLEN-1; i++)
  {
     if(t <= pbf[i][0])
       return (int)(pbf[i-1][1] + ((t - pbf[i-1][0])*(pbf[i][1] - pbf[i-1][1]))/
         (pbf[i][0] - pbf[i-1][0]));
  }
  return 0;
}

int targetdry(long t)
{
  if(t <= dry[0][0])
   return dry[0][1];
  if(t >= dry[PLEN-1][0])
  {
   done = true; // We are off the end of the time curve
   return dry[PLEN-1][1];
  }
  for(int i = 1; i < PLEN-1; i++)
  {
     if(t <= dry[i][0])
       return (int)(dry[i-1][1] + ((t - dry[i-1][0])*(dry[i][1] - dry[i-1][1]))/
         (dry[i][0] - dry[i-1][0]));
  }
  return 0;
}


 
void setup(void) {
  pinMode(heatPin, OUTPUT); // Heater
  done = false;
  pinMode(4, INPUT);      // Button for Leaded
  digitalWrite(4, HIGH);  // Button for Leaded
  pinMode(5, INPUT);      // Button for Lead Free
  digitalWrite(5, HIGH);  // Button for Lead Free
  pinMode(6, INPUT);      // Button for Drying
  digitalWrite(6, HIGH);  // Button for Drying
  
  // Setup Display
  u8g.setRot180();
  u8g.setColorIndex(1);   // pixel on

 // Startup Splash Screen
   u8g.firstPage();  
      do {
      u8g.setFont(u8g_font_helvB08);
      //u8g.setFont(u8g_font_osb21);
      u8g.drawStr( 30, 12, "Reflow Oven");
     } while( u8g.nextPage() );

 
     float t = temperature();
 
     // Wait until a button is pressed
     while(digitalRead(4) == HIGH && digitalRead(5) == HIGH && digitalRead(6) == HIGH )   {
          // Display Status Updates while we wait
          u8g.firstPage();  
            do {
            
              // Temperature: convert to string   
              float temperature2 = temperature();
              char temp[5];
              dtostrf(temperature2,5,1,temp);
      
      
              // Temp Display        
              u8g.setFont(u8g_font_helvB08);
              u8g.drawStr( 30, 12, "Reflow Oven");
              u8g.drawLine(0, 15, 127, 15);
              u8g.drawStr( 6, 26, "Current Temp:");
              u8g.drawLine(0, 28, 127, 28);
              u8g.drawStr(82,26,temp);
              u8g.drawStr(110,26,"\260C");

              // Select Cycle 
              u8g.setFont(u8g_font_helvB08);
              u8g.drawStr(32,41,"Select Cycle:");
              
              // Font for Buttons
              u8g.setFont(u8g_font_6x10);
      
              // Lead Profile Button
              u8g.drawRFrame(3,46,37,18, 8);
              u8g.drawStr(16,58,"Pb");
              
              // Lead-Free Profile Button
              u8g.drawRFrame(45,46,37,18, 8);
              u8g.drawStr(56,58,"PbF");
      
              // Drying Cycle Profile Button
              u8g.drawRFrame(87,46,37,18, 8);
              u8g.drawStr(97,58,"Dry"); 
                      
      } while( u8g.nextPage() );
    
    };


      // Once one of the Mode buttons was pressed, start a non-interactive loop to drive the profile selected
      
        // Mode Leaded
        if (digitalRead(4) == LOW) {
        
            int total = pb[5][0];
              
            
            // Go round and round
            while(true)   
            {
              int t;
              unsigned long currentMillis = millis();
             
              if(currentMillis - previousMillis > interval) 
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
                if(done)
                  {
            
                u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 30, 12, "Leaded Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                  u8g.drawStr(45,30,"Finished! ");
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(1,48,curtemp);
                    u8g.drawStr(33,48,"\260C - Cooling Down");
            
                    
                   } while( u8g.nextPage() );
                    
                  }
                else
                {  
              
                  u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 30, 12, "Leaded Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                         
                    u8g.drawStr(4,30,"Time:  ");
                    u8g.setPrintPos(45, 30); 
                    u8g.print(time);
                    u8g.drawStr(64,30," / ");  
                    u8g.setPrintPos(78, 30); 
                    u8g.print(total);
                    u8g.drawStr(100,30,"Sec");  
            
                    u8g.drawLine(0, 36, 127, 36);
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(8,60,curtemp);
                    u8g.drawStr(40,60,"\260C   / ");
            
                    char tgt[5];
                    dtostrf(tg,5,1,tgt);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(76,60,tgt);
                    u8g.drawStr(108,60,"\260C");
            
                    u8g.setFont(u8g_font_6x10);
                    u8g.drawStr(11,48,"Current");
                    u8g.drawStr(79,48,"Target");
                   
                   
                   } while( u8g.nextPage() );
              
                  }
               }  
            }
      }
       
          
      
        // Mode Lead Free
        if (digitalRead(5) == LOW) {
      int total = pbf[5][0];
              
            
            // Go round and round
            while(true)   
            {
              int t;
              unsigned long currentMillis = millis();
             
              if(currentMillis - previousMillis > interval) 
              {
                previousMillis = currentMillis; // set next time 
                
                // Get the actual temperature
                t = temperature();
                // One second has passed
                time++;   
                // Find the target temperature
                int tg = targetpbf(time);
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
                if(done)
                  {
            
                u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 22, 12, "Lead Free Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                  u8g.drawStr(45,30,"Finished! ");
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(1,48,curtemp);
                    u8g.drawStr(33,48,"\260C - Cooling Down");
            
                    
                   } while( u8g.nextPage() );
                    
                  }
                else
                {  
              
                  u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 22, 12, "Lead Free Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                         
                    u8g.drawStr(4,30,"Time:  ");
                    u8g.setPrintPos(45, 30); 
                    u8g.print(time);
                    u8g.drawStr(64,30," / ");  
                    u8g.setPrintPos(78, 30); 
                    u8g.print(total);
                    u8g.drawStr(100,30,"Sec");  
            
                    u8g.drawLine(0, 36, 127, 36);
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(8,60,curtemp);
                    u8g.drawStr(40,60,"\260C   / ");
            
                    char tgt[5];
                    dtostrf(tg,5,1,tgt);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(76,60,tgt);
                    u8g.drawStr(108,60,"\260C");
            
                    u8g.setFont(u8g_font_6x10);
                    u8g.drawStr(11,48,"Current");
                    u8g.drawStr(79,48,"Target");
                   
                   
                   } while( u8g.nextPage() );
              
                  }
               }  
            }
      
         }  
      
           // Mode Drying
        if (digitalRead(6) == LOW) {
      int total = dry[5][0];
              
            
            // Go round and round
            while(true)   
            {
              int t;
              unsigned long currentMillis = millis();
             
              if(currentMillis - previousMillis > interval) 
              {
                previousMillis = currentMillis; // set next time 
                
                // Get the actual temperature
                t = temperature();
                // One second has passed
                time++;   
                // Find the target temperature
                int tg = targetdry(time);
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
                if(done)
                  {
            
                u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 30, 12, "Drying Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                  u8g.drawStr(45,30,"Finished! ");
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(1,48,curtemp);
                    u8g.drawStr(33,48,"\260C - Cooling Down");
            
                    
                   } while( u8g.nextPage() );
                    
                  }
                else
                {  
              
                  u8g.firstPage();  
                  do {
                  u8g.setFont(u8g_font_helvB08);
                  //u8g.setFont(u8g_font_osb21);
                  u8g.drawStr( 30, 12, "Drying Cycle");
                  u8g.drawLine(0, 15, 127, 15);
                         
                    u8g.drawStr(4,30,"Time:  ");
                    u8g.setPrintPos(45, 30); 
                    u8g.print(time);
                    u8g.drawStr(64,30," / ");  
                    u8g.setPrintPos(78, 30); 
                    u8g.print(total);
                    u8g.drawStr(100,30,"Sec");  
            
                    u8g.drawLine(0, 36, 127, 36);
                    // show temperature
                    // Temp: convert to string   
                    char curtemp[5];
                    dtostrf(t,5,1,curtemp);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(8,60,curtemp);
                    u8g.drawStr(40,60,"\260C   / ");
            
                    char tgt[5];
                    dtostrf(tg,5,1,tgt);
                    // Temp Display        
                    u8g.setFont(u8g_font_helvB08);
                    u8g.drawStr(76,60,tgt);
                    u8g.drawStr(108,60,"\260C");
            
                    u8g.setFont(u8g_font_6x10);
                    u8g.drawStr(11,48,"Current");
                    u8g.drawStr(79,48,"Target");
                   
                   
                   } while( u8g.nextPage() );
              
                  }
               }  
            }
      
         }  

}
    

void loop(void) {
// Nothing happens in the loop function.  Runs program on startup and then needs a reset to start another run.  NB wire up Reset button to Front Panel. Also works as E-Stop
}

