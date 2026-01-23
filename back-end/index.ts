import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import connectDB from './src/config/db';
import router from './src/routes';
import { PaymentGateway } from './src/sockets/payment.gateway';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Express middleware
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

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // change to your client URL in production
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket Gateway
const paymentGateway = new PaymentGateway();
paymentGateway.init(io);

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
