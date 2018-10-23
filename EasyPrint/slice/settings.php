<?php
$item = $_POST['filename'];
echo $item;
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
   <p>
<table>
<tr>
<td><h3>Quality</h3></td>
<td>
<select name="quality" style="width: 200px">
<option value="hi">High</option>
<option value="med">Medium</option>
<option value="fast">Fast</option>
</select>
</td>
</tr>
<tr>
<td><h3>Nozzle Size</h3></td>
<td>
<select name="nozzle"  style="width: 200px">
<option value="0.35">0.35mm</option>
<option value="0.4">0.40mm</option>
<option value="0.5">0.50mm</option>
</select>
</td>
</tr>
<tr>
<td><h3>Filament Type</h3></td>
<td>
<input type="radio" name="temp" value="">Predefined:
<select name="temp">
<option value="230">ABS (230degC)</option>
<option value="195">PLA (195degC)</option>
</select>
<br>
<input type="radio" name="temp" value="">Other: <input type="text" name="qual" value="" size="4">degC

</td>
</tr>

<tr>
<td><h3>Filament Diameter</h3></td>
<td>
<input type="radio" name="diam" value="1.75">1.75mm<br>
<input type="radio" name="diam" value="3.0">3.0mm<br>
<input type="radio" name="diam" value="">Other: <input type="text" name="diam" value="" size="4">mm
</td>
</tr>
<tr>
<td><h3>Infill Type</h3></td>
<td>
<select name="infill" style="width: 200px">
<option value="rect">Rectilinear</option>
<option value="hex">Hexagonal</option>
</select>
</td>
</tr>
<tr>
<td><h3>Infill Solidity</h3></td>
<td>
<select name="solid" style="width: 200px">
<option value="0.1">10%</option>
<option value="0.2">20%</option>
<option value="0.3" selected>30%</option>
<option value="0.4">40%</option>
<option value="0.5">50%</option>
<option value="0.6">60%</option>
<option value="0.7">70%</option>
<option value="0.8">80%</option>
<option value="0.9">90%</option>
<option value="1.0">100%</option>
</select>
</td>
</tr>

<tr>
<td><h3>Control heated bed</h3></td>
<td>
<select name="heatbed" style="width: 200px">
<option value="yes">Yes</option>
<option value="no">No, I control Manually</option>
</select>
</td>
</tr>


<tr>
<td colspan=2><center>
<input type="hidden" name="filename" value="/stl/objects/<? echo $item;?>">
<button>Generate GCODE</button>
</center>
<p>
</form>
</td>
</tr>
</table>

</div>
</div>
</div>
</body>
</html>
