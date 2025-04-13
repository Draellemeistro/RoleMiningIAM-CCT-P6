
import express from 'express';
import deparmtentController from '../controllers/departmentControler.js';

const router = express.Router();

router.get('/', deparmtentController.getDepartments); // fetch alle afdelinger
router.post('/analyze-specifics', deparmtentController.getDepartmentOverview); // sammenlign to afdelinger
router.get('/analyze-all', deparmtentController.getAllDepartmentOverviews); // fetch og analyser alle afdelinger

export default router;

