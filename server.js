const { createServer } = require("http");
const next = require("next");
const { setIO } = require("./src/lib/socket");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  setIO(server);

  server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  });
});