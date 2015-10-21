'use strict';

/**
 * jQuery like selection object based on Vanilla.
 * @param selector Any CSS selector appropriated by Vanilla
 * @returns {Element}
 */
var $ = function (selector) {
  return document.querySelector(selector)
};

/**
 * Calculate grid coordinates from real mouse position
 * @param x Real mouse click x position
 * @param y Real mouse click y position
 * @returns {{x: (number|*), y: (number|*)}}
 */
function approximatePosition(x, y) {
  x = x / 25;
  y = y / 25;

  //console.log('Real X is', x, 'Real Y is', y);
  x = Math.round(x);
  y = Math.round(y);

  //console.log('Natural X is', x, 'Natural Y is', y);

  return {x: x, y: y}
}

/**
 * Create <div> cell by tick/tack type for grid coordinates.
 * @param x Natural coordinate x
 * @param y Natural coordinate y
 * @param type
 */
function createCell(x, y, type) {
  //TODO: Check parameters
  var cell = document.createElement('div');

  cell.className = type;

  cell.style.top = (y * 25 - 12.5) + 'px';
  cell.style.left = (x * 25 - 12.5) + 'px';

  $('div#content').appendChild(cell);
}

/**
 * Make your move on the server.
 * @param position Get an {x, y} position with natural coordinates
 * @returns {{position: *}}
 */
function setMove(position) {
  var move = {
    position: position
  };

  channel.send(JSON.stringify(move));

  return move;
}

/**
 * Main entry
 */
document.addEventListener("DOMContentLoaded", function() {

  window.channel = new WebSocket("ws://localhost:3000/channel");

  channel.onmessage = function (message) {
    var data = JSON.parse(message.data);

    //console.log(data);

    $('span#message').textContent = data.text;

    $('div#content').className = data.ready ? '' : 'disabled';

    if (data.position && data.type)
      createCell(data.position.x, data.position.y, data.type);
  };

  $('div#content').addEventListener('click', function (e) {
    e.stopPropagation();

    // Events not working on filled cells
    if (e.target.className === 'tick' || e.target.className === 'tack')
      return false;

    //console.log('Click inside div', e);

    var position = approximatePosition(e.layerX, e.layerY);

    setMove(position);
  });
});
