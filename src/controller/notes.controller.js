import { request, response } from 'express'

import {pool} from '../config/db.js'

//* Obtener todas las notas de todas las asignaturas
export const getAllNotes = async (req = request, res = response ) => {
    try {
    const [notes] = await pool.query(
      `SELECT 
        n.NOT_ID, 
        n.NOT_VALUE, 
        n.NOT_DATE,
        ev.EVA_NAME, 
        ev.EVA_PERCENT,
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