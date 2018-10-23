/*   Example sketch demonstrating the OPBS (OpenBuilds Stepper) library for use with DRV8711 stepper drivers

The library is based on the excellent work of JerseyGuy1996 ( https://github.com/jerseyguy1996/Stepper-Driver ) which was 
based, according to ( https://e2e.ti.com/support/applications/motor_drivers/f/38/p/328400/1445018#1445018 ) on the sample 
code provided by Texas Instruments's  Nick Oborny, originally for the MSP430 platform.

OpenBuilds created the Library to wrap up the slighly complicated initilisation procedure into an easy 
to use library, where for each motor you simply specify the torque and gain (which together determines the chopper current 
limit) and the Microstep value

The Current limit (for those used to turning finicky pots) is set in the through the formula [I = 2.75 * Torque) / (256 * GAIN * Rsense)]
RSense on the DRV8711 Boost Pack and the OpenBuildsPartstore.com Stepper Driver / CNC Controllers are 0.5R
For the majority of applications a gain of 20 should be left (default) 
Thus the only value you should need is the Torque - however there are edge cases of bigger and smaller motors where you may need to use a different Gain as well...

NB Note:  Overdriving the driver can physically damage the driver - start low and adjust torque as needed - do not overdrive your motors or drivers
NB Note 2:  Overdriving / Underdriving the motor will be noticable in symptoms such noisy motor, skipped steps, or overheating driver boards / motors
NB Note 3:  For more detail on Tuning the DRV8711 look at http://www.ti.com.cn/general/cn/docs/lit/getliterature.tsp?baseLiteratureNumber=slva632&fileType=pdf
NB Note 4:  IF you want me to add the advanced tuning features, please open a Issue on Github - its easy enough to do, I elected to keep it out, and leave a default set 
of sane values so as to not confuse new users (:  - I wanted it to be simple to configure (Torque and Microstep pretty much)   */


#include <opbs.h>

#include <SPI.h>

    // Just some pins to later test spinning one axis 
    #if defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
      #  define STEPpin  36
      #  define DIRpin   35
      #  define RESETpin 34
    #else
      #  define STEPpin  5
      #  define DIRpin   6
    
      #  define RESETpin 7
      /*NB to have a reset pin!  All the drivers share the reset pin.  Just before initialising in setup() the "Reset" pin is pulsed to 
      clear the registers on the driver, so we can set a controlled set of registers instead of wondering what's already on there
      NB2:  The DRV8711 registers are not stored, and has to be initialised on each start. */
    #endif

  // Initialise an instance of the OPBS object.  Each "object" is unique and will be used later for configuration
  OPBS stepper(3);

  /*  If you have a multi axis system, define all the objects you need, with which Arduino pin is connected to the driver's SCS pin
  
  OPBS Yaxis(2);
  OPBS Yaxis(3);
  OPBS Yaxis(4);
  OPBS Yaxis(5);    */


void setup ()
{
  // Reset all the drivers before initialisation
  pinMode (RESETpin, OUTPUT) ;
  digitalWrite (RESETpin, HIGH) ;
  delay (10) ;
  digitalWrite (RESETpin, LOW) ;
  delay (1) ;
  // NB All the drivers connected, share the reset line
  
  // Start Serial for Debug
  Serial.begin (115200) ;
  
  // Set pinmodes for the test STEP/DIR pins 
  pinMode (STEPpin, OUTPUT) ;
  pinMode (DIRpin, OUTPUT) ;

  // Create objects for each of the steppers.
  stepper.begin (50, 20, 64) ;  //(TORQUE in *%, GAIN - 20 = default for 0.5R sense resistors, MICROSTEPS in x/1)


  /*
  If you have a multi axis system, in setup(), initialise each of the drivers with settings relevant to that axis

  Xaxis.begin (40, 20, 16) ;    //(For example, in my X Axis I want 40% torque on a Gain of 20, with 1/16th microstep)
  Yaxis.begin (60, 20, 64) ;    //(For example, in my Y Axis I want 60% torque on a Gain of 20, with 1/64th microstep)
  Zaxis.begin (50, 20, 32) ;    //(For example, in my Z Axis I want 50% torque on a Gain of 20, with 1/32th microstep)
  Aaxis.begin (100, 20, 256) ;  //(For example, in my A Axis I want 100% torque on a Gain of 20, with 1/256th microstep)
  */
}


/*    From here on down, we are just testing one of the motors... 
      If you have STEP/DIR/GND connected to something else (Grbl, Marlin, TinyG, Mach3, LinuxCNC etc - you can empty the loop() below  */

// Just a little bit of code to ramp the motor up to speed to prevent stalling

void loop ()
  {
  do_step (0) ;
  }
  


// Simple function to step the motor for testing 
void do_step (byte dir)
{
  digitalWrite (DIRpin, dir) ;
  digitalWrite (STEPpin, HIGH) ;
  //delayMicroseconds (2) ;
  digitalWrite (STEPpin, LOW) ;
}
