import { request, response } from 'express'

import { pool } from '../config/db.js'


export const createEvaluation = async (req = request, res = response) => {

  try {
    const {
      eva_cos_id,
      // eva_per_id,
      eva_name,
      eva_tp_type,
      // eva_percent,
      eva_date
    } = req.body;

    // 1️⃣ Lógica de Negocio: Validar que los porcentajes no sumen más de 100%
    // Buscamos cuánto porcentaje ya se ha asignado a esta materia en este periodo
    // const [currentSum] = await pool.query(
    //   'SELECT SUM(EVA_PERCENT) AS total_percent FROM AMS_EVALUATION WHERE EVA_COS_ID = ? AND EVA_PER_ID = ?',
    //   [eva_cos_id, eva_per_id]
    // );

    // const totalActual = currentSum[0].total_percent || 0;

    // if ((totalActual + parseInt(eva_percent)) > 100) {
    //   return res.status(400).json({
    //     message: `No se puede crear la evaluación. El porcentaje acumulado actual es ${totalActual}%, y con esta evaluación superaría el 100%.`
    //   });
    // }

    // 2️⃣ Insertar la evaluación
    // Nota: El diagrama dice EVA_ID es INT, si no es autoincrementable deberás generar uno.
    const [result] = await pool.query(
      'INSERT INTO AMS_EVALUATION (EVA_COS_ID, EVA_NAME, EVA_TP_TYPE, EVA_DATE) VALUES (?, ?, ?, ?, ?, ?)',
      [eva_cos_id, eva_name, eva_tp_type, eva_date]
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