import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluationType } from "../controller/evaluationType.controller.js";

import { validateRolAdmin } from "../middlewares/validateRolAdmin.js";

const router = Router()

//* CREERIA QUE EL TIPO DE EVALUACION LA CREA UN DOCENTE
router.post('/createEvaluationType', verifyJwt, validateRolAdmin, createEvaluationType) 

export default router