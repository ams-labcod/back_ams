import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { saveObserver } from "../controller/observer.controller.js";

const router = Router()

router.post('/createObserver', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO'), saveObserver)

export default router
