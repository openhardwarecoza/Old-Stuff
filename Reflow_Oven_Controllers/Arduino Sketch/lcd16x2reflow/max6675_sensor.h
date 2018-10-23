
int thermoCLK = 13;
int thermoCS = 10;
int thermoDO = 12;

MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);


float temperature()
{ 
  delay(10); 
  float celcius = thermocouple.readCelsius();
  return celcius;
}



  

