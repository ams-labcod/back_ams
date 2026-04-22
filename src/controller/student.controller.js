import { pool } from '../config/db.js'

//* para estudiante tambien debe poder ver sus asignaturas respectivas, junto con el grado en el que este
export const getStudentSubjects = async (req, res) => {
    try {
        // 1️⃣ Obtenemos el ID de la persona desde el token JWT 
        const { peoId } = req.user;

        // 2️⃣  JOIN para traer su curso, materias y profesores
        const [subjects] = await pool.query(
            `SELECT 
        c.COU_LEVEL AS NIVEL,
        c.COU_NAME_TEACH AS GRADO,
        cs.COS_ID AS ID_MATERIA,
        cs.COS_SUBJECT_NAME AS ASIGNATURA,
        t.TEA_NAME AS PROFESOR_NOMBRE,
        t.TEA_LAST_NAME AS PROFESOR_APELLIDO,
        t.TEA_IDENTIFICATION AS PROFESOR_IDENTIFICACION
      FROM AMS_ESTUDENTS e
      INNER JOIN AMS_COURSES c ON e.COU_ID = c.COU_ID
      INNER JOIN AMS_COURSE_SUBJECT cs ON c.COU_ID = cs.COU_ID
      LEFT JOIN AMS_TEACHERS t ON cs.TEA_PEO_ID = t.TEA_PEO_ID
      WHERE e.EST_PEO_ID = ? AND cs.COS_STATE = 'A'`,
            [peoId]
        );

        // 3️⃣ Validamos si el estudiante está matriculado en un curso que tenga materias
        if (subjects.length === 0) return res.status(404).json({message: 'No se encontraron asignaturas. Verifica que estés matriculado en un curso y que el curso tenga materias asignadas.'});
        
        // 4️⃣ Preparamos la data para la response
        const studentData = {
            nivel: subjects[0].NIVEL,
            grado: subjects[0].GRADO,
            asignaturas: subjects.map(sub => ({
                id_materia: sub.ID_MATERIA,
                nombre: sub.ASIGNATURA,
                profesor: `${sub.PROFESOR_NOMBRE || 'Sin'} ${sub.PROFESOR_APELLIDO || 'Asignar'}`
            }))
        };

        const response = {
            content: studentData,
            status: true,
            message: 'Asignaturas del estudiante obtenidas correctamente'
        };

        return res.status(200).json({ data: response });

    } catch (error) {
        
        console.error('❌ ERROR OBTENIENDO ASIGNATURAS DEL ESTUDIANTE:', error);

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
};


export const getAllStudents = async (req, res) => {
  try {
    // Consultamos todos los cursos
    const [student] = await pool.query('SELECT * FROM AMS_ESTUDENTS');

    const response = {
      content: student,
      status: true,
      message: 'Estudiantes obtenidos correctamente'
    };

    const data = {
      data: response
    };

    return res.status(200).json(data);

  } catch (error) {
    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })
  }
};

//* Notas del estudiante logueado
export const getMyGrades = async (req, res) => {
  try {
    // 1️⃣ Extraemos el ID de la persona desde su token
    const peo_id = req.user.peoId;

    // Opcional: El frontend puede enviar un periodo específico (?per_id=1)
    const { per_id } = req.query;

    if (!peo_id) {
      return res.status(401).json({ message: 'No se pudo identificar al estudiante desde el token.' });
    }

    // 2️⃣ Construimos la consulta base filtrando estrictamente por el EST_PEO_ID
    let sqlQuery = `
      SELECT 
        c.COU_ID as CursoID,
        c.COU_LEVEL as CursoNivel,
        c.COU_NAME_TEACH AS CURSO,
        p.PER_ID as PeriodoID,
        p.PER_NAME AS PERIODO, 
        cs.COS_SUBJECT_NAME AS MATERIA,
        ev.EVA_NAME AS ACTIVIDAD,
        n.NOT_VALUE AS NOTA,
        n.NOT_TYPE AS TIPO_NOTA,
       conv.CON_NOTE AS NOTA_CONVIVENCIA,
       conv.CON_FINAL_NOTE AS NOTA_CONVIVENCIA_FINAL,
       conv.CON_ACTIVITY AS ACTIVIDAD_CONVIVENCIA,
       conv.COU_ID AS CURSO_CONVIVENCIA,
       conv.EST_ID AS ESTUDIANTE_CONVIVENCIA
      FROM AMS_ESTUDENTS e
      INNER JOIN AMS_COURSES c ON e.COU_ID = c.COU_ID
      INNER JOIN AMS_COURSE_SUBJECT cs ON c.COU_ID = cs.COU_ID
      INNER JOIN AMS_EVALUATION ev ON cs.COS_ID = ev.EVA_COS_ID
      INNER JOIN AMS_PERIOD p ON ev.EVA_PER_ID = p.PER_ID
      LEFT JOIN AMS_NOTES n ON ev.EVA_ID = n.EVA_ID AND e.EST_ID = n.NOT_EST_ID
      LEFT JOIN AMS_CONVIVENCIA conv ON e.EST_ID = conv.EST_ID 
      AND p.PER_ID = conv.PER_ID 
      AND c.COU_ID = conv.COU_ID
      WHERE e.EST_PEO_ID = ? AND cs.COS_STATE = 'A'
    `;

    const queryParams = [peo_id];

    // 3️⃣ Filtro opcional por periodo
    if (per_id) {
      sqlQuery += ` AND p.PER_ID = ?`;
      queryParams.push(per_id);
    }

    // Ordenamos por Periodo y luego por Materia
    sqlQuery += ` ORDER BY p.PER_ID ASC, cs.COS_SUBJECT_NAME ASC`;

    const [rows] = await pool.query(sqlQuery, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron calificaciones o no estás matriculado en un curso válido.' });
    }

    // 4️⃣ Formateamos el JSON para hacerle la vida fácil al frontend
    const response = {
      CursoID: rows[0].CursoID,
      CursoNivel: rows[0].CursoNivel,
      CURSO: rows[0].CURSO,
      calificaciones: rows.map(row => ({
        PeriodoID: row.PeriodoID,
        PERIODO: row.PERIODO,
        MATERIA: row.MATERIA,
        ACTIVIDAD: row.ACTIVIDAD,
        NOTA: row.NOTA !== null ? row.NOTA : 'Sin calificar',
        TIPO_NOTA: row.TIPO_NOTA || 'NORMAL'
      }))
    };

    return res.status(200).json({ 
      data: {
        content: response,
        status: true,
        message: 'Calificaciones obtenidas correctamente'
      }
    });

  } catch (error) {
    console.error('❌ ERROR OBTENIENDO MIS NOTAS:', error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al obtener las notas' });
  }
};




//* calcular puesto - estudiante
export const getGradesForRanking = async (req, res) => {
  try {
    // 1. Recibimos el curso y el periodo desde la URL (?cou_id=X&per_id=Y)
    const { cou_id, per_id } = req.query;

    if (!cou_id || !per_id) {
      return res.status(400).json({
        status: false,
        message: 'Debe especificar el curso (cou_id) y el periodo (per_id)'
      });
    }

    // 2. Consulta SQL: Unimos Estudiantes, Materias, Evaluaciones, Notas y Criterios
    const [rows] = await pool.query(
      `SELECT 
        e.EST_PEO_ID AS peo_id,
        e.EST_ID AS id_estudiante,
        cn.COU_NOT_CRITERIA AS criterio,
        cn.COU_NOT_PERCENT AS porcentaje,
        n.NOT_VALUE AS nota
      FROM AMS_ESTUDENTS e
      INNER JOIN AMS_COURSE_SUBJECT cs ON e.COU_ID = cs.COU_ID
      INNER JOIN AMS_EVALUATION ev ON cs.COS_ID = ev.EVA_COS_ID
      INNER JOIN AMS_COURSE_NOTES cn ON ev.COU_NOTES_ID = cn.ID_COU_NOTES
      INNER JOIN AMS_NOTES n ON ev.EVA_ID = n.EVA_ID AND e.EST_ID = n.NOT_EST_ID
      WHERE e.COU_ID = ? AND ev.EVA_PER_ID = ?
      ORDER BY e.EST_ID ASC`,
      [cou_id, per_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No se encontraron notas para este curso en el periodo indicado.'
      });
    }

    // 3. Transformación de los datos al JSON solicitado
    const groupedData = {};

    rows.forEach(row => {
      // Si el estudiante aún no existe en nuestro objeto, lo creamos
      if (!groupedData[row.id_estudiante]) {
        groupedData[row.id_estudiante] = {
          id_estudiante: row.id_estudiante,
          peo_id: row.peo_id,
          notas: []
        };
      }

      // Insertamos la nota en el arreglo del estudiante correspondiente
      groupedData[row.id_estudiante].notas.push({
        criterio: row.criterio,
        porcentaje: row.porcentaje,
        nota: row.nota !== null ? Number(row.nota) : 0 // Convertimos a número por seguridad
      });
    });

    // 4. Convertimos el objeto agrupado en un arreglo plano
    const finalArray = Object.values(groupedData);

    return res.status(200).json({
      data: {
        content: finalArray,
        status: true,
        message: 'Notas obtenidas correctamente para el cálculo de puestos'
      }
    });

  } catch (error) {
    console.error('❌ ERROR OBTENIENDO NOTAS PARA RANKING:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor al obtener las notas',
      error: error.message
    });
  }
};