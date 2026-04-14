import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getAllStudents, getGradesForRanking, getMyGrades, getStudentSubjects } from "../controller/student.controller.js";


const router = Router()

router.get(
  '/student/my-subjects', 
  verifyJwt, 
  validateRoles('ROL_STUDENT', 'ROL_ADMIN','ROL_ADMINISTRATIVO'), 
  getStudentSubjects
);

router.get('/my-grades', verifyJwt, validateRoles('ROL_STUDENT', 'ROL_ADMINISTRATIVO'), getMyGrades);

router.get('/student/getAll', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMIN', 'ROL_ADMINISTRATIVO'), getAllStudents)

//* Obtener - calcular puesto
router.get('/ranking-grades', verifyJwt, validateRoles('ROL_STUDENT', 'ROL_ADMIN'), getGradesForRanking);

export default router