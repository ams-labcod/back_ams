import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluation } from "../controller/evaluation.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* CREERIA QUE LA EVALUCION LA CREA UN DOCENTE
router.post('/createEvaluation', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMIN'), createEvaluation) 

export default router