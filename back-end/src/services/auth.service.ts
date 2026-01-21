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
}

export default new AuthService();
