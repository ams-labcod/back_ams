import { Router } from 'express';
import { check } from 'express-validator';

// import { create_course } from '../controllers/courses.controller.js';
import { create_course } from '../controller/courses.controller.js';
import { validations } from '../middlewares/validations.js';

import { verifyJwt } from '../middlewares/verifyToken.js'

const router = Router();

const GRADOS = {
  PREESCOLAR: [
    'PARVULO',
    'PREJARDIN',
    'JARDIN',
    'TRANSICION'
  ],
  BASICA: {
    1: 'PRIMERO',
    2: 'SEGUNDO',
    3: 'TERCERO',
    4: 'CUARTO',
    5: 'QUINTO'
  },
  SECUNDARIA: {
    6: 'SEXTO',
    7: 'SEPTIMO',
    8: 'OCTAVO',
    9: 'NOVENO',
    10: 'DECIMO',
    11: 'UNDECIMO'
  }
};

const CURSOS_POR_NIVEL = {
  BASICA: [1, 2, 3, 4, 5],
  SECUNDARIA: [6, 7, 8, 9, 10, 11]
};
router.post(
  '/create_course',
  verifyJwt,
  [

    /* ===============================
       NIVEL
    =============================== */
    check('cou_level')
      .notEmpty().withMessage('El nivel es obligatorio')
      .isIn(['PREESCOLAR', 'BASICA', 'SECUNDARIA'])
      .withMessage('Nivel inválido. Valores permitidos: PREESCOLAR, BASICA, SECUNDARIA'),

    /* ===============================
     NOMBRE DEL CURSO
  =============================== */
    check('cou_name_teach')
      .notEmpty().withMessage('El nombre del curso es obligatorio')
      .isString()
      .custom((value, { req }) => {
        const level = req.body.cou_level;
        const num = req.body.cou_num_courses;
        const name = value.toUpperCase();

        // PREESCOLAR
        if (level === 'PREESCOLAR') {
          const permitidos = GRADOS.PREESCOLAR.join(', ');

          if (!GRADOS.PREESCOLAR.includes(name)) {
            throw new Error(
              `Curso inválido para PREESCOLAR. Valores permitidos: ${permitidos}`
            );
          }
          return true;
        }

        // BÁSICA
        if (level === 'BASICA') {
          const permitidos = Object.values(GRADOS.BASICA).join(', ');

          if (GRADOS.BASICA[num] !== name) {
            throw new Error(
              `Curso inválido para BÁSICA. Valores permitidos: ${permitidos}`
            );
          }
          return true;
        }

        // SECUNDARIA
        if (level === 'SECUNDARIA') {
          const permitidos = Object.values(GRADOS.SECUNDARIA).join(', ');

          if (GRADOS.SECUNDARIA[num] !== name) {
            throw new Error(
              `Curso inválido para SECUNDARIA. Valores permitidos: ${permitidos}`
            );
          }
          return true;
        }

        return true;
      }),



    check('cou_num_courses')
      .custom((value, { req }) => {
        const level = req.body.cou_level;
        const num = Number(value);

        // PREESCOLAR
        if (level === 'PREESCOLAR') {
          if (value !== undefined && value !== null && value !== '') {
            throw new Error(
              'PREESCOLAR no maneja número de curso. Valores permitidos: (vacío)'
            );
          }
          return true;
        }

        // Obligatorio para otros niveles
        if (value === undefined || value === null || value === '') {
          throw new Error(
            `El número del curso es obligatorio. Valores permitidos para ${level}: ${CURSOS_POR_NIVEL[level]?.join(', ')
            }`
          );
        }

        if (isNaN(num)) {
          throw new Error(
            `El número del curso debe ser numérico. Valores permitidos para ${level}: ${CURSOS_POR_NIVEL[level]?.join(', ')
            }`
          );
        }

        // Validación por nivel
        if (!CURSOS_POR_NIVEL[level]?.includes(num)) {
          throw new Error(
            `Número de curso inválido para ${level}. Valores permitidos: ${CURSOS_POR_NIVEL[level].join(', ')
            }`
          );
        }

        return true;
      }),

    /* ===============================
       MATERIAS / TEMAS
    =============================== */
    check('cou_theme')
      .notEmpty().withMessage('Las materias del curso son obligatorias')
      .isString()

  ],
  validations,
  create_course
);

export default router;