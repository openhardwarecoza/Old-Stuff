var ST7920 = require('st7920');
var lcd = new ST7920({sclk: 15, sid: 14, rst: 18});
lcd.on('ready', function () {
        lcd.on('initText',function() {
                console.log(1);
                lcd.printText(0, 0, "                ");
                lcd.printText(0, 1, "                ");
                lcd.printText(0, 2, "                ");
                lcd.printText(0, 3, "                ");
        });
        lcd.initText();
});


var async = require('async');
var lame = require('lame');
var fs = require('fs');
var Speaker = require('speaker');
var walk    = require('walk');
var files   = [], filetag = [];
var path    = "../MP3"
var walker  = walk.walk(path, { followLinks: false });
var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var static = require('node-static');
app.listen('8000');
var server = new static.Server('./web');
var stream = null;
// var loudness = require('loudness');
var audioOptions = {
    channels: 2,
    bitDepth: 16,
    sampleRate: 44100,
    mode: lame.STEREO
};
var playIndex = 0;
var state = 'stopped'
var id3 = require('id3js');

function handler (req, res) {
    console.log(req.url);
    server.serve(req, res, function (err, result) {
    	if (err) console.log('fileServer error: ',err);
    });
}

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    if (stat.name.indexOf(".mp3") == stat.name.length - 4) {
      files.push(root + '/' + stat.name);
      id3({ file: root + '/' + stat.name, type: id3.OPEN_LOCAL }, function(err, tags) {
        // console.log(tags)
        filetag.push(tags)
      });
    }
    next();
});

walker.on('end', function() {
    // socket.emit(files);
});

io.sockets.on('connection', function (socket) {

  socket.on('play', function(index) {
      stop();
      play(index);
      state = "playing"
  })

  socket.on('random', function(data) {
    random();
  })

  socket.on('stop', function(data) {
    stop();
    state = "stopped"
  });

  // socket.on('vol', function(vol) {
  //   loudness.setVolume(vol, function (err) {
  //       console.log('Failed to set volume' + err)
  //   });
  // });


	socket.on('refresh', function (data) {
	   socket.emit('files', files);
     socket.emit('filestag', filetag);
     io.sockets.emit('playing', playIndex)
    //  loudness.getVolume(function (err, vol) {
    //   io.sockets.emit('volume', vol)
    //  });
	});


  // mp3 functions
  function stop() {
    if (stream) {
      stream.unpipe();
      stream.destroy();
      speaker.close();
    }
    console.log('stopping')
  }

  function play(index) {

    var row1 = filetag[index].title.replace(/\\"/g, '"').substring(0, 15) || "                "
    var row2 = filetag[index].title.replace(/\\"/g, '"').substring(16, 31) || "                "
    var row3 = filetag[index].title.replace(/\\"/g, '"').substring(32, 47) || "                "

    lcd.printText(0, 0, "Now Playing:");
    lcd.printText(0, 1, row1);
    lcd.printText(0, 2, row2);
    lcd.printText(0, 3, row3);


    playIndex = index;
    console.log('playing');
    speaker = new Speaker();
    decoder = new lame.Decoder();
    stream = fs.createReadStream(files[index]);
    stream.pipe(decoder).pipe(speaker);
    io.sockets.emit('playing', playIndex)
    stream.on('end', function() {
      setTimeout(random(), 2000);
    })
  }

  function random() {
    stop();
    var index = Math.floor(Math.random()*files.length);
    play(index);
  }

});
