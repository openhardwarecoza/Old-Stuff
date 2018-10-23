var fileOpenName;


$( document ).ready(function() {
  var fileOpen = document.getElementById('filebtn');
  fileOpen.addEventListener('change', readFile, false);

  var dropTarget = document.getElementById('container1');

  var onDragLeave = function(e) {
      e.stopPropagation();
      e.preventDefault();
      $('#draganddrop').hide();
  }

  var onDragOver = function(e) {
      e.stopPropagation();
      e.preventDefault();
      $('#draganddrop').show();
  }

  var onDrop = function(e) {
      onDragLeave(e);
      readFile(e);
  }


  dropTarget.addEventListener('drop', onDrop, false);
  dropTarget.addEventListener('dragover', onDragOver, false);
  dropTarget.addEventListener('dragleave', onDragLeave, false);
});

// Function to execute when opening file (triggered by fileOpen.addEventListener('change', readFile, false); )
function readFile(evt) {
    console.group("New FileOpen Event:")
    console.log(evt);
    console.groupEnd();
    // Close the menu
    $("#drop1").dropdown("toggle");

    // Files
    var files = evt.target.files || evt.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
        loadFile(files[i]);
    }
}

// load file
function loadFile(f) {
    // Filereader
    if (f) {
        var r = new FileReader();
        if (f.name.match(/.gcode$/i)) {
            r.readAsText(f);
            r.onload = function(event) {
                // cleanupThree();
                document.getElementById('gcodepreview').value = this.result;
                printLog('GCODE Opened', msgcolor, "file");
                resetView()
                setTimeout(function(){   openGCodeFromText(); }, 500);
            };
        } else if (f.name.match(/.stl$/i)) {
            //r.readAsText(f);
            // Remove the UI elements from last run
            console.group("STL File");
            var stlloader = new MeshesJS.STLLoader;
            r.onload = function(event) {
                // cleanupThree();
                // Parse ASCII STL
                if (typeof r.result === 'string') {
                    stlloader.loadString(r.result);
                    return;
                }
                // buffer reader
                var view = new DataView(this.result);
                // get faces number
                try {
                    var faces = view.getUint32(80, true);
                } catch (error) {
                    self.onError(error);
                    return;
                }
                // is binary ?
                var binary = view.byteLength == (80 + 4 + 50 * faces);
                if (!binary) {
                    // get the file contents as string
                    // (faster than convert array buffer)
                    r.readAsText(f);
                    return;
                }
                // parse binary STL
                stlloader.loadBinaryData(view, faces, 100, window, f);
            };
            // start reading file as array buffer
            r.readAsArrayBuffer(f);
            printLog('STL Opened', msgcolor, "file");
            console.log("Opened STL, and asking user for Slice settings")
            console.groupEnd();
            $('#stlslice').modal('show')
        }
        fileOpenName = f.name;
    }
  }
