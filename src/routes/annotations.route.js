import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import {createAnnotation, getAnnotations, getAssistanceSummaries, syncAssistanceSummary} from '../controller/annotations.controller.js'

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

// Actualizar contadores de asistencia
router.post('/assistance-summary/sync', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'),syncAssistanceSummary);

router.get('/annotations/:cou_id/:per_id', verifyJwt,validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'),getAnnotations);

router.post('/annotations/create', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), createAnnotation)

router.get('/assistance-summaries', verifyJwt, getAssistanceSummaries);

export default router
