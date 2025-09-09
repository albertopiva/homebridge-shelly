/* global console, setTimeout */
import { JSONRPCClient } from 'json-rpc-2.0';
import WebSocket from 'ws';

function connectShelly(ip, retryDelay = 2000) {
  let ws;
  let shouldReconnect = true;

  function start() {
    ws = new WebSocket(`ws://${ip}/rpc`);

    ws.on('open', () => {
      console.log(`[Shelly WS] Connected to ${ip}`);
      const req = {
        id: 1,
        method: 'Switch.GetStatus',
        params: { id: 0 },
        src: 'io',
      };
      ws.send(JSON.stringify(req));
      console.log('[Shelly WS] Status request sent:', req);
    });

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.method === 'NotifyStatus') {
          console.log(
            '[Shelly WS] Status updated:',
            JSON.stringify(data.params, null, 2),
          );
        } else {
          console.log('[Shelly WS] RPC Event:', data);
        }
      } catch (e) {
        console.error('[Shelly WS] Error parsing message:', e, msg);
      }
    });

    ws.on('error', (err) => {
      console.error('[Shelly WS] WS Error:', err.message);
    });

    ws.on('close', () => {
      console.warn(
        '[Shelly WS] Connection closed. Reconnecting in',
        retryDelay,
        'ms...',
      );
      if (shouldReconnect) {
        setTimeout(start, retryDelay);
      }
    });
  }

  start();

  // Optional: function to close the connection cleanly
  return () => {
    shouldReconnect = false;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}

const ip = '192.168.1.197';
const ws = new WebSocket(`ws://${ip}/rpc`);

// Buffer for outgoing requests until the socket is open
let pendingRequests = [];

const client = new JSONRPCClient((jsonRPCRequest) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(jsonRPCRequest));
  } else {
    pendingRequests.push(jsonRPCRequest);
  }
});

ws.on('open', () => {
  console.log(`[Shelly WS] Connected to ${ip}`);
  // Send any requests that were buffered before connection
  pendingRequests.forEach((req) => ws.send(JSON.stringify(req)));
  pendingRequests = [];
});

ws.on('message', (msg) => {
  try {
    const data = JSON.parse(msg);
    // Pass response to JSONRPCClient
    client.receive(data);
    if (data.method === 'NotifyStatus') {
      console.log(
        '[Shelly WS] Status updated:',
        JSON.stringify(data.params, null, 2),
      );
    } else if (data.result) {
      console.log('[Shelly WS] RPC Result:', data.result);
    } else {
      console.log('[Shelly WS] RPC Event:', data);
    }
  } catch (e) {
    console.error('[Shelly WS] Error parsing message:', e, msg);
  }
});

ws.on('error', (err) => {
  console.error('[Shelly WS] WS Error:', err.message);
});

ws.on('close', () => {
  console.warn('[Shelly WS] Connection closed.');
});

// Use client.request to make a JSON-RPC request call.
client
  .request({
    method: 'Switch.GetStatus',
    params: { id: 0 },
    src: 'hb-test',
  })
  .then((result) => console.log('[Shelly WS] Switch.GetStatus result:', result))
  .catch((err) => console.error('RPC Error:', err.message));
// Replace with your Shelly device IP
connectShelly('192.168.1.197');
