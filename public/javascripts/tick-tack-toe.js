'use strict';

var $ = function (selector) {
  return document.querySelector(selector)
};

var fieldsArray = [];
var xFields = [];
//var yFields = [];

function approximatePosition(x, y) {
  x = x / 25;
  y = y / 25;

  console.log('Real X is', x, 'Real Y is', y);
  x = Math.round(x);
  y = Math.round(y);

  console.log('Natural X is', x, 'Natural Y is', y);

  return {x: x, y: y}
}

function createCell(x, y, type) {
  //TODO: Check parameters
  var cell = document.createElement('div');

  cell.className = type;

  cell.style.top = (y * 25 - 12.5) + 'px';
  cell.style.left = (x * 25 - 12.5) + 'px';

  $('div#content').appendChild(cell);
}

function checkWinner(tick) {

}

function setMove(position) {
  var tick = {
    position: position
  };

  fieldsArray.push(tick);

  //TODO: Check success

  checkWinner(tick);

  //TODO: Отправить tick или win сопернику
  channel.send(JSON.stringify(tick));

  return tick;
}

document.addEventListener("DOMContentLoaded", function() {

  window.channel = new WebSocket("ws://localhost:3000/channel");

  channel.onmessage = function (message) {
    console.log(message);

    var data = JSON.parse(message.data || '{}');

    console.log(data);

    //if (data.status = 'ready')

    if (data.position && data.type)
      createCell(data.position.x, data.position.y, data.type);
  };

  $('div#content').addEventListener('click', function (e) {
    e.stopPropagation();

    if (e.target.className === 'tick' || e.target.className === 'tack')
      return false;

    console.log('Click inside div', e);

    var position = approximatePosition(e.layerX, e.layerY);

    setMove(position);
  });
});
