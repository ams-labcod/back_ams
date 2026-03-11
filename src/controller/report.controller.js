import { pool } from '../config/db.js'

export const getConsolidatedByCourse = async (req, res) => {
    try {
        // Obtenemos el ID del curso que queremos buscar
        const { cou_id } = req.params;

        // Opcional: Podrías recibir el periodo por query para filtrar más (?per_id=1)
        const { per_id } = req.query;

        // Construimos la consulta base
        let sqlQuery = `
      SELECT 
        c.COU_ID as CursoID,
        c.COU_LEVEL as  CursoNivel,
        c.COU_NAME_TEACH AS CURSO,
        p.PER_ID as PeriodoID,
        p.PER_NAME AS PERIODO, 
        e.EST_IDENTIFICATION AS IDENTIFICACION,
        CONCAT(e.EST_NAME, ' ', e.EST_LAST_NAME) AS ESTUDIANTE,
        cs.COS_SUBJECT_NAME AS MATERIA,
        ev.EVA_NAME AS ACTIVIDAD,
        ev.EVA_PERCENT AS PORCENTAJE,
        n.NOT_VALUE AS NOTA
      FROM AMS_COURSES c
      INNER JOIN AMS_ESTUDENTS e ON c.COU_ID = e.COU_ID
      INNER JOIN AMS_COURSE_SUBJECT cs ON c.COU_ID = cs.COU_ID
      INNER JOIN AMS_EVALUATION ev ON cs.COS_ID = ev.EVA_COS_ID
      INNER JOIN AMS_PERIOD p ON ev.EVA_PER_ID = p.PER_ID
      LEFT JOIN AMS_NOTES n ON ev.EVA_ID = n.EVA_ID AND e.EST_ID = n.NOT_EST_ID
      WHERE c.COU_ID = ?
    `;

        const queryParams = [cou_id];

        // Si además enviaron un periodo específico, lo agregamos al filtro
        if (per_id) {
            sqlQuery += ` AND p.PER_ID = ?`;
            queryParams.push(per_id);
        }

        // Ordenamos para que el reporte sea legible (Por periodo, luego por estudiante, luego por materia)
        sqlQuery += ` ORDER BY p.PER_ID ASC, e.EST_LAST_NAME ASC, cs.COS_SUBJECT_NAME ASC`;

        const [consolidado] = await pool.query(sqlQuery, queryParams);

        if (consolidado.length === 0) {
            return res.status(404).json({ message: 'No se encontraron datos para este curso. Verifica que tenga estudiantes, materias y evaluaciones creadas.' });
        }

        const response = {
            content: consolidado,
            status: true,
            message: 'Consolidado generado exitosamente'
        };

        return res.status(200).json({ data: response });

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
};


export const assignGroupDirector = async (req, res) => {

    try {
        // Recibimos el ID del profesor por los parámetros de la URL
        const { tea_peo_id } = req.params;

        // Recibimos el ID del curso que va a dirigir por el body
        const { cou_id } = req.body;

        //  Validar si el curso realmente existe
        const [course] = await pool.query('SELECT COU_ID FROM AMS_COURSES WHERE COU_ID = ?', [cou_id]);

        if (course.length === 0) {
            return res.status(404).json({ message: 'El curso especificado no existe en el sistema' });
        }

        // se asigna profesor como director de grupo
        const [result] = await pool.query(
            'UPDATE AMS_TEACHERS SET TEA_GROUP_DIR = ? WHERE TEA_PEO_ID = ?',
            [cou_id, tea_peo_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'El docente no fue encontrado' });
        }

        const response = {
            content: null,
            status: true,
            message: 'Director de grupo asignado exitosamente'
        };

        return res.status(200).json({ data: response });

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
};


//* obtener todos los cursos con sus directores
export const getAllCourseDirectors = async (req, res) => {
  try {
    const [coursesList] = await pool.query(
      `SELECT 
        c.COU_ID as CursoID,
        c.COU_LEVEL as CursoNivel,
        c.COU_NAME_TEACH AS CURSO,
        t.TEA_PEO_ID as DocenteID,
        t.TEA_NAME as DocenteNombre,
        t.TEA_LAST_NAME as DocenteApellido,
        t.TEA_IDENTIFICATION as DocenteIdentificacion
      FROM AMS_COURSES c
      LEFT JOIN AMS_TEACHERS t ON c.COU_ID = t.TEA_GROUP_DIR AND t.TEA_STATE = 'A'
      ORDER BY c.COU_LEVEL, c.COU_NAME_TEACH`
    );

    const response = {
      content: coursesList,
      status: true,
      message: 'Lista de directores por curso obtenida correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {
    console.error('❌ ERROR OBTENIENDO LISTA DE DIRECTORES:', error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al obtener la lista' });
  }
};
