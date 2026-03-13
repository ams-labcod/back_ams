import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getConsolidatedByCourse, assignGroupDirector, getAllCourseDirectors, getTeacherGradebook } from "../controller/report.controller.js";

const router = Router()

//* admin/administrativo, elige el director de grupo
router.patch('/teachers/:tea_peo_id/director',verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), assignGroupDirector);

//* - este reporte lo tendria que ver el administrativo y el director de grupo 
router.get('/consolidated/:cou_id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO','ROL_TEACHER'),  getConsolidatedByCourse )

//* Todos los cursos con sus directores
router.get(
  '/coursesDirectors/all', 
  verifyJwt, 
  validateRoles('ROL_ADMIN', 'ROL_ADMINISTRATIVO', 'ROL_TEACHER'), 
  getAllCourseDirectors
);

router.get('/teacher/gradebook', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO', 'ROL_ADMIN'), getTeacherGradebook)

export default router
