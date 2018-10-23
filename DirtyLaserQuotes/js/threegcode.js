/*

    AUTHOR:  John Lauer
    -- changes by AUTHOR: Peter van der Walt

*/

var inflateGrp;
var fileParentGroup;
var fileParentGroupOriginal;
var fileObjectOriginal;
var xpos, ypos, yposold, xposold, distance;
var linelength, width, height;


/**
 * Contains the actual rendered SVG file. This is where the action is.
 */
var fileGroup;
/**
 * Contains the original path from SVG file. This is like layer 1 of the rendering.
 */
var svgPath;
/**
 * Contains the inflated/deflated path. This is like layer 2 of the rendering. If no
 * inflate/deflate was asked for by user, this path is still generated but at 0 inflate.
 */
var fileInflatePath;

// stl
var i, il, y, yl, shape, lines, line;

$(document).ready(function() {
    $('#generatequote').on('click', function() {

        if (typeof(fileObject) == 'undefined') {
            console.log('No file loaded. do Choose File, first!')
        };


        var g;

        if (fileObject) {
            fileObject.updateMatrix();
        }
        scene.updateMatrixWorld();

        linelength = generateQuote(fileParentGroup);


        if (fileParentGroup) {
            var bbox2 = new THREE.Box3().setFromObject(fileParentGroup);
            console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) );
            width = (bbox2.max.x - bbox2.min.x);
            height = (bbox2.max.y - bbox2.min.y);
        };

        $('#quoteresult').html('Job cut length: ' + linelength.toFixed(1) + ' mm<p> Width: ' + width.toFixed(1) + ' mm<p>Height: ' + height.toFixed(1) + ' mm');



    });
});



var options = {};


function generateGcode(threeGroup, cutSpeed, laserPwr, rapidSpeed, laseron, laseroff) {

    var laserPwrVal = 0.0;
    console.log('inside generateGcodeCallback')
    console.log('Group', threeGroup);
    console.log('CutSpeed', cutSpeed);
    console.log('RapidSpeed', rapidSpeed);
    console.log('Laser Power %', laserPwr);
    var lasermultiply = $('#lasermultiply').val();
    console.log('Laser Multiplier', lasermultiply);

    if (lasermultiply <= 1) {
        var laserPwrVal = laserPwr / 100;
        laserPwrVal = parseFloat(laserPwrVal).toFixed(2);
    } else {
        var laserPwrVal = laserPwr * (lasermultiply / 100);
        laserPwrVal = laserPwrVal.toFixed(0);
    }
    console.log('Laser Power Value', laserPwrVal, ' type of ', typeof(laserPwrVal));

    //  options["pointsperpath"] = 1;
    //  options["holes"] = 0;
    //  options["cut"] = 'solid';
    //  options["dashPercent"] = 20;
    //  options["mode"] = 'laser';
    //  options["laseron"] = 'M3';
    //  options["millclearanceheight"] = 5.00;
    //  options["milldepthcut"] = 3.00;
    //  options["millfeedrateplunge"] = 200.00;
    //  options["feedrate"] = cutSpeed;

    var g = "";

    // get the THREE.Group() that is the txt3d
    var grp = threeGroup;
    var txtGrp = threeGroup;

    var that = this;
    var isLaserOn = false;
    var isAtClearanceHeight = false;
    var isFeedrateSpecifiedAlready = false;
    var isSeekrateSpecifiedAlready = false;
    var subj_paths = [];
    var subj_path2 = [];
    console.log(txtGrp);
    console.log(rapidSpeed)
    console.log(cutSpeed);

    txtGrp.traverse(function(child) {
        //console.log(child);
        if (child.type == "Line") {
            // let's create gcode for all points in line
            for (i = 0; i < child.geometry.vertices.length; i++) {

                var localPt = child.geometry.vertices[i];
                var worldPt = grp.localToWorld(localPt.clone());

                if (stl) {
                    var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2) + child.parent.position.x).toFixed(3);
                    var ypos = (parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2) + child.parent.position.y).toFixed(3);
                } else if (yflip == true && !inflateGrp) {
                    var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3);
                    var ypos = (-1 * parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3);
                } else {
                    var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3);
                    var ypos = (parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3);
                };

                if (i == 0) {
                    // first point in line where we start lasering/milling
                    // move to point

                    // if milling, we need to move to clearance height
                    // if (options.mode == "mill") {
                    //     if (!isAtClearanceHeight) {
                    //         g += "G0 Z" + options.millclearanceheight + "\n";
                    //     }
                    // }

                    // move to start point


                    // do normal feedrate move
                    var seekrate;
                    if (isSeekrateSpecifiedAlready) {
                        seekrate = "";
                    } else {
                        console.log('Rapid Speed: ', rapidSpeed);
                        if (rapidSpeed) {
                            seekrate = " F" + rapidSpeed;
                            isSeekrateSpecifiedAlready = true;
                        } else {
                            seekrate = "";
                        }

                    }
                    //console.log('World', worldPt);
                    //console.log('Local', localPt);
                    g += "G0" + seekrate;
                    g += " X" + xpos + " Y" + ypos + "\n";

                    //console.log( (parseFloat(worldPt.x.toFixed(3))) + (parseFloat(laserxmax)), ' ...')

                    //subj_paths.push(worldPt.x.toFixed(3) +',' + worldPt.y.toFixed(3));
                    // if milling move back to depth cut
                    // if (options.mode == "mill") {
                    //     var halfDistance = (options.millclearanceheight - options.milldepthcut) / 2;
                    //     g += "G0 Z" + (options.millclearanceheight - halfDistance).toFixed(3) + "\n";
                    //     g += "G1 F" + options.millfeedrateplunge +
                    //         " Z" + options.milldepthcut + "\n";
                    //     isAtClearanceHeight = false;
                    // }

                } else {

                    // we are in a non-first line so this is normal moving

                    // see if laser or milling
                    if (options.mode == "laser") {

                        // if the laser is not on, we need to turn it on
                        //if (firmware.indexOf('Grbl') == 0) {
                        if (!isLaserOn) {
                            if (laseron) {
                                g += laseron
                                g += '\n'
                            } else {
                                // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
                            };
                            isLaserOn = true;
                        }
                        // }
                    } else {
                        // this is milling. if we are not at depth cut
                        // we need to get there


                    }

                    // do normal feedrate move
                    var feedrate;
                    if (isFeedrateSpecifiedAlready) {

                    } else {
                        console.log('Cut Speed: ', cutSpeed);
                        if (cutSpeed) {
                            feedrate = " F" + cutSpeed;
                            isFeedrateSpecifiedAlready = true;
                        } else {
                            feedrate = "";
                        }

                    }
                    //console.log('World', worldPt);
                    //console.log('Local', localPt);
                    g += "G1" + feedrate;
                    g += " X" + xpos;
                    g += " Y" + ypos;
                    g += " S" + laserPwrVal + "\n";
                    var xpos = parseFloat(worldPt.x.toFixed(3));
                    var ypos = parseFloat(worldPt.y.toFixed(3));
                    subj_paths.push({
                        X: xpos,
                        Y: ypos
                    });


                }
            }

            // make feedrate have to get specified again on next line
            // if there is one
            isFeedrateSpecifiedAlready = false;

            // see if laser or milling
            if (options.mode == "laser") {
                // turn off laser at end of line
                isLaserOn = false;
                // if (firmware.indexOf('Grbl') == 0) {
                if (laseroff) {
                    g += laseroff
                    g += '\n'
                } else {
                    // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
                }
                //  }
            } else {
                // // milling. move back to clearance height
                // g += "G0 Z" + options.millclearanceheight + "\n";
                // isAtClearanceHeight = true;
            }
        }
    });

    console.log("generated gcode. length:", g.length);

    isGcodeInRegeneratingState = false;

    return g;

};














function generateQuote(threeGroup) {



    var g = "";
    var distance = 0;

    // get the THREE.Group() that is the txt3d
    var grp = threeGroup;
    var txtGrp = threeGroup;

    var that = this;
    // var isLaserOn = false;
    // var isAtClearanceHeight = false;
    // var isFeedrateSpecifiedAlready = false;
    // var isSeekrateSpecifiedAlready = false;
    // var subj_paths = [];
    // var subj_path2 = [];
    // console.log(txtGrp);
    // console.log(rapidSpeed)
    // console.log(cutSpeed);

    txtGrp.traverse(function(child) {
        //console.log(child);
        if (child.type == "Line") {
            // let's create gcode for all points in line
            for (i = 0; i < child.geometry.vertices.length; i++) {

                var localPt = child.geometry.vertices[i];
                var worldPt = grp.localToWorld(localPt.clone());

                // if (stl) {
                //     var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2) + child.parent.position.x).toFixed(3);
                //     var ypos = (parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2) + child.parent.position.y).toFixed(3);
                // } else if (yflip == true && !inflateGrp) {
                //     var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3);
                //     var ypos = (-1 * parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3);
                // } else {
                    var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3);
                    var ypos = (parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3);
                // };

                if (i == 0) {

                  if ( xposold && yposold) {
                    var a = xposold - xpos
                    var b = yposold - ypos
                    var c = Math.sqrt( a*a + b*b );
                  } else {
                    var a = 0 - xpos
                    var b = 0 - ypos
                    var c = Math.sqrt( a*a + b*b );

                  }

                  distance += c;
                    // first point in line where we start lasering/milling
                    // move to point

                    // if milling, we need to move to clearance height
                    // if (options.mode == "mill") {
                    //     if (!isAtClearanceHeight) {
                    //         g += "G0 Z" + options.millclearanceheight + "\n";
                    //     }
                    // }

                    // move to start point


                    // do normal feedrate move
                    // var seekrate;
                    // if (isSeekrateSpecifiedAlready) {
                    //     seekrate = "";
                    // } else {
                    //     console.log('Rapid Speed: ', rapidSpeed);
                    //     if (rapidSpeed) {
                    //         seekrate = " F" + rapidSpeed;
                    //         isSeekrateSpecifiedAlready = true;
                    //     } else {
                    //         seekrate = "";
                    //     }
                    //
                    // }
                    //console.log('World', worldPt);
                    //console.log('Local', localPt);
                    // g += "G0" + seekrate;
                    g += " X" + xpos + " Y" + ypos + "\n";

                    //console.log( (parseFloat(worldPt.x.toFixed(3))) + (parseFloat(laserxmax)), ' ...')

                    //subj_paths.push(worldPt.x.toFixed(3) +',' + worldPt.y.toFixed(3));
                    // if milling move back to depth cut
                    // if (options.mode == "mill") {
                    //     var halfDistance = (options.millclearanceheight - options.milldepthcut) / 2;
                    //     g += "G0 Z" + (options.millclearanceheight - halfDistance).toFixed(3) + "\n";
                    //     g += "G1 F" + options.millfeedrateplunge +
                    //         " Z" + options.milldepthcut + "\n";
                    //     isAtClearanceHeight = false;
                    // }

                } else {


                  var a = xposold - xpos
                  var b = yposold - ypos
                  var c = Math.sqrt( a*a + b*b );

                  distance += c;

                    // we are in a non-first line so this is normal moving

                    // see if laser or milling
                    // if (options.mode == "laser") {
                    //
                    //     // if the laser is not on, we need to turn it on
                    //     //if (firmware.indexOf('Grbl') == 0) {
                    //     if (!isLaserOn) {
                    //         if (laseron) {
                    //             g += laseron
                    //             g += '\n'
                    //         } else {
                    //             // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
                    //         };
                    //         isLaserOn = true;
                    //     }
                    //     // }
                    // } else {
                    //     // this is milling. if we are not at depth cut
                    //     // we need to get there
                    //
                    //
                    // }

                    // do normal feedrate move
                    // var feedrate;
                    // if (isFeedrateSpecifiedAlready) {
                    //
                    // } else {
                    //     console.log('Cut Speed: ', cutSpeed);
                    //     if (cutSpeed) {
                    //         feedrate = " F" + cutSpeed;
                    //         isFeedrateSpecifiedAlready = true;
                    //     } else {
                    //         feedrate = "";
                    //     }
                    //
                    // }
                    //console.log('World', worldPt);
                    //console.log('Local', localPt);
                    // g += "G1" + feedrate;
                    g += " X" + xpos;
                    g += " Y" + ypos;
                    // g += " S" + laserPwrVal + "\n";
                    // var xpos = parseFloat(worldPt.x.toFixed(3));
                    // var ypos = parseFloat(worldPt.y.toFixed(3));
                    // subj_paths.push({
                    //     X: xpos,
                    //     Y: ypos
                    // });


                }

                xposold = xpos;
                yposold = ypos;
            }

            // make feedrate have to get specified again on next line
            // if there is one
            // isFeedrateSpecifiedAlready = false;

            // see if laser or milling
            // if (options.mode == "laser") {
            //     // turn off laser at end of line
            //     isLaserOn = false;
            //     // if (firmware.indexOf('Grbl') == 0) {
            //     if (laseroff) {
            //         g += laseroff
            //         g += '\n'
            //     } else {
            //         // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
            //     }
            //     //  }
            // } else {
            //     // // milling. move back to clearance height
            //     // g += "G0 Z" + options.millclearanceheight + "\n";
            //     // isAtClearanceHeight = true;
            // }
        }
    });

    // console.log("generated gcode. length:", g.length);
    console.log("generated quote. cut length:", distance, 'mm');
    return distance;

};




















onInflateChange = function(evt) {
    console.log("onInflateChange. evt:");

    options["pointsperpath"] = 1;
    options["holes"] = 0;
    options["cut"] = 'solid';
    options["dashPercent"] = 20;
    options["mode"] = 'laser';
    options["laseron"] = 'M3';
    options["lasersvalue"] = 255;
    options["millclearanceheight"] = 5.00;
    options["milldepthcut"] = 3.00;
    options["millfeedrateplunge"] = 200.00;
    options["feedrate"] = 2000;
    options["inflate"] = parseFloat($('#inflateVal').val());

    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }

    if (options.inflate != 0) {
        console.log("user wants to inflate. val:", options.inflate);

        fileParentGroup.updateMatrix();

        var grp = fileObject;

        var clipperPaths = [];

        grp.traverse(function(child) {
            console.log('Traverse: ', child)

            if (child.name == "inflatedGroup") {
                console.log("this is the inflated path from a previous run. ignore.");
                return;
            } else if (child.type == "Line") {
                // let's inflate the path for this line. it may not be closed
                // so we need to check that.
                var clipperArr = [];
                // Fix world Coordinates
                for (i = 0; i < child.geometry.vertices.length; i++) {
                    var localPt = child.geometry.vertices[i];
                    var worldPt = scene.localToWorld(localPt.clone());
                    var xpos = (worldPt.x + child.position.x);
                    var ypos = (worldPt.y + child.position.y);
                    clipperArr.push({
                        X: xpos,
                        Y: ypos
                    });
                }
                clipperPaths.push(clipperArr);
                // Commented out - makes original dim
                //  child.material.color = 0x000000;
                //  child.material.transparent = true;
                //  child.material.opacity = 0.2;
            } else if (child.type == "Points") {
                child.visible = false;
            } else {
                console.log("type of ", child.type, " being skipped");
            }
        });

        console.log("clipperPaths:", clipperPaths);

        // simplify this set of paths which is a very powerful Clipper call that
        // figures out holes and path orientations
        var newClipperPaths = simplifyPolygons(clipperPaths);

        if (newClipperPaths.length < 1) {
            console.error("Clipper Simplification Failed!:");
            printLog('Clipper Simplification Failed!', errorcolor)
        }

        // get the inflated/deflated path
        var inflatedPaths = getInflatePath(newClipperPaths, options.inflate);

        inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, 0.01, 0, true, false, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name)
        inflateGrp.name = 'inflateGrp';

        var hScale = ($("#scaleFactor").val() / 100);
        console.log('Scaling to ', hScale);
        inflateGrp.scale.x = hScale;

        if (yflip == true) {
            inflateGrp.scale.y = -hScale;
            putInflateGrpAtZero()
        } else {
            inflateGrp.scale.y = hScale;
            putInflateGrpAtZero();
        }

        scene.add(inflateGrp);
    }
};

simplifyPolygons = function(paths) {
    console.log('Simplifying: ', paths)
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);

    var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
    console.log('Simplified: ', newClipperPaths)

    // scale back down
    ClipperLib.JS.ScaleDownPaths(newClipperPaths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return newClipperPaths;


};

getInflatePath = function(paths, delta, joinType) {
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var miterLimit = 2;
    var arcTolerance = 10;
    joinType = joinType ? joinType : ClipperLib.JoinType.jtRound
    var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
    co.AddPaths(paths, joinType, ClipperLib.EndType.etClosedPolygon);
    //var delta = 0.0625; // 1/16 inch endmill
    var offsetted_paths = new ClipperLib.Paths();
    co.Execute(offsetted_paths, delta * scale);

    // scale back down
    ClipperLib.JS.ScaleDownPaths(offsetted_paths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return offsetted_paths;

};

drawClipperPaths = function(paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name) {
    console.log("drawClipperPaths");


    var lineUnionMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
    });

    if (z === undefined || z == null)
        z = 0;

    if (zstep === undefined || zstep == null)
        zstep = 0;

    if (isClosed === undefined || isClosed == null)
        isClosed = true;

    var group = new THREE.Object3D();
    if (name) group.name = name;

    for (var i = 0; i < paths.length; i++) {
        var lineUnionGeo = new THREE.Geometry();
        for (var j = 0; j < paths[i].length; j++) {
            var actualZ = z;
            if (zstep != 0) actualZ += zstep * j;
            lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][j].X, paths[i][j].Y, actualZ));

            // does user want arrow helper to show direction
            if (isAddDirHelper) {
                /*
                var pt = { X: paths[i][j].X, Y: paths[i][j].Y, Z: actualZ };
                var ptNext;
                if (j + 1 >= paths[i].length)
                    ptNext = {X: paths[i][0].X, Y: paths[i][0].Y, Z: actualZ };
                else
                    ptNext = {X: paths[i][j+1].X, Y: paths[i][j+1].Y, Z: actualZ };
                // x2-x1,y2-y1
                var dir = new THREE.Vector3( ptNext.X - pt.X, ptNext.Y - pt.Y, ptNext.Z - pt.Z );
                var origin = new THREE.Vector3( pt.X, pt.Y, pt.Z );
                var length = 0.1;
                var hex = 0xff0000;

                var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
                group.add( arrowHelper );
                */
            }
        }
        // close it by connecting last point to 1st point
        if (isClosed) lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][0].X, paths[i][0].Y, z));


        var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
        if (name) lineUnion.name = name;

        //lineUnion.position.set(0,-20,0);
        group.add(lineUnion);
    }
    //this.sceneAdd(group);
    return group;
};
