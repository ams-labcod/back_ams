import { Router } from 'express';
import { check } from 'express-validator';

import { login } from '../controller/user.controller.js';
import { validations } from '../middlewares/validations.js';

const router = Router();

router.post(
    '/login',
    [
        check('usu_correo')
            .notEmpty().withMessage('El correo es obligatorio')
            .isEmail().withMessage('Debe ser un correo válido'),

        check('usu_password')
            .notEmpty().withMessage('La contraseña es obligatoria')
            .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
    ],
    validations,
    login
);

export default router;
