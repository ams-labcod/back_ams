import { response, request } from 'express';
import { pool } from '../config/db.js';

// export const create_criteria = async (req = request, res = response) => {

//   const {
//     cri_note_min,
//     cri_note_max,
//     cri_passing_grade,
//     cri_academics_breaks
//   } = req.body;

//   // 🔐 PEO_ID desde el token
//   const peo_id = req.user.peoId;

//   let connection;

//   try {

//     if (!peo_id) {
//       return res.status(401).json({
//         status: false,
//         message: 'No fue posible identificar al usuario'
//       });
//     }

//     // 1️⃣ Obtener conexión
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Consultar si YA existe un registro de criterios en la tabla
//     const [existingCriteria] = await connection.query('SELECT * FROM AMS_CRITERIA LIMIT 1');


//     if (existingCriteria.length > 0) {
//       //modo actualizacion
//       const idCriterio = existingCriteria[0].CRI_ID;

//       await connection.query(
//         `
//         UPDATE AMS_CRITERIA 
//         SET 
//           CRI_NOTE_MIN = ?, 
//           CRI_NOTE_MAX = ?, 
//           CRI_PASSING_GRADE = ?, 
//           CRI_ACADEMICS_BREAKS = ?, 
//           PEO_ID = ?
//         WHERE CRI_ID = ?
//         `,
//         [cri_note_min, cri_note_max, cri_passing_grade, cri_academics_breaks, peo_id, idCriterio]
//       );

//       await connection.commit();

//       return res.status(200).json({
//         status: true,
//         message: 'Criterios actualizados correctamente'
//       });

//     } else {

//       // 2️⃣ Insertar criterio
//       const [result] = await connection.query(
//         `
//       INSERT INTO AMS_CRITERIA
//       (
//         CRI_NOTE_MIN,
//         CRI_NOTE_MAX,
//         CRI_PASSING_GRADE,
//         CRI_ACADEMICS_BREAKS,
//         CRI_STATE,
//         PEO_ID
//       )
//       VALUES (?, ?, ?, ?, ?, ?)
//       `,
//         [
//           cri_note_min,
//           cri_note_max,
//           cri_passing_grade,
//           cri_academics_breaks,
//           'A',
//           peo_id
//         ]
//       );

//       // 3️⃣ Confirmar transacción
//       await connection.commit();

//       return res.status(201).json({
//         status: true,
//         message: 'Criterio creado correctamente'
//       });


//     }


//   } catch (error) {

//     if (connection) await connection.rollback();

//     console.error('❌ ERROR CREATE_CRITERIA');

//     console.error(error)

//     return res.status(500).json({
//       status: false,
//       message: 'Error interno del servidor',
//       error: error.message
//     })

//   } finally {
//     if (connection) connection.release();
//   }
// };

export const getAllCriteria = async (req, res) => {

  try {

    const [data] = await pool.query('SELECT  * FROM  AMS_CRITERIA')

    if (data.length === 0) return res.status(404).json({ errorMessage: 'No hay criterios creados' })

    const result = {
      content: data,
      status: true,
      message: 'Lista de todos los criterios'
    }

    const Data = {
      data: data
    }

    return res.status(200).json(Data)


  } catch (error) {

    console.log(error)

    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor',
      error: error.message
    })

  }
}

//* Crear
export const create_criteria = async (req, res) => {
  const {
    cri_note_min,
    cri_note_max,
    cri_passing_grade,
    cri_academics_breaks
  } = req.body;

  // 🔐 PEO_ID desde el token
  const peo_id = req.user.peoId;

  if (!peo_id) {
    return res.status(401).json({ status: false, message: 'No fue posible identificar al usuario' });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Validar si ya existe una configuración de criterios
    const [existingCriteria] = await connection.query('SELECT CRI_ID FROM AMS_CRITERIA LIMIT 1');

    if (existingCriteria.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        status: false,
        message: 'Ya existe una configuración de criterios. Debes usar la opción de actualizar.'
      });
    }

    // 2️⃣ Insertar criterio
    await connection.query(
      `INSERT INTO AMS_CRITERIA
      (
        CRI_NOTE_MIN,
        CRI_NOTE_MAX,
        CRI_PASSING_GRADE,
        CRI_ACADEMICS_BREAKS,
        CRI_STATE,
        PEO_ID
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cri_note_min,
        cri_note_max,
        cri_passing_grade,
        cri_academics_breaks,
        'A',
        peo_id
      ]
    );

    await connection.commit();

    return res.status(201).json({
      status: true,
      message: 'Criterios creados correctamente'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ ERROR CREATE_CRITERIA:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor al crear criterios',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

//* Actualizar 
export const update_criteria = async (req, res) => {
  // Recibimos el ID del criterio a actualizar por los parámetros de la URL
  const { cri_id } = req.params;

  const {
    cri_note_min,
    cri_note_max,
    cri_passing_grade,
    cri_academics_breaks
  } = req.body;

  // 🔐 PEO_ID desde el token (quien está haciendo la actualización)
  const peo_id = req.user.peoId;

  if (!peo_id) {
    return res.status(401).json({ status: false, message: 'No fue posible identificar al usuario' });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Validar que el criterio que intentan actualizar realmente exista
    const [existing] = await connection.query('SELECT CRI_ID FROM AMS_CRITERIA WHERE CRI_ID = ?', [cri_id]);

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: false,
        message: 'La configuración de criterios que intentas actualizar no existe.'
      });
    }

    // 2️⃣ Actualizar el registro
    await connection.query(
      `UPDATE AMS_CRITERIA 
       SET 
         CRI_NOTE_MIN = ?, 
         CRI_NOTE_MAX = ?, 
         CRI_PASSING_GRADE = ?, 
         CRI_ACADEMICS_BREAKS = ?, 
         PEO_ID = ?
       WHERE CRI_ID = ?`,
      [cri_note_min, cri_note_max, cri_passing_grade, cri_academics_breaks, peo_id, cri_id]
    );

    await connection.commit();

    return res.status(200).json({
      status: true,
      message: 'Criterios actualizados correctamente'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ ERROR UPDATE_CRITERIA:', error);
    return res.status(500).json({
      status: false,
      message: 'Error interno del servidor al actualizar criterios',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};