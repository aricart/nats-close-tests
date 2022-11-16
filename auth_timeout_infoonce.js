import { createServer } from "net";
import { connect } from "nats";

const PORT = 4432;

let INFO = Buffer.from(
  `INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":${PORT},"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}\r\n`,
);

const PING = { re: /^PING\r\n/i, out: "PONG\r\n" };
const CONNECT = { re: /^CONNECT\s+([^\r\n]+)\r\n/i, out: "" };
const CMDS = [PING, CONNECT];

const server = createServer();
server.on("connection", (conn) => {
  console.log("client connected");
  if (INFO) {
    conn.write(INFO);
    INFO = null;
    let inbound;
    conn.on("data", (data) => {
      if (inbound) {
        inbound = Buffer.concat([inbound, data]);
      } else {
        inbound = data;
      }
      while (data.length > 0) {
        let m = null;
        for (let i = 0; i < CMDS.length; i++) {
          m = CMDS[i].re.exec(inbound);
          if (m) {
            const len = m[0].length;
            if (len <= inbound.length) {
              inbound = inbound.slice(len);
              conn.write(Buffer.from(CMDS[i].out));
              break;
            }
          }
        }
        if (m === null) {
          break;
        }
      }
    });
  }
  setTimeout(() => {
    conn.end();
  }, 5000);
});

server.listen(PORT, (v) => {
});

const nc = await connect({
  port: PORT,
  debug: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 500,
  timeout: 1000,
});

(async () => {
  for await (const s of nc.status()) {
    console.log(s);
  }
})();

nc.closed().then((err) => {
  console.log(`client closed with: ${err?.message}`);
  server.close();
});
