#Arduino sketch to control a Toaster oven reflow oven.#

If you would like to help with paying the prototyping costs, you can shoot me a donation on Paypal if you wish: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45DXEXK9LJSWU, I post all personal donations on https://plus.google.com/collection/UtfYZB so make sure I get you in my Google circles to I can say thanks!

Features:

3 different profiles can be programmed (leaded, leadfree and drying) allows flexibility
Just 3 action buttons (single buttons press needed to start a profile - no menus, easy to use) + Reset button (u8glib version)
or Up/Down/Enter buttons (16x2 LCD version has a menu - only way on so little screen real estate)

Option to use
- EPCOS B57540G1104F000 Thermistor (Reprap style circuit with 4K7 pullup)
- MAX6755 Thermocouple Amplifier
- Even a DS18B20 (NOTE  Not suitable with average reflow temps - but I added it since i intend using one of these (slightly modified UI) on another application where a DS18B20 would be perfect

16x2 LCD version (eagle Files in this repository)
![16x2 reflow Controller](https://raw.githubusercontent.com/openhardwarecoza/Reflow_Oven_u8GLib/master/Photo/20160405_094429.jpg)

U8GLib / 128x64SPI version (No Eagle Files - I used an Arduino Nano)
![u8glib reflow Controller](https://raw.githubusercontent.com/openhardwarecoza/Reflow_Oven_u8GLib/master/Photo/20151103_145121.jpg)

Based on code from:  
http://reprap.org/wiki/Temperature_Sensor_v1.1#Upload_firmware_to_Arduino

http://reprap.org/wiki/Toaster_Oven_Reflow_Technique

https://github.com/adafruit/MAX6675-library

http://playground.arduino.cc/Learning/OneWire

https://github.com/olikraus/u8glib/wiki
