import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getConsolidatedByCourse, assignGroupDirector, getAllCourseDirectors, getTeacherGradebook, getMyDirector, getAdminGradebook, getConsolidatedConvivencia } from "../controller/report.controller.js";

const router = Router()

//* admin/administrativo, elige el director de grupo
router.patch('/teachers/:tea_peo_id/director',verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), assignGroupDirector);

//* - este reporte lo tendria que ver el administrativo y el director de grupo 
router.get('/consolidated/:cou_id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO','ROL_TEACHER','ROL_STUDENT'),  getConsolidatedByCourse )


router.get('/consolidated/convivencia/:cou_id', verifyJwt, validateRoles('ROL_TEACHER', 'ROL_ADMINISTRATIVO', 'ROL_STUDENT'), getConsolidatedConvivencia)

//* Todos los cursos con sus directores
router.get(
  '/coursesDirectors/all', 
  verifyJwt, 
  validateRoles('ROL_ADMIN', 'ROL_ADMINISTRATIVO', 'ROL_TEACHER','ROL_STUDENT'), 
  getAllCourseDirectors
);

//* Obtener el director del curso del estudiante logueado
router.get(
  '/coursesDirectors/my-director', 
  verifyJwt, 
  validateRoles('ROL_STUDENT', 'ROL_ADMINISTRATIVO'), 
  getMyDirector
);

router.get('/teacher/gradebook', verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO', 'ROL_ADMIN', 'ROL_STUDENT'), getTeacherGradebook)

router.get('/admin/gradebook', verifyJwt, validateRoles('ROL_ADMIN', 'ROL_ADMINISTRATIVO','ROL_TEACHER'), getAdminGradebook);

export default router
