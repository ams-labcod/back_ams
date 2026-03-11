import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRolAdministrativo } from "../middlewares/validateRolAdministrativo.js";

import { getAllAssitance } from "../controller/assistance.controller.js";

const router = Router()

//* PROFESOR
router.get('/getAllAssistance', verifyJwt ,getAllAssitance )

export default router
