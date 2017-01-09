var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var imgData = "";
var servers = {};
var users = {};


app.use(express.static(__dirname));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/client', function (req, res) {
    res.sendFile('client.html', { root: __dirname });
});

app.get('/server', function (req, res) {
    res.sendFile('server.html', { root: __dirname });
});

app.get('/server/start', function (req, res) {
    var id = req.query.id;

    servers[id].isStarted = true;
    console.log(servers[id]);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(true));
});

app.get('/servers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(servers));
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});



io.on('connection', function (socket) {
    var userId = socket.id;
    users[userId] = {};
    console.log('connected ' + userId);
    socket.on('disconnect', function () {
        var user = users[userId];

        if (user.isServer === true) {
            delete servers[user.server];
            socket.broadcast.to(user.server).emit("serverInfo", { code: -1, message: "Disconnected!" });
        } else if (user.server !== undefined) {
            if (servers.hasOwnProperty(user.server)) {
                var server = servers[user.server];
                delete server.users[userId];
                io.sockets.connected[server.server].emit('connected', { users: server.users, user: user });
            }
        }

        console.log('disconnected ' + userId);
        delete users[userId];
    });

    socket.on('mousemove', function (data) {
        var user = users[userId];
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.s
        socket.broadcast.to(user.server).emit('moving', data);
    });

    socket.on('reset', function (data) {
        var user = users[userId];
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.to(user.server).emit('reset', data);
    });

    socket.on("join", function (data) {
        if (servers.hasOwnProperty(data)) {
            socket.join(data);
            servers[data].users[userId] = {
                id: userId,
                name: userId,
                isDrawing: false
            };
            users[userId].server = data;

            if (io.sockets.connected[servers[data].server]) {
                io.sockets.connected[servers[data].server].emit('connected', { users: servers[data].users, user: servers[data].users[userId] });
            }

            console.log("connected: " + data);
            socket.emit("serverInfo",
            {
                code: 0,
                message: "Connected",
                data:
                {
                    user: servers[data].users[userId],
                    users: servers[data].users
                }
            });
        } else {
            console.log("No: " + data);
            socket.emit("serverInfo", { code: -1, message: "Failed to join server" });
        }
    });


    socket.on("createServer", function (data) {
        socket.join(data.toString());
        if (!servers.hasOwnProperty(data)) {
            users[userId].isServer = true;
            users[userId].server = data;

            servers[data] = {
                server: userId,
                users: {},
                isStarted: false
            };
            console.log("server started: " + data.toString());
        }
    });

    socket.on("newRound", function (data) {
        var server = servers[data.id];
        var user;
        for (var key in server.users) {
            user = server.users[key];
            user.isDrawing = false;
        }

        user = server.users[data.userId];
        user.isDrawing = true;

        socket.broadcast.to(data.id).emit("newRound", true);

        if (io.sockets.connected[data.userId]) {
            io.sockets.connected[data.userId].emit('selected', { word: data.word });
        }
    });
});

