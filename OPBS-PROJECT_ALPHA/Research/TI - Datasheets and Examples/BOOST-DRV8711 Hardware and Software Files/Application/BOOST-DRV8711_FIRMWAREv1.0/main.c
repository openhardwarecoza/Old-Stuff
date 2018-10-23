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
 *  main.c - c file for main function
 *  Nick Oborny
 *  BOOST-DRV8711_FIRMWARE
 *  3/12/2014
 *
 ******************************************************************************/

/* 				Program Structure
 *
 *					 main.c
 *					  ^^^^
 *			   utility.h->utility.c		(Global Variables, Work Functions, SPI)
 *				^^^^		^^^^
 *			   	^^^^	registers.h		(DRV8711 Register Definitions)
 *			    ^^^^
 *			   monitor.h->monitor.c		(Serial Monitor for Host PC Connection)
 *					  ^^^^
 *			      uart.h->uart.c		(MSP430 Hardware/Software UART)
 *
 */

#include "msp430.h"
#include "utility.h"

// Main
int main(void)
{
	Initialize();

	while (1)
	{
		// Update Functions
		UpdateGPIO();
		UpdateDRV8711Registers();
		UpdateFullScaleCurrent();
		UpdateStepperMotionProfile();
        // Enter LPM and wake up when needed
        __bis_SR_register(LPM0_bits + GIE);
	}
}

/****************************Interrupt Service Routines*****************************/

#pragma vector=PORT1_VECTOR, PORT2_VECTOR, ADC10_VECTOR, \
        USCIAB0TX_VECTOR, TIMER0_A0_VECTOR, TIMER0_A1_VECTOR, \
        COMPARATORA_VECTOR, NMI_VECTOR
__interrupt void Trap_ISR(void) {}


#pragma vector=TIMER1_A0_VECTOR
__interrupt void Timer1_A0(void)
{
    // Update Timer at End of PWM Period
    if (G_LOAD_CCR_VALS == true)
    {
        G_CUR_SPEED = G_CUR_SPEED_TEMP;
        TA1CCR0 = G_TA1CCR0_TEMP;
        TA1CCR1 = G_TA1CCR1_TEMP;
        G_LOAD_CCR_VALS = false;
    }
}

#pragma vector=TIMER1_A1_VECTOR
__interrupt void Timer1_A1(void)
{
    switch (TA1IV)
    {
        case TA1IV_NONE: break;         // Vector 0: No Interrupt
        case TA1IV_TACCR1:              // Vector 2: CCR1 CCIFG
        {
            // Increment Step Counter
            G_CUR_NUM_STEPS++;
            if (G_CUR_NUM_STEPS == G_TOTAL_NUM_STEPS)
            {
                __bic_SR_register_on_exit(LPM0_bits);
            }
            TA1CCTL1 &= ~CCIFG;
            break;
        }
        case TA1IV_TACCR2:              // Vector 4: CCR2 CCIFG
        {
            TA1CCTL2 &= ~CCIFG;
            break;
        }
        case TA1IV_6: break;            // Vector 6: Reserved CCIFG
        case TA1IV_8: break;            // Vector 8: Reserved CCIFG
        case TA1IV_TAIFG:               // Vector 10: Overflow
        {
            TACTL &= ~TAIFG;
            break;
        }
        default: break;
    }
}

#pragma vector=WDT_VECTOR
__interrupt void WatchDog_Timer(void)
{
    // Signal Main Thread to Calculate Next Speed Value
    G_ACCEL_FLAG = true;
    // Wake Up the Main Thread
    __bic_SR_register_on_exit(LPM0_bits);
}
