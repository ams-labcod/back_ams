import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getObserver, saveObserver } from "../controller/observer.controller.js";

const router = Router()

router.post('/createObserver', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO'), saveObserver)

router.get('/observer/:est_id/:per_id', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO','ROL_STUDENT'), getObserver);

export default router
