import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createEvaluation } from "../controller/evaluation.controller.js";

const router = Router()

router.post('/createEvaluation', verifyJwt, createEvaluation) //"jwt, logica"

export default router