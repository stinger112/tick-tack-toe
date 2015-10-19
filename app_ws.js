'use strict';

var bb = require('bluebird');

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(':memory:');
db.run("CREATE TABLE Moves (PlayerType TEXT, xPos INTEGER, yPos INTEGER)");

function checkWinner(move, callback) {
  var lengthCondition = 5; // Condition for win

  db.serialize(function() {
    var parameters = [move.type, move.position.x, move.position.y];
    db.run("INSERT INTO Moves VALUES(?, ?, ?)", parameters);

    /** Select signs in the nearest 10 cells by x coordinate in ASC order **/
    var xPosQuery = "SELECT xPos FROM Moves WHERE"
                                      + " PlayerType='" + move.type + "'"
                                      + " AND yPos = " + move.position.y
                                      + " AND xPos > " + (move.position.x - lengthCondition)
                                      + " AND xPos < " + (move.position.x + lengthCondition)
                                    + " ORDER BY xPos";

    var tmp = move.position.x; // Hold current x position for comparison with the next captured position
    var lineCounter = 1; // Counter for natural order signs (always starts from 1)

    db.each(xPosQuery, function(err, row) {
      //console.log(row.xPos);

      // Check that current sign don't broke natural order
      if (row.xPos === tmp + 1)
        lineCounter++;
      else
        lineCounter = 1;

      tmp = row.xPos;

      // We found 5 signs in natural order! Win!
      if (lineCounter === 5) {
        callback();
        return false;
      }
    });

    ///** Select signs in the nearest 10 cells by y coordinate in ASC order **/
    //var yPosQuery = "SELECT xPos FROM Moves WHERE"
    //                                      + " PlayerType='" + move.type + "'"
    //                                      + " AND xPos = " + move.position.x
    //                                      + " AND yPos > " + (move.position.y - lengthCondition)
    //                                      + " AND yPos < " + (move.position.y + lengthCondition)
    //                                    + " ORDER BY yPos";
    //
    //var tmp = move.position.y; // Hold current y position for comparison with the next captured position
    //var lineCounter = 1; // Counter for natural order signs (always starts from 1)
    //
    //db.each(yPosQuery, function(err, row) {
    //  // Check that current sign don't broke natural order
    //  if (row.yPos === tmp + 1)
    //    lineCounter++;
    //  else
    //    lineCounter = 1;
    //
    //  tmp = row.yPos;
    //
    //  // We found 5 signs in natural order! Win!
    //  if (lineCounter === 5) {
    //    console.log('WIN WIN WIN!');
    //    return false;
    //  }
    //});

  });
}


//db.run = bb.promisify(db.run);
//db.all = bb.promisify(db.all);
//
//
//db.run("CREATE TABLE Moves (PlayerType TEXT, xPos INTEGER, yPos INTEGER)")
//  .then(function () {
//    return db.run("INSERT INTO Moves VALUES('tick', 2, 3)")
//  })
//  .then(function () {
//    return db.run("INSERT INTO Moves VALUES('tick', 1, 5)")
//  })
//  .then(function () {
//    return db.all("SELECT xPos FROM Moves WHERE xPos < 5")
//  })
//  .then(function (rows) {
//    console.log(rows)
//  })
//  .then(function () {
//    db.close();
//  })
//  .catch(function (error) {
//    console.log(error)
//  });












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

      checkWinner(move, function () {
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

      checkWinner(move, function () {
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
  })
});

app.listen(3000);