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

  const { eva_id, not_est_id, not_value, not_date, not_type = 'NORMAL', cou_notes_id = null, not_average } = req.body

  try {

    const [validateStudent] = await pool.query('SELECT est_id FROM AMS_ESTUDENTS WHERE est_id = ? ', [not_est_id])

    const [validateEvaluation] = await pool.query('SELECT eva_id FROM AMS_EVALUATION WHERE eva_id = ?', [eva_id])

    if (validateStudent.length === 0) return res.status(400).json({ errorMessage: 'El estudiante no existe' })

    if (validateEvaluation.length === 0) return res.status(400).json({ errorMessage: 'La evaluación no existe' })

    if (cou_notes_id) {
      const [validateCriteria] = await pool.query('SELECT ID_COU_NOTES FROM AMS_COURSE_NOTES WHERE ID_COU_NOTES = ?', [cou_notes_id]);
      if (validateCriteria.length === 0) {
        return res.status(400).json({ errorMessage: 'El criterio de evaluación especificado no existe' });
      }
    }

    const [create] = await pool.query('INSERT INTO AMS_NOTES (eva_id,not_est_id,not_value,not_date, not_type, cou_notes_id, not_average) VALUES (? ,? ,? ,? ,? ,? ,? )',
      [eva_id || null, not_est_id, not_value, not_date, not_type, cou_notes_id, not_average || null])

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


export const getStudentNotes = async (req, res) => {
  try {
    // 1️⃣ Extraemos el ID de la persona (estudiante) desde su token
    const peo_id = req.user.peoId;
    
    // Recibimos el periodo por la URL (Ej: /student/notes?per_id=1)
    const { per_id } = req.query;

    if (!peo_id) {
      return res.status(401).json({ message: 'No se pudo identificar al estudiante.' });
    }

    if (!per_id) {
      return res.status(400).json({ message: 'Debe enviar el periodo a consultar (?per_id=X).' });
    }

    // 2️⃣ Consulta SQL: Traemos solo las materias y notas de ESTE estudiante en ESTE periodo
    const [rows] = await pool.query(
      `SELECT 
        cs.COS_ID AS id_materia,
        cs.COS_SUBJECT_NAME AS materia,
        ev.EVA_ID AS id_evaluacion,
        ev.EVA_NAME AS actividad,
        ev.EVA_DATE AS FechaEvaluacion,
        cn.COU_NOT_CRITERIA AS criterio,
        cn.COU_NOT_PERCENT AS porcentaje,
        n.NOT_VALUE AS nota,
        n.NOT_DATE AS FechaNota,
        n.NOT_TYPE AS TipoNota,
        n.NOT_AVERAGE AS Promedio,
        rn.REC_ID AS ID_nota_recuperacion,
        rn.REC_VALUE AS nota_recuperacion,
        rn.REC_OLD_VALUE AS nota_anterior,
        rn.REC_OBSERVATION AS observacion_recuperacion
      FROM AMS_ESTUDENTS e
      INNER JOIN AMS_COURSE_SUBJECT cs ON e.COU_ID = cs.COU_ID
      INNER JOIN AMS_EVALUATION ev ON cs.COS_ID = ev.EVA_COS_ID
      -- Unimos las notas asegurando que coincida la evaluación y el ID del estudiante
      LEFT JOIN AMS_NOTES n ON ev.EVA_ID = n.EVA_ID AND e.EST_ID = n.NOT_EST_ID
      -- Unimos los criterios (DBA, DB, etc.) si existen
      LEFT JOIN AMS_COURSE_NOTES cn ON ev.COU_NOTES_ID = cn.ID_COU_NOTES
      LEFT JOIN AMS_RECOVERY_NOTES rn ON ev.EVA_ID = rn.EVA_ID AND e.EST_ID = rn.EST_ID
      WHERE e.EST_PEO_ID = ? AND ev.EVA_PER_ID = ? AND cs.COS_STATE = 'A'
      ORDER BY cs.COS_SUBJECT_NAME ASC, ev.EVA_DATE ASC`,
      [peo_id, per_id]
    );

    if (rows.length === 0) {
      // Devolvemos un content vacío pero con status 200, significa que no hay notas aún
      return res.status(200).json({ 
        data: { content: [], status: true, message: 'No hay notas registradas para este periodo.' } 
      });
    }

    // 3️⃣ Magia de JavaScript: Agrupar por materias para armar el JSON que pide el Frontend
    const groupedData = {};

    rows.forEach(row => {
      // Si la materia aún no existe en nuestro objeto agrupador, la creamos
      if (!groupedData[row.id_materia]) {
        groupedData[row.id_materia] = {
          id_materia: row.id_materia,
          materia: row.materia,
          notas: []
        };
      }

      // Si hay una evaluación creada, empujamos la nota al arreglo de esa materia
      if (row.id_evaluacion) {
        groupedData[row.id_materia].notas.push({
          id_evaluacion: row.id_evaluacion,
          actividad: row.actividad,
          fechaEvaluacion: row.FechaEvaluacion,
          criterio: row.criterio || "Sin criterio",
          porcentaje: row.porcentaje || 0,
          nota: row.nota !== null ? row.nota : null, // Null si el profe aún no ha calificado
          ID_nota_recuperacion: row_ID_nota_recuperacion,
          notaRecuperacion: row.nota_recuperacion,
          notaAnterior: row.nota_anterior,
          observacionRecuperacion: row.observacion_recuperacion
        });
      }
    });

    // Convertimos nuestro objeto agrupador en un Arreglo (Array) limpio
    const contentArray = Object.values(groupedData);

    // 4️⃣ Respuesta Final: Exactamente el formato que solicitó el Frontend
    return res.status(200).json({
      data: {
        content: contentArray,
        status: true,
        message: 'Notas del estudiante obtenidas correctamente'
      }
    });

  } catch (error) {
    console.error('❌ ERROR OBTENIENDO NOTAS DEL ESTUDIANTE:', error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al obtener las notas' });
  }
};