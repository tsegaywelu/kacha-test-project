import { Request, Response } from 'express';
import authService from '../services/auth.service';

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        try {
            const token = await authService.login(email, password);
            if (!token) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            res.status(200).json({ token });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AuthController();
