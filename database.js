'use strict';

//var bb = require('bluebird');
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(':memory:');
db.run("CREATE TABLE Moves (PlayerType TEXT, xPos INTEGER, yPos INTEGER)");

var database = {
  checkWinner: function(move, callback) {
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
          var result = {
            text: 'User ' + move.type + ' are win!'
          };
          callback(null, result);
        }
      });

      /** Select signs in the nearest 10 cells by y coordinate in ASC order **/
      var yPosQuery = "SELECT yPos FROM Moves WHERE"
        + " PlayerType='" + move.type + "'"
        + " AND xPos = " + move.position.x
        + " AND yPos > " + (move.position.y - lengthCondition)
        + " AND yPos < " + (move.position.y + lengthCondition)
        + " ORDER BY yPos";

      tmp = move.position.y; // Hold current y position for comparison with the next captured position
      lineCounter = 1; // Counter for natural order signs (always starts from 1)

      db.each(yPosQuery, function(err, row) {
        // Check that current sign don't broke natural order
        if (row.yPos === tmp + 1)
          lineCounter++;
        else
          lineCounter = 1;

        tmp = row.yPos;

        // We found 5 signs in natural order! Win!
        if (lineCounter === 5) {
          var result = {
            text: 'User ' + move.type + ' are win!'
          };
          callback(null, result);
        }
      });

    });
  },

  clear: function (callback) {
    db.run("DELETE FROM Moves", callback);
    //db.close();
  }
};

module.exports = database;