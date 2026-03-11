import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken.js";

import { createPeriod, getAllPeriod } from "../controller/period.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

router.post('/createPeriod', verifyJwt,validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO','ROL_TEACHER'), createPeriod)

router.get('/getAllPeriod', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO','ROL_TEACHER'), getAllPeriod)

export default router