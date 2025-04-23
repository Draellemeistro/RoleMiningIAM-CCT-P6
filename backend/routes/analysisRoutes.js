import express from 'express';
import analysisController from '../controllers/analysisController.js';

const router = express.Router();

router.get('/', analysisController.testAnalysis);
router.get('/test', analysisController.testAnalysisAgain);

export default router;

