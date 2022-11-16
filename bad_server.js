import { createServer } from "net";
const PORT = 4321;
const buf = Buffer.from(
  `INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":${PORT},"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}\r\n`,
);

const PING = { re: /^PING\r\n/i, out: "PONG\r\n" };
const CONNECT = { re: /^CONNECT\s+([^\r\n]+)\r\n/i, out: "" };
const CMDS = [PING, CONNECT];
const SEND_INFO = true;
let MAX_SENDINFO = 1;

let sent = MAX_SENDINFO;
let inbound;
const server = createServer();
server.on("connection", (conn) => {
  console.log("client connected");
  if (SEND_INFO) {
    if (MAX_SENDINFO === -1 || sent > 0) {
      conn.write(buf);
      sent--;
    }
  }
  setTimeout(() => {
    conn.end();
  }, 30000);

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
});

server.listen(PORT, (v) => {
});
