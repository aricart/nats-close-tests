import { connect } from "nats";
await connect({
  port: 1234,
  user: "a",
  pass: "b",
  debug: true,
  maxReconnectAttempts: -1,
  waitOnFirstConnect: true,
});
