 float vPow = 5.0;
 float DCr1 = 56000;
 float DCr2 = 10000;


 float BATTr1 = 20000;
 float BATTr2 = 10000;

 
 void setup() {
pinMode(0, OUTPUT);
digitalWrite(13, LOW);
//Serial.begin(9600);
 }
 
 void loop() {
   float vdcread = (analogRead(2) * vPow) / 1024.0;
   float vdc = vdcread / (DCr2 / (DCr1 + DCr2));

   float vbattread = (analogRead(3) * vPow) / 1024.0;
   float vbatt = vbattread / (BATTr2 / (BATTr1 + BATTr2));

  
      if (vdc > 12 )
      {
//      Serial.print("Charging, DC Input at ");
//      Serial.print(vdc);
//      Serial.print("V.  ");
      digitalWrite(0, LOW);
      
      }
      else
      {
//      Serial.print("NOT Charging, DC Input at ");
//      Serial.print(vdc);
//      Serial.print("V.  ");
      digitalWrite(0, HIGH);
      }
      
      if (vbatt > 11.5 )
      {
//      Serial.print("Battery OK, at ");
//      Serial.print(vbatt);
//      Serial.println("V.  ");
      //digitalWrite(0, LOW);
      }
      else
      {
//      Serial.print("Battery Depleted at ");
//      Serial.print(vbatt);
//      Serial.println("V.  ");
      digitalWrite(13, LOW);
      }
      
 }

 
