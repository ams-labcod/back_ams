import { Router } from 'express';
import { check } from 'express-validator';

import { create_criteria } from '../controller/criteria.controller.js';
import { validations } from '../middlewares/validations.js';
import { verifyJwt } from '../middlewares/verifyToken.js';
import { validateRolAdmin } from '../middlewares/validateRolAdmin.js';

const router = Router();

router.post(
  '/create_criteria',
  verifyJwt,
  validateRolAdmin,
  [

  check('cri_note_min')
    .notEmpty().withMessage('La nota mínima es obligatoria')
    .isFloat({ min: 0 }).withMessage('La nota mínima debe ser un número mayor o igual a 0'),

  check('cri_note_max')
    .notEmpty().withMessage('La nota máxima es obligatoria')
    .isFloat({ gt: 0 }).withMessage('La nota máxima debe ser un número mayor que 0')
    .custom((value, { req }) => {
      const min = Number(req.body.cri_note_min);
      const max = Number(value);

      if (max <= min) {
        throw new Error('La nota máxima debe ser mayor que la nota mínima');
      }

      // Validación suave (NO restrictiva)
      if (max > 1000) {
        throw new Error('La nota máxima parece inválida, verifique el valor');
      }

      return true;
    }),


    check('cri_passing_grade')
      .notEmpty().withMessage('La nota mínima para aprobar es obligatoria')
      .isFloat({ min: 0 })
      .withMessage('La nota mínima para aprobar debe ser un número mayor o igual a 0')
      .custom((value, { req }) => {
        const min = Number(req.body.cri_note_min);
        const max = Number(req.body.cri_note_max);
        const passing = Number(value);

        if (passing <= min) {
          throw new Error('La nota mínima para aprobar debe ser mayor que la nota mínima');
        }

        if (passing > max) {
          throw new Error('La nota mínima para aprobar no puede ser mayor que la nota máxima');
        }

        return true;
      }),


    check('cri_academics_breaks')
      .notEmpty().withMessage('La cantidad de períodos académicos es obligatoria')
      .isInt({ min: 1, max: 4 })
      .withMessage('La cantidad de períodos académicos debe ser un número entero entre 1 y 4'),



    // check('peo_id')
    //   .notEmpty().withMessage('El PEO_ID es obligatorio')
    //   .isUUID().withMessage('El PEO_ID debe ser un UUID válido')

  ],
  validations,
  create_criteria
);

export default router;
