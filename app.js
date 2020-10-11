//hello there
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req,res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(8000);
console.log('Server started.');

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id){
  var self = {
    x:250,
    y:250,
    id:id,
    number:"" + Math.floor(10*Math.random()),
    presstingLeft:false,
    pressingDown: false,
    pressingRight: false,
    pressingUp: false,
    maxSpd:10
  }
  return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection',function(socket){
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  var player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });

  socket.on('keyPress',function(data){
    if(data.inputId === 'left')
      player.pressingLeft = data.state;
    else if(data.inputId === 'right')
      player.pressingRight = data.state;
    else if(data.inputId === 'down')
      player.pressingDown = data.state;
    else if(data.inputId === 'up')
      player.pressingUp = data.state;
  });
});

setInterval(function (){
  var pack = [];
  for(var i in PLAYER_LIST){
    var player = PLAYER_LIST[i];
    //player.x++;
    //player.y++;
    pack.push({
      x:player.x,
      y:player.y,
      number:player.number
    });
  }
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions',pack);
  }
},1000/25);
