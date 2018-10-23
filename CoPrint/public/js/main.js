// colors for the consolelog
var msgcolor = '#ffffff';
var successcolor = '#00ff00';
var errorcolor = '#ff0000';
var warncolor = '#ff6600';
var fileParentGroup;
var rastermesh;

$( document ).ready(function() {

  $('#sendCommand').on('click', function() {
    var commandValue = $('#command').val();
    sendGcode(commandValue);
    $('#command').val('');
  });

  // Command Console History
  $("#command").inputHistory({
      enter: function () {
          var commandValue = $('#command').val();
          sendGcode(commandValue);
      }
  });

  $('#tempcontrol').on('keyup change','input:radio', function() {
    console.log($(this))
      var state = null;
      var control = $(this).attr('name');
      var value = $(this).val();
      if (value.indexOf('on') != -1) {
        state = "off"
      } else {
        state = "on"
      }
      if (control) {
        if (control.indexOf('t1') == 0) {
          var temp = $('#t1val').val()
          console.log("Turning T1 " + state + " at " + temp)
          if (state == "on") {
            sendGcode("T0")
            sendGcode("M104 S"+temp)
          } else {
            sendGcode("T0")
            sendGcode("M104 S0")
          }
        }

        if (control.indexOf('t2') == 0) {
          var temp = $('#t2val').val();
          console.log("Turning T2 " + state + " at " + temp)
          if (state == "on") {
            sendGcode("T1")
            sendGcode("M104 S"+temp)
          } else {
            sendGcode("T1")
            sendGcode("M104 S0")
          };
        };

        if (control.indexOf('bed') == 0) {
          var temp = $('#bedval').val()
          console.log("Turning Bed " + state + " at " + temp)
          if (state == "on") {
            sendGcode("T1")
            sendGcode("M140 S"+temp)
          } else {
            sendGcode("T1")
            sendGcode("M140 S0")
          };
        }

        if (control.indexOf('fan') == 0) {
          var power = Math.ceil($('#fanval').val() * (255/100));
          console.log("Turning Fan " + state + " at " + temp)
          if (state == "on") {
            sendGcode("T1")
            sendGcode("M106 S"+power)
          } else {
            sendGcode("T1")
            sendGcode("M107")
          };
        }
      }
    });

    init3D();
    animate();
    initJog();
    initSocket()
    errorHandlerJS();
    socket.emit('listDrives');
    // $("#wifiModal").modal('show');

    NProgress.configure({
        showSpinner: false
    });
});



function printLog(text, color, logclass) {
    text = text.replace(/\n/g, "<br />")
    if ($('#console p').length > 300) {
        // remove oldest if already at 300 lines
        $('#console p').first().remove();
    }
    var template = '<p class="pf" style="color: ' + color + ';">'
    if (logclass) {
        if (logclass == "settings") {
            template += '<i class="fa fa-cogs fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "file") {
            template += '<i class="fa fa-file-text-o fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "google") {
            template += '<i class="fa fa-google fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "jog") {
            template += '<i class="fa fa-arrows fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "macro") {
            template += '<i class="fa fa-th-large fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "fullscreen") {
            template += '<i class="fa fa-fullscreen fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "raster") {
            template += '<i class="fa fa-file-image-o fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "usb") {
            template += '<i class="fa fa-usb fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "wifi") {
            template += '<i class="fa fa-wifi fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "viewer") {
            template += '<i class="fa fa-search fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
        if (logclass == "git") {
            template += '<i class="fa fa-github fa-fw" aria-hidden="true"></i>:&nbsp;'
        }
    }
    template += text
    $('#console').append(template);
    $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
};
errorHandlerJS = function() {
    window.onerror = function(message, url, line) {
        message = message.replace(/^Uncaught /i, "");
        //alert(message+"\n\n("+url+" line "+line+")");
        console.log(message + "\n\n(" + url + " line " + line + ")");
        if (message.indexOf('updateMatrixWorld') == -1) { // Ignoring threejs/google api messages, add more || as discovered
            printLog(message + "\n(" + url + " on line " + line + ")", errorcolor);
        }
    };
};
