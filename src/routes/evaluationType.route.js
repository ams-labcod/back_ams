import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluationType, getAllEvaluationType } from "../controller/evaluationType.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* CREERIA QUE EL TIPO DE EVALUACION LA CREA UN DOCENTE
router.post('/createEvaluationType', verifyJwt, validateRoles('ROL_ADMIN','ROL_TEACHER'), createEvaluationType) 

router.get('/getAllEvaluationType', verifyJwt, validateRoles('ROL_ADMIN', 'ROL_ADMINISTRATIVO', 'ROL_TEACHER', 'ROL_STUDENT'), getAllEvaluationType)

export default router