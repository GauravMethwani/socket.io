// sharestate.js
let io;

function setIo(socketIo) {
  io = socketIo;
}

function initIo(server) {
  io = require('socket.io')(server);
}

function getIo() {
  return io;
}

module.exports = {
  initIo,
  setIo,
  getIo
};
