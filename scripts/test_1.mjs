import WebSocket from 'ws';

function connectShelly(ip, retryDelay = 2000) {
  let ws;
  let shouldReconnect = true;

  function start() {
    ws = new WebSocket(`ws://${ip}/rpc`);

    ws.on('open', () => {
      console.log(`[Shelly WS] Connesso a ${ip}`);
      // Richiesta iniziale di stato (esempio per switch:0)
      const req = {
        id: 1,
        method: 'Switch.GetStatus',
        params: { id: 0 },
        src: 'io',
      };
      ws.send(JSON.stringify(req));
      console.log('[Shelly WS] Richiesta stato inviata:', req);
    });

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.method === 'NotifyStatus') {
          console.log(
            '[Shelly WS] Stato aggiornato:',
            JSON.stringify(data.params, null, 2),
          );
        } else {
          console.log('[Shelly WS] Evento RPC:', data);
        }
      } catch (e) {
        console.error('[Shelly WS] Errore parsing messaggio:', e, msg);
      }
    });

    ws.on('error', (err) => {
      console.error('[Shelly WS] Errore WS:', err.message);
    });

    ws.on('close', () => {
      console.warn(
        '[Shelly WS] Connessione chiusa. Riconnessione tra',
        retryDelay,
        'ms...',
      );
      if (shouldReconnect) {
        setTimeout(start, retryDelay);
      }
    });
  }

  start();

  // opzionale: funzione per chiudere la connessione pulita
  return () => {
    shouldReconnect = false;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}

// Sostituisci con l'IP del tuo Shelly
connectShelly('192.168.1.197');
