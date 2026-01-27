import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

interface PaymentMessage {
    type: string;
    orderId: string;
    amount: number;
    currency: string;
}

interface PaymentResponse {
    status: 'success' | 'error';
    message: string;
    orderId: string;
    currency: string;
    amount: number;
    transactionId?: string;
}

export class PaymentGateway {
    public init(wss: WebSocketServer) {
        wss.on('connection', (ws: WebSocket, req: any) => {
            const user = this.authenticateConnection(req);
            if (!user) {
                ws.close(1008, 'Authentication failed');
                return;
            }

            console.log(`New client connected: ${req.socket.remoteAddress}`);
            console.log('User:', user);

            ws.on('message', (data: Buffer) => {
                try {
                    const message: PaymentMessage = JSON.parse(data.toString());
                    console.log('Received message:', message);

                    if (message.type === 'INIT_PAYMENT') {
                        this.handlePayment(ws, message);
                    } else {
                        console.log('Unknown message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                    ws.send(JSON.stringify({
                        status: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });
    }

    private authenticateConnection(req: any): any {
        try {
            let token: string | null = null;

            const authHeader = req.headers['authorization'] as string;
            if (authHeader) {
                token = authHeader.replace('Bearer ', '');
            }

            if (!token && req.url) {
                const urlParts = req.url.split('?');
                if (urlParts.length > 1) {
                    const params = new URLSearchParams(urlParts[1]);
                    const tokenParam = params.get('token');
                    if (tokenParam) {
                        token = tokenParam.replace('Bearer ', '');
                    }
                }
            }

            if (!token) {
                return null;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            return decoded;
        } catch (err) {
            return null;
        }
    }

    private handlePayment(ws: WebSocket, message: PaymentMessage) {
        const { orderId, amount, currency } = message;
        console.log('Processing payment:', { orderId, amount, currency });

        const response: PaymentResponse = {
            status: amount >= 250 ? 'success' : 'error',
            message: amount >= 250 ? 'Payment successful' : 'Insufficient balance',
            orderId,
            currency,
            amount,
        };

        if (amount >= 250) {
            const transactionId = this.generateTransactionId();
            response.transactionId = transactionId;
            console.log('Payment successful, transactionId:', transactionId);
        } else {
            console.log('Insufficient balance');
        }

        ws.send(JSON.stringify(response));
    }

    private generateTransactionId(): string {
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }
}
