import { connect, nuid } from "nats";

const nc = await connect({ port: 1234, user: "a", pass: "a" });

(async () => {
  for await (const s of nc.status()) {
    console.log(s);
  }
})();

let i = 0;
nc.subscribe("a.>", {
  callback: (err, msg) => {
    if (err) {
      console.error(`got error from sub to a.>: ${err.message}`);
      return;
    }
    i++;
    console.log(`got message: ${i}: ${msg.subject}`);
  },
});

setInterval(() => {
  nc.publish(`a.${nuid.next()}`);
}, 1000);

let subFails = 0;
setInterval(() => {
  nc.subscribe("q", {
    callback: (err, msg) => {
      subFails++;
      console.log(err.message);
    },
  });
}, 5000);

nc.closed().then((err) => {
  let m = "nats client closed";
  if (err) {
    m += `with error: ${err.message}`;
  }
  console.log(m);
});
