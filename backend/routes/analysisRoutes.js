import express from 'express';
import analysisController from '../controllers/analysisController.js';

const router = express.Router();

router.get('/', analysisController.getDepartments); // fetch og analyser alle afdelinger
router.get('/analyze-all', analysisController.getDepartmentOverview); // fetch og analyser alle afdelinger
router.post('/analyze-specifics', analysisController.getAllDepartmentOverviews); // sammenlign to afdelinger

export default router;

