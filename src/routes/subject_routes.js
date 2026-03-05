import { Router } from "express";

import { check } from 'express-validator';

import { validations } from '../middlewares/validations.js';

import { verifyJwt } from '../middlewares/verifyToken.js';

import { validateRolAdmin } from '../middlewares/validateRolAdmin.js';

import { createSubject, disableCourseSubject, getAllCourseSubjects, getCourseSubjectById, updateCourseSubject } from "../controller/subject.controller.js";

const router = Router();

router.post('/createSubject', verifyJwt, validateRolAdmin, createSubject)

router.get('/getSubjects', verifyJwt, getAllCourseSubjects)

router.get('/getOneSubject/:id', verifyJwt, getCourseSubjectById)

router.put('/updateSubject/:id', verifyJwt, validateRolAdmin, updateCourseSubject)

router.patch('/deleteSubject/:id', verifyJwt, validateRolAdmin,disableCourseSubject)

export default router;