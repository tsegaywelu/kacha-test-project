import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const socketAuth = (socket: Socket, next: (err?: any) => void) => {
    try {
        let token: string | null = null;

        const authHeader = socket.handshake.headers['authorization'] as string;
        if (authHeader) {
            token = authHeader.replace('Bearer ', '');
        } else if (socket.handshake.auth && socket.handshake.auth.token) {
            const authToken = socket.handshake.auth.token;
            token = typeof authToken === 'string' ? authToken.replace('Bearer ', '') : null;
        }

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (socket as any).user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
};
