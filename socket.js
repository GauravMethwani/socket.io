// initSocket.js
const socketIo = require('socket.io');

function initSocket(server) {
  return socketIo(server);
}

module.exports = initSocket;



