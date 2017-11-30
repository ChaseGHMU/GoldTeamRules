var path = require('path');
var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000);
var io = socket(server);

app.get('/', function(req,res){
  res.sendFile(__dirname + '/public/index.html');
});
var users = [];
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){

  console.log(io.engine.clientsCount);

  if(io.engine.clientsCount < 2){
    users.push(socket.id);
    io.emit('notEnoughUsers');
    console.log("Not Enough Users.")
    console.log(socket.id);
  }else if (io.engine.clientsCount > 2){
    socket.disconnect();
  }else{
    users.push(socket.id);
    io.to(users[0]).emit('isActive', true);
    io.to(users[1]).emit('isActive', false);
    io.emit('startRound', users);
    console.log(users);
  }

  socket.on('guessed', function(guess){
    socket.broadcast.emit('returnGuess', guess)
  });

  socket.on('disconnect', function(){
    var index = users.indexOf(socket.id);
    users.splice(index,1);
    console.log(io.engine.clientsCount);
    console.log(users);
  })

  socket.on('toggle', function(){
    socket.broadcast.emit('yourTurn');
  })

  socket.on('bumpRound', function(number){
    io.emit('bumpRound', number);
  })
  socket.on('answerSheet', function(answers){
    socket.broadcast.emit('returnedAnswers', answers);
  })
  socket.on('codeWordSent', function(word){
    socket.broadcast.emit('codeWordReturned', word);
  });
});
