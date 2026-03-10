import { request, response } from 'express'
import { pool } from '../config/db.js'


export const getAllAssitance = async (req = request, res = response) => {


    try {
        const [attendances] = await pool.query(
            `SELECT 
        a.ASS_ID, 
        a.ASS_DATE, 
        a.ASS_COMMENT,
        cs.COS_SUBJECT_NAME,
        c.COU_LEVEL, 
        c.COU_NAME_TEACH,
        e.EST_NAME, 
        e.EST_LAST_NAME, 
        e.EST_IDENTIFICATION
      FROM AMS_ASSISTANCE a
      INNER JOIN AMS_COURSE_SUBJECT cs ON a.COS_ID = cs.COS_ID
      INNER JOIN AMS_COURSES c ON cs.COU_ID = c.COU_ID
      INNER JOIN AMS_ESTUDENTS e ON a.EST_ID = e.EST_ID
      ORDER BY a.ASS_DATE DESC, c.COU_LEVEL, cs.COS_SUBJECT_NAME`
        );

        return res.status(200).json({
            data: {
                content: attendances,
                status: true,
                message: 'Todas las asistencias obtenidas correctamente'
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorMessage: 'Error en el servidor al obtener las asistencias' });
    }


}