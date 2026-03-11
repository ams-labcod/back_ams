import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";
import { getStudentSubjects } from "../controller/student.controller.js";


const router = Router()

router.get(
  '/student/my-subjects', 
  verifyJwt, 
  validateRoles('ROL_STUDENT', 'ROL_ADMIN','ROL_ADMINISTRATIVO'), 
  getStudentSubjects
);

export default router