/*
*
* Connection IDs with messages & state
*/

var sockjs = require('sockjs');
var util = require('util');

// 1. Echo sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var connections = {};

function socket(server) {
  var sockjs_socket = sockjs.createServer(sockjs_opts);
  sockjs_socket.on('connection', listener);
  sockjs_socket.installHandlers(server, {prefix:'/echo'});
  function tick() {
    var tickDelay = 1000;
    //var messages = world.tick();
    //broadcast_all(messages);
    setTimeout(tick, tickDelay);
  }
  tick();
}

function listener(conn) {
  console.log('    [+] open %s', conn.id);
  connections[conn.id] = conn;

  function tick() {
    // tick for individual connection
    var tickDelay = 4000; // 4 seconds
    //conn.write(makeGridMessage());
    setTimeout(tick, tickDelay);
  }

  tick();

  conn.write(util.format('WELCOME YOU %s', conn.id));
  broadcast_all('NEW PLAYER ENTERED: ' + conn.id);

  var readMessage = function(message) {
    if (!message || message.length <= 0) return; // skip

    console.log(message);

    broadcast(conn.id + ' PRESSED: ' + message);
  }

  var closeConnection = function() {
    delete connections[conn.id];
    console.log('    [-] closed %s', conn.id);
  }

  function broadcast(message) {
    for (var id in connections) {
      if (id !== conn.id) {
        connections[id].write(message);
      }
    }
  }

  conn.on('data', readMessage);
  conn.on('close', closeConnection)
}

function broadcast_all(message) {
  var messages = message;
  if (!Array.isArray(message)) {
    messages = [message];
  }
  for (var i = 0; i < messages.length; i++) {
    for (var id in connections) {
      connections[id].write(messages[i]);
    }
  }
}

module.exports = socket;
