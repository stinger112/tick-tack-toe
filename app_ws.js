'use strict';

var db = require('./database');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.use(express.static('public'));

var tickClient = null;
var tackClient = null;

app.ws('/channel', function(ws, req) {
  console.log('Connect new client')

  if (!tickClient) {
    tickClient = ws;

    tickClient.on('message', function(msg) {
      if (!tackClient)
        return console.error("The second client (tack client) isn\'t presented!");

      var move = JSON.parse(msg);

      move.type = 'tick';

      tickClient.send(JSON.stringify(move));
      tackClient.send(JSON.stringify(move));

      db.checkWinner(move, function () {
        console.log('WIN WIN WIN!');
      });
    });

    tickClient.send(JSON.stringify({
      text: 'Hello, first user! You are the tick!',
      get state() {
        return tackClient !== null
      }
    }));
  } else {
    tackClient = ws;

    tackClient.on('message', function(msg) {
      if (!tickClient)
        return console.error("The first client (tick client) isn't presented!");

      var move = JSON.parse(msg);

      move.type = 'tack';

      tickClient.send(JSON.stringify(move));
      tackClient.send(JSON.stringify(move));

      db.checkWinner(move, function () {
        console.log('WIN WIN WIN!');
      });
    });

    tackClient.send(JSON.stringify({
      text: 'Hello, second user! You are the tack!',
      get state() {
        return tickClient !== null
      }
    }));
  }

  ws.once('close', function () {
    console.log('Player leave game. Game ended.');

    tickClient = null;
    tackClient = null;

    //db.clear();
  })
});

app.listen(3000);