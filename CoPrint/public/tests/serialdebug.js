var serialport = require("serialport");
var SerialPort = serialport
var port;

port = new SerialPort("COM7", {  parser: serialport.parsers.readline("\n"), baudrate: 115200 });

port.on('open', function() {
  port.write("version\n"); // Lets check if its Smoothieware?
  console.log('Connected to ' + port.path + ' at ' + port.options.baudRate)
});

port.on('close', function(err) { // open errors will be emitted as an error event
    console.log('Disconnected from ' + port.path + 'at ' + port.options.baudRate)
});

port.on('error', function(err) { // open errors will be emitted as an error event
  console.log('Error: ', err.message);
});

port.on("data", function (data) {
  console.log('Recv: ' + data)
  port.write("ok\n");
});




// End Websocket <-> Serial
