import { Server, Socket } from 'socket.io';
import { socketAuth } from '../middleware/socket-auth.middleware';

export class PaymentGateway {
    public init(io: Server) {
        io.use(socketAuth); 
        io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`);
            console.log('User:', (socket as any).user);
            socket.on('payment', (data: { orderId: string; currency: string; amount: number }) => {
                const payload = typeof data === 'string' ? JSON.parse(data) : data;
                console.log('Payment data:', payload, payload.amount);
                const eventName = `payment.${payload.orderId}`;
                if (payload.amount >= 250) {
                    console.log('Payment successful');
                    const transactionId = this.generateTransactionId();
                    console.log(eventName)
                    socket.emit(eventName, {
                        status: 'success',
                        message: 'Payment successful',
                        orderId: payload.orderId,
                        currency: payload.currency,
                        amount: payload.amount,
                        transactionId,
                    });
                    console.log(transactionId)
                } else {
                    console.log('Insufficient balance');
                    socket.emit(eventName, {
                        status: 'error',
                        message: 'Insufficient balance',
                        orderId: payload.orderId,
                        currency: payload.currency,
                        amount: payload.amount,
                    });
                }
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    private generateTransactionId(): string {
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }
}
