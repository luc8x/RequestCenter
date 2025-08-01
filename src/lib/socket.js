let io;

function setIO(serverInstance) {
  const { Server } = require("socket.io");

  if (global.__io) {
    io = global.__io;
    return io;
  }

  io = new Server(serverInstance, {
    path: "/api/socket_io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Novo cliente conectado");

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
    });
  });

  global.__io = io;
  return io;
}

function getIO() {
  if (global.__io) return global.__io;
  throw new Error("Socket.IO não foi inicializado.");
}

module.exports = { setIO, getIO };