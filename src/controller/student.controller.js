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