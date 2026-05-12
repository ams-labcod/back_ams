import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { createSubject, disableCourseSubject, enableCourseSubject, getAllCourseSubjects, getCourseSubjectById, updateCourseSubject } from "../controller/subject.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router();

router.post('/createSubject', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO', 'ROL_TEACHER'), createSubject)

router.get('/getSubjects', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO', 'ROL_TEACHER','ROL_STUDENT'),getAllCourseSubjects)

router.get('/getOneSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO','ROL_TEACHER'),getCourseSubjectById)

router.put('/updateSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), updateCourseSubject)

router.patch('/deleteSubject/:id', verifyJwt, validateRoles('ROL_ADMIN','ROL_ADMINISTRATIVO'), disableCourseSubject)

router.patch('/activateSubject/:id',verifyJwt, validateRoles('ROL_ADMINISTRATIVO'), enableCourseSubject)

export default router;