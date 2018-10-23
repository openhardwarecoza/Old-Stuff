var client = mqtt.connect('ws://10.3.0.254:1884') // you add a ws:// url here
     client.subscribe("/mqtt/+")

     client.on("message", function (topic, payload) {
       printLog([topic, payload].join(": "), msgcolor, "fullscreen");

       console.log(typeof(topic));

       if (topic === '/mqtt/annouce'){
         var newobj = JSON.parse( payload );
         console.log(newobj);
       }
     })
