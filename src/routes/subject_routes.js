import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createSubject, disableCourseSubject, getAllCourseSubjects, getCourseSubjectById, updateCourseSubject } from "../controller/subject.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router();

router.post('/createSubject', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), createSubject)

router.get('/getSubjects', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'),getAllCourseSubjects)

router.get('/getOneSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'),getCourseSubjectById)

router.put('/updateSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), updateCourseSubject)

router.patch('/deleteSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), disableCourseSubject)

export default router;