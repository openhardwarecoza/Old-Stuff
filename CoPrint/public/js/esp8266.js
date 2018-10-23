ws =  null;
queryLoop = null;
var blocked;
var gcodeQueue; gcodeQueue = [];
var heap;
var buffer = "";
var paused;
var heaterT0ActualTemp, heaterT0DisplayTemp, heaterT1ActualTemp, heaterT1DisplayTemp, bedActualTemp, bedDisplayTemp;
var myIP;
var paused = false;
var connectType = "none";
var jobRunsFrom = "none";

$( document ).ready(function() {

  $('#espConnectBtn').on('click', function() {
    var espIP = $('#espIp').val();
    startWS(espIP);
  });

  $('#scanwifi').on('click', function(e) {
      scanWifiSubnet()
  });

  $("#espIp").val(localStorage.getItem('espIpAddress'));
  $("#wifisubnet1").val(localStorage.getItem("wifisubnet1"));
  $("#wifisubnet2").val(localStorage.getItem("wifisubnet2"));
  $("#wifisubnet3").val(localStorage.getItem("wifisubnet3"));

  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
  var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
  pc.createDataChannel("");    //create a bogus data channel
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
  pc.onicecandidate = function(ice){  //listen for candidate events
     if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
     myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
     console.log('my IP: ', myIP);
     var subnet = myIP.replace(/\d+$/, "*");
     subnet = subnet.split('.');
     $("#wifisubnet1").val(subnet[0]);
     $("#wifisubnet2").val(subnet[1]);
     $("#wifisubnet3").val(subnet[2]);
     console.log("My IP subnet:", subnet);
     pc.onicecandidate = noop;
  };




});


function espQueue(data) {
  data = data.split('\n')
  for (i=0; i<data.length; i++) {
    var line = data[i]
    //console.log(line)
    var tt = line.split(';');
    line = tt[0];
    line = line.trim();
    //console.log(line)
    // line = line.replace(/^\s+|\s+$/g,'');
    if (line == '' || line.indexOf(';') == 0) {
      // Nothing
    } else {
      addQ(line)
    }

  }
}

function addQ(gcode) {
  gcodeQueue.push(gcode);
}

function uploadLine() {
  if(paused==false) {
    if (gcodeQueue.length > 0 && !blocked) {
        var gcode = gcodeQueue.shift()
        console.log('Sent: '  + gcode + ' Q: ' + gcodeQueue.length)
        $('#queueCnt').html('Queued: ' + gcodeQueue.length)
        lastSent = gcode
        sendGcode(gcode + '\n');
        blocked = true;
      }
  }
}

function espPlay() {
    jobRunsFrom = "wifi"
    // espQueue("M28 "+ $('#saveasname').val() + "\n")
    g = document.getElementById('gcodepreview').value;
    espQueue(g);
    // espQueue("M29\n");
    uploadLine();
}

function stopWS() {
  // Close WS if already opened
  if (ws) {
    ws.close();
    ws = null;
  }
  $('#espConnectBtn').show();
  $('#espDisconnectBtn').hide();
  jobRunsFrom = "none"
}

// Start WebSocket
function startWS(url) {
  if (url === undefined )
    url = document.location.host;
  stopWS();
  ws = new WebSocket('ws://'+url+'/');
  localStorage.setItem('espIpAddress', url);
  ws.binaryType = "arraybuffer";

setConnectType("wifi");


  ws.onopen = function(e) {
    printLog("ESP8266 Connected to "+url, successcolor, 'wifi');
    $('#espConnectBtn').hide();
    $('#espDisconnectBtn').show();
    $("#wifiModal").modal('hide');
    console.log(e);
    sendGcode('version');
    queryLoop = setInterval(function() {
        // console.log('StatusChkc')
        // sendGcode('?\n');
        sendGcode('M105');
        uploadLine();
    }, 1000);
    $("#machineStatus").addClass('badge-ok')
    $("#machineStatus").removeClass('badge-notify')
    $("#machineStatus").removeClass('badge-warn')
    $("#machineStatus").removeClass('badge-busy')
    $('#machineStatus').html("Wifi Connected");
  };

  ws.onclose = function(e){
    printLog("ESP8266 closed! ", errorcolor, 'wifi');
    clearInterval(queryLoop);
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    $("#machineStatus").removeClass('badge-ok')
    $("#machineStatus").addClass('badge-notify')
    $("#machineStatus").removeClass('badge-warn')
    $("#machineStatus").removeClass('badge-busy')
    $('#machineStatus').html("Disconnected");
    console.log(e);
    $("#wifiModal").modal('show');
    $("#foundIpwifi").empty();

    var template = `
    <div class="table-responsive">
    <table class="table table-striped">
    <thead>
      <tr>
        <th>Device</th>
        <th>IP</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody id="foundIPTable">
    </table>
    </div>
    `

    $("#foundIpwifi").append(template);
  };

  ws.onerror = function(e){
    printLog("ESP8266 Error! ", errorcolor, 'wifi');
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    console.log(e);
  };

  ws.onmessage = function(e){
    // console.log(e.data)
    var data = "";
    if(e.data instanceof ArrayBuffer){
      var bytes = new Uint8Array(e.data);
      for (var i = 0; i < bytes.length; i++) {
        data += String.fromCharCode(bytes[i]);
      }
    } else {
      data = e.data;
    }
    // console.log(data);
    $('#syncstatus').html('Socket OK');
    isConnected = true;

      buffer += data
      var split = buffer.split("\n");
      buffer = split.pop(); //last not fin data back to buffer
      // console.log(split)
      for (i=0; i< split.length; i++) {
        var response = split[i];
        console.log(response)
        // trigger line handling event here
        if(response.indexOf("ok") != -1 || response == "start\r" || response.indexOf('<') == 0){
          // Queue based feedback
          if (response.indexOf("ok") == 0) { // Got an OK so we are clear to send
            uploadLine()
          } else if (response.indexOf('<') != -1) {
            updateStatus(response);
          } else {
            printLog(response, msgcolor, "wifi")
          }
          blocked = false;

          // Status based feedback
          if (response.indexOf("ok T:") == 0) { // Got an Temperature Feedback
              // console.log(response);
              for (var r, n = /(B|T(\d*)):\s*([+]?[0-9]*\.?[0-9]+)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi; null !== (r = n.exec(response));) {
                  var o = r[1],
                      a = r[3] + "°C";
                  a += "/" + r[5] + "°C", "T" == o ? (heaterT0ActualTemp = r[3], heaterT0DisplayTemp = a) : "T1" == o && (heaterT1ActualTemp = r[3], heaterT1DisplayTemp = a), "B" == o && (bedActualTemp = Number(r[3]), bedDisplayTemp = a)
              }
              $('#tempstatus').empty();

              var template = "<dtitle>";

              if (heaterT0ActualTemp) {
                template += `<i class="fa fa-fw fa-thermometer-empty" aria-hidden="true" style="color: #ff0000;"></i>T0: ` + heaterT0DisplayTemp + " ";
              }

              if (heaterT1ActualTemp) {
                template += `<i class="fa fa-fw fa-thermometer-empty" aria-hidden="true" style="color: #00ff00;"></i>T1: ` + heaterT1DisplayTemp + " ";
                $('#t2row').show();
              }

              if (bedActualTemp) {
                template += `<i class="fa fa-fw fa-thermometer-empty" aria-hidden="true" style="color: #00a2ff;"></i>B: ` + bedDisplayTemp + " ";
              }

              template += "<dtitle>";


              $('#tempstatus').append(template);

              var T0temp = heaterT0ActualTemp  || 0;
              var T1temp = heaterT1ActualTemp  || 0;
              var Bedtemp = bedActualTemp  || 0;

              setTemp(T0temp, T1temp, Bedtemp);
          } // End Temp
        }
    }
  };
}

function scanWifiSubnet() {
  var data = 3;
  $("#progress").css('width',data+'%');
    /* and display the numeric value */
  $("#progress").html(data+'%');

  $('#scanwifi').prop('disabled', true);
  $('#scanwifi').html('Scanning...');

  scanned = 254;
  scanok = 0;
  scanfail = 0;

  $("#foundIpwifi").empty();

  var template = `
  <div class="table-responsive">
  <table class="table">
  <thead>
    <tr>
      <th>IP</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody id="foundIPTable">
  </table>
  </div>
  `

  $("#foundIpwifi").append(template);

  var subnet1 = $("#wifisubnet1").val();
  var subnet2 = $("#wifisubnet2").val();
  var subnet3 = $("#wifisubnet3").val();
  if (!subnet1) {
    subnet1 = "192";
  }
  if (!subnet2) {
    subnet2 = "168";
  }
  if (!subnet3) {
    subnet3 = "137";
  }
  var subnet = subnet1 + '.' +  subnet2 + '.' + subnet3 + '.' ;

  for (var ctr = 1; ctr < 255; ctr++) {
    var ip = subnet + ctr

    var result = scanWifiIP(ip)
  }
  localStorage.setItem("wifisubnet1", subnet1);
  localStorage.setItem("wifisubnet2", subnet2);
  localStorage.setItem("wifisubnet3", subnet3);
};

function  scanWifiIP(ip) {
  printLog('Wifi Checking: '+ip, successcolor, "wifi")
  var cmd = "version\n";
  var url = "http://" + ip + "/command";
  // Send the data using post

    var posting = new WebSocket('ws://'+ip+'/');
    posting.binaryType = "arraybuffer";

    posting.onopen = function(e) {
      scanned = scanned - 1;
      scanok += 1
      var ipa = ip.split('.');
      $("#scannumberwifi").html('Scanning: <span style="color: #00cc00">'+scanok+ '</span>+<span style="color: #cc0000">'+scanfail+ '</span> done. '+scanned+' to go.' )
      $("#foundIPTable").append("<tr><td><a onclick='setWifiIP(\""+ip+"\")' href='#'>"+ip+"<div id='logo"+ipa[3]+"'></div></a></td><td><div id='ip"+ipa[3]+"'></div></td></tr>");
      posting.send("M117 Scan " + myIP + "\n");
      posting.send("version\n");
      posting.send("version\n");
    }

    posting.onclose = function(e){
      scanned = scanned - 1;
      scanfail += 1
      $("#scannumberwifi").html('Scanning: <span style="color: #00cc00">'+scanok+ '</span>+<span style="color: #cc0000">'+scanfail+ '</span> done. '+scanned+' to go.' )

      var data = parseInt(Math.ceil(((254 - scanned)/254) * 100));

      $("#progress").css('width',data+'%');
        /* and display the numeric value */
      $("#progress").html(data+'%');

      if (scanned < 5) {
        $('#scanwifi').prop('disabled', false);
        $('#scanwifi').html('Scan');
      }
    }

    posting.onmessage = function(e){
      var data = "";
      if(e.data instanceof ArrayBuffer){
        var bytes = new Uint8Array(e.data);
        for (var i = 0; i < bytes.length; i++) {
          data += String.fromCharCode(bytes[i]);
        }
      } else {
        data = e.data;
      }

      buffer += data
      var split = buffer.split("\n");
      console.log(buffer)
      buffer = split.pop(); //last not fin data back to buffer
      // console.log(split)

      var ipid = posting.url
      ipid = ipid.split(/[/.]+/)
      console.log(ipid[4])
      for (i=0; i< split.length; i++) {
        var response = split[i];
        // console.log(response)

        var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;
         // test the pattern
         var matches = response.match(pattern);
         if (matches) {
             // split branch-hash on dash
             var branchgit = matches[1].split('-');

             var branch = branchgit[0];
             var hash   = branchgit[1];
             var date   = matches[2];
             var mcu    = matches[3];
             var clock  = matches[4];
            setTimeout(function(){ populateDetails(ipid[4], mcu, clock, branch, hash, date); }, 200);
         }
      }
      };
}

function populateDetails(ipid, mcu, clock, branch, hash, date) {
  $("#ip"+ipid).empty();
  $("#logo"+ipid).empty();
  $("#ip"+ipid).append("MCU: <kbd>"+mcu+ " @ " + clock + "</kbd><br>FW: <kbd>" + branch + " " + hash + "</kbd><br>FW date: <kbd>" + date + "</kbd>");
  $("#logo"+ipid).append("<img src='images/smoothie.png'>");
}

function setWifiIP(ipaddr) {
  $("#espIp").val(ipaddr);
  $('#espConnectBtn').click();
}


function sendGcode(gcode) {
  // printLog("<i class='fa fa-arrow-right' aria-hidden='true'></i>"+ gcode, msgcolor)
  if(gcode) {
    // console.log('Sending', gcode)
      if (connectType=="usb") {
        socket.emit('serialSend', gcode);
      } else if (connectType="wifi") {
        if (ws) {
          if (ws.readyState == '1') {
            ws.send(gcode+"\n");
          } else {
            printLog("Unable to send gcode: Not connected to Websocket: "+ gcode, errorcolor, "wifi");
          }
        } else {
          printLog("Unable to send gcode: Not connected: "+ gcode, errorcolor, "wifi");
        }
      }
    }
  };

  function updateStatus(data) {
    // Smoothieware: <Idle,MPos:49.5756,279.7644,-15.0000,WPos:0.0000,0.0000,0.0000>
    // till GRBL v0.9: <Idle,MPos:0.000,0.000,0.000,WPos:0.000,0.000,0.000>
    // since GRBL v1.1: <Idle|WPos:0.000,0.000,0.000|Bf:15,128|FS:0,0|Pn:S|WCO:0.000,0.000,0.000> (when $10=0 or 2!)

    // Extract state
    var state = data.substring(data.indexOf('<') + 1, data.search(/(,|\|)/));
    console.log(state)
    if (state == 'Alarm') {
      $("#machineStatus").removeClass('badge-ok');
      $("#machineStatus").addClass('badge-notify');
      $("#machineStatus").removeClass('badge-warn');
      $("#machineStatus").removeClass('badge-busy');
    } else if (state == 'Home') {
      $("#machineStatus").removeClass('badge-ok');
      $("#machineStatus").removeClass('badge-notify');
      $("#machineStatus").removeClass('badge-warn');
      $("#machineStatus").addClass('badge-busy');
    } else if (state == 'Hold') {
      $("#machineStatus").removeClass('badge-ok');
      $("#machineStatus").removeClass('badge-notify');
      $("#machineStatus").addClass('badge-warn');
      $("#machineStatus").removeClass('badge-busy');
    } else if (state == 'Idle') {
      $("#machineStatus").addClass('badge-ok');
      $("#machineStatus").removeClass('badge-notify');
      $("#machineStatus").removeClass('badge-warn');
      $("#machineStatus").removeClass('badge-busy');
    } else if (state == 'Run') {
      $("#machineStatus").removeClass('badge-ok');
      $("#machineStatus").removeClass('badge-notify');
      $("#machineStatus").removeClass('badge-warn');
      $("#machineStatus").addClass('badge-busy');
    }
    $('#machineStatus').html(state);

    // Extract Pos
    var startPos = data.search(/wpos:/i) + 5;
    if (startPos){
      var pos = data.replace('>','').substr(startPos).split(/,|\|/, 3);
    } else {
  	  var startPos = data.search(/mpos:/i) + 5;
  	  if (startPos){
  		var pos = data.replace('>','').substr(startPos).split(/,|\|/, 3);
  	  }
    }
    if (Array.isArray(pos)){
      // $('#mX').html(pos[0]);
      // $('#mY').html(pos[1]);
      // $('#mZ').html(pos[2]);
      if (bullseye) {
         setBullseyePosition(pos[0], pos[1], pos[2]); // Also updates #mX #mY #mZ
      }
      // printLog("S: " + state + "; X: "+pos[0]+ "; Y: "+pos[1]+ "; Z: "+pos[2] , '#cccccc', "wifi")
    }
  }

function setConnectType(type) {
  connectType = type;
}
