import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createNote, getAllNotes } from "../controller/notes.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* - PROFESOR
router.get('/getAllNotes', verifyJwt, validateRoles('ROL_TEACHER'),  getAllNotes )
//* - PROFESOR
router.post('/createNote', verifyJwt,validateRoles('ROL_TEACHER'), createNote)

export default router
