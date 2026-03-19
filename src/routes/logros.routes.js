import { Router } from "express";

import { verifyJwt } from '../middlewares/verifyToken.js';

import { create_logro, update_logro, get_logros_by_course } from "../controller/logros.controller.js";

import { validateRoles } from "../middlewares/validateRols.js";

const router = Router()

//* - PROFESOR
router.post('/create_logro', verifyJwt, validateRoles('ROL_ADMIN','ROL_TEACHER','ROL_ADMINISTRATIVO'),  create_logro )

router.get('/logros/:cou_id', verifyJwt, validateRoles('ROL_ADMIN','ROL_TEACHER','ROL_ADMINISTRATIVO'),  get_logros_by_course )

router.put('/logros/:report_id',verifyJwt, validateRoles('ROL_TEACHER','ROL_ADMINISTRATIVO','ROL_ADMIN'), update_logro)


export default router
