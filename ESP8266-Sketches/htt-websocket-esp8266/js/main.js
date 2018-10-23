var topictree = []
var topicbuilding = []
var topicroom = []
var topicdevice = []
var mqtt;

function sendmesg(devicestring, command) {
  var string = devicestring.replace(/_/g, "/")
  mqtt.send(string, command);
  if ($('#ws p').length > 300) {
    // remove oldest if already at 300 lines
    $('#ws p').first().remove();
  }
  $('#ws').append('<p class="pf" style="color: #ff0000 ;">Sent:' + string + ' = ' + command);
  $('#ws').scrollTop($("#ws")[0].scrollHeight - $("#ws").height());
}


$( document ).ready(function() {


  var reconnectTimeout = 2000;

  function MQTTconnect() {
  if (typeof path == "undefined") {
      path = '/mqtt';
  }
  mqtt = new Paho.MQTT.Client(
    host,
    port,
    path,
    "web_" + parseInt(Math.random() * 100, 10)
  );
      var options = {
          timeout: 3,
          useSSL: useTLS,
          cleanSession: cleansession,
          onSuccess: onConnect,
          onFailure: function (message) {
              $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
              setTimeout(MQTTconnect, reconnectTimeout);
          }
      };

      mqtt.onConnectionLost = onConnectionLost;
      mqtt.onMessageArrived = onMessageArrived;

      if (username != null) {
          options.userName = username;
          options.password = password;
      }
      console.log("Host="+ host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
      mqtt.connect(options);
  }

  function onConnect() {
      $('#status').html('Host: ' + host + ':' + port + path);
      // Connection succeeded; subscribe to our topic
      mqtt.subscribe(topic, {qos: 0});
      $('#topic').html("Subscribed to: " + topic);
  }

  function onConnectionLost(response) {
      setTimeout(MQTTconnect, reconnectTimeout);
      $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");

  };


  function onMessageArrived(message) {

      var topic = message.destinationName;
      var payload = message.payloadString;

      var l1 = topic.split('/');

      if ($.inArray(topic, topictree) != -1) {
        //  console.log('not adding again')
        var device = l1[3];
        var object = l1[4];
        if (object) {
          if (object == "state") {
            console.log("State changed to ", payload, " for ", l1[3] )
              $("#"+device+"-state").html("State: " + payload)
          }

          if (object == "value") {
            console.log("State changed to ", payload, " for ", l1[3] )
              $("#"+device+"-state").html("Value: " + payload)
          }

          if (object == "status") {
            console.log("State changed to ", payload, " for ", l1[3] )
              $("#"+device+"-state").html("Value: " + payload)
          }
        }

      } else {

        topictree.push(topic);

        var building = l1[1];
        if ($.inArray(building, topicbuilding) != -1) {
           // do nothing if already in array
        } else {7
          topicbuilding.push(building)
          var parent = '#';
          var index = building
          var node = { id:index,text:building, type:"building", opened:true};
          $('#topictree').jstree().create_node(parent, node, 'last');
        }

        var room = l1[2];
        if (room) {
          if ($.inArray(room, topicroom) != -1) {
            // do nothing if already in array
          } else {
            topicroom.push(room)
            var parent = building;
            var index = room
            var node = { id:index,text:room, type:"room", opened:true};
            $('#topictree').jstree().create_node(parent, node, 'last');
          }
        }

        var device = l1[3];
        if (device) {
          if ($.inArray(device, topicdevice) != -1) {
            // do nothing if already in array
          } else {
            topicdevice.push(device)
            var parent = room;
            var index = device
            var node = { id:index,text:device, type:"device", opened:true};
            $('#topictree').jstree().create_node(parent, node, 'last');
          }
        }

        var object = l1[4];

        if (object == "state") {
          var template = `<form class="form-horizontal devicegroup" id="`+device+`-form" style="display:none;">
          <label class="control-label">`+topic+`</label><br>
          <label class="control-label" id="`+device+`-state"></label><br>
          <input style="display:none;" id="device"></input>
          <div class="btn-group btn-group-justified">
            <div class="btn-group"><a class="btn btn-danger" onclick="sendmesg('_` + building +`_` + room +`_`+ device +`_command', '0')">OFF</a></div>
            <div class="btn-group"><a class="btn btn-success" onclick="sendmesg('_` + building +`_` + room +`_`+ device +`_command', '1')">ON</a></div>
          </div>
          </form>
          `
            $("#controls").append(template);
        }
        if (object == "value") {

          var template = `<form class="form-horizontal devicegroup" id="`+device+`-form" style="display:none;">
          <label class="control-label">`+topic+`</label><br>
          <label class="control-label" id="`+device+`-state"></label><br>
          <input style="display:none;" id="device"></input>

          </form>
          `

          $("#controls").append(template);

        }

        if (object == "status") {

          var template = `<form class="form-horizontal devicegroup" id="`+device+`-form" style="display:none;">
          <label class="control-label">`+topic+`</label><br>
          <label class="control-label" id="`+device+`-state"></label><br>
          <input style="display:none;" id="device"></input>

          </form>
          `

          $("#controls").append(template);

        }




        $("#topictree").jstree("open_all");
      }






      if ($('#ws p').length > 300) {
        // remove oldest if already at 300 lines
        $('#ws p').first().remove();
      }
      $('#ws').append('<p class="pf" style="color: #000 ;">' + topic + ' = ' + payload);
      $('#ws').scrollTop($("#ws")[0].scrollHeight - $("#ws").height());
$("#tree").jstree("open_all");
  };


  $(document).ready(function() {
      MQTTconnect();

      $('#topictree').jstree({
          core: {
              "check_callback": true,
              "animation": 0
          },
          "html_data": {},
          "themes": {
              "icons": false
          },
          "types" : {
            "building" : {
              "icon" : "glyphicon glyphicon-home"
            },
            "room" : {
              "icon" : "glyphicon glyphicon-folder-open"
            },
            "device" : {
              "icon" : "glyphicon glyphicon-object-align-horizontal"
            }
          },
          "plugins" : ["themes","types"]
      });
      $('#topictree').on("changed.jstree", function (e, data) {
        console.log(data.selected);
        $('.devicegroup').hide();
        $('#'+data.selected+'-form').show()
      });
  });

});
