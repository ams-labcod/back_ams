import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createNote, getAllNotes, getStudentNotes, updateNote } from "../controller/notes.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()


//* - PROFESOR
router.get('/getAllNotes', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMIN', 'ROL_ADMINISTRATIVO'),  getAllNotes )
//* - PROFESOR
router.post('/createNote', verifyJwt,validateRoles('ROL_TEACHER' ,'ROL_ADMIN', 'ROL_ADMINISTRATIVO'), createNote)

//* buscar solo sus notas en ese periodo, y entregarlas agrupadas por materia
router.get('/student/notes', verifyJwt, validateRoles('ROL_STUDENT', 'ROL_ADMINISTRATIVO'), getStudentNotes);

//* update
router.put('/updateNote/:eva_id/:not_est_id',verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), updateNote)

export default router
