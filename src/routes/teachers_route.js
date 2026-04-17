import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createCourseCriteria, getAllCourseNotes, getAllTeachers, updateCourseCriteria } from "../controller/teachers.controller.js";

import { getCourseCriteria } from "../controller/teachers.controller.js";

// import { saveCourseCriteria } from "../controller/teachers.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* PROFESOR
router.get('/getAllTeachers', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'), getAllTeachers )

//* Obtener criteria curso
router.get(
  '/teacher/criteria/:per_id/:cou_id',  //* le agregamos el criterio(ams_coruse_notes) y (ams_course_subject)
  verifyJwt, 
  validateRoles('ROL_ADMINISTRATIVO','ROL_ADMIN','ROL_TEACHER'), 
  getCourseCriteria
);

//* Crear
router.post(
  '/teacher/criteria', 
  verifyJwt, 
  validateRoles('ROL_ADMINISTRATIVO','ROL_ADMIN','ROL_TEACHER'), 
  createCourseCriteria
);


//* obtener todos los criterios
router.get('/teacher/getAllCriteria', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO','ROL_ADMIN', 'ROL_STUDENT'),getAllCourseNotes)

//* Actulizar
router.put('/course-criteria/:per_id', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO'), updateCourseCriteria)
export default router;