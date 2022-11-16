import { createServer } from "net";
import { connect } from "nats";

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

await connect({
  port: PORT,
  debug: true,
  maxReconnectAttempts: 10,
  timeout: 1000,
});
