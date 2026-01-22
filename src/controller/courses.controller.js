import { pool } from '../config/db.js'
import { salt } from '../utils/salt.js'
import bcrypt from 'bcrypt'
import { generateJwt } from '../helpers/generate-jwt.js'

export const create_course = async (req, res) => {

  const {
    cou_level,
    cou_name_teach,
    cou_num_courses,
    cou_theme
  } = req.body;

  try {

     // Normalizar
    // cou_level = cou_level.trim().toUpperCase();
    // cou_name_teach = cou_name_teach.trim().toUpperCase();

    // 🎒 Regla PREESCOLAR
    if (cou_level === 'PREESCOLAR') {
      cou_num_courses = null;
    }
    
        // 🔍 Validar si el curso ya existe
    const [exists] = await pool.query(
      'SELECT 1 FROM AMS_COURSES WHERE COU_LEVEL = ? AND COU_NAME_TEACH = ? AND COU_STATE = "A" LIMIT 1',
      [cou_level, cou_name_teach]
    );

      if (exists.length > 0) {
      return res.status(409).json({
        status: false,
        message: 'El curso ya existe'
      });
    }
    
    // 🧱 Insertar curso
    const [result] = await pool.query(
     'INSERT INTO AMS_COURSES (COU_LEVEL, COU_NAME_TEACH, COU_NUM_COURSE, COU_THEME, COU_STATE) VALUES (?, ?, ?, ?, ?)',
      [
        cou_level,
        cou_name_teach,
        cou_num_courses || null,
        cou_theme || null,
        'A'
      ]
    );

    return res.status(201).json({
      status: true,
      message: 'Curso creado correctamente',
      data: {
        cou_id: result.insertId
      }
    });

  } catch (error) {
    console.error('❌ ERROR CREATE_COURSE');
    console.error(error);

    return res.status(500).json({
      status: false,
      message: 'Error en el servidor'
    });
  }
};