import { request, response } from 'express'

import { pool } from '../config/db.js'


//* Obtener todas las notas de todas las asignaturas
export const getAllNotes = async (req = request, res = response) => {
  try {
    const [notes] = await pool.query(
      `SELECT 
        n.NOT_ID, 
        n.NOT_VALUE, 
        n.NOT_DATE,
        ev.EVA_NAME, 
        cs.COS_SUBJECT_NAME,
        c.COU_LEVEL, 
        c.COU_NAME_TEACH,
        e.EST_NAME, 
        e.EST_LAST_NAME, 
        e.EST_IDENTIFICATION
      FROM AMS_NOTES n
      INNER JOIN AMS_EVALUATION ev ON n.EVA_ID = ev.EVA_ID
      INNER JOIN AMS_COURSE_SUBJECT cs ON ev.EVA_COS_ID = cs.COS_ID
      INNER JOIN AMS_COURSES c ON cs.COU_ID = c.COU_ID
      INNER JOIN AMS_ESTUDENTS e ON n.NOT_EST_ID = e.EST_ID
      ORDER BY c.COU_LEVEL, cs.COS_SUBJECT_NAME, e.EST_LAST_NAME`
    );

    return res.status(200).json({
      data: {
        content: notes,
        status: true,
        message: 'Todas las notas obtenidas correctamente'
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({ errorMessage: 'Error en el servidor al obtener las notas' });
  }

}

export const createNote = async (req = request, res = response) => {

  const { eva_id, not_est_id, not_value, not_date } = req.body

  try {

    const [validateStudent] = await pool.query('SELECT est_id FROM AMS_ESTUDENTS WHERE est_id = ? ', [not_est_id])

    const [validateEvaluation] = await pool.query('SELECT eva_id FROM AMS_EVALUATION WHERE eva_id = ?', [eva_id])

    if (validateStudent.length ===  0) return res.status(400).json({ errorMessage: 'El estudiante no existe' })

    if (validateEvaluation.length ===  0) return res.status(400).json({ errorMessage: 'La evaluación no existe' })

    const [create] = await pool.query('INSERT INTO AMS_NOTES (eva_id,not_est_id,not_value,not_date) VALUES (?,?,?,?)',
      [eva_id, not_est_id, not_value, not_date])

    const response = {

      content: null,
      status: true,
      message: 'Nota Creada Correctamente'
    }

    const data = {
      data: response
    }

    return res.status(200).json(data)

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }
}
