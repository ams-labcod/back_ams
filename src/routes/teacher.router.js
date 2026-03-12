import { Router } from "express"

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRoles } from "../middlewares/validateRols.js";

import { getCourseCriteria, saveCourseCriteria } from "../controller/teacher.controller.js";

const router = Router()

router.get(
  '/teacher/criteria/:per_id', 
  verifyJwt, 
  validateRoles('ROL_TEACHER'), 
  getCourseCriteria
);

router.post(
  '/teacher/criteria', 
  verifyJwt, 
  validateRoles('ROL_TEACHER'), 
  saveCourseCriteria
);

export default router