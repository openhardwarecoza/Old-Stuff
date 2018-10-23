$(document).ready(function() {
  var fileOpen = document.getElementById('file');
  fileOpen.addEventListener('change', readFile, false);
});


function readFile(evt) {

  $('#quoteresult').empty();

  console.log(evt);
    // Close the menu
    $("#drop1").dropdown("toggle");
    cleanupThree();
    if (typeof(fileName) !== 'undefined' ) {
      axesgrp.remove(fileName)
    }

    fileName = makeSprite(scene, "webgl", {
        x: (laserxmax / 2),
        y: -30,
        z: 0,
        text: 'Filename : ' + evt.target.files[0].name,
        color: "#000000"
    });

    $('#tabsLayers').append('<li role="presentation" class="layerth" id="'+evt.target.files[0].name+'-tab"><a href="#">'+evt.target.files[0].name+'</a></li>')
    axesgrp.add(fileName);
    // Filereader
    var f = evt.target.files[0];
    if (f) {
        var r = new FileReader();
        if (f.name.match(/.dxf$/i)) {
            console.log(f.name + " is a DXF file");
            console.log('Reader: ', r)
            r.readAsText(evt.target.files[0]);
            r.onload = function(e) {
                dxf = r.result
                // $('#togglefile').click();
                // $('#cammodule').show();
                // $('#svgnewway').hide();
                $('#rastermodule').hide();
                // getSettings();
                drawDXF(dxf);
                currentWorld();
                console.log('DXF Opened');
                // $('#cammodule').show();
                putFileObjectAtZero();
                resetView()
                // $('#stlopt').hide();
                // $('#prepopt').show();
                // $('#prepopt').click();
                // attachTransformWidget();
                // activeObject = fileParentGroup
            };

        } else if (f.name.match(/.svg$/i)) {
            console.log(f.name + " is a SVG file");
            r.readAsText(evt.target.files[0]);
            r.onload = function(event) {
                svg = r.result
                var svgpreview = document.getElementById('svgpreview');
                svgpreview.innerHTML = r.result;
                    // /console.log(svg);
                // $('#togglefile').click();
                // $('#cammodule').show();
                // $('#svgnewway').show();
                $('#rastermodule').hide();
                // getSettings();
                var svgfile = $('#svgpreview').html();
                // var colors = pullcolors(svgfile).unique();
                // var layers = []
                // for (i = 0; i < colors.length; i++) {
                //   // var r = colors[i][0];
                //   // var g = colors[i][1];
                //   // var b = colors[i][2];
                //   //var colorval = RGBToHex(r, g, b)
                //   layers.push(colors[i]);
                // };
                svg2three(svgfile);
                currentWorld();
                console.log('SVG Opened');
                $('#cammodule').show();
                putFileObjectAtZero();
                resetView()
                // $('#stlopt').show();
                // $('#prepopt').show();
                // $('#prepopt').click();
                $('#svgresize').modal('show');
                // attachTransformWidget();
                // activeObject = fileParentGroup
            };
            $('#svgresize').modal('show');

        }
        // else if (f.name.match(/.gcode$/i)) {
        //     cleanupThree();
        //     r.readAsText(evt.target.files[0]);
        //     r.onload = function(event) {
        //         cleanupThree();
        //         document.getElementById('gcodepreview').value = this.result;
        //         openGCodeFromText();
        //         printLog('GCODE Opened', successcolor);
        //         $('#toggleviewer').click();
        //         $('#cammodule').hide();
        //         $('#rastermodule').hide();
        //         //  putFileObjectAtZero();
        //         resetView()
        //         $('#stlopt').hide();
        //         $('#prepopt').hide();
        //         $("#transformcontrols").hide();
        //         activeObject = object
        //     };
        // } else if (f.name.match(/.stl$/i)) {
        //     //r.readAsText(evt.target.files[0]);
        //     // Remove the UI elements from last run
        //     cleanupThree();
        //     var stlloader = new MeshesJS.STLLoader;
        //     r.onload = function(event) {
        //         cleanupThree();
        //         // Parse ASCII STL
        //         if (typeof r.result === 'string') {
        //             console.log("Inside STL.js Found ASCII");
        //             stlloader.loadString(r.result);
        //             return;
        //         }
        //
        //         // buffer reader
        //         var view = new DataView(this.result);
        //
        //         // get faces number
        //         try {
        //             var faces = view.getUint32(80, true);
        //         } catch (error) {
        //             self.onError(error);
        //             return;
        //         }
        //
        //         // is binary ?
        //         var binary = view.byteLength == (80 + 4 + 50 * faces);
        //
        //         if (!binary) {
        //             // get the file contents as string
        //             // (faster than convert array buffer)
        //             r.readAsText(evt.target.files[0]);
        //             return;
        //         }
        //
        //         // parse binary STL
        //         console.log("Inside STL.js Binary STL");
        //         cleanupThree();
        //         stlloader.loadBinaryData(view, faces, 100, window, evt.target.files[0]);
        //     };
        //     // start reading file as array buffer
        //     r.readAsArrayBuffer(evt.target.files[0]);
        //     printLog('STL Opened', successcolor);
        //     //$('#cammodule').hide();
        //     $('#cammodule').show();
        //     $('#rastermodule').hide();
        //     $('#togglefile').click();
        //     $('#stlopt').show();
        //     $('#prepopt').hide();
        //     $('#stlopt').click();
        //     $("#transformcontrols").hide();
        //     activeObject = fileParentGroup
        // } else {
        //     console.log(f.name + " is probably a Raster");
        //     $('#origImage').empty();
        //     r.readAsDataURL(evt.target.files[0]);
        //     r.onload = function(event) {
        //         var imgtag = document.getElementById("origImage");
        //         imgtag.title = evt.target.files[0].name;
        //         imgtag.src = event.target.result;
        //         setImgDims();
        //         drawRaster();
        //         printLog('Bitmap Opened', successcolor);
        //         $('#cammodule').hide();
        //         $('#rastermodule').show();
        //         // putFileObjectAtZero();
        //         $('#togglefile').click();
        //         $('#stlopt').hide();
        //         $('#prepopt').hide();
        //         $("#transformcontrols").hide();
        //
        //         //tbfleming's threejs texture code
        //         var img = document.getElementById('origImage');
        //         var imgwidth = img.naturalWidth;
        //         var imgheight = img.naturalHeight;
        //
        //         var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);
        //
        //         var texture = new THREE.TextureLoader().load(event.target.result);
        //         texture.minFilter = THREE.LinearFilter
        //
        //         var material = new THREE.MeshBasicMaterial({
        //             map: texture,
        //             transparent: true
        //         });
        //
        //         rastermesh = new THREE.Mesh(geometry, material);
        //
        //         rastermesh.position.x = -(laserxmax / 2) + (imgwidth / 2);
        //         rastermesh.position.y = -(laserymax / 2) + (imgheight / 2);
        //         rastermesh.name = "rastermesh"
        //
        //         scene.add(rastermesh);
        //         //  attachTransformWidget();
        //         resetView();
        //         setImgDims();
        //         $('#rasterresize').modal('show')
        //         activeObject = rastermesh
        //     };
        // }
    }
    // $('#filestatus').hide();
    // if ($( "#togglefile" ).hasClass( "btn-default" )) {
    //   $('#togglefile').click();
    // }


};


// Removed and null all object when a new file is loaded
function cleanupThree() {
    if (typeof(fileObject) !== 'undefined') {
        scene.remove(fileObject);
        fileObject = null;
    };


    if (typeof(fileParentGroup) != 'undefined') {
        scene.remove(fileParentGroup);
        fileParentGroup = null;
    };



}
