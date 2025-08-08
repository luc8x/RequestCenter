import { Server as IOServer } from "socket.io";

let io = null;

export function setIO(server) {
  if (globalThis.__io) {
    io = globalThis.__io;
    return io;
  }

  // io = new IOServer(server, {
  //   path: "/api/socket_io",
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //   },
  // });

  io = new IOServer(server, {
    cors: { origin: "http://localhost:3000" },
    path: "/api/socket_io"
  });

  io.on("connection", (socket) => {
    console.log("WebSocket - Novo cliente conectado!", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("solicitacoes", () => {
      socket.join("solicitacoes");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket - Cliente desconectado", socket.id);
    });
  });

  globalThis.__io = io;
  return io;
}

export function getIO() {
  if (!globalThis.__io) {
    throw new Error("WebSocket - não foi inicializado.");
  }
  return globalThis.__io;
}
