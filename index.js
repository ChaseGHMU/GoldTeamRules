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

  socket.on('clicked', function(){
    socket.broadcast.emit('clicked');
  })
});
