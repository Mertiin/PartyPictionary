var serverId = getParameterByName("id");

var socket = io();
socket.emit("join", serverId);
var ctx, color = "#000";
var lastData = "";
var lastEmit = null;
var id = Math.round($.now() * Math.random());
var drawing = false;

$(document).ready(function () {
    // setup a new canvas for drawing wait for device init
    setTimeout(function () {
        newCanvas();
    }, 1000);

    $(".colorList li").click(function () {
        changeColor($(this).css("background-color"));
    });
});

socket.on("serverInfo", function(data) {
    if (data.code === -1) {
        alert(data.message);
        window.location = "/";
    }
});


function emitMove(x, y) {
    if ($.now() - lastEmit > 10) {
        socket.emit('mousemove',
        {
            'x': x,
            'y': y,
            'id': id,
            'drawing': drawing,
            'color': color
        });
        lastEmit = $.now();
    }
}
function reset(x, y) {
    newCanvas();
    socket.emit('reset', true);
}

function changeColor(clr) {
    color = clr;
    ctx.beginPath();
    ctx.strokeStyle = clr;
}

function newCanvas() {
    //define and resize canvas
    var canvas = '<canvas id="canvas" width="750px" height="750px"></canvas>';
    $("#content").html(canvas);

    // setup canvas
    ctx = document.getElementById("canvas").getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;

    // setup to trigger drawing on mouse or touch
    $("#canvas").drawTouch();
    $("#canvas").drawPointer();
    $("#canvas").drawMouse();
}

// prototype to	start drawing on touch using canvas moveTo and lineTo
$.fn.drawTouch = function () {
    var start = function (e) {
        var off = $("#canvas").offset();
        e = e.originalEvent;
        ctx.beginPath();
        x = e.changedTouches[0].pageX - off.left;
        y = e.changedTouches[0].pageY - off.top;
        ctx.moveTo(x, y);
    };
    var move = function (e) {
        var off = $("#canvas").offset();
        e.preventDefault();
        e = e.originalEvent;
        x = e.changedTouches[0].pageX - off.left;
        y = e.changedTouches[0].pageY - off.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        drawing = true;
        emitMove(x, y);
        drawing = false;
    };
    var stop = function () {
        drawing = false;
    }
    $(this).on("touchstart", start);
    $(this).on("touchmove", move);
    $(this).on("touchend", stop);

};

// prototype to	start drawing on pointer(microsoft ie) using canvas moveTo and lineTo
$.fn.drawPointer = function () {
    var start = function (e) {
        var off = $("#canvas").offset();
        e = e.originalEvent;
        ctx.beginPath();
        x = e.pageX - off.left;
        y = e.pageY - off.top;
        ctx.moveTo(x, y);
    };
    var move = function (e) {
        var off = $("#canvas").offset();
        e.preventDefault();
        e = e.originalEvent;
        x = e.pageX - off.left;
        y = e.pageY - off.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        drawing = true;
        emitMove(x, y);
    };
    var stop = function () {
        drawing = false;
    }
    $(this).on("MSPointerDown", start);
    $(this).on("MSPointerMove", move);
    $(this).on("MSPointerUpp", stop);
};
// prototype to	start drawing on mouse using canvas moveTo and lineTo
$.fn.drawMouse = function () {
    var clicked = 0;
    var start = function (e) {
        var off = $("#canvas").offset();
        clicked = 1;
        ctx.beginPath();
        x = e.pageX - off.left;
        y = e.pageY - off.top;
        ctx.moveTo(x, y);
    };
    var move = function (e) {
        var off = $("#canvas").offset();
        x = e.pageX - off.left;
        y = e.pageY - off.top;
        if (clicked) {
            ctx.lineTo(x, y);
            ctx.stroke();
            drawing = true;
        }
        emitMove(x, y);
    };
    var stop = function (e) {
        drawing = false;
        clicked = 0;
    };
    $(this).on("mousedown", start);
    $(this).on("mousemove", move);
    $(window).on("mouseup", stop);
};

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}