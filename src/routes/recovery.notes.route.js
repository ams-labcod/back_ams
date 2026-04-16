import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";
import { saveRecoveryNote } from "../controller/recovery.notes.controller.js";

const router = Router()


router.post('/recoveryNote', verifyJwt,validateRoles('ROL_ADMINISTRATIVO', 'ROL_TEACHER'), saveRecoveryNote)

export default router