import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken.js";

import { createPeriod } from "../controller/period.controller.js";

const router = Router()

router.post('/createPeriod', verifyJwt, createPeriod)

export default router