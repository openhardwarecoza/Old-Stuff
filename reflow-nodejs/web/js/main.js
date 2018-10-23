function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    printLog('Going Fullscreen', successcolor);
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
    printLog('Exiting Fullscreen', successcolor);
  }
}



$( document ).ready(function() {

  var extrapolate = new EXTRAPOLATE.LINEAR();

  var $monitor = $("#monitor");
  var p1 = []; // Store Profile
  var d1 = []; // Store Realtime Data

  var profile = [];

    // WHoop! https://github.com/AlexanderBrevig/Extrapolate.js  = BEST THING SINCE SLICED BREAD!   Easiest way ever of extrapolating the temp profile for reflow
    //long pb[PLEN][2] =  { {0, 20}, {120, 150}, {210, 190}, {240, 240}, {310, 180}, {400, 0} };  // Kester Sn63/Pb37
    extrapolate.given(0).get(20);
    extrapolate.given(120).get(150);
    extrapolate.given(210).get(192);
    extrapolate.given(240).get(240);
    extrapolate.given(310).get(180);
    extrapolate.given(400).get(0);

    for (i=0; i<400; i++) {
      profile.push([i, extrapolate.valueFor(i) ]);
    }

  var options = {
    series: {
      lines: { show: true, fill: false },
      bars: { show: false },
      points: { show: false }
    },
    yaxis: {
      min: 0,
      max: 280,
      tickSize: 30,
      tickFormatter: function(val, axis) { return val < axis.max ? val.toFixed(0)+'&deg;C' : "CZK/l";}
    },
    xaxis: {
      tickSize: 10
      //tickLength: 0.1
      // mode: "time"
    },
    grid: {
        // backgroundColor:
        // {
        //     colors: ["#ccc", "#fff"]
        // },

    },
    colors: [ "#00ff00", "#ff0000" ]


  };
  var socket = io.connect("/", {
    "reconnect" : true,
    "reconnection delay" : 500,
    "max reconnection attempts" : 10
  });

  socket.on("connect", function(data) {
    socket.emit("message", "Connected - " + (new Date()).toString());
  });

  socket.on("message", function (data) {
    var temp = [];

    var tmp = 0;
    var tgt = 0;
    //var ds = data.split(',');
    if(d1.length > profile.length) d1.length = 0; // Remove first items


    d1.push(data[1]);


    for(var i = 0; i < d1.length; i++) {
      //arr1.push([i, p1[i]]);
    temp.push([i, d1[i]]);
    }
    $.plot($monitor, [profile, temp], options);

    var currtemp = temp[temp.length-1];
    var currprofile = profile[temp.length-1]; // no time.lenght is correct.  Profile.lenght-1 = last value in total profile.  We want the corresponding spot in the current time seconds

    var tmp = currtemp[1]
    var tgt = currprofile[1]
    var tmp = parseFloat(tmp).toFixed(0);
    var tgt = parseFloat(tgt).toFixed(0);


    var totalSec = profile.length;
    var tminutes = parseInt( totalSec / 60 ) % 60;
    var tseconds = totalSec % 60;
    var s = tseconds+"";
    if (s.length < 2) tseconds = "0" + tseconds

    var currSec = i;
    var cminutes = parseInt( currSec / 60 ) % 60;
    var cseconds = currSec % 60;
    var s = cseconds+"";
    if (s.length < 2) cseconds = "0" + cseconds


    progress = parseFloat((i / profile.length)*100).toFixed(1);


    console.log('Temp: '+ tmp + ' of ' + tgt + 'Time' + tminutes + ':' + tseconds)

    $('#currTemp').html(tmp + '&degC/' + tgt + '&degC')

    if (tmp < tgt) {
      console.log('Heater On')
      $('#heaterState').html('	Heater ON')
      $('#progress').html(progress + '%')
      $('#time').html(cminutes + ':' + cseconds + '/' + tminutes + ':' + tseconds  )
        // $('#heaterState').removeClass('btn-success')
        // $('#heaterState').addClass('btn-danger')
    } else {
      console.log('Heater Off')
      $('#heaterState').html('	Heater OFF')
      $('#progress').html(progress + '%')
      $('#time').html(cminutes + ':' + cseconds + '/' + tminutes + ':' + tseconds  )
      // $('#heaterState').removeClass('btn-danger')
      // $('#heaterState').addClass('btn-success')
    }


  });

  $.plot($monitor, [p1], options);
});
