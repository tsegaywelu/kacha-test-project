import express, { Application, Request, Response } from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import connectDB from './src/config/db';
import router from './src/routes';
import { PaymentGateway } from './src/sockets/payment.gateway';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const wsPort = 8080;

connectDB();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

const server = http.createServer(app);

const wss = new WebSocketServer({ port: wsPort });

const paymentGateway = new PaymentGateway();
paymentGateway.init(wss);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log(`WebSocket server is running on ws://localhost:${wsPort}`);
