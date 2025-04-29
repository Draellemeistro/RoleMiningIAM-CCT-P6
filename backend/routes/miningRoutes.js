import express from 'express';
import miningController from '../controllers/miningController.js';

const router = express.Router();

router.get('/', miningController.testAnalysis);
router.get('/test', miningController.testAnalysisAgain);
router.post('/analyze', miningController.analyzeDepartments);

export default router;

