import { pool } from '../config/db.js'

import { request, response } from 'express'

//* -> VERIFICA SI EN LA TABLA ES AI 
export const create_logro = async (req = request, res = response) => {

  try {

    const { report_id, per_id, cou_id, subject_cos_id, rep_performance, rep_num_logro, rep_logro } = req.body

    const [data] = await pool.query('INSERT INTO AMS_REPORT (report_id, per_id, cou_id, subject_cos_id, rep_performance, rep_num_logro, rep_logro) VALUES (?,?,?,?,?,?,?)',
      [report_id, per_id, cou_id, subject_cos_id, rep_performance, rep_num_logro, rep_logro]
    )

    const response = {
      content: null,
      status: true,
      message: 'Logro creado correctamente'
    }

    return res.status(200).json({ data: response })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }

}

//* TODOS LOS PERIODOS
export const get_logros_by_course = async (req, res) => {
  const { cou_id } = req.params;
  const [data] = await pool.query(
      `SELECT 
          report_id,
          per_id,
          cou_id,
          subject_cos_id,
          rep_performance,
          rep_num_logro,
          rep_logro
       FROM AMS_REPORT
       WHERE cou_id = ?`,
      [cou_id]
    );

  if (data.length === 0) return res.status(404).json({ errorMessage: 'No hay periodos creados' })

  const result = {
    content: data,
    status: true,
    message: 'Lista de Logros por Curso'
  }

  const Data = {
    data: data
  }

  return res.status(200).json(Data)

}