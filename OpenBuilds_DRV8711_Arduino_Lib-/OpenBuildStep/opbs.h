#ifndef opbs_h
#define opbs_h

#include <Arduino.h>
#include "registers.h"
#include "SPI.h"

class OPBS
{
 public:
  OPBS (int pin) ;

  // load register state from EEPROM, override drive and microstepping
  void begin (unsigned int torque, unsigned int gain, unsigned int microsteps) ;  

  void set_enable (bool enable) ;
  
  void end () ;

  void clear_status () ;
  
  void get_status () ;
  
  unsigned int SPI_DRV8711_ReadWrite(unsigned char dataHi, unsigned char dataLo) ;
  //these are defined in registers.h
 
 private:
   
  byte _pin ;
  byte _amps ;
  byte _torque ;
  byte _gain ;
  byte _microstepreg ;
  
  void ReadAllRegisters () ;
  
  void WriteAllRegisters () ;
  
  

 } ;


 

#endif