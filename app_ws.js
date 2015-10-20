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

      move.type = 'tick';

      move.text = 'Waiting for another player...';
      move.ready = false;
      tickClient.send(JSON.stringify(move));

      move.text = 'Your turn!';
      move.ready = true;
      tackClient.send(JSON.stringify(move));

      db.checkWinner(move, function (err, result) {
        result.ready = false;

        tickClient.send(JSON.stringify(result));
        tackClient.send(JSON.stringify(result));
        //console.log('WIN WIN WIN!');
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

      move.type = 'tack';

      move.text = 'Waiting for another player...';
      move.ready = false;
      tackClient.send(JSON.stringify(move));

      move.text = 'Your turn!';
      move.ready = true;
      tickClient.send(JSON.stringify(move));

      db.checkWinner(move, function (err, result) {
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

    //var readyMessage = {
    //  text: 'Players is ready!',
    //  ready: true
    //};
    //
    //tickClient.send(JSON.stringify(readyMessage));
    //tackClient.send(JSON.stringify(readyMessage));
  }

  ws.once('close', function () {
    console.log('Player leave game. Game ended.');

    tickClient = null;
    tackClient = null;

    //db.clear();
  })
});

app.listen(3000);