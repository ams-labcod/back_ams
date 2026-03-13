import { request, response } from 'express'

import { pool } from '../config/db.js'


export const createEvaluation = async (req = request, res = response) => {

  try {
    const {
      eva_cos_id,
      eva_per_id,
      eva_name,
      eva_tp_type,
      eva_percent,
      eva_date,
      cou_notes_id
    } = req.body;

    const [validatePeriod] = pool.query('select PER_ID from AMS_PERIOD WHERE PER_ID = ?', [eva_per_id])

    if(validatePeriod.length === 0) return res.status(404).json({errorMessage: 'El periodo no existe'})

    // 2️⃣ Insertar la evaluación
    // Nota: El diagrama dice EVA_ID es INT, si no es autoincrementable deberás generar uno.
    const [result] = await pool.query(
      'INSERT INTO AMS_EVALUATION (EVA_COS_ID, EVA_PER_ID, EVA_NAME, EVA_TP_TYPE, EVA_DATE, COU_NOTES_ID) VALUES (?,?, ?, ?, ?, ?)',
      [eva_cos_id, eva_per_id, eva_name, eva_tp_type, eva_percent, eva_date, cou_notes_id]
    );

    return res.status(201).json({
      data: {
        content: null,
        status: true,
        message: 'Actividad de evaluación creada correctamente'
      }
    });


  } catch (error) {

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ errorMessage: 'Error de integridad: El periodo, materia o tipo de evaluación no existen.' });
    }
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};