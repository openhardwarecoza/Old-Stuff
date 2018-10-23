function initJog() {

  $('#bounding').on('click', function() {
    var bbox2 = new THREE.Box3().setFromObject(object);
    console.log('bbox for Draw Bounding Box: '+ object +' Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
    printLog("Drawing Bounding Box...", msgcolor, "jog");
    var moves = `
    G90\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
    G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
    G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F2000\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F2000\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
    G90`
    sendGcode(moves)
});

    $('#extrudebtn').on('click', function() {
       if (isConnected) {
         var dist = $('#extrudelength').val()
         var feed = $('#extrudespeed').val()
         sendGcode('G91\nG0 E'+ dist +' F'+ feed + '\nG90');
       }
    });

    $('#retractbtn').on('click', function() {
       if (isConnected) {
         var dist = $('#extrudelength').val()
         var feed = $('#extrudespeed').val()
         sendGcode('G91\nG0 E-'+ dist +' F'+ feed + '\nG90');
       }
    });

    $('#xP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedxy').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' X'+ dist + '\nG90');
       }
    });

    $('#yP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedxy').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' Y'+ dist + '\nG90');
       }
    });

    $('#zP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedz').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' Z'+ dist + '\nG90');
       }
    });

    $('#xM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedxy').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' X-'+ dist + '\nG90');
       }
    });

    $('#yM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedxy').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' Y-'+ dist + '\nG90');
       }
    });

    $('#zM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         var feedrate = $('#jogfeedz').val() * 60
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 F'+ feedrate +' Z-'+ dist + '\nG90');
       }
    });

    // Jog Widget
    var lastJogSize = parseFloat(localStorage.getItem("lastJogSize") || 10);

    $('#stepsize input').on('change', function() {
      var newJogSize = $('input[name=stp]:checked', '#stepsize').val();
       printLog('Jog will use ' + newJogSize + ' mm per click', successcolor, "jog");

       $(".stepsizeval").empty();
       $(".stepsizeval").html(newJogSize + 'mm');
       // Save the setting to local storage once it's been set.
       localStorage.setItem("lastJogSize", newJogSize.toString());
    });

    // Now set the initial setting from the saved settings
    $("input[name=stp][value='"+lastJogSize+"']").click();

    var jogfeedxy = parseFloat(localStorage.getItem("jogFeedXY") || 30);
    var jogfeedz = parseFloat(localStorage.getItem("jogFeedZ") || 5);
    $("#jogfeedxy").val(jogfeedxy);
    $("#jogfeedz").val(jogfeedz);

    $("#jogfeedxy").on('change', function() {
      var jogfeedxy = parseFloat($("#jogfeedxy").val());
      localStorage.setItem("jogFeedXY", jogfeedxy.toString());
      printLog('Jog xy speed settings saved', successcolor, "jog");
    });

    $("#jogfeedz").on('change', function() {
      var jogfeedz = parseFloat($("#jogfeedz").val());
      saveSetting("jogFeedZ", jogfeedz.toString());
      printLog('Jog z speed settings saved', successcolor, "jog");
    });

};

function saveJogSpeeds() {
  var jogfeedxy = parseFloat($("#jogfeedxy").val());
  var jogfeedz = parseFloat($("#jogfeedz").val());

  localStorage.setItem("jogFeedXY", jogfeedxy.toString());
  localStorage.setItem("jogFeedZ", jogfeedz.toString());

  printLog('Jog speed settings saved', successcolor, "jog");

};
