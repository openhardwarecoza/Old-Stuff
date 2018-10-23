var msgcolor = '#000000';
var successcolor = '#00aa00';
var errorcolor = '#cc0000';
var warncolor = '#ff6600';

function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        printLog('Going Fullscreen', successcolor, "fullscreen");
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        printLog('Exiting Fullscreen', successcolor, "fullscreen");
    }
}

function printLog(text, color, logclass) {
	if (text.isString) {
      text = text.replace(/\n/g, "<br />");
	}
    if ($('#console p').length > 300) {
        // remove oldest if already at 300 lines
        $('#console p').first().remove();
    }
    var template = '<p class="pf" style="color: ' + color + ';">';
    if (logclass) {
        if (logclass == "settings") {
            template += '<i class="fa fa-cogs fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "file") {
            template += '<i class="fa fa-file-text-o fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "google") {
            template += '<i class="fa fa-google fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "jog") {
            template += '<i class="fa fa-arrows fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "macro") {
            template += '<i class="fa fa-th-large fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "fullscreen") {
            template += '<i class="fa fa-fullscreen fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "raster") {
            template += '<i class="fa fa-file-image-o fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "usb") {
            template += '<i class="fa fa-usb fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "wifi") {
            template += '<i class="fa fa-wifi fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "viewer") {
            template += '<i class="fa fa-search fa-fw" aria-hidden="true"></i>: ';
        }
        if (logclass == "git") {
            template += '<i class="fa fa-github fa-fw" aria-hidden="true"></i>: ';
        }
    }
    template += text;
    $('#console').append(template);
    $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
}
