import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { getAllAssitance, updateAssistance } from "../controller/assistance.controller.js";

import { createAssitance } from "../controller/assistance.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* PROFESOR
router.get('/getAllAssistance', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO', 'ROL_STUDENT'),getAllAssitance )

//POST ASSISTENCIA
router.post('/createAssistance', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'), createAssitance)

//* update
router.put('/:id',verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO'), updateAssistance)
export default router
