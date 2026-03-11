import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluationType } from "../controller/evaluationType.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* CREERIA QUE EL TIPO DE EVALUACION LA CREA UN DOCENTE
router.post('/createEvaluationType', verifyJwt, validateRoles('ROL_ADMIN','ROL_TEACHER'), createEvaluationType) 

export default router