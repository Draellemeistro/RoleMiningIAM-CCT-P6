import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserInfo);
router.get('/:userId/access', userController.getUserAccessDetails);

export default router;
