import { createServer } from "net";
const PORT = 4321;

const server = createServer();
server.on("connection", (conn) => {
  console.log("client connected");
  setTimeout(() => {
    conn.end();
  }, 30000);
});

server.listen(PORT, (v) => {
});
