/*
 * This file is provided for custom JavaScript logic that your HTML files might need.
 * GUI Composer includes this JavaScript file by default within HTML pages authored in GUI Composer.
 */
require(["dojo/ready"], function(ready){
	ready(function()
	{
	     // logic that requires that Dojo is fully initialized should go here
	});
});


function Invert( valueFromTarget) {
	return !valueFromTarget;
}

function DecToHex( valueFromTarget) {
	return valueFromTarget.toString(16);
}

function HexToDec( valueToTarget) {
	return parseInt(valueToTarget, 16);
}

function RoundTo64( valueToTarget ) {
	return Math.floor(valueToTarget >> 6) * 64;
}

function RoundFrom64( valueFromTarget ) {
	return Math.floor(valueFromTarget >> 6) * 64;
}

function RoundTo2Dec(valueFromTarget ) {
	return Math.round(valueFromTarget * 100) / 100;
}
