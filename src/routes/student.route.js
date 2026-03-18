import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getAllStudents, getStudentSubjects } from "../controller/student.controller.js";


const router = Router()

router.get(
  '/student/my-subjects', 
  verifyJwt, 
  validateRoles('ROL_STUDENT', 'ROL_ADMIN','ROL_ADMINISTRATIVO'), 
  getStudentSubjects
);

router.get('/student/getAll', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMIN', 'ROL_ADMINISTRATIVO'), getAllStudents)

export default router