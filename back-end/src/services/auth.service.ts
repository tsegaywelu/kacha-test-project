import jwt from 'jsonwebtoken';
import userService from './user.service';

export class AuthService {
    async login(email: string, password: string): Promise<string | null> {
        const user = await userService.findByEmail(email);
        if (!user) {
            return null;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return null;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '1d',
        });

        return token;
    }

    async register(name: string, email: string, password: string): Promise<{ success: boolean; message?: string; token?: string }> {
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }

        try {
            const user = await userService.createUser({ name, email, password });
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
                expiresIn: '1d',
            });

            return { success: true, token };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default new AuthService();
