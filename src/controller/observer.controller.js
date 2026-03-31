import { pool } from '../config/db.js';

export const saveObserver = async (req, res) => {
  let connection;
  try {
    // 1️⃣ Obtener datos del token (quién hace la petición)
    const peo_id = req.user.peoId;
    const usu_role = req.user.usu_role; // Necesitamos saber si es ROL_ADMIN o ROL_TEACHER
    
    const {
      est_id, //id estudiante
      per_id, //id periodo
      obs_strengths, //fortalezas
      obs_difficulties, //dificultades
      obs_commitments, //comentarios
      obs_coexistence //convivencia
    } = req.body;

    if (!est_id || !per_id) {
      return res.status(400).json({ message: 'El ID del estudiante y el periodo son obligatorios.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 3️⃣ VALIDACIÓN DE SEGURIDAD: ¿Es el director de grupo correcto?
    // Si el usuario NO es administrador, tenemos que validar su curso
    if (usu_role !== 'ROL_ADMINISTRATIVO') {
      
      // A. Buscamos en qué curso está matriculado el estudiante
      const [student] = await connection.query(
        'SELECT COU_ID FROM AMS_ESTUDENTS WHERE EST_ID = ?',
        [est_id]
      );

      if (student.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Estudiante no encontrado en el sistema.' });
      }

      const studentCourse = student[0].COU_ID;

      // B. Buscamos de qué curso es director este profesor
      const [teacher] = await connection.query(
        'SELECT TEA_GROUP_DIR FROM AMS_TEACHERS WHERE TEA_PEO_ID = ?',
        [peo_id]
      );

      // C. Si no es director de nada, o si su curso dirigido no coincide con el del estudiante: Bloqueo
      if (teacher.length === 0 || teacher[0].TEA_GROUP_DIR !== studentCourse) {
        await connection.rollback();
        return res.status(403).json({
          message: 'Acceso denegado: Solo el director de grupo de este curso puede modificar el observador del estudiante.'
        });
      }
    }

    // 4️⃣ LÓGICA UPSERT: Guardar o Actualizar en un solo paso
    await connection.query(
      `INSERT INTO AMS_OBSERVER 
        (EST_ID, PER_ID, OBS_STRENGTHS, OBS_DIFFICULTIES, OBS_COMMITMENTS, OBS_COEXISTENCE, PEO_ID) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        OBS_STRENGTHS = VALUES(OBS_STRENGTHS),
        OBS_DIFFICULTIES = VALUES(OBS_DIFFICULTIES),
        OBS_COMMITMENTS = VALUES(OBS_COMMITMENTS),
        OBS_COEXISTENCE = VALUES(OBS_COEXISTENCE),
        PEO_ID = VALUES(PEO_ID)`, // Actualizamos quién fue el último en editarlo
      [
        est_id, 
        per_id, 
        obs_strengths || '',      // Si mandan vacío, guardamos string vacío en vez de null
        obs_difficulties || '', 
        obs_commitments || '', 
        obs_coexistence || '', 
        peo_id
      ]
    );

    await connection.commit();

    return res.status(200).json({
      data: {
        content: null,
        status: true,
        message: 'Observador del estudiante guardado correctamente.'
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ ERROR GUARDANDO OBSERVADOR:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor al guardar el observador',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};