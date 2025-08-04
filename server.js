import { createServer } from "http";
import next from "next";
import { setIO } from "./src/lib/socket.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  setIO(server);

  server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
  });
});
