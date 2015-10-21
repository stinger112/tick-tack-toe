'use strict';

var db = require('./database');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.use(express.static('public'));



var tickClient = null;
var tackClient = null;

app.ws('/channel', function(ws, req) {
  console.log('Connect new client');

  if (!tickClient) {
    tickClient = ws;

    tickClient.on('message', function(msg) {
      //console.log(msg);
      if (!tackClient) {
        tickClient.send(JSON.stringify({
          text: "The second client isn't connected",
          ready: false
        }));
        return console.error("The second client (tack client) isn't presented!");
      }

      var move = JSON.parse(msg);

      /** Block when we send tick/tack to the players **/
      move.type = 'tick';

      move.text = "Waiting for another player's turn...";
      move.ready = false;
      tickClient.send(JSON.stringify(move));

      move.text = 'Your turn!';
      move.ready = true;
      tackClient.send(JSON.stringify(move));

      // Then check winner's condition
      db.checkWinner(move, function (err, result) {
        db.clear();
        result.ready = false;

        tickClient.send(JSON.stringify(result));
        tackClient.send(JSON.stringify(result));
      });
    });


    tickClient.send(JSON.stringify({
      text: 'You are the tick!',
      get ready() {
        return (tickClient !== null) && (tackClient !== null)
      }
    }));

  } else {
    tackClient = ws;

    tackClient.on('message', function(msg) {
      if (!tickClient) {
        tackClient.send(JSON.stringify({
          text: "The second client isn't connected",
          ready: false
        }));
        return console.error("The first client (tick client) isn't presented!");
      }

      var move = JSON.parse(msg);

      /** Block when we send tick/tack to the players **/
      move.type = 'tack';

      move.text = "Waiting for another player's turn...";
      move.ready = false;
      tackClient.send(JSON.stringify(move));

      move.text = 'Your turn!';
      move.ready = true;
      tickClient.send(JSON.stringify(move));

      // Then check winner's condition
      db.checkWinner(move, function (err, result) {
        db.clear();
        result.ready = false;

        tickClient.send(JSON.stringify(result));
        tackClient.send(JSON.stringify(result));
      })

    });

    tackClient.send(JSON.stringify({
      text: 'You are the tack! Your turn!',
      get ready() {
        return (tickClient !== null) && (tackClient !== null)
      }
    }));
  }

  ws.once('close', function () {
    console.log('Player leave game. Game ended.');

    db.clear();

    if (ws === tickClient)
      tickClient = null;
    else
      tackClient = null;
  })
});

app.listen(3000);

console.log('Application starts on localhost:3000');