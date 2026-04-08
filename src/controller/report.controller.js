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

// * Obtener únicamente el director de grupo del estudiante logueado
export const getMyDirector = async (req, res) => {
  try {
    // 1️⃣ Extraemos el ID del estudiante desde su JWT
    const peo_id = req.user.peoId;

    if (!peo_id) {
      return res.status(401).json({ message: 'No se pudo identificar al estudiante desde el token.' });
    }

    // 2️⃣ Consulta SQL optimizada para traer solo lo necesario
    const [result] = await pool.query(
      `SELECT 
        t.TEA_NAME AS DocenteNombre, 
        t.TEA_LAST_NAME AS DocenteApellido, 
        e.COU_ID AS CursoID
      FROM AMS_ESTUDENTS e
      LEFT JOIN AMS_TEACHERS t ON e.COU_ID = t.TEA_GROUP_DIR AND t.TEA_STATE = 'A'
      WHERE e.EST_PEO_ID = ?`,
      [peo_id]
    );

    // 3️⃣ Validamos si el estudiante existe
    if (result.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado en el sistema.' });
    }

    const directorData = result[0];

    // 4️⃣ Armamos la respuesta EXACTAMENTE como la pidió el frontend
    return res.status(200).json({
      data: {
        DocenteNombre: directorData.DocenteNombre || "Sin asignar",
        DocenteApellido: directorData.DocenteApellido || "",
        CursoID: directorData.CursoID
      }
    });

  } catch (error) {
    console.error('❌ ERROR OBTENIENDO MI DIRECTOR:', error);
    return res.status(500).json({ errorMessage: 'Error en el servidor al obtener el director de grupo' });
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

// //* Planilla del profesor
// export const getTeacherGradebook = async (req, res) => {
//   try {
//     // 1️⃣ ID del profesor desde el token
//     const tea_peo_id = req.user.tea_peo_id;

//     // 2️⃣ El periodo debe venir por la URL (Ej: /teacher/gradebook?per_id=1)
//     const { per_id } = req.query;

//     const [validatePeriod] = await pool.query('SELECT PER_ID FROM AMS_PERIOD WHERE PER_ID = ? ', per_id)

//     if(validatePeriod.length === 0) return res.status(400).json({errorMessage: 'El periodo ingesado no existe'})

//     if (!tea_peo_id) {
//       console.log(tea_peo_id)
//       return res.status(403).json({ message: 'Acceso denegado: Perfil docente no encontrado.' });
//     }

//     if (!per_id) {
//       return res.status(400).json({ message: 'Debe especificar el periodo académico (?per_id=X)' });
//     }

//     // 🌟 NUEVO: Obtenemos los criterios de evaluación que el profe configuró para este periodo
//     const [criterios] = await pool.query(
//       'SELECT COU_NOT_CRITERIA AS criterio, COU_NOT_PERCENT AS porcentaje FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ?',
//       [per_id, tea_peo_id]
//     );

//     // 3️⃣ La Súper Consulta SQL con LEFT JOINs estratégicos
//     const [rows] = await pool.query(
//       `SELECT 
//         t.TEA_NAME, 
//         t.TEA_LAST_NAME,
//         c.COU_ID, 
//         c.COU_LEVEL, 
//         c.COU_NAME_TEACH AS CURSO,
//         cs.COS_ID, 
//         cs.COS_SUBJECT_NAME AS ASIGNATURA,
//         e.EST_ID, 
//         e.EST_IDENTIFICATION, 
//         e.EST_NAME, 
//         e.EST_LAST_NAME,
//         ev.EVA_ID, 
//         ev.EVA_NAME AS ACTIVIDAD, 
//         ev.EVA_PERCENT,
//         n.NOT_VALUE,
//         cn.ID_cou_notes AS Id_notas_del_curso,
//         cn.PER_ID,
//         cn.cou_not_criteria AS criterio,
//         cn.cou_not_percent AS porcentaje_criterio,
//         cn.TEA_ID
//       FROM AMS_COURSE_SUBJECT cs
//       INNER JOIN AMS_TEACHERS t ON cs.TEA_PEO_ID = t.TEA_PEO_ID
//       INNER JOIN AMS_COURSES c ON cs.COU_ID = c.COU_ID
//       -- Hacemos LEFT JOIN a los estudiantes por si el curso aún no tiene matriculados
//       LEFT JOIN AMS_ESTUDENTS e ON c.COU_ID = e.COU_ID
//       -- LEFT JOIN a evaluaciones filtrando POR EL PERIODO SOLICITADO
//       LEFT JOIN AMS_EVALUATION ev ON cs.COS_ID = ev.EVA_COS_ID AND ev.EVA_PER_ID = ?
//       -- LEFT JOIN a las notas por si el estudiante aún no ha sido calificado
//       LEFT JOIN AMS_NOTES n ON ev.EVA_ID = n.EVA_ID AND e.EST_ID = n.NOT_EST_ID
//       LEFT JOIN AMS_COURSE_NOTES cn 
//       ON cn.PER_ID = ev.EVA_PER_ID 
//       AND cn.TEA_ID = t.TEA_PEO_ID
//       WHERE cs.TEA_PEO_ID = ? AND cs.COS_STATE = 'A'
//       ORDER BY c.COU_LEVEL, c.COU_NAME_TEACH, cs.COS_SUBJECT_NAME, e.EST_LAST_NAME, ev.EVA_DATE ASC`,
//       [per_id, tea_peo_id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'No se encontró carga académica para este docente.' });
//     }

//     // 4️⃣ Transformar la data plana de SQL a un JSON estructurado
//     const groupedData = {};
//     const profesorInfo = `${rows[0].TEA_NAME} ${rows[0].TEA_LAST_NAME}`;

//     rows.forEach(row => {
//       // Agrupamos por Curso + Materia
//       const courseSubjKey = `${row.COU_ID}-${row.COS_ID}`;
//       console.log(groupedData)  

//       if (!groupedData[courseSubjKey]) {
//         groupedData[courseSubjKey] = {
//           id_curso: row.COU_ID,
//           nivel: row.COU_LEVEL,
//           curso: row.CURSO,
//           id_materia: row.COS_ID,
//           materia: row.ASIGNATURA,
//           estudiantes: {},
//           criterios: {}
//         };
//       }

//       // Agrupamos los estudiantes dentro de esa materia
//       if (row.EST_ID) {
//         if (!groupedData[courseSubjKey].estudiantes[row.EST_ID]) {
//           groupedData[courseSubjKey].estudiantes[row.EST_ID] = {
//             id_estudiante: row.EST_ID,
//             identificacion: row.EST_IDENTIFICATION,
//             nombre: row.EST_NAME,
//             apellido: row.EST_LAST_NAME,
//             notas: []
//           };
//         }

//         // Si hay una evaluación (actividad) en este periodo, la metemos al estudiante
//         if (row.EVA_ID) {
//           groupedData[courseSubjKey].estudiantes[row.EST_ID].notas.push({
//             id_evaluacion: row.EVA_ID,
//             actividad: row.ACTIVIDAD,
//             criterio: row.criterio, 
//             porcentaje: row.EVA_PERCENT,
//             nota: row.NOT_VALUE !== null ? row.NOT_VALUE : null
//           });
//         }
//       }
//     });

//     // 5️⃣ Convertimos los objetos temporales en arreglos limpios para el Frontend
//     const cargaAcademica = Object.values(groupedData).map(course => ({
//       ...course,
//       estudiantes: Object.values(course.estudiantes)
//     }));

//     // 6️⃣ Respuesta Final
//     const response = {
//       content: {
//         profesor: profesorInfo,
//         periodo_consultado: per_id,
//         criterios_evaluacion: criterios.length > 0 ? criterios : "El docente no ha configurado los criterios (DBA, DB, etc.) para este periodo.",
//         carga_academica: cargaAcademica
//       },
//       status: true,
//       message: 'Planilla de calificaciones obtenida correctamente'
//     };

//     return res.status(200).json({ data: response });

//   } catch (error) {
//     console.error('❌ ERROR OBTENIENDO PLANILLA DEL DOCENTE:', error);
//     return res.status(500).json({
//       status: false,
//       message: 'Error interno del servidor',
//       error: error.message
//     });
//   }
// };

//* Planilla académica general
export const getTeacherGradebook = async (req, res) => {
  try {

    // 1️⃣ Periodo desde la URL
    const { per_id } = req.query;

    if (!per_id) {
      return res.status(400).json({
        message: 'Debe especificar el periodo académico (?per_id=X)'
      });
    }

    // 2️⃣ Validar periodo
    const [validatePeriod] = await pool.query(
      'SELECT PER_ID FROM AMS_PERIOD WHERE PER_ID = ?',
      [per_id]
    );

    if (validatePeriod.length === 0) {
      return res.status(400).json({
        errorMessage: 'El periodo ingresado no existe'
      });
    }

    // 3️⃣ Obtener criterios del periodo
    const [criterios] = await pool.query(
      `SELECT 
        COU_NOT_CRITERIA AS criterio,
        COU_NOT_PERCENT AS porcentaje
      FROM AMS_COURSE_NOTES
      WHERE PER_ID = ?`,
      [per_id]
    );

    // 4️⃣ Consulta principal
    const [rows] = await pool.query(
      `SELECT 
        t.TEA_NAME, 
        t.TEA_LAST_NAME,
        c.COU_ID, 
        c.COU_LEVEL, 
        c.COU_NAME_TEACH AS CURSO,
        cs.COS_ID, 
        cs.COS_SUBJECT_NAME AS ASIGNATURA,
        e.EST_ID, 
        e.EST_IDENTIFICATION, 
        e.EST_NAME, 
        e.EST_LAST_NAME,
        ev.EVA_ID, 
        ev.EVA_NAME AS ACTIVIDAD, 
        ev.EVA_DATE,
        cn.ID_COU_NOTES AS CRITERIO_ID,
        cn.COU_NOT_CRITERIA AS CRITERIO,
        cn.COU_NOT_PERCENT AS PORCENTAJE,
        n.NOT_VALUE,
        n.NOT_TYPE,
        n.COU_NOTES_ID
      FROM AMS_COURSE_SUBJECT cs
      INNER JOIN AMS_TEACHERS t 
        ON cs.TEA_PEO_ID = t.TEA_PEO_ID
      INNER JOIN AMS_COURSES c 
        ON cs.COU_ID = c.COU_ID
      LEFT JOIN AMS_ESTUDENTS e 
        ON c.COU_ID = e.COU_ID
      LEFT JOIN AMS_EVALUATION ev 
        ON cs.COS_ID = ev.EVA_COS_ID 
        AND ev.EVA_PER_ID = ?
      LEFT JOIN AMS_NOTES n 
        ON ev.EVA_ID = n.EVA_ID 
        AND e.EST_ID = n.NOT_EST_ID
  LEFT JOIN AMS_COURSE_NOTES cn
  ON ev.COU_NOTES_ID = cn.ID_COU_NOTES
      WHERE cs.COS_STATE = 'A'
      ORDER BY 
        c.COU_LEVEL,
        c.COU_NAME_TEACH,
        cs.COS_SUBJECT_NAME,
        e.EST_LAST_NAME,
        ev.EVA_DATE ASC`,
      [per_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No se encontró información académica para este periodo.'
      });
    }

    // 5️⃣ Transformar SQL plano a JSON
    const groupedData = {};
    const profesorInfo = `${rows[0].TEA_NAME} ${rows[0].TEA_LAST_NAME}`;

    rows.forEach(row => {

      const courseSubjKey = `${row.COU_ID}-${row.COS_ID}`;

      if (!groupedData[courseSubjKey]) {
        groupedData[courseSubjKey] = {
          id_curso: row.COU_ID,
          nivel: row.COU_LEVEL,
          curso: row.CURSO,
          id_materia: row.COS_ID,
          materia: row.ASIGNATURA,
          estudiantes: {}
        };
      }

      if (row.EST_ID) {

        if (!groupedData[courseSubjKey].estudiantes[row.EST_ID]) {
          groupedData[courseSubjKey].estudiantes[row.EST_ID] = {
            id_estudiante: row.EST_ID,
            identificacion: row.EST_IDENTIFICATION,
            nombre: row.EST_NAME,
            apellido: row.EST_LAST_NAME,
            notas: []
          };
        }

        if (row.EVA_ID) {

          groupedData[courseSubjKey].estudiantes[row.EST_ID].notas.push({
            id_evaluacion: row.EVA_ID,
            actividad: row.ACTIVIDAD,
            criterio: row.CRITERIO,
            porcentaje: row.PORCENTAJE,
            nota: row.NOT_VALUE !== null ? row.NOT_VALUE : null,
            tipo_nota: row.NOT_TYPE,
            criterio_nota_id : row.COU_NOTES_ID
          });

        }

      }

    });

    // 6️⃣ Convertir objetos a arrays
    const cargaAcademica = Object.values(groupedData).map(course => ({
      ...course,
      estudiantes: Object.values(course.estudiantes)
    }));

    // 7️⃣ Respuesta final
    const response = {
      content: {
        profesor: profesorInfo,
        periodo_consultado: per_id,
        criterios_evaluacion:
          criterios.length > 0
            ? criterios
            : "No se han configurado criterios para este periodo.",
        carga_academica: cargaAcademica
      },
      status: true,
      message: 'Planilla de calificaciones obtenida correctamente'
    };

    return res.status(200).json({ data: response });

  } catch (error) {

    console.error('❌ ERROR OBTENIENDO PLANILLA:', error);

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    });

  }
};
