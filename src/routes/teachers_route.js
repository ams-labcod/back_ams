import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { getAllCourseNotes, getAllTeachers } from "../controller/teachers.controller.js";

import { getCourseCriteria } from "../controller/teachers.controller.js";

import { saveCourseCriteria } from "../controller/teachers.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* PROFESOR
router.get('/getAllTeachers', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'), getAllTeachers )

router.get(
  '/teacher/criteria/:per_id', 
  verifyJwt, 
  validateRoles('ROL_ADMINISTRATIVO','ROL_ADMIN','ROL_TEACHER'), 
  getCourseCriteria
);

router.post(
  '/teacher/criteria', 
  verifyJwt, 
  validateRoles('ROL_ADMINISTRATIVO','ROL_ADMIN','ROL_TEACHER'), 
  saveCourseCriteria
);


//* obtener todos los criterios
router.get('/teacher/getAllCriteria', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO','ROL_ADMIN', 'ROL_STUDENT'),getAllCourseNotes)
export default router;