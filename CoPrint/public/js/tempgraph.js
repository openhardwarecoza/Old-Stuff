var hotend1 = [];
var hotend2 = [];
var heatbed = [];


$( document ).ready(function() {
  $.plot($("#monitor"), [hotend1, hotend2, heatbed], options);
});


  var options = {
    series: {
      lines: { show: true, fill: false },
      bars: { show: false },
      points: { show: false }
    },
    yaxis: {
      min: 0,
      max: 280,
      tickSize: 40,
      color: '#aaa',
      tickFormatter: function(val, axis) { return val < axis.max ? val.toFixed(0)+'&deg;C' : "&deg;C";}
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
    colors: [ "#ff0000", "#00ff00", "#00a2ff" ]


  };


function setTemp(t0, t1, b) {

  var he1 = [];
  var he2 = [];
  var hb = [];


  hotend1 = hotend1.slice(-10)
  hotend1.push(t0);
  for (var i = 0; i < hotend1.length; ++i) {
    he1.push([i, hotend1[i]])
  }

  hotend2 = hotend2.slice(-10)
  hotend2.push(t1);
  for (var i = 0; i < hotend2.length; ++i) {
    he2.push([i, hotend2[i]])
  }

  heatbed = heatbed.slice(-10)
  heatbed.push(b)
  for (var i = 0; i < heatbed.length; ++i) {
    hb.push([i, heatbed[i]])
  }

  $.plot($("#monitor"), [he1, he2, hb], options);
}
