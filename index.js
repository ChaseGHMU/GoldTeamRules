var express = require('express');
var socket = require('socket.io');

var app = express();
// var http = require('http').Server(app);
var server = app.listen(4000);
var io = socket(server);

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  io.emit('connected');

  socket.on('sendNickname', function(name){
    socket.nickname = name
    io.emit('user-connected', socket.nickname);
  });

  socket.on('disconnect',function(){
    io.emit('user-disconnect', socket.nickname);
  });

  socket.on('chat message', function(msg){
    msg = socket.nickname + ": " + msg;
    io.emit('chat message', msg);
  });
});
