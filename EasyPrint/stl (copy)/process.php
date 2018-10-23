<?php
$item = $_FILES['userfile']['name'];
?>

<?php
   // Configuration - Your Options
      $allowed_filetypes = array('.stl','.obj'); // These will be the types of file that will pass the validation.
      $max_filesize = 50024288; // Maximum filesize in BYTES (currently 0.5MB).
      $upload_path = '/srv/www/vhosts/EasyPrint/stl/objects/'; // The place the files will be uploaded to (currently a 'files' directory).
 
   $filename = $_FILES['userfile']['name']; // Get the name of the file (including file extension).
   $item = $_FILES['userfile']['name'];
   $ext = substr($filename, strpos($filename,'.'), strlen($filename)-1); // Get the extension from the filename.
 
   // Check if the filetype is allowed, if not DIE and inform the user.
   if(!in_array($ext,$allowed_filetypes))
      die('The file you attempted to upload is not allowed.');
 
   // Now check the filesize, if it is too large then DIE and inform the user.
   if(filesize($_FILES['userfile']['tmp_name']) > $max_filesize)
      die('The file you attempted to upload is too large.');
 
   // Check if we can upload to the specified path, if not DIE and inform the user.
   if(!is_writable($upload_path))
      die('You cannot upload to the specified directory, please CHMOD it to 777.');
 
 
    // Upload the file to your specified path.
   if(move_uploaded_file($_FILES['userfile']['tmp_name'],$upload_path . $filename))
         echo '';
     else
         echo 'There was an error during the file upload.  Please try again.'; // It failed :(.
 
?>
<!doctype html>
<html lang="en" class="no-js">
<head>
<title>EasyPrint by OpenHardware.co.za</title>
  <meta charset="utf-8">
   
    <script src="Three.js"></script>
    <script src="plane.js"></script>
    <script src="thingiview.js"></script>

    <script>
      window.onload = function() {
        thingiurlbase = ".";
        thingiview = new T <script src="Three.js"></script>
    <script src="plane.js"></script>
    <script src="thingiview.js"></script>

    <script>
      window.onload = function() {
        thingiurlbase = "/stl/javascripts";
        thingiview = new Thingiview("viewer");
        thingiview.setObjectColor('#CC0000');
	thingiview.setBackgroundColor('#000000');
        thingiview.initScene();
        thingiview.loadSTL("/stl/objects/<? echo $item;?>");
      }
    </script>

    <style>
body{
background-color: black;
color: white;
}
a{
color: white;
}

* {margin:0;padding:0}
/* mac hide \*/
html,body{height:100%;width:100%;}
/* end hide */
body { 
background-color: #000000;
text-align:center;
min-height:468px;/* for good browsers*/
min-width:552px;/* for good browsers*/
}
#outer{
height:100%;
width:100%;
display:table;
vertical-align:middle;
}
#container {
text-align: center;
position:relative;
vertical-align:middle;
display:table-cell;
height: 568px;
} 
#inner {
width: 600px;
background:black;
height: 600px;
text-align: center;
padding-top: 0px;
margin-left:auto;
margin-right:auto;
border:1px solid #FFF;
}
input {
font-family: verdana;
font-size: 12px;
}

button {
font-family: verdana;
font-size: 20px;
padding: 10px;
}

#logo {
text-align: center;
position:absolute;
vertical-align:top;
display:table-cell;
height: 126px;
} 

    </style>
</head>

<body>
<div id="outer">
<div id="logo">
<img src="/logo_inv.jpg">
</div>
<div id="container">
<div id="inner">

    <div id="viewer" style="width:600px;height:400px;align:center;"></div>
<p>

<h2><?php echo $_FILES['userfile']['name'];  ?></h2>
</p>
<hr>
<p>

  <input onclick="thingiview.setCameraView('top');" type="button" value="Top" /> 
  <input onclick="thingiview.setCameraView('side');" type="button" value="Side" /> 
  <input onclick="thingiview.setCameraView('bottom');" type="button" value="Bottom" /> 
  <input onclick="thingiview.setCameraView('diagonal');" type="button" value="Diagonal" /> 
 
  <input onclick="thingiview.setCameraZoom(5);" type="button" value="Zoom +" /> 
  <input onclick="thingiview.setCameraZoom(-5);" type="button" value="Zoom -" /> 
 
  Rotation: <input onclick="thingiview.setRotation(true);" type="button" value="on" /> | <input onclick="thingiview.setRotation(false);" type="button" value="off" />
</p>
<p>
  <input onclick="thingiview.setObjectMaterial('wireframe');" type="button" value="Wireframe" /> 
  <input onclick="thingiview.setObjectMaterial('solid');" type="button" value="Solid" />
</p>

<p>
  Plane: <a href="#" onclick="thingiview.setShowPlane(false)">Hide</a> | <a href="#" onclick="thingiview.setShowPlane(true)">Show</a><br/>
  Background Color: <a href="#" onclick="thingiview.setBackgroundColor('#606060')">Gray</a> | <a href="#" onclick="thingiview.setBackgroundColor('#ffffff')">White</a> | <a href="#" onclick="thingiview.setBackgroundColor('#000000')">Black</a><br/>
  Object Color: <a href="#" onclick="thingiview.setObjectColor('#ffffff')">White</a> | <a href="#" onclick="thingiview.setObjectColor('#aa0000')">Red</a> | <a href="#" onclick="thingiview.setObjectColor('#CDFECD')">Green</a> | <a href="#" onclick="thingiview.setObjectColor('#C0D8F0')">Blue</a><br/>
</p>
<form action="./stl/process.php" method="post" enctype="multipart/form-data">
   <p>
      <button>Preview OK:  Proceed to generate GCode</button>
   <p>
</form>

</div>
</div>
</div>
</body>
</html>
