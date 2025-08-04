import { Server as IOServer } from "socket.io";

let io = null;

export function setIO(server) {
  if (globalThis.__io) {
    io = globalThis.__io;
    return io;
  }

  io = new IOServer(server, {
    path: "/api/socket_io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Novo cliente conectado");

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Cliente desconectado");
    });
  });

  globalThis.__io = io;
  return io;
}

export function getIO() {
  if (!globalThis.__io) {
    throw new Error("Socket.IO não foi inicializado.");
  }
  return globalThis.__io;
}
