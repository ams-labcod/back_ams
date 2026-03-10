import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRolAdministrativo } from "../middlewares/validateRolAdministrativo.js";

import { getAllAssitance } from "../controller/assistance.controller.js";

const router = Router()

//* ADMIN
router.get('/getAllAssistance', verifyJwt, validateRolAdministrativo ,getAllAssitance )

export default router
