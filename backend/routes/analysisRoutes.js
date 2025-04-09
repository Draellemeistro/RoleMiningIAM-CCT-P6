import express from 'express';
import analysisController from '../controllers/analysisController.js';

const router = express.Router();

// router.post('/analyze', roleController.analyzeFunctionalRoles);
router.get('/analyze-all', analysisController.analyzeAllDepartments); // fetch og analyser alle afdelinger
router.post('/analyze-specifics', analysisController.analyzeSpecificDepartments); // sammenlign to afdelinger

export default router;

