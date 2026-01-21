import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const socketAuth = (socket: Socket, next: (err?: any) => void) => {
    try {
        // Access Authorization header
        const authHeader = socket.handshake.headers['authorization'] as string;

        if (!authHeader) {
            return next(new Error('Authentication error: Token missing'));
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (socket as any).user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
};
