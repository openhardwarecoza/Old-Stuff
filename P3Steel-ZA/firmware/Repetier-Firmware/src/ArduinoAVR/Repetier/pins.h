#ifndef PINS_H
#define PINS_H

/*
The board assignment defines the capabilities of the motherboard and the used pins.
Each board definition follows the following scheme:

CPU_ARCH
  ARCH_AVR for AVR based boards
  ARCH_ARM for all arm based boards

STEPPER_CURRENT_CONTROL
  CURRENT_CONTROL_MANUAL  1  // mechanical poti, default if not defined
  CURRENT_CONTROL_DIGIPOT 2  // Use a digipot like RAMBO does
  CURRENT_CONTROL_LTC2600 3  // Use LTC2600 like Foltyn 3D Master
  CURRENT_CONTROL_ALLIGATOR 4  //Use External DAC like Alligator
*/

#define ARCH_AVR 1
#define ARCH_ARM 2

#define CURRENT_CONTROL_MANUAL  1  // mechanical poti, default if not defined
#define CURRENT_CONTROL_DIGIPOT 2  // Use a digipot like RAMBO does
#define CURRENT_CONTROL_LTC2600 3  // Use LTC2600 like Foltyn 3D Master
#define CURRENT_CONTROL_ALLIGATOR 4  //Use External DAC like Alligator
#define CURRENT_CONTROL_MCP4728 5  // Use an i2c DAC as a digipot like PrintrBoard Rev. F

/****************************************************************************************
* Arduino pin assignment
*
*                  ATMega168
*                   +-\/-+
*             PC6  1|    |28  PC5 (AI 5 / D19)
*       (D 0) PD0  2|    |27  PC4 (AI 4 / D18)
*       (D 1) PD1  3|    |26  PC3 (AI 3 / D17)
*       (D 2) PD2  4|    |25  PC2 (AI 2 / D16)
*  PWM+ (D 3) PD3  5|    |24  PC1 (AI 1 / D15)
*       (D 4) PD4  6|    |23  PC0 (AI 0 / D14)
*             VCC  7|    |22  GND
*             GND  8|    |21  AREF
*             PB6  9|    |20  AVCC
*             PB7 10|    |19  PB5 (D 13)
*  PWM+ (D 5) PD5 11|    |18  PB4 (D 12)
*  PWM+ (D 6) PD6 12|    |17  PB3 (D 11) PWM
*       (D 7) PD7 13|    |16  PB2 (D 10) PWM
*       (D 8) PB0 14|    |15  PB1 (D 9)  PWM
*                   +----+
****************************************************************************************/

/****************************************************************************************
* Arduino Mega pin assignment
*
****************************************************************************************/
#if MOTHERBOARD == 33
#define KNOWN_BOARD 1
#define RAMPS_V_1_3
#elif MOTHERBOARD == 34
#define KNOWN_BOARD 1
#define RAMPS_V_1_3
#define AZTEEG_X3
#elif MOTHERBOARD == 35
#define KNOWN_BOARD 1
#define RAMPS_V_1_3
#define AZTEEG_X3_PRO
#endif
#if MOTHERBOARD == 3 || MOTHERBOARD == 33 || MOTHERBOARD == 34 || MOTHERBOARD == 35
#define KNOWN_BOARD 1

#if !(defined (__AVR_ATmega1280__ ) || defined (__AVR_ATmega2560__ ))
#error Oops!  Make sure you have 'Arduino Mega' selected from the 'Tools -> Boards' menu.
#endif

// uncomment one of the following lines for RAMPS v1.3 or v1.0, comment both for v1.2 or 1.1
// #define RAMPS_V_1_3
// #define RAMPS_V_1_0

#ifdef RAMPS_V_1_3

#define ORIG_X_STEP_PIN         54
#define ORIG_X_DIR_PIN          55
#define ORIG_X_ENABLE_PIN       38
#define ORIG_X_MIN_PIN          3
#define ORIG_X_MAX_PIN          2

#define ORIG_Y_STEP_PIN         60
#define ORIG_Y_DIR_PIN          61
#define ORIG_Y_ENABLE_PIN       56
#define ORIG_Y_MIN_PIN          14
#define ORIG_Y_MAX_PIN          15

#define ORIG_Z_STEP_PIN         46
#define ORIG_Z_DIR_PIN          48
#define ORIG_Z_ENABLE_PIN       62
#define ORIG_Z_MIN_PIN          18
#define ORIG_Z_MAX_PIN          19

#define ORIG_E0_STEP_PIN         26
#define ORIG_E0_DIR_PIN          28
#define ORIG_E0_ENABLE_PIN       24

#define ORIG_E1_STEP_PIN         36
#define ORIG_E1_DIR_PIN          34
#define ORIG_E1_ENABLE_PIN       30

#define SDPOWER            -1
#define SDSS               53
#define ORIG_SDCARDDETECT 	    49

#define LED_PIN            13
#define ORIG_FAN_PIN            9
#define ORIG_PS_ON_PIN          12

#define HEATER_0_PIN       10
#define HEATER_1_PIN       8
#define HEATER_2_PIN       9
// ANALOG NUMBERING
#define TEMP_0_PIN         13   
#define TEMP_1_PIN         14
#define TEMP_2_PIN         15
#define E0_PINS ORIG_E0_STEP_PIN,ORIG_E0_DIR_PIN,ORIG_E0_ENABLE_PIN,
#define E1_PINS ORIG_E1_STEP_PIN,ORIG_E1_DIR_PIN,ORIG_E1_ENABLE_PIN,


#else // RAMPS_V_1_1 or RAMPS_V_1_2 as default

#define ORIG_X_STEP_PIN         26
#define ORIG_X_DIR_PIN          28
#define ORIG_X_ENABLE_PIN       24
#define ORIG_X_MIN_PIN           3
#define ORIG_X_MAX_PIN          -1    //2

#define ORIG_Y_STEP_PIN         38
#define ORIG_Y_DIR_PIN          40
#define ORIG_Y_ENABLE_PIN       36
#define ORIG_Y_MIN_PIN          16
#define ORIG_Y_MAX_PIN          -1    //17

#define ORIG_Z_STEP_PIN         44
#define ORIG_Z_DIR_PIN          46
#define ORIG_Z_ENABLE_PIN       42
#define ORIG_Z_MIN_PIN          18
#define ORIG_Z_MAX_PIN          -1    //19

#define ORIG_E0_STEP_PIN         32
#define ORIG_E0_DIR_PIN          34
#define ORIG_E0_ENABLE_PIN       30

#define SDPOWER            48
#define SDSS               53
#define LED_PIN            13
#define ORIG_PS_ON_PIN          -1
//#define SCL                21
//#define SDA                20

#define E0_PINS ORIG_E0_STEP_PIN,ORIG_E0_DIR_PIN,ORIG_E0_ENABLE_PIN,
#define E1_PINS


#ifdef RAMPS_V_1_0 // RAMPS_V_1_0
#define HEATER_0_PIN     12    
#define HEATER_1_PIN     -1    
#define ORIG_FAN_PIN          11

#else // RAMPS_V_1_1 or RAMPS_V_1_2
#define HEATER_0_PIN     10    
#define HEATER_1_PIN      8    
#define ORIG_FAN_PIN      9
#endif

// MUST USE ANALOG INPUT NUMBERING NOT DIGITAL OUTPUT NUMBERING!!!!!!!!!
#define TEMP_0_PIN          2    
#define TEMP_1_PIN          1
#endif

// SPI for Max6675 Thermocouple

// these pins are defined in the SD library if building with SD support
#define SCK_PIN          52
#define MISO_PIN         50
#define MOSI_PIN         51
#define MAX6675_SS       53

#ifdef AZTEEG_X3
#define SDSUPPORT 1
#define SDCARDDETECTINVERTED 0
#define ORIG_SDCARDDETECT 49
#define ORIG_FAN_PIN           4
#define ORIG_FAN2_PIN          5
#define LIGHT_PIN         6
// Activate beeper on extension shield
#define BEEPER_PIN        33  
#define BEEPER_TYPE        1

// Only available with X3 shield
#define ORIG_E2_STEP_PIN         27  
#define ORIG_E2_DIR_PIN          29 
#define ORIG_E2_ENABLE_PIN       41 
// Only available with X3 shield
#define ORIG_E3_STEP_PIN         23 
#define ORIG_E3_DIR_PIN          25 
#define ORIG_E3_ENABLE_PIN       40 
// Only available with X3 shield
#define HEATER_3_PIN        17 
#define TEMP_3_PIN          12 
#define HEATER_4_PIN        16 
#define TEMP_4_PIN          5 


#define E1_PINS ORIG_E1_STEP_PIN,ORIG_E1_DIR_PIN,ORIG_E1_ENABLE_PIN,
#define E2_PINS ORIG_E2_STEP_PIN,ORIG_E2_DIR_PIN,ORIG_E2_ENABLE_PIN,
#define E3_PINS E3_STEP_PIN,E3_DIR_PIN,E3_ENABLE_PIN,

#endif

#ifdef AZTEEG_X3_PRO
#define SDSUPPORT true
#define SDCARDDETECTINVERTED false
#define ORIG_SDCARDDETECT 49
#define SDSS               53
#undef ORIG_FAN_PIN
#define ORIG_FAN_PIN           5
#define ORIG_FAN2_PIN          6
#define LIGHT_PIN         11
// Activate beeper on extension shield
#define BEEPER_PIN        33  
#define BEEPER_TYPE        1

#define ORIG_E2_STEP_PIN         23
#define ORIG_E2_DIR_PIN          25
#define ORIG_E2_ENABLE_PIN       40
#define ORIG_E3_STEP_PIN         27
#define ORIG_E3_DIR_PIN          29
#define ORIG_E3_ENABLE_PIN       41
#define ORIG_E4_STEP_PIN         43
#define ORIG_E4_DIR_PIN          37
#define ORIG_E4_ENABLE_PIN       42
#define HEATER_0_PIN       10
// bed
#define HEATER_1_PIN       8  
#define HEATER_2_PIN       9
#define HEATER_3_PIN       16
#define HEATER_4_PIN       17
#define HEATER_5_PIN       4
// ANALOG NUMBERING
#define TEMP_0_PIN         13   
// BED , ANALOG NUMBERING
#define TEMP_1_PIN         14   
#define TEMP_2_PIN         15
#define TEMP_3_PIN         12 
#define TEMP_4_PIN         11 
#define TEMP_5_PIN         10

// Thermocouple 1 and 2
#define TEMP_6_PIN         4   
#define TEMP_7_PIN         5 
#define THERMOCOUPLE_0_PIN         4  
#define THERMOCOUPLE_1_PIN         5  


#define E1_PINS ORIG_E1_STEP_PIN,ORIG_E1_DIR_PIN,ORIG_E1_ENABLE_PIN,
#define E2_PINS ORIG_E2_STEP_PIN,ORIG_E2_DIR_PIN,ORIG_E2_ENABLE_PIN,
#define E3_PINS ORIG_E3_STEP_PIN,ORIG_E3_DIR_PIN,ORIG_E3_ENABLE_PIN,
#define E4_PINS ORIG_E4_STEP_PIN,ORIG_E4_DIR_PIN,ORIG_E4_ENABLE_PIN,

#endif

#endif


#if MOTHERBOARD == 999
#define KNOWN_BOARD
#include "userpins.h"
#endif



#ifndef CPU_ARCH  // Set default architecture
#define CPU_ARCH ARCH_AVR
#endif

#ifndef SDSSORIG
#define SDSSORIG -1
#endif

#ifndef STEPPER_CURRENT_CONTROL // Set default stepper current control if not set yet.
#define STEPPER_CURRENT_CONTROL  CURRENT_CONTROL_MANUAL
#endif

#ifndef FAN_BOARD_PIN
#define FAN_BOARD_PIN -1
#endif

#ifndef E2_PINS
#define E2_PINS
#endif

#if NUM_EXTRUDER==1
#undef E1_PINS
#define E1_PINS
#endif

#if NUM_EXTRUDER < 3
#undef E2_PINS
#define E2_PINS
#endif

#ifndef HEATER_PINS_INVERTED
#define HEATER_PINS_INVERTED 0
#endif

// Original pin assignmats to be used in configuration tool
#define X_STEP_PIN ORIG_X_STEP_PIN
#define X_DIR_PIN ORIG_X_DIR_PIN
#define X_ENABLE_PIN ORIG_X_ENABLE_PIN
#define X_MIN_PIN ORIG_X_MIN_PIN
#define X_MAX_PIN ORIG_X_MAX_PIN

#define Y_STEP_PIN ORIG_Y_STEP_PIN
#define Y_DIR_PIN ORIG_Y_DIR_PIN
#define Y_ENABLE_PIN ORIG_Y_ENABLE_PIN
#define Y_MIN_PIN ORIG_Y_MIN_PIN
#define Y_MAX_PIN ORIG_Y_MAX_PIN

#define Z_STEP_PIN ORIG_Z_STEP_PIN
#define Z_DIR_PIN ORIG_Z_DIR_PIN
#define Z_ENABLE_PIN ORIG_Z_ENABLE_PIN
#define Z_MIN_PIN ORIG_Z_MIN_PIN
#define Z_MAX_PIN ORIG_Z_MAX_PIN

#define E0_STEP_PIN ORIG_E0_STEP_PIN
#define E0_DIR_PIN ORIG_E0_DIR_PIN
#define E0_ENABLE_PIN ORIG_E0_ENABLE_PIN

#define E1_STEP_PIN ORIG_E1_STEP_PIN
#define E1_DIR_PIN ORIG_E1_DIR_PIN
#define E1_ENABLE_PIN ORIG_E1_ENABLE_PIN

#define E2_STEP_PIN ORIG_E2_STEP_PIN
#define E2_DIR_PIN ORIG_E2_DIR_PIN
#define E2_ENABLE_PIN ORIG_E2_ENABLE_PIN

#define E3_STEP_PIN ORIG_E3_STEP_PIN
#define E3_DIR_PIN ORIG_E3_DIR_PIN
#define E3_ENABLE_PIN ORIG_E3_ENABLE_PIN

#define E4_STEP_PIN ORIG_E4_STEP_PIN
#define E4_DIR_PIN ORIG_E4_DIR_PIN
#define E4_ENABLE_PIN ORIG_E4_ENABLE_PIN

#define E5_STEP_PIN ORIG_E5_STEP_PIN
#define E5_DIR_PIN ORIG_E5_DIR_PIN
#define E5_ENABLE_PIN ORIG_E5_ENABLE_PIN

#define FAN_PIN ORIG_FAN_PIN
#ifdef ORIG_FAN2_PIN
#define FAN2_PIN ORIG_FAN2_PIN
#endif

#define PS_ON_PIN ORIG_PS_ON_PIN

#ifndef ORIG_SDCARDDETECT
#define ORIG_SDCARDDETECT -1
#endif
#define SDCARDDETECT ORIG_SDCARDDETECT

#define SENSITIVE_PINS {0, 1, ORIG_X_STEP_PIN, ORIG_X_DIR_PIN, ORIG_X_ENABLE_PIN, ORIG_X_MIN_PIN, ORIG_X_MAX_PIN, \
        ORIG_Y_STEP_PIN, ORIG_Y_DIR_PIN, ORIG_Y_ENABLE_PIN, ORIG_Y_MIN_PIN, ORIG_Y_MAX_PIN, ORIG_Z_STEP_PIN,\
        ORIG_Z_DIR_PIN, ORIG_Z_ENABLE_PIN, ORIG_Z_MIN_PIN, ORIG_Z_MAX_PIN, LED_PIN, ORIG_PS_ON_PIN, \
        HEATER_0_PIN, HEATER_1_PIN, /*ORIG_FAN_PIN,*/ E0_PINS E1_PINS E2_PINS TEMP_0_PIN, TEMP_1_PIN,SDSS }
#endif

