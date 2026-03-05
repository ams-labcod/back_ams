import { Router } from 'express';
import { check } from 'express-validator';

import { create_person, login, getusers, userProfile, getUserProfileByUser } from '../controller/user.controller.js';
import { validations } from '../middlewares/validations.js';
import { verifyJwt } from '../middlewares/verifyToken.js'
import { validateRolAdmin } from '../middlewares/validateRolAdmin.js';
// import { validateRolAdministrativo } from '../middlewares/validateRolAdministrativo.js';

const router = Router();
// ,validateRolAdministrativo,
router.post('/create_person',[
    check('usu_name1')
        .isString().withMessage('El primer nombre debe ser un Texto')
        .notEmpty().withMessage('El primer nombre es requerido'),

    check('usu_name2')
        .optional()
        .isString().withMessage('El segundo nombre debe ser un Texto'),

    check('usu_lastname1')
        .isString().withMessage('El primer apellido debe ser un Texto')
        .notEmpty().withMessage('El primer apellido es requerido'),

    check('usu_lastname2')
        .optional()
        .isString().withMessage('El segundo apellido debe ser un Texto'),

    check('usu_tp_person')
        .isString().withMessage('El tipo de persona debe ser un texto')
        .notEmpty().withMessage('El tipo de persona es requerido')
        .isIn(['ESTUDIANTE', 'DOCENTE', 'ADMINISTRATIVO'])
        .withMessage('El tipo de persona debe ser: ESTUDIANTE, DOCENTE o ADMINISTRATIVO'),

    check('usu_tp_id')
        .isString().withMessage('El tipo de identificación debe ser un texto')
        .notEmpty().withMessage('El tipo de identificación es requerido')
        .isIn(['CC', 'TI', 'RC', 'PE'])
        .withMessage('El tipo de identificación debe ser: CC, TI, RC o PE'),


    check('usu_identification')
        .isNumeric().withMessage('La identificación debe ser un número')
        .notEmpty().withMessage('La identificación es requerida'),
    // .custom(existIdentificacion),

    check('usu_level')
        .custom((value, { req }) => {

            const tipo = req.body.usu_tp_person;

            if (tipo === 'ADMINISTRATIVO') {
                return true; // no aplica
            }

            if (!value) {
                throw new Error('El nivel es requerido');
            }

            if (!['PREESCOLAR', 'BASICA', 'SECUNDARIA'].includes(value)) {
                throw new Error('El nivel debe ser: PREESCOLAR, BASICA o SECUNDARIA');
            }

            return true;
        }),


    check('usu_tp_reg')
        .isString().withMessage('El tipo de registro debe ser un texto')
        .notEmpty().withMessage('El tipo de registro es requerido')
        .isIn(['NUEVO', 'ANTIGUO'])
        .withMessage('El tipo de registro debe ser: NUEVO o ANTIGUO'),

    check('usu_grade')
        .custom((value, { req }) => {

            const tipo = req.body.usu_tp_person;

            if (tipo === 'ADMINISTRATIVO') {
                return true;
            }

            if (tipo === 'DOCENTE' && !value) {
                return true; // docente puede no tener grado
            }

            const level = req.body.usu_level;
            const grade = Number(value);

            if (level === 'PREESCOLAR') {
                if (value) {
                    throw new Error('PREESCOLAR no maneja grados numéricos');
                }
                return true;
            }

            if (level === 'BASICA' && (grade < 1 || grade > 5)) {
                throw new Error('BASICA solo permite grados entre 1 y 5');
            }

            if (level === 'SECUNDARIA' && (grade < 6 || grade > 11)) {
                throw new Error('SECUNDARIA solo permite grados entre 6 y 11');
            }

            return true;
        }),

    check('usu_grade_l')
        .custom((value, { req }) => {

            const tipo = req.body.usu_tp_person;

            if (tipo === 'ADMINISTRATIVO') {
                return true;
            }

            if (tipo === 'DOCENTE' && !value) {
                return true;
            }

            const level = req.body.usu_level;
            const grade = req.body.usu_grade;

            const GRADOS = {
                PREESCOLAR: ['PARVULO', 'PREJARDIN', 'JARDIN', 'TRANSICION'],
                BASICA: { 1: 'PRIMERO', 2: 'SEGUNDO', 3: 'TERCERO', 4: 'CUARTO', 5: 'QUINTO' },
                SECUNDARIA: { 6: 'SEXTO', 7: 'SEPTIMO', 8: 'OCTAVO', 9: 'NOVENO', 10: 'DECIMO', 11: 'UNDECIMO' }
            };

            if (level === 'PREESCOLAR') {
                if (!value) {
                    throw new Error('El grado escrito es requerido para preescolar');
                }
                if (!GRADOS.PREESCOLAR.includes(value.toUpperCase())) {
                    throw new Error('Grado inválido para preescolar');
                }
                return true;
            }

            const esperado = GRADOS[level]?.[grade];

            if (esperado && value.toUpperCase() !== esperado) {
                throw new Error(
                    `El grado escrito no coincide. Para grado ${grade} debe ser "${esperado}"`
                );
            }

            return true;
        }),


    check('usu_sex')
        .isString().withMessage('El sexo debe ser un texto')
        .notEmpty().withMessage('El sexo es requerido')
        .trim()
        .toUpperCase()
        .isLength({ min: 1, max: 1 }).withMessage('El sexo debe tener un solo carácter')
        .isIn(['M', 'F'])
        .withMessage('El sexo debe ser M o F'),


    check('usu_birth')
        .isDate().withMessage('La fecha de nacimiento no es válida')
        .notEmpty().withMessage('La fecha de nacimiento es requerida'),

    check('usu_place_birth')
        .isString().withMessage('El lugar de nacimiento debe ser un Texto indicando la ciudad')
        .notEmpty().withMessage('El lugar de nacimiento es requerido'),

    check('usu_cel')
        .isString().withMessage('El celular debe ser un numero')
        .isLength({ min: 10, max: 10 }).withMessage('El celular debe tener 10 dígitos'),

    check('usu_correo')
        .isEmail().withMessage('El correo no es válido')
        .notEmpty().withMessage('El correo es requerido'),
    // .custom(existEmail),

    check('usu_city')
        .isString().withMessage('La ciudad de residencia debe ser un texto')
        .notEmpty().withMessage('La ciudad de residencia es requerida'),

    check('usu_departament')
        .isString().withMessage('El departamento debe ser un texto')
        .notEmpty().withMessage('El departamento es requerido'),

    check('usu_address')
        .isString().withMessage('La dirección debe ser un texto')
        .notEmpty().withMessage('La dirección es requerida'),

    check('usu_eps')
        .isString().withMessage('La EPS debe ser un texto')
        .notEmpty().withMessage('La EPS es requerida'),

    check('usu_population')
        .optional()
        .isString().withMessage('El tipo de población debe ser un Texto')
        .notEmpty().withMessage('La población es requerida'),

    check('usu_prev_school')
        .optional()
        .isString().withMessage('El colegio Anterior debe ser un Texto'),

    check('usu_allergies')
        .optional()
        .isString().withMessage('Las alergias deben ser un texto'),

    check('usu_condition')
        .optional()
        .isString().withMessage('La condición debe ser un texto'),
], validations, create_person);

router.post(
    '/login',
    [
        check('usu_user')
            .isInt().withMessage('Debes llenar con Numeros')
            .notEmpty().withMessage('La identificación es obligatoria'),

        check('usu_password')
            .notEmpty().withMessage('La contraseña es obligatoria')
            .isLength({ min: 5 }).withMessage('Mínimo 5 caracteres'),
    ],
    validations,
    login
);

router.get('/get_users', verifyJwt, validateRolAdmin, getusers);

//Ver perfil (persona verificado - privada )-- 
router.get('/users/profile', verifyJwt, userProfile)

router.get('/users/:id_users', verifyJwt, getUserProfileByUser)

export default router;
