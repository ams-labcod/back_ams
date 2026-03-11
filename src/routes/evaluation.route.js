import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluation } from "../controller/evaluation.controller.js";

import { validateRolAdmin } from "../middlewares/validateRolAdmin.js";

const router = Router()

//* CREERIA QUE LA EVALUCION LA CREA UN DOCENTE
router.post('/createEvaluation', verifyJwt, validateRolAdmin, createEvaluation) 

export default router