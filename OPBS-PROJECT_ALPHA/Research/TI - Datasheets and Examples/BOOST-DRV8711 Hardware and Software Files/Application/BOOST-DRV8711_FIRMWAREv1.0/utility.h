/* --COPYRIGHT--,BSD
 * Copyright (c) 2014, Texas Instruments Incorporated
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * *  Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * *  Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * *  Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * --/COPYRIGHT--*/

/*******************************************************************************
 *
 *  utility.h - Declaration file for utility functions and global variables
 *  Nick Oborny
 *  BOOST-DRV8711_FIRMWARE
 *  3/12/2014
 *
 ******************************************************************************/

#ifndef UTILITY_H_
#define UTILITY_H_

 /*****************************************************************************/

// MSP430 Clk Frequencies
#define MCLK_MHz    16      // Main Clock Frequency
#define SMCLK_MHz   2       // Sub Main Clock Frequency

// GPIO Port 1 Definitions
#define POT         BIT0    // P1.0
#define nSLEEP		BIT4    // P1.4

// GPIO Port 2 Definitions
#define RESET		BIT0    // P2.0
#define STEP_AIN1	BIT1    // P2.1
#define DIR_AIN2	BIT2    // P2.2
#define BIN2		BIT4    // P2.4
#define	BIN1		BIT5    // P2.5
#define nSTALL		BIT6    // P2.6
#define nFAULT		BIT7    // P2.7

// SPI Port Definitions
#define CS			BIT3    // P2.3
#define SCLK		BIT5    // SCLK
#define SDATO		BIT6    // MISO
#define SDATI		BIT7    // MOSI

// Register Access
#define REGWRITE    0x00
#define REGREAD     0x80

// Default Defines
#define	DEFAULT_START_STOP_SPEED	128		 	// Initial speed of the motor (PPS)
#define DEFAULT_TARGET_SPEED        512 		// Target speed of the motor (PPS)
#define DEFAULT_ACCEL_RATE		    128			// Acceleration/deceleration rate (PPSPS)
#define DEFAULT_NUM_STEPS           1024        // Number of steps

// Custom Types
typedef enum {false, true} boolean;
typedef enum {low, high} gpio;
typedef enum {SPD_START, SPD_ACCEL, SPD_STABLE, SPD_DECEL, SPD_STOP, STP_START, STP_ACCEL, STP_STABLE, STP_DECEL, STP_STOP, HOLD} MotorState;

/*****************************************************************************/

// Declare Global Variables

// GUI Variables
extern float G_FIRMWARE_VERSION;          // Version number of the firmware
extern float G_FULL_SCALE_CURRENT;        // Full scale chopping current
extern int G_TORQUE_OLD;                  // Previous TORQUE value
extern int G_ISGAIN_OLD;                  // Previous GAIN value
extern boolean G_BYPASS_INDEXER;          // GUI widget to disable indexer mode
extern boolean G_BYPASS_INDEXER_OLD;      // Previous value for edge detection
extern boolean G_WRITE_ALL_REG;           // Write All Registers
extern boolean G_READ_ALL_REG;            // Read All Registers
extern boolean G_RESET_FAULTS;            // Reset All Faults
extern boolean G_MANUAL_WRITE;            // Manually write SPI data
extern unsigned int G_WRITE_ADDR;         // SPI Address
extern unsigned int G_WRITE_DATA;         // SPI Data
extern boolean G_MANUAL_READ;             // Manually read SPI data
extern unsigned int G_READ_ADDR;          // SPI Address
extern unsigned int G_READ_DATA;          // SPI Data

// Stepper Motion Profile
extern unsigned int G_START_STOP_SPEED;   // Initial and final speed of the motor (PPS)
extern unsigned int G_TARGET_SPEED;       // Target speed of the motor (PPS)
extern unsigned int G_ACCEL_RATE;         // Acceleration/deceleration rate (PPSPS)
extern unsigned int G_TOTAL_NUM_STEPS;    // Number of steps to advance the motor
extern unsigned int G_STEPS_TO_ACCEL;     // Number of steps to accel/decel
extern MotorState G_MOTOR_STATE;          // Status of the speed profile state machine
extern boolean G_SPEED_PROFILE;           // Start/stop the stepper motion profile
extern boolean G_SPEED_PROFILE_LOCK;      // Lock the speed profile
extern boolean G_STEP_PROFILE;            // Start/stop a specific number of steps
extern boolean G_STEP_PROFILE_LOCK;       // Lock the step profile

// Motor Status
extern unsigned int G_CUR_NUM_STEPS;      // Number of steps the motor has advanced
extern unsigned int G_CUR_SPEED;          // Current speed of the motor
extern unsigned int G_CUR_SPEED_TEMP;     // Next speed after Accel/Decel update
extern unsigned int G_SPEED_INCR;         // Amount to increment/decrement speed each Accel/Decel update
extern boolean G_ACCEL_FLAG;              // Signals to calculate next speed value

// Holding Values For Timer A1 CCR Registers
extern unsigned int G_TA1CCR0_TEMP;
extern unsigned int G_TA1CCR1_TEMP;
extern boolean G_LOAD_CCR_VALS;           // Flag to load the temporary CCR Register values

// DRV8711 GPIO
extern gpio G_nSLEEP;                     // Logic low to enter low power sleep mode
extern gpio G_RESET;                      // Logic high to reset internal logic and disable h-bridge
extern gpio G_STEP_AIN1;                  // Rising edge advances indexer one step (controls AOUT1)
extern gpio G_DIR_AIN2;                   // Sets direction of stepping (controls AOUT2)
extern gpio G_BIN2;                       // Controls BOUT1
extern gpio G_BIN1;                       // Controls BOUT2
extern gpio G_nFAULT;                     // Logic low when in FAULT condition
extern gpio G_nSTALL;                     // Logic low when in STALL condition

// DRV8711 Registers
extern struct CTRL_Register 	G_CTRL_REG;
extern struct TORQUE_Register 	G_TORQUE_REG;
extern struct OFF_Register 		G_OFF_REG;
extern struct BLANK_Register	G_BLANK_REG;
extern struct DECAY_Register 	G_DECAY_REG;
extern struct STALL_Register 	G_STALL_REG;
extern struct DRIVE_Register 	G_DRIVE_REG;
extern struct STATUS_Register 	G_STATUS_REG;

/*****************************************************************************/

// Function Declarations
void Initialize();
void UpdateGPIO();
void UpdateDRV8711Registers();
void WriteAllRegisters();
void ReadAllRegisters();
void UpdateFullScaleCurrent();
void UpdateStepperMotionProfile();
void SpeedProfile();
void StepProfile();
unsigned int SPI_DRV8711_ReadWrite(unsigned char data_high, unsigned char data_low);

#endif /* UTILITY_H_ */
