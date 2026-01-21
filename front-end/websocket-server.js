

import { WebSocketServer } from 'ws';
const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(` web socket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log(' ew client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);

      if (message.type === 'INIT_PAYMENT') {
        console.log(` Payment initiated: ${message.orderId} - ${message.amount} ${message.currency}`);

      
       
        // i am sending PENDING status immediately
        setTimeout(() => {
          const pendingMessage = {
            type: 'PAYMENT_STATUS',
            status: 'PENDING'
          };
          ws.send(JSON.stringify(pendingMessage));
          console.log('📤 Sent: PENDING');
        }, 500);

       
        setTimeout(() => {
          const amount = parseFloat(message.amount) || 0;
          const MINIMUM_AMOUNT = 1; 
       
          if (amount === 0 || amount < MINIMUM_AMOUNT) {
            const failedMessage = {
              type: 'PAYMENT_STATUS',
              status: 'FAILED',
              reason: 'Insufficient balance'
            };
            ws.send(JSON.stringify(failedMessage));
          
          } else {
            
            const successMessage = {
              type: 'PAYMENT_STATUS',
              status: 'SUCCESS',
              reference: `TXN-${Date.now()}`
            };
            ws.send(JSON.stringify(successMessage));
           
          }
        }, 2000);
      }
    } catch (error) {
      console.error(' error when processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(' Client disconnected now');
  });

  ws.on('error', (error) => {
    console.error('webSocket error:', error);
  });
});



