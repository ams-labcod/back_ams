import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { assignConvivenciaGrade, getConvivenciaGrades, saveFinalConvivenciaGrade } from "../controller/convivencia.controller.js";

const router = Router()

//* aisgnacion de nota
router.post('/convivencia/asignacion', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO'), assignConvivenciaGrade)

//* trae la nota
router.get('/convivencia/asignacion/:cou_id/:per_id', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), getConvivenciaGrades)

//* asignar nota final
router.post('/convivencia/asignacion/final', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), saveFinalConvivenciaGrade)

export default router
