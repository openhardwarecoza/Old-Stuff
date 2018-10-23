/* --COPYRIGHT--,BSD
 * Copyright (c) 2012, Texas Instruments Incorporated
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
 *  uart.c - c file for UART communication
 *
 ******************************************************************************/
#include "uart.h"

unsigned int txData;

void TimerA_UART_tx(unsigned char byte);
extern void receivedDataCommand(unsigned char receiveData);

/*******************************************************************************
 *
 *! This function initializes the necessary configurations or GPIO for UART
 *! functionality. It automatically selects Timer_UART or hardware UART using
 *! USCI_A0.
 *!
 *! \param data character data to be transmitted via UART.
 *!
 *! \return None
 *
 ******************************************************************************/
void uartInit(void)
{
#if HARDWARE_UART
    /* P1.1 = RXD, P1.2=TXD */
    P1SEL |= UART_TXD | UART_RXD ;
    /* P1.1 = RXD, P1.2=TXD */
    P1SEL2 |= UART_TXD | UART_RXD ;
    /* SMCLK */
    UCA0CTL1 |= UCSSEL_2;
    /* 4MHz 9600 */
    UCA0BR0 = 208;
    UCA0BR1 = 0;
    /* Modulation UCBRSx = 1 */
    UCA0MCTL = UCBRS0;
    /* **Initialize USCI state machine** */
    UCA0CTL1 &= ~UCSWRST;
    /* Enable USCI_A0 RX interrupt */
    IE2 |= UCA0RXIE;
#else
    /* Timer function for TXD/RXD pins */
    P1SEL |= UART_TXD + UART_RXD;
    /* TXD */
    P1DIR |= UART_TXD;
    P1DIR &= ~UART_RXD;

    /* Set TXD Idle as Mark = '1' */
    TACCTL0 = OUT;
    /* Sync, Neg Edge, Capture, Int */
    TACCTL1 = SCS + CM1 + CAP + CCIE;
    /* Clear TA0 counter, SMCLK, start in continuous mode */
    TACTL = TACLR + TASSEL_2 + MC_2;
#endif
}

/*******************************************************************************
 *
 *! This function transmits a character via UART. It automatically selects
 *! Timer_UART or hardware UART using USCI_A0.
 *!
 *! \param data character data to be transmitted via UART.
 *!
 *! \return None
 *
 ******************************************************************************/
void uartTxByte(unsigned char byte)
{
#if HARDWARE_UART
    /* USCI_A0 TX buffer ready? */
    while (!(IFG2&UCA0TXIFG));
    /* transmite data */
    UCA0TXBUF = byte;
#else
    /* Transmit data packet */
    TimerA_UART_tx(byte);
#endif
}

#if (!HARDWARE_UART)
/*******************************************************************************
 *
 *! Outputs one byte using the Timer_A UART
 *!
 *! \param byte is the character to be transmitted
 *!
 *! \return None
 *
 ******************************************************************************/
void TimerA_UART_tx(unsigned char byte)
{
    while (TACCTL0 & CCIE);                 // Ensure last char got TX'd
    TACCR0 = TAR;                           // Current state of TA counter
    TACCR0 += UART_TBIT;                    // One bit time till first bit
    txData = byte;                          // Load global variable
    txData |= 0x100;                        // Add mark stop bit to TXData
    txData <<= 1;                           // Add space start bit
    TACCTL0 = OUTMOD0 + CCIE;               // Set TXD on EQU2 (idle), Int
}

/*******************************************************************************
 *
 *! Timer_A UART - Transmit Interrupt Handler
 *!
 *! \param None
 *!
 *! \return None
 *
 ******************************************************************************/
#pragma vector = TIMER0_A0_VECTOR
__interrupt void Timer_A0_ISR(void)
{
    static unsigned char txBitCnt = 10;

    TACCR0 += UART_TBIT;                    // Add Offset to CCRx
    if (--txBitCnt == 0)                    // All bits TXed?
    {
        TACCTL0 &= ~CCIE;                   // All bits TXed, disable interrupt
        txBitCnt = 10;
    }
    else {
        if (txData & 0x01) {
            TACCTL0 &= ~OUTMOD2;            // TX Mark '1'
        }
        else {
            TACCTL0 |= OUTMOD2;             // TX Space '0'
        }
        txData >>= 1;
    }
}

/*******************************************************************************
 *
 *! Timer_A UART - Receive Interrupt Handler
 *!
 *! \param None
 *!
 *! \return None
 *
 ******************************************************************************/
#pragma vector = TIMER0_A1_VECTOR
__interrupt void Timer_A1_ISR(void)
{
    static unsigned char rxBitCnt = 8;
    static unsigned char rxData = 0;

    switch (__even_in_range(TA0IV, TA0IV_TAIFG)) { // Use calculated branching
        case TA0IV_TACCR1:                        // TACCR1 CCIFG - UART RX
            TACCR1 += UART_TBIT;                 // Add Offset to CCRx
            if (TACCTL1 & CAP) {                 // Capture mode = start bit edge
                TACCTL1 &= ~CAP;                 // Switch capture to compare mode
                TACCR1 += UART_TBIT_DIV_2;       // Point CCRx to middle of D0
            }
            else {
                rxData >>= 1;
                if (TACCTL1 & SCCI) {            // Get bit waiting in receive latch
                    rxData |= 0x80;
                }
                rxBitCnt--;
                if (rxBitCnt == 0) {             // All bits RXed?
                    rxBitCnt = 8;                // Re-load bit counter
                    TACCTL1 |= CAP;              // Switch compare to capture mode

                    /* Parse received command immediately */
                    receivedDataCommand(rxData);

                    __bic_SR_register_on_exit(LPM0_bits);  // Clear LPM0 bits from 0(SR)
                }
            }
            break;
    }
}
#endif

#if HARDWARE_UART
/*******************************************************************************
 *
 *! Hardware UART interrupt service routine
 *!
 *! \param None
 *!
 *! \return None
 *
 ******************************************************************************/
#pragma vector=USCIAB0RX_VECTOR
__interrupt void USCI0RX_ISR(void)
{
    /* USCI_A0 TX buffer ready? */
    while (!(IFG2&UCA0TXIFG));

    /* Parse received command immediately */
    receivedDataCommand(UCA0RXBUF);

    /* clear LPM3 bits from 0(SR) */
   __bic_SR_register_on_exit(LPM3_bits);
}
#endif
