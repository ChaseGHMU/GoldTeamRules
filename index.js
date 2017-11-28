var path = require('path');
var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000);
var io = socket(server);

app.get('/', function(req,res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  socket.on('clicked', function(){
    console.log("howdy");
    socket.broadcast.emit('clicked');
  });

  socket.on('guessed', function(guess){
    socket.broadcast.emit('returnGuess', guess)
  });

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
