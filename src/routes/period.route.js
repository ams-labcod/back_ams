import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken.js";

import { createPeriod, getAllPeriod } from "../controller/period.controller.js";

import { validateRolAdmin } from "../middlewares/validateRolAdmin.js";

import { validateRolAdministrativo } from "../middlewares/validateRolAdministrativo.js";

const router = Router()

router.post('/createPeriod', verifyJwt,validateRolAdmin, createPeriod)

router.get('/getAllPeriod', verifyJwt, validateRolAdmin, getAllPeriod)

export default router