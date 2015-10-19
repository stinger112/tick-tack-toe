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

function createCell(x, y) {
  var cell = document.createElement('div');

  cell.className = 'tick';

  cell.style.top = (y * 25 - 12.5) + 'px';
  cell.style.left = (x * 25 - 12.5) + 'px';

  $('div#content').appendChild(cell);
}

function checkWinner(tick) {

}

function setTick(position) {
  var tick = {
    type: 'tick',
    position: position
    //get style() {
    //  return 'left: ' + 0 + 'px, top: ' + 0 + 'px';
    //}
  };

  fieldsArray.push(tick);

  //TODO: Check success

  checkWinner(tick);

  //TODO: Отправить tick или win сопернику
  return tick;
}

document.addEventListener("DOMContentLoaded", function() {
  console.log('Div founded', document.querySelector('div#content'));

  $('div#content').addEventListener('click', function (e) {
    e.stopPropagation();

    if (e.target.className === 'tick' || e.target.className === 'tack')
      return false;

    console.log('Click inside div', e);

    var position = approximatePosition(e.layerX, e.layerY);

    setTick(position);

    createCell(position.x, position.y);
  });
});
