import express from 'express';
import roleController from '../controllers/roleController.js';

const router = express.Router();

router.get('/', roleController.getFunctionalRoles);               // Hent alle funktionelle roller
router.post('/analyze', roleController.analyzeFunctionalRoles);  // Send to roller til analyse

export default router;
