import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { getAllAssitance } from "../controller/assistance.controller.js";

import { createAssitance } from "../controller/assistance.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* PROFESOR
router.get('/getAllAssistance', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'),getAllAssitance )

//POST ASSISTENCIA
router.post('/createAssistance', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'), createAssitance)



export default router
