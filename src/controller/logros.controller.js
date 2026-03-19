import { pool } from '../config/db.js'

import { request, response } from 'express'

//* -> VERIFICA SI EN LA TABLA ES AI 
export const create_logro = async (req = request, res = response) => {

  try {

     const { report_id, per_id, cou_id, subject_cos_id, rep_performance, rep_num_logro, rep_logro } = req.body

    //validamos de que exista ya un logro para esa materia, periodo y desempeño
    const [existingLogro] = await pool.query(
      `SELECT report_id FROM AMS_REPORT 
       WHERE per_id = ? AND cou_id = ? AND subject_cos_id = ? AND rep_performance = ?`,
      [per_id, cou_id, subject_cos_id, rep_performance]
    );

    // Si ya existe, detenemos el proceso
    if (existingLogro.length > 0) {
      return res.status(400).json({ 
        message: `Ya existe un logro registrado para el desempeño ${rep_performance} en esta asignatura y periodo. Por favor, utilice la opción de actualizar.` 
      });
    }
    
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

export const update_logro = async (req, res) => {
  try {
    // Recibimos el ID del reporte (logro) por la URL
    const { report_id } = req.params;
    
    // Recibimos los datos que se van a actualizar por el body
    const { rep_logro, rep_num_logro } = req.body;

    // Actualizamos el texto del logro
    const [result] = await pool.query(
      'UPDATE AMS_REPORT SET rep_logro = ?, rep_num_logro = ? WHERE report_id = ?',
      [rep_logro, rep_num_logro, report_id]
    );

    // Si affectedRows es 0, significa que no se encontró el ID en la tabla
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Logro no encontrado en el sistema' });
    }

    const response = {
      content: null,
      status: true,
      message: 'Logro actualizado correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};