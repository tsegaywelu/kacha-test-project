import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', userController.createUser);
router.get('/', authenticateToken, userController.getAllUsers);

export default router;
