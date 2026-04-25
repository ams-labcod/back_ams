import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { assignConvivenciaGrade, getConvivenciaGrades, updateConvivenciaGrade } from "../controller/convivencia.controller.js";

const router = Router()

//* aisgnacion de nota
router.post('/convivencia/asignacion', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO'), assignConvivenciaGrade)

//* trae la nota
router.get('/convivencia/asignacion/:cou_id/:per_id', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), getConvivenciaGrades)

router.put('/convivencia/asignacion/:con_id', verifyJwt,validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), updateConvivenciaGrade);


export default router
