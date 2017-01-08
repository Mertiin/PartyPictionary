function rndSmallGuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4();
}

//var id = guid();
var id = rndSmallGuid();
console.log(id);
var socket = io();
socket.emit('createServer', id);


var ctx, color = "#000";
var clients = {};
var lastDraw = $.now();

$(document).ready(function () {
    // setup a new canvas for drawing wait for device init
    setTimeout(function () {
        newCanvas();
    }, 1000);
    setInterval(function () {
        for (ident in clients) {
            if ($.now() - clients[ident].updated > 10000) {

                // Last update was more than 10 seconds ago.
                // This user has probably closed the page

                delete clients[ident];
            }
        }
    }, 10000);
});

socket.on('connected', function (data) {
    console.log("connected: " + data.id);
    console.log(data);
    $("#userList").empty();
    for (var key in data.users) {
        if (data.users.hasOwnProperty(key)) {
            var user = data.users[key];
            $("#userList").append("<li>" + user.name + "</li>");
        }
    }
});

socket.on('moving', function (data) {
    console.log('moving re');
    // Is the user drawing?
    if (data.drawing && clients[data.id]) {

        // Draw a line on the canvas. clients[data.id] holds
        // the previous position of this user's mouse pointer
        if (data.color != color)
            changeColor(data.color);
        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
    }

    // Saving the current client state
    clients[data.id] = data;
    clients[data.id].updated = $.now();
});

socket.on('reset', function () {
    newCanvas();
});

function changeColor(clr) {
    color = clr;
    ctx.beginPath();
    ctx.strokeStyle = clr;
}

function drawLine(fromx, fromy, tox, toy) {
    console.log($.now() - lastDraw);
    if ($.now() - lastDraw > 100) {
        fromx = tox;
        fromy = toy;
    }
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    lastDraw = $.now();
}

function newCanvas() {
    //define and resize canvas
    $("#content").height($(window).height() - 90);
    var canvas = '<canvas id="canvas" width="750px" height="750px"></canvas>';
    $("#content").html(canvas);

    // setup canvas
    ctx = document.getElementById("canvas").getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;

    // setup to trigger drawing on mouse or touch
}