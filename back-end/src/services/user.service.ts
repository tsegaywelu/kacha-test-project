import User, { IUser } from '../models/user.model';

export class UserService {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new User(data);
        return await user.save();
    }

    async getAllUsers(): Promise<IUser[]> {
        return await User.find();
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }
}

export default new UserService();
