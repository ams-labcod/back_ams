import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { getAllNotes } from "../controller/notes.controller.js";

import { validateRolAdministrativo } from "../middlewares/validateRolAdministrativo.js";

const router = Router()

//* ADMIN
router.get('/getAll', verifyJwt, getAllNotes )

export default router
