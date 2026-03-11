import { response, request } from 'express';
import { pool } from '../config/db.js';

export const create_criteria = async (req = request, res = response) => {

  const {
    cri_note_min,
    cri_note_max,
    cri_passing_grade,
    cri_academics_breaks
  } = req.body;

  // 🔐 PEO_ID desde el token
  const peo_id = req.user.peoId;

  let connection;

  try {

    if (!peo_id) {
      return res.status(401).json({
        status: false,
        message: 'No fue posible identificar al usuario'
      });
    }

    // 1️⃣ Obtener conexión
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2️⃣ Insertar criterio
    const [result] = await connection.query(
      `
      INSERT INTO AMS_CRITERIA
      (
        CRI_NOTE_MIN,
        CRI_NOTE_MAX,
        CRI_PASSING_GRADE,
        CRI_ACADEMICS_BREAKS,
        CRI_STATE,
        PEO_ID
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        cri_note_min,
        cri_note_max,
        cri_passing_grade,
        cri_academics_breaks,
        'A',
        peo_id
      ]
    );

    // 3️⃣ Confirmar transacción
    await connection.commit();

    return res.status(201).json({
      status: true,
      message: 'Criterio creado correctamente'
    });

  } catch (error) {

    if (connection) await connection.rollback();

    console.error('❌ ERROR CREATE_CRITERIA');

    console.error(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  } finally {
    if (connection) connection.release();
  }
};
