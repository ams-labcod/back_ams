import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { getAllTeachers } from "../controller/teachers.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* PROFESOR
router.get('/getAllTeachers', verifyJwt,validateRoles('ROL_TEACHER','ROL_ADMIN','ROL_ADMINISTRATIVO'), getAllTeachers )


export default router;