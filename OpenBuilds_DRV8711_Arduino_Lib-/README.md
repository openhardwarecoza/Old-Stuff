# OpenBuilds_DRV8711_Arduino_Lib
Arduino Library to initialise TI DRV8711 Drivers

Copy the OpenBuildStep directory to your arduino/libraries folder

Run Arduino

Click File, Examples, OpenBuildStep, DrV8711

Upload

## Wiring:

Driver -> Arduino

SCS to the pin you specified in the constructor the OPBS object

SDATI to MOSI

SDATO to MISO

CLK to SCK

RST to Pin specified as ResetPin

SLP -> Pullup to VCC with 10K, or you can control it in the sketch (not coded into example)

DIR/STEP to example pins specified in sketch or own controller

GND to GND

3.3V to 3.3v or 5v (open collector LEDs and pullup on SDATO only anyway)





