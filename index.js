var path = require('path');
var express = require('express');
var socket = require('socket.io');

var app = express();
// var http = require('http').Server(app);
var server = app.listen(4000);
var io = socket(server);

app.get('/', function(req,res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  io.emit('connected');
  socket.on('clicked', function(){
    socket.broadcast.emit('clicked');
  })
});
