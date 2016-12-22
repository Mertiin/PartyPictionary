var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});
app.get('/server', function (req, res) {
    res.sendFile('server.html', { root: __dirname });
});

var imgData = "";

io.on('connection', function (socket) {
    console.log('connected');
    socket.on('disconnect', function () {
        console.log('disconnected');
    });

    socket.on('mousemove', function (data) {
        console.log('mousemove');
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });
    socket.on('reset', function (data) {
        console.log('reset');
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('reset', data);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
