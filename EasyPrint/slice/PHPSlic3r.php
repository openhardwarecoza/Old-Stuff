<?php
$item = $_POST['filename'];
$quality = $_POST['quality'];

$nozzle = $_POST['nozzle'];

$temp = $_POST['temp'];

$diam = $_POST['diam'];

$infill = $_POST['infill'];

$solid = $_POST['solid'];

$heatbed = $_POST['heatbed'];

echo $quality;
echo "<br>";
echo $nozzle;
echo "<br>";
echo $temp;
echo "<br>";
echo $diam;
echo "<br>";
echo $infill;
echo "<br>";
echo $solid;
echo "<br>";
echo $heatbed;
echo "<br>";

$str = exec('PATH=$PATH:/srv/apps/Slic3r/bin && slic3r');
echo $str;

?>



<!doctype html>
<html lang="en" class="no-js">
<head>
<title>EasyPrint by OpenHardware.co.za</title>
  <meta charset="utf-8">
   
   
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
padding-top: 50px;
padding-left: 50px;
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

 
<form action="/slice/PHPSlic3r.php" method="post" enctype="multipart/form-data">
<button>Generate GCODE</button>
</form>
</td>
</tr>
</table>

</div>
</div>
</div>
</body>
</html>
