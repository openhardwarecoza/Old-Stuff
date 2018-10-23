var socket, isConnected, connectVia;
var jobStartTime = -1;
var playing = false;
var paused = false;
var lastpath;
var progressCheck;

function initSocket() {
  socket = io.connect(''); // socket.io init
  socket.emit('firstLoad', 1);

  socket.on('config', function (data) {
    console.log(data)
  });

  socket.on('loadfile', function (data) {
    if (typeof(object) != "undefined") {
      scene.remove(object)
    }
    console.log(data)
    document.getElementById('gcodepreview').value = data.data;
    printLog('GCODE Opened', msgcolor, "file");
    resetView()
    setTimeout(function(){   openGCodeFromText(); }, 500);
    fileOpenName = data.name;
  });

  socket.on('loadconfig', function (data) {
    // console.log(data)
    var config = configparse(data.data)


  });

  socket.on('uploadcomplete', function (data) {
      $("#uploadbtn").removeClass('disabled');
      $(".upload").removeClass('disabled');
      $(".upload").show();
      $(".uploadprogress").hide();
      window.setTimeout($("#sdModal").modal('hide'), 100);
      socket.emit('listSD', $('#drives2').val());
      lastpath = $('#drives2').val()
      $("#drives option:contains(" + $('#drives2').val() + ")").attr('selected', 'selected');

  });

  socket.on('fileList', function (data) {
    // console.log(data)
    $('#filelist').empty();
    for (i=0; i<data.length; i++) {
      // console.log(data[i].Name);
      var path = data[i].Path;
      path = path.replace(/\\/g,"/");
      var name = data[i].Name
      if (name.length > 25) {
        var newname = ""
        newname += name.substring(0,10)
        newname += "..."
        newname += name.substring(name.length - 10)
        name = newname;
      }

      if (name == "config") {
        $("#filelist").append(`<tr><td><i class="fa fa-fw fa-file-o" aria-hidden="true"></i> `+name+`</td><td><a class="btn btn-xs btn-default" onclick="fetchconfig('`+name+`','`+path+`')"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a></td></tr>`);
      } else if (name == "FIRMWARE.CUR") {
        $("#filelist").append(`<tr><td><i class="fa fa-fw fa-file-o" aria-hidden="true"></i> `+name+`</td><td><a class="btn btn-xs btn-danger"  onclick="deletesd('`+name+`','`+path+`')"><i class="fa fa-times" aria-hidden="true"></i></a><a class="btn btn-xs btn-warning"><i class="fa fa-cloud-download" aria-hidden="true"></i></a></td></tr>`);
      } else if (data[i].IsParentDirectory) {
        // <a class="btn btn-xs btn-default"><i class="fa fa-eye" aria-hidden="true"></i></a><a class="btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a><a class="btn btn-xs btn-primary"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
        $("#filelist").append(`<tr><td><a onclick="socket.emit('listSD', '`+path+`'); lastpath=path;"' href='#'><i class="fa fa-fw fa-level-up" aria-hidden="true"></i> ... `+name+`</a></td><td><a class="btn btn-xs btn-default"><i class="fa fa-level-up" aria-hidden="true"></i></a></td></tr>`);
      } else if (data[i].IsDirectory) {
        $("#filelist").append(`<tr><td><a onclick="socket.emit('listSD', '`+path+`'); lastpath=path;"' href='#'><i class="fa fa-fw fa-folder-open" aria-hidden="true"></i> `+name+`</a></td><td><a class="btn btn-xs btn-default"><i class="fa fa-folder-open" aria-hidden="true"></i></a></td></tr>`);
        // $('#filelist').append(`<a href="#" onclick="socket.emit('listSD', '`+path+`')"><i class="fa fa-folder-open" aria-hidden="true"></i> `+name+"<br>");
      } else {
        $("#filelist").append(`<tr><td><i class="fa fa-fw fa-file-o" aria-hidden="true"></i> `+name+`</td><td><a class="btn btn-xs btn-default" onclick="fetchsd('`+name+`','`+path+`')"><i class="fa fa-television" aria-hidden="true"></i></a><a class="btn btn-xs btn-danger"  onclick="deletesd('`+name+`','`+path+`')"><i class="fa fa-times" aria-hidden="true"></i></a><a class="btn btn-xs btn-success" onclick="playsd('`+name+`','`+path+`')"><i class="fa fa-fw fa-play" aria-hidden="true"></i></a></td></tr>`);
      }
    }
  });

  $('#drives').change(function() {
      socket.emit('listSD', $(this).val());
      lastpath =  $(this).val()
  });

  socket.on('driveList', function (data) {
    $("#drives").find('option').remove();
    var drives = $("#drives");
    console.log(data);
    drives.append($("<option />").val("").text("Please Select Drive..."));
    for (i = 0; i< data.length; i++) {
      var driveSize = parseInt(data[i].size)/1024000000;
      driveSize = driveSize.toFixed(2);
      mountpoint = data[i].mountpoints[0].path
      drives.append($("<option />").val(mountpoint).text(mountpoint + " (" + driveSize + "GB)"));
    }

    $("#drives2").find('option').remove();
    var drives = $("#drives2");
    console.log(data);
    drives.append($("<option />").val("").text("Please Select Drive..."));
    for (i = 0; i< data.length; i++) {
      var driveSize = parseInt(data[i].size)/1024000000;
      driveSize = driveSize.toFixed(2);
      mountpoint = data[i].mountpoints[0].path
      drives.append($("<option />").val(mountpoint).text(mountpoint + " (" + driveSize + "GB)"));
    }
  });



  socket.on('data', function (data) {
    $('#syncstatus').html('Socket OK');
    isConnected = true;
    if (data.indexOf("ok T:") == 0) { // Got an Temperature Feedback
        // console.log(response);
        for (var r, n = /(B|T(\d*)):\s*([+]?[0-9]*\.?[0-9]+)? (\/)([+]?[0-9]*\.?[0-9]+)?/gi; null !== (r = n.exec(data));) {
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
    } else if (data.indexOf('<') == 0) {
      updateStatus(data);
    } else if (data =='ok') {
      printLog(data, '#cccccc', "usb");
    } else if (data.indexOf("file:") == 0) {
      //file: /sd/file (9).gcode, 10 % complete, elapsed time: 00:00:06
      var progressdata = data.split(" ");
      // console.log(progressdata)
      var percentage = parseInt(progressdata[3]);
      printLog(data, '#00ff00', "usb");
    } else if (data.indexOf("Not currently playing") == 0) {
        clearInterval(progressCheck);
        clearInterval(queryLoop);
        printLog("Job Complete: Stopping Progress Check", msgcolor, "usb")
    } else {
      printLog(data, msgcolor, "usb");
    }
  });

  socket.on('ports', function (data) {
    $('#syncstatus').html('Socket Init');
    var options = $("#port");
    for (i = 0; i< data.length; i++) {
      options.append($("<option />").val(data[i].comName).text(data[i].comName));
    }
    $('#connect').removeClass('disabled');
    // Might as well pre-select the last-used port and buffer
    var lastUsed = localStorage.getItem("lastUsedPort");
    var lastBaud = localStorage.getItem("lastUsedBaud");
    $("#port option:contains(" + lastUsed + ")").attr('selected', 'selected');
    $("#baud option:contains(" + lastBaud + ")").attr('selected', 'selected');
  });

  socket.on('activePorts', function (data) {
    console.log('activePorts' + data);
  });

  socket.on('connectStatus', function (data) {
	   console.log(data);
     if (data == "Connected") {
       $('#closePort').removeClass('disabled');
       $('#connect').hide();
       $('#closePort').show();
     } else if (data == "Disconnected") {
       $('#closePort').addClass('disabled');
       $('#connect').show();
       $('#closePort').hide();
     }
    // $('#connectStatus').html(data);
    $('#syncstatus').html('Socket OK');
  });

  $('#refreshPort').on('click', function() {
    $('#port').find('option').remove().end();
    socket.emit('refreshPorts', 1);
    $('#syncstatus').html('Socket Refreshed');
  });

  $('#connect').on('click', function() {
    var portName = $('#port').val();
    var baudRate = $('#baud').val();
    socket.emit('connectTo', portName + ',' + baudRate);
    isConnected = true;
    setConnectType("usb");
    localStorage.setItem("lastUsedPort", portName);
    localStorage.setItem("lastUsedBaud", baudRate);
    $("#machineStatus").addClass('badge-ok')
    $("#machineStatus").removeClass('badge-notify')
    $("#machineStatus").removeClass('badge-warn')
    $("#machineStatus").removeClass('badge-busy')
    $('#machineStatus').html("USB Connected");

  });

  $('#closePort').on('click', function() {
    socket.emit('closePort', 1);
    isConnected = false;
    $('#closePort').addClass('disabled');
    $('#machineStatus').html('Not Connected');
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").addClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").removeClass('badge-busy');
    jobRunsFrom = "none";
  });

  $('#sendCommand').on('click', function() {
    var commandValue = $('#command').val();
    sendGcode(commandValue);
    $('#command').val('');
  });

  socket.on('qCount', function (data) {
    data = parseInt(data);
    $('#queueCnt').html('Queued: ' + data);
    if (data < 1) {
      $('#playicon').removeClass('fa-pause');
      $('#playicon').addClass('fa-play');
      playing = false;
      paused = false;
      if (jobStartTime >= 0) {
        var jobFinishTime = new Date(Date.now());
        var elapsedTimeMS = jobFinishTime.getTime() - jobStartTime.getTime();
        var elapsedTime = Math.round(elapsedTimeMS / 1000);
        printLog("Job started at " + jobStartTime.toString(), msgcolor, "file");
        printLog("Job finished at " + jobFinishTime.toString(), msgcolor, "file");
        printLog("Elapsed time: " + elapsedTime + " seconds.", msgcolor, "file");
        jobStartTime = -1;

        // Update accumulated job time
        var accumulatedJobTimeMS = accumulateTime(elapsedTimeMS);

        printLog("Total accumulated job time: " + (accumulatedJobTimeMS / 1000).toHHMMSS());
      }
    }
  });
}


function sdupload() {
  socket.emit('listDrives');
  $("#sdModal").modal('show');
  $("#sdfilename").val(fileOpenName);
}

function sduploadaction() {
  $("#uploadbtn").addClass('disabled');
  $(".upload").addClass('disabled');
  $(".upload").hide();
  $(".uploadprogress").show();

  g = document.getElementById('gcodepreview').value;
  var data = new Object;
  data.path = $('#drives2').val();
  data.name = $("#sdfilename").val();
  data.data = g;
  socket.emit('writefile', data)
}

function fetchsd(filename, path) {
  var data = new Object;
  data.path = path;
  data.name = filename;
  socket.emit('readfile', data)
}

function fetchconfig(filename, path) {
  var data = new Object;
  data.path = path;
  data.name = filename;
  socket.emit('readconfig', data)
}


function deletesd(filename, path) {
  var data = new Object;
  data.path = path;
  data.name = filename;
  socket.emit('deletefile', data)
  setTimeout(function(){   socket.emit(); }, 500);
  socket.emit('listSD', lastpath);
}

function playsd(filename, path) {
  jobRunsFrom = "sd";
  sendGcode('play /sd/' + filename);
  progressCheck = setInterval(function() {
      // console.log('StatusChkc')
      // sendGcode('?\n');
      sendGcode('progress');
  }, 1000);
  queryLoop = setInterval(function() {
      // console.log('StatusChkc')
      // sendGcode('?\n');
      sendGcode('?');
      uploadLine();
  }, 500);
}

function stopjob() {
  if (connectType=="usb") {
    if (jobRunsFrom == "sd") {
      sendGcode('abort')
    } else if (jobRunsFrom == "usb") {
      socket.emit('stop', 0);
    }
  } else if (connectType=="wifi") {
    gcodeQueue = []; $('#queueCnt').html('Queued: ' + gcodeQueue.length)
  }
}

function runjob() {
  if (connectType=="usb") {
    g = document.getElementById('gcodepreview').value;
    sendGcode(g);
    jobRunsFrom = "usb";
  } else if (connectType=="wifi") {
    espPlay();
  }

}
