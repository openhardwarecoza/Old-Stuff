# TPS2514-USB-Charger-with-Autonegotion-and-INA219-Current-Montoring

TI TPS2514 is used to automatically negotaite max USB charge current to attached device

Second port has the famous Adafruit Mintyboost USB resistors to also try fooling device into max charge current.

With my Samsung S5 I get 1200mAh charge rate on the resistors, and 1700mAh on the TPS2514 Port

Also onboard is an INA219 voltage/current over I2C monitor and a LM2596 3A stepdowm converter (So plug 12-30v in, get 5v out, but also a negotiated charge for maximum charging current)


![TPS2514](https://raw.githubusercontent.com/openhardwarecoza/TPS2514-USB-Charger-with-Autonegotion-and-INA219-Current-Montoring/master/20160720_212453.jpg)
