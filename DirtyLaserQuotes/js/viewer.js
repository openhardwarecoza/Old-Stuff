var scene, camera, renderer;
var geometry, material, mesh, helper, axes, axesgrp, light, bullseye;
var projector, mouseVector, containerWidth, containerHeight;

// Global Vars
var container, stats;
var camera, controls, control, scene, renderer;
var clock = new THREE.Clock();

var marker;
var laserxmax = 1000;
var laserymax = 1000;
var lineincrement = 50

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;

function init3D() {


    // ThreeJS Render/Control/Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 295;

    // var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    //
    // if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
    // {
    //       console.log('Running on iOS');
    //       renderer = new THREE.WebGLRenderer();
    // }
    //     else if( userAgent.match( /Android/i ) )
    // {
    //     console.log('Running on Android');
    //     renderer = new THREE.CanvasRenderer();
    // }
    //   else
    // {
    //     console.log('Running on unknown/Desktop');
    //     renderer = new THREE.WebGLRenderer();
    // }

    var canvas = !!window.CanvasRenderingContext2D;
    var webgl = (function() {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })();

    if (webgl) {
        console.log('WebGL Support found! success:Laserweb will work optimally on this device!');
        renderer = new THREE.WebGLRenderer({
            autoClearColor: true,
            antialias: false
        });

    } else if (canvas) {
        console.log('WebGL Support found! CRITICAL ERROR: Laserweb may not work optimally on this device! <br>Try another device with WebGL support');
        renderer = new THREE.CanvasRenderer();
    };



    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
        console.log('Running on iOS');
        // $('#viewermodule').show();
        // $('#mobileRenderArea').append(renderer.domElement);
        // renderer.setClearColor(0xffffff, 1); // Background color of viewer
        // renderer.setSize(1000, 1000);
        // renderer.clear();
        // camera.aspect = $('#mobileRenderArea').width() / $('#mobileRenderArea').height();
        // camera.updateProjectionMatrix();

    } else if (userAgent.match(/Android/i)) {
        console.log('Running on Android');
        // $('#viewermodule').show();
        // $('#mobileRenderArea').append(renderer.domElement);
        // renderer.setClearColor(0xffffff, 1); // Background color of viewer
        // renderer.setSize($('#mobileRenderArea').width(), $('#mobileRenderArea').height());
        // renderer.clear();
        // camera.aspect = $('#mobileRenderArea').width() / $('#mobileRenderArea').height();
        // camera.updateProjectionMatrix();

    } else {
        console.log('Running on unknown/Desktop');
        // $('#viewermodule').hide();
        // $('#renderArea').append(renderer.domElement);
        // renderer.setClearColor(0xffffff, 1); // Background color of viewer = transparent
        // // renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
        // renderer.clear();
        //
        // sceneWidth = document.getElementById("renderArea").offsetWidth,
        // sceneHeight = document.getElementById("renderArea").offsetHeight;
        // camera.aspect = sceneWidth / sceneHeight;
        // renderer.setSize(sceneWidth, sceneHeight)
        // camera.updateProjectionMatrix();
        // controls.reset();
        // $('#viewReset').click();

    }

    $('#viewermodule').hide();
    $('#renderArea').append(renderer.domElement);
    renderer.setClearColor(0xffffff, 1); // Background color of viewer = transparent
    // renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
    renderer.clear();

    sceneWidth = document.getElementById("renderArea").offsetWidth,
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    camera.aspect = sceneWidth / sceneHeight;
    renderer.setSize(sceneWidth, sceneHeight)
    camera.updateProjectionMatrix();


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // view direction perpendicular to XY-plane
    //controls.enableRotate = false;
    controls.enableZoom = true; // optional
    controls.noKeys = true; // Disable Keyboard on canvas
    //controls.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT }; // swapping left and right buttons
    // /var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    control = new THREE.TransformControls(camera, renderer.domElement);
    //control.addEventListener('change', currentWorld);
    // control.addEventListener('objectChange', cancelAnimation);
    //control.attach(model);
    scene.add(control);
    control.setMode("translate");

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-500, -500, 1).normalize();
    scene.add(light);

    var light2 = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 0, 1).normalize();
    scene.add(light2);

    // LaserWEB UI Grids
    if (helper) {
        scene.remove(helper);
    }

    laserxmax = 1000;
    laserymax = 1000;


    helper = new THREE.GridHelper(laserxmax, laserymax, 10);
    helper.setColors(0x0000ff, 0x707070);
    helper.position.y = 0;
    helper.position.x = 0;
    helper.position.z = 0;
    //helper.rotation.x = 90 * Math.PI / 180;
    helper.material.opacity = 0.15;
    helper.material.transparent = true;
    helper.receiveShadow = false;
    //console.log("helper grid:", helper);
    this.grid = helper;
    //this.sceneAdd(this.grid);
    //console.log('[VIEWER] - added Helpert');
    scene.add(helper);

    // // particleLight = new THREE.Mesh( new THREE.SphereBufferGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    // // 				scene.add( particleLight );
    // //
    // // scene.add( new THREE.AmbientLight( 0x222222 ) );
    // // 				var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    // // 				directionalLight.position.set( 1, 1, 1 ).normalize();
    // // 				scene.add( directionalLight );
    // // 				var pointLight = new THREE.PointLight( 0xffffff, 2, 800 );
    // // 				particleLight.add( pointLight );
    //
    //
    // if (bullseye) {
    //     scene.remove(bullseye);
    // }
    // bullseye = new THREE.Object3D();
    //
    // var material = new THREE.MeshBasicMaterial({
    //     color: 0xFF0000
    // });
    //
    // var radius = 3.5;
    // var segments = 32;
    // var circleGeometry = new THREE.CircleGeometry(radius, segments);
    // var circle = new THREE.Line(circleGeometry, material);
    // bullseye.add(circle);
    //
    // var geometryx = new THREE.Geometry();
    // geometryx.vertices.push(
    //     new THREE.Vector3(-6, 0, 0),
    //     new THREE.Vector3(6, 0, 0)
    // );
    // var linex = new THREE.Line(geometryx, material);
    // linex.position = (0, 0, 0)
    // bullseye.add(linex);
    //
    // var geometryy = new THREE.Geometry();
    // geometryy.vertices.push(
    //     new THREE.Vector3(0, -6, 0),
    //     new THREE.Vector3(0, 6, 0)
    // );
    // var liney = new THREE.Line(geometryy, material);
    // liney.position = (0, 0, 0)
    // bullseye.add(liney);
    //
    // bullseye.name = "Bullseye";
    //
    // scene.add(bullseye);
    // bullseye.position.x = -(laserxmax / 2) + 50;
    // bullseye.position.y = -(laserymax / 2) + 50;


    if (axesgrp) {
        scene.remove(axesgrp);
    }
    axesgrp = new THREE.Object3D();

    var x = [];
    var y = [];
    for (var i = 0; i <= laserxmax; i += lineincrement) {
        x[i] = this.makeSprite(this.scene, "webgl", {
            x: i,
            y: -14,
            z: 0,
            text: i,
            color: "#ff0000"
        });
        axesgrp.add(x[i]);
    }

    for (var i = 0; i <= laserymax; i += lineincrement) {

        y[i] = this.makeSprite(this.scene, "webgl", {
            x: -14,
            y: i,
            z: 0,
            text: i,
            color: "#006600"
        });
        axesgrp.add(y[i]);
    }
    // add axes labels
    var xlbl = this.makeSprite(this.scene, "webgl", {
        x: laserxmax,
        y: 0,
        z: 0,
        text: "X",
        color: "#ff0000"
    });
    var ylbl = this.makeSprite(this.scene, "webgl", {
        x: 0,
        y: laserymax,
        z: 0,
        text: "Y",
        color: "#006600"
    });
    var zlbl = this.makeSprite(this.scene, "webgl", {
        x: 0,
        y: 0,
        z: 125,
        text: "Z",
        color: "#0000ff"
    });


    axesgrp.add(xlbl);
    axesgrp.add(ylbl);
    //axesgrp.add(zlbl); Laser don't have Z - but CNCs do

    var materialX = new THREE.LineBasicMaterial({
        color: 0xcc0000
    });

    var materialY = new THREE.LineBasicMaterial({
        color: 0x00cc00
    });

    var geometryX = new THREE.Geometry();
    geometryX.vertices.push(
        new THREE.Vector3(-0.1, 0, 0),
        new THREE.Vector3(-0.1, (laserymax - 5), 0)
    );

    var geometryY = new THREE.Geometry();
    geometryY.vertices.push(
        new THREE.Vector3(0, -0.1, 0),
        new THREE.Vector3((laserxmax - 5), -0.1, 0)
    );

    var line1 = new THREE.Line(geometryX, materialY);
    var line2 = new THREE.Line(geometryY, materialX);
    axesgrp.add(line1);
    axesgrp.add(line2);

    axesgrp.translateX(laserxmax / 2 * -1);
    axesgrp.translateY(laserymax / 2 * -1);
    //console.log('[VIEWER] - added Axesgrp');
    scene.add(axesgrp);

    // Picking stuff
    projector = new THREE.Projector();
    mouseVector = new THREE.Vector3();



}

function animate() {

  //useVideo = $('#useVideo').val()

    requestAnimationFrame(animate);


    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    renderer.render(scene, camera);
    sceneWidth = document.getElementById("renderArea").offsetWidth,
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    camera.aspect = sceneWidth / sceneHeight;
}



viewExtents = function(objecttosee) {
    //console.log("viewExtents. object.userData:", this.object.userData);
    console.log("controls:", controls);
    //wakeAnimate();

    // lets override the bounding box with a newly
    // generated one
    // get its bounding box
    if (objecttosee) {
      var helper = new THREE.BoundingBoxHelper(objecttosee, 0xff0000);
      helper.update();
    //if (this.bboxHelper)
    //    this.scene.remove(this.bboxHelper);
    bboxHelper = helper;

    // If you want a visible bounding box
    //this.scene.add(this.bboxHelper);
    console.log("helper bbox:", helper);

    var minx = helper.box.min.x;
    var miny = helper.box.min.y;
    var maxx = helper.box.max.x;
    var maxy = helper.box.max.y;
    var minz = helper.box.min.z;
    var maxz = helper.box.max.z;


    controls.reset();

    var lenx = maxx - minx;
    var leny = maxy - miny;
    var lenz = maxz - minz;
    var centerx = minx + (lenx / 2);
    var centery = miny + (leny / 2);
    var centerz = minz + (lenz / 2);


    console.log("lenx:", lenx, "leny:", leny, "lenz:", lenz);
    var maxlen = Math.max(lenx, leny, lenz);
    var dist = 2 * maxlen;
    // center camera on gcode objects center pos, but twice the maxlen
    controls.object.position.x = centerx;
    controls.object.position.y = centery;
    controls.object.position.z = centerz + dist;
    controls.target.x = centerx;
    controls.target.y = centery;
    controls.target.z = centerz;
    console.log("maxlen:", maxlen, "dist:", dist);
    var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
    console.log("new fov:", fov, " old fov:", controls.object.fov);
    if (isNaN(fov)) {
        console.log("giving up on viewing extents because fov could not be calculated");
        return;
    }
    controls.object.fov = fov;
    //this.controls.object.setRotationFromEuler(THREE.Euler(0.5,0.5,0.5));
    //this.controls.object.rotation.set(0.5,0.5,0.5,"XYZ");
    //this.controls.object.rotateX(2);
    //this.controls.object.rotateY(0.5);

    var L = dist;
    var camera = controls.object;
    var vector = controls.target.clone();
    var l = (new THREE.Vector3()).subVectors(camera.position, vector).length();
    var up = camera.up.clone();
    var quaternion = new THREE.Quaternion();

    // Zoom correction
    camera.translateZ(L - l);
    console.log("up:", up);
    up.y = 1;
    up.x = 0;
    up.z = 0;
    quaternion.setFromAxisAngle(up, 0);
    //camera.position.applyQuaternion(quaternion);
    up.y = 0;
    up.x = 1;
    up.z = 0;
    quaternion.setFromAxisAngle(up, 0);
    camera.position.applyQuaternion(quaternion);
    up.y = 0;
    up.x = 0;
    up.z = 1;
    quaternion.setFromAxisAngle(up, 0);
    //camera.position.applyQuaternion(quaternion);

    camera.lookAt(vector);

    //this.camera.rotateX(90);

    controls.object.updateProjectionMatrix();
    containerWidth = window.innerWidth;
    containerHeight = window.innerHeight;
    //this.controls.enabled = true;
    //this.scaleInView();
    //this.controls.rotateCamera(0.5);
    //this.controls.noRoll = true;
    //this.controls.noRotate = true;
  }
};

function colorobj(name) {
    var object = scene.getObjectByName(name, true);
    console.log(object)
        // for (i=0; i<dxfObject.children.length; i++) {
        //     dxfObject.children[i].material.color.setHex(0x000000);
        //     dxfObject.children[i].material.opacity = 0.3;
        // }
    object.material.color.setHex(0xFF0000);
    object.material.needsUpdate = true;
}


function makeSprite(scene, rendererType, vals) {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        metrics = null,
        textHeight = 100,
        textWidth = 0,
        actualFontSize = 10;
    var txt = vals.text;
    if (vals.size) actualFontSize = vals.size;

    context.font = "normal " + textHeight + "px Arial";
    metrics = context.measureText(txt);
    var textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = "normal " + textHeight + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    //context.fillStyle = "#ff0000";
    context.fillStyle = vals.color;

    context.fillText(txt, textWidth / 2, textHeight / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    var material = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        transparent: true,
        opacity: 0.6
    });
    material.transparent = true;
    //var textObject = new THREE.Sprite(material);
    var textObject = new THREE.Object3D();
    textObject.position.x = vals.x;
    textObject.position.y = vals.y;
    textObject.position.z = vals.z;
    var sprite = new THREE.Sprite(material);
    textObject.textHeight = actualFontSize;
    textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
    if (rendererType == "2d") {
        sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
    } else {
        sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
    }

    textObject.add(sprite);

    //scene.add(textObject);
    return textObject;
}


// Global Function to keep three fullscreen
$(window).on('resize', function() {
    //renderer.setSize(element.width(), element.height());

    sceneWidth = document.getElementById("renderArea").offsetWidth,
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    renderer.setSize(sceneWidth, sceneHeight)
    //renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    controls.reset();
    $('#viewReset').click();

});
