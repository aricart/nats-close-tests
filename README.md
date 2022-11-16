# Test Script

## Auth error

Should see that the client connected twice, but got the
`-ERR 'Authorization Violation'␍␊` twice. NATS clients disconnect after 2 back
to back authorization violations.

```bash
nats-server -c server.conf
node auth_err.js

> INFO {"server_id":"NCOD4PXRBQARPVWYOGMPVWS73PYRG7YX4VQBL3FOC3OX6DMHY5TSEEFT","server_name":"NCOD4PXRBQARPVWYOGMPVWS73PYRG7YX4VQBL3FOC3OX6DMHY5TSEEFT","version":"2.9.4","proto":1,"git_commit":"0b95294","go":"go1.19.2","host":"0.0.0.0","port":1234,"headers":true,"auth_required":true,"max_payload":1048576,"client_id":4,"client_ip":"127.0.0.1"} ␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"user":"a","pass":"b","headers":true,"no_responders":true}␍␊
< PING␍␊
> -ERR 'Authorization Violation'␍␊
> INFO {"server_id":"NCOD4PXRBQARPVWYOGMPVWS73PYRG7YX4VQBL3FOC3OX6DMHY5TSEEFT","server_name":"NCOD4PXRBQARPVWYOGMPVWS73PYRG7YX4VQBL3FOC3OX6DMHY5TSEEFT","version":"2.9.4","proto":1,"git_commit":"0b95294","go":"go1.19.2","host":"0.0.0.0","port":1234,"headers":true,"auth_required":true,"max_payload":1048576,"client_id":5,"client_ip":"127.0.0.1"} ␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"user":"a","pass":"b","headers":true,"no_responders":true}␍␊
< PING␍␊
> -ERR 'Authorization Violation'␍␊
/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:333
return new error_1.NatsError(s, error_1.ErrorCode.AuthorizationViolation);
^

NatsError: 'Authorization Violation'
at ProtocolHandler.toError (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:333:20)
at ProtocolHandler.<anonymous> (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:363:41)
at Generator.next (<anonymous>)
at /private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:8:71
at new Promise (<anonymous>)
at __awaiter (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:4:12)
at ProtocolHandler.processError (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:361:16)
at ProtocolHandler.push (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:461:22)
at Parser.parse (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/parser.js:307:45)
at ProtocolHandler.<anonymous> (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:197:45) {
code: 'AUTHORIZATION_VIOLATION',
chainedError: undefined
}

killall nats-server
```

## Client Authentication Timeout

First test will succeed in connecting once, and then will disconnect, but
subsequent reconnects, are not proper (the other side of the connection is not
sending an INFO) Should see infinite reconnect attempts on the client.

```bash
node auth_timeout_infoonce.js
client connected
> INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":4432,"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"headers":true,"no_responders":true}␍␊
< PING␍␊
> PONG␍␊
{ type: 'disconnect', data: '127.0.0.1:4432' }
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
{ type: 'reconnecting', data: '127.0.0.1:4432' }
client connected
^C⏎
```

A second scenario, client connects but the server never sends an info -
`waitOnFirstConnect` is not set, so the client will close after the first
connect. If you modify the source to have `waitOnFirstConnect: true` option, the
client will retry.

```bash
node auth_timeout_noinfo.js
client connected
/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/error.js:101
        return new NatsError(m, code, chainedError);
               ^

NatsError: TIMEOUT
    at NatsError.errorForCode (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/error.js:101:16)
    at timeout (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/util.js:88:35)
    at ProtocolHandler.<anonymous> (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:188:44)
    at Generator.next (<anonymous>)
    at /private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:8:71
    at new Promise (<anonymous>)
    at __awaiter (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:4:12)
    at ProtocolHandler.dial (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:184:16)
    at ProtocolHandler.<anonymous> (/private/tmp/nats-close-tests/node_modules/nats/lib/nats-base-client/protocol.js:250:32)
    at Generator.next (<anonymous>) {
  code: 'TIMEOUT',
  chainedError: undefined
}
```

with waitOnFirstConnect:

```bash
 node auth_timeout_noinfo.js
client connected
client connected
client connected
client connected
```

## Stale Connection

The ping timer is set to expire faster, so the test re-attempts connections more
often, if you don't set it, it will do the same, but at the default set on the
client. Note the stale connections are notified, and the client reconnects.

```bash:
node staleconn.js
client connected
> INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":4532,"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"headers":true,"no_responders":true}␍␊
< PING␍␊
> PONG␍␊
{ type: 'pingTimer', data: '1' }
< PING␍␊
{ type: 'pingTimer', data: '2' }
< PING␍␊
< 
{ type: 'pingTimer', data: '3' }
{ type: 'staleConnection', data: '' }
{ type: 'disconnect', data: '127.0.0.1:4532' }
{ type: 'reconnecting', data: '127.0.0.1:4532' }
client connected
> INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":4532,"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"headers":true,"no_responders":true}␍␊
< PING␍␊
{ type: 'update', data: { added: [], deleted: [] } }
> PONG␍␊
{ type: 'reconnect', data: '127.0.0.1:4532' }
{ type: 'pingTimer', data: '1' }
< PING␍␊
{ type: 'pingTimer', data: '2' }
< PING␍␊
< 
{ type: 'pingTimer', data: '3' }
{ type: 'staleConnection', data: '' }
{ type: 'disconnect', data: '127.0.0.1:4532' }
{ type: 'reconnecting', data: '127.0.0.1:4532' }
client connected
> INFO {"server_id":"FAKE","server_name":"FAKE","version":"2.9.4","proto":1,"go":"go1.19.2","host":"127.0.0.1","port":4532,"headers":true,"max_payload":1048576,"jetstream":true,"client_id":4,"client_ip":"127.0.0.1"}␍␊
< CONNECT {"protocol":1,"version":"2.9.0","lang":"nats.js","verbose":false,"pedantic":false,"headers":true,"no_responders":true}␍␊
< PING␍␊
{ type: 'update', data: { added: [], deleted: [] } }
> PONG␍␊
{ type: 'reconnect', data: '127.0.0.1:4532' }
{ type: 'pingTimer', data: '1' }
< PING␍␊
^C⏎
```

## Sub Permission Errors

Here the client will attempt to resub to a subject it doesn't permissions, while publishing messages
You can see that no disconnect events are emitted, and the client continues to report sub errors, but
keeps going

```bash
killall nats-server
aricart@imac /p/t/nats-close-tests (master)> nats-server -c server.conf &
[1352] 2022/11/16 11:42:45.557646 [INF] Starting nats-server
[1352] 2022/11/16 11:42:45.557719 [INF]   Version:  2.9.4
[1352] 2022/11/16 11:42:45.557732 [INF]   Git:      [0b95294]
[1352] 2022/11/16 11:42:45.557737 [INF]   Name:     NA56NWFYTXPNJW5564ITAXX5IAAXVMY7MSCBEKUYCMIKPIQXTWYJFHVT
[1352] 2022/11/16 11:42:45.557741 [INF]   ID:       NA56NWFYTXPNJW5564ITAXX5IAAXVMY7MSCBEKUYCMIKPIQXTWYJFHVT
[1352] 2022/11/16 11:42:45.557745 [WRN] Plaintext passwords detected, use nkeys or bcrypt
[1352] 2022/11/16 11:42:45.557753 [INF] Using configuration file: server.conf
[1352] 2022/11/16 11:42:45.558191 [INF] Listening for client connections on 0.0.0.0:1234
[1352] 2022/11/16 11:42:45.558337 [INF] Server is ready
aricart@imac /p/t/nats-close-tests (master)> node sub_perm.js
got message: 1: a.4EH4M868DJA3UOTYPBAMJX
got message: 2: a.4EH4M868DJA3UOTYPBAMRW
got message: 3: a.4EH4M868DJA3UOTYPBAMZV
got message: 4: a.4EH4M868DJA3UOTYPBAN7U
[1352] 2022/11/16 11:43:01.757140 [ERR] 127.0.0.1:49317 - cid:4 - "v2.9.0:nats.js" - Subscription Violation - User "a", Subject "q", SID 2
'Permissions Violation for Subscription to "q"'
{
  type: 'error',
  data: 'PERMISSIONS_VIOLATION',
  permissionContext: { operation: 'subscription', subject: 'q' }
}
got message: 5: a.4EH4M868DJA3UOTYPBANFT
got message: 6: a.4EH4M868DJA3UOTYPBANNS
got message: 7: a.4EH4M868DJA3UOTYPBANVR
got message: 8: a.4EH4M868DJA3UOTYPBAO3Q
got message: 9: a.4EH4M868DJA3UOTYPBAOBP
[1352] 2022/11/16 11:43:06.757684 [ERR] 127.0.0.1:49317 - cid:4 - "v2.9.0:nats.js" - Subscription Violation - User "a", Subject "q", SID 3
'Permissions Violation for Subscription to "q"'
{
  type: 'error',
  data: 'PERMISSIONS_VIOLATION',
  permissionContext: { operation: 'subscription', subject: 'q' }
}
got message: 10: a.4EH4M868DJA3UOTYPBAOJO
got message: 11: a.4EH4M868DJA3UOTYPBAORN
got message: 12: a.4EH4M868DJA3UOTYPBAOZM
got message: 13: a.4EH4M868DJA3UOTYPBAP7L
got message: 14: a.4EH4M868DJA3UOTYPBAPFK
[1352] 2022/11/16 11:43:11.757091 [ERR] 127.0.0.1:49317 - cid:4 - "v2.9.0:nats.js" - Subscription Violation - User "a", Subject "q", SID 4
'Permissions Violation for Subscription to "q"'
{
  type: 'error',
  data: 'PERMISSIONS_VIOLATION',
  permissionContext: { operation: 'subscription', subject: 'q' }
}
got message: 15: a.4EH4M868DJA3UOTYPBAPNJ
got message: 16: a.4EH4M868DJA3UOTYPBAPVI
^C⏎                                                                    
```
