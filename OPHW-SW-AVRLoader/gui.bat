@ECHO OFF
REM BFCPEOPTIONSTART
REM Advanced BAT to EXE Converter www.BatToExeConverter.com
REM BFCPEEXE=C:\Users\Peter\Desktop\AvrLoader.exe
REM BFCPEICON=C:\Users\Peter\Downloads\icon-128.ico
REM BFCPEICONINDEX=-1
REM BFCPEEMBEDDISPLAY=1
REM BFCPEEMBEDDELETE=0
REM BFCPEADMINEXE=1
REM BFCPEINVISEXE=0
REM BFCPEVERINCLUDE=1
REM BFCPEVERVERSION=1.0.0.0
REM BFCPEVERPRODUCT=Firmware Updater
REM BFCPEVERDESC=Firmware Updater for OpenHardware.co.za
REM BFCPEVERCOMPANY=OpenHardware.co.za
REM BFCPEVERCOPYRIGHT=Peter van der Walt (C) 2014
REM BFCPEEMBED=C:\Users\Peter\Desktop\XLoader - Copy\avrdude.conf
REM BFCPEEMBED=C:\Users\Peter\Desktop\XLoader - Copy\avrdude.exe
REM BFCPEEMBED=C:\Users\Peter\Desktop\XLoader - Copy\libusb0.dll
REM BFCPEEMBED=C:\Users\Peter\Desktop\XLoader - Copy\Repetier-lcd.cpp.hex
REM BFCPEEMBED=C:\Users\Peter\Desktop\XLoader - Copy\Repetier-nolcd.cpp.hex
REM BFCPEOPTIONEND
@ECHO ON
@ECHO OFF
C:
CD\
CLS

:MENU
REM CLS
REM ECHO **************************************************************  
REM ECHO Firmware Upgrade for OpenHardware.co.za 3D Printer Controllers
REM ECHO **************************************************************  
REM ECHO Please select an option below:
REM ECHO Note:  Installing LCD Firmware without an LCD will fail to 
REM ECHO start correctly as the board will wait for LCD to initialise
REM ECHO --------------------------------------------------------------
REM ECHO   1.  Upgrade Firmware without LCD
REM ECHO   2.  Upgrade Firmware with LCD 
REM ECHO   3.  Burn Bootloader w USBtiny (1284p 20Mhz)
REM ECHO   4.  Visit Wiki for Update Instructions
REM ECHO   Q.  Quit                      
REM ECHO --------------------------------------------------------------

set watitle=Choose an Action
  set watext=~~~~What would you liek to do today:
  set wainput= ^&Upgrade Controller Firmware without LCD (v2+v3); ^&Upgrade Firmware with LCD with Encoder (v2); ^&Upgrade Firmware with LCD with Buttons (v3); ^Burn Bootloader using USBtinyISP (1284p 20Mhz)
  set waoutnum=0
  set wabat=%~dp0\wabat.bat 
  start /w %~dp0wizapp RB
  if errorlevel 2 goto :cancel
  if errorlevel 1 goto :previous
  call %wabat% 
  if "%waoutnum%"=="0" GOTO Selection1
  if "%waoutnum%"=="1" GOTO Selection2
  if "%waoutnum%"=="2" GOTO Selection2.5
  if "%waoutnum%"=="3" GOTO Selection3


:Selection1
REM CLS
ECHO **************************************************************  
ECHO Firmware Upgrade for OpenHardware.co.za 3D Printer Controllers
ECHO **************************************************************  
ECHO We detected possible controllers on the following COM ports:
for /f "usebackq tokens=* skip=1" %%a in (`wmic path Win32_SerialPort Get DeviceID`) do echo:%%a
ECHO In the question below, please enter the PORT in the format
ECHO "COM00" where 00 is the COM port of the Printer 
ECHO --------------------------------------------------------------
SET INPUT=
SET /P INPUT=Please enter the COM port of the 3D Printer: [%a%]:
ECHO Your printer controller will now reset and the firmware update
ECHO will be uploaded and then verified.  Please stand by...
%MYFILES%\avrdude -C %MYFILES%\avrdude.conf -v -p atmega1284p -cstk500v2 -b115200 -D -Uflash:w:%MYFILES%\Repetier-nolcd.cpp.hex:i -P%INPUT%
PAUSE
GOTO Quit

:Selection2
REM  CLS
ECHO **************************************************************  
ECHO Firmware Upgrade for OpenHardware.co.za 3D Printer Controllers
ECHO **************************************************************  
ECHO We detected possible controllers on the following COM ports:
for /f "usebackq tokens=* skip=1" %%a in (`wmic path Win32_SerialPort Get DeviceID`) do echo:%%a
ECHO In the question below, please enter the PORT in the format
ECHO "COM00" where 00 is the COM port of the Printer 
ECHO --------------------------------------------------------------
SET INPUT=
SET /P INPUT=Please enter the COM port the 3D Printer is attached to like COM2, COM19, etc [%a%]:
ECHO Your printer controller will now reset and the firmware update
ECHO will be uploaded and then verified.  Please stand by...
%MYFILES%\avrdude -C %MYFILES%\avrdude.conf -v -patmega1284p -cstk500v2 -b115200 -D -Uflash:w:%MYFILES%\Repetier-lcd.cpp.hex:i -P%INPUT%
PAUSE
GOTO Quit

:Selection3
REM  CLS
ECHO **************************************************************  
ECHO Firmware Upgrade for OpenHardware.co.za 3D Printer Controllers
ECHO **************************************************************  
ECHO Bootloader will now be written - this will overwrite firmware
PAUSE
cd %MYFILES%
ECHO Setting Fuses
%MYFILES%\avrdudeusb -C %MYFILES%\avrdudeusb.conf -v -c usbtiny -p atmega1284p -U lfuse:w:0xF7:m -U hfuse:w:0xDC:m -U efuse:w:0xFC:m
ECHO Upload Bootloader
%MYFILES%\avrdudeusb -C %MYFILES%\avrdudeusb.conf -V -v -c usbtiny -p atmega1284p -U flash:w:bootloader-1284P-20MHz.hex
ECHO Lock the Bootloader
ECHO This gives an expected "verification error 0xcf != 0x0f"
%MYFILES%\avrdudeusb -C %MYFILES%\avrdudeusb.conf -v -c usbtiny -p atmega1284p -U lock:w:0xCF:m 
PAUSE
GOTO Quit


:Selection4
START "" "http://wiki.openhardware.co.za/index.php/OpenHardware.co.za_FrontPrint_-_Firmware_Upgrade_and_Extruder_Calibration"
GOTO Quit


:Quit
CLS
EXIT