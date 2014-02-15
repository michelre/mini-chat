var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var users = [];

app.use(express.static('../client'));

server.listen("6061");

app.get("/", function (req, res) {
    res.sendfile('client/index.html');
});

io.sockets.on('connection', function (socket) {

    socket.emit("connect", {"users": users});

    socket.emit("formData", {"state":"disconnected"});

    socket.on("connectionUser", function (data) {
        socket.set('user', data.username, function () {
           io.sockets.emit("newUser", {"username":data.username});
           socket.emit("formData", {"state":"connected"});
        });
        users.push(data.username);
    });

    socket.on("logoff", function () {
        socket.get("user", function (err, username) {
            var index = users.indexOf(username);
            users.splice(index, 1);
            socket.emit("formData", {"state":"disconnected"});
            io.sockets.emit("userDisconnect", {"username":username});
        });
    });

    socket.on("disconnect", function(){
        socket.get("user", function (err, username) {
            var index = users.indexOf(username);
            users.splice(index, 1);
            socket.emit("formData", {"state":"disconnected"});
            io.sockets.emit("userDisconnect", {"username":username});
        });
    });

    socket.on("message", function(data){
        socket.get("user", function (err, username) {
            io.sockets.emit("newMsg", {"message":data.content, "username":username});
        });
    })

});