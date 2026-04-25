import { pool } from '../config/db.js';

//* Asignar Nota de Convivencia (Inserción Normal)
export const assignConvivenciaGrade = async (req, res) => {
    try {
        // 1. Recibir los datos del Body
        const { 
            est_id, 
            cou_id, 
            per_id, 
            con_note,
            con_note_final,
            con_activity
        } = req.body;

        // 2. Validación estricta
         if (!est_id || !cou_id || !per_id) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios (est_id, cou_id, per_id).' 
            });
        }

        // 3. Ejecutar el INSERT normal
        const [result] = await pool.query('INSERT INTO AMS_CONVIVENCIA (EST_ID, PER_ID, COU_ID, CON_NOTE,CON_FINAL_NOTE, CON_ACTIVITY) VALUES (?, ?, ?, ?, ?,?)',
            [
                est_id, 
                per_id, 
                cou_id, 
                con_note ?? null,
                con_note_final ?? null,
                con_activity ?? null
            ]
        );

        return res.status(201).json({
            data: {
                content: { con_id: result.insertId },
                status: true,
                message: 'Nota de convivencia asignada correctamente'
            }
        });

    } catch (error) {
        console.error('❌ ERROR GUARDANDO NOTA DE CONVIVENCIA:', error);

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al asignar la nota de convivencia',
            error: error.message
        });
    }
};

//* ACTUALIZAR Nota de Convivencia específica
export const updateConvivenciaGrade = async (req, res) => {
    try {
        const { con_id } = req.params; // Lo sacamos de la URL
        const { con_note, con_activity } = req.body;

        if (!con_id) {
            return res.status(400).json({ 
                message: 'Debe especificar el ID de la nota en la URL (con_id).' 
            });
        }

        // Usamos COALESCE para que si el frontend no envía algún dato, se conserve el que ya estaba en la BD
        const [result] = await pool.query(
            `UPDATE AMS_CONVIVENCIA 
             SET CON_NOTE = COALESCE(?, CON_NOTE), 
                 CON_ACTIVITY = COALESCE(?, CON_ACTIVITY) 
             WHERE CON_ID = ?`,
            [
                con_note ?? null, 
                con_activity ?? null, 
                con_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'La nota especificada no existe.' 
            });
        }

        return res.status(200).json({
            data: {
                content: null,
                status: true,
                message: 'Nota de convivencia actualizada correctamente'
            }
        });

    } catch (error) {
        console.error('❌ ERROR ACTUALIZANDO NOTA DE CONVIVENCIA:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al actualizar la nota',
            error: error.message
        });
    }
};


//* Obtener Notas de Convivencia por Curso y Periodo - FILTRO ASIGNACION
export const getConvivenciaGrades = async (req, res) => {
    try {
        // 1. Extraemos los parámetros de la URL 
        const { cou_id, per_id } = req.params;

        // 2. Validación: Ambos datos son obligatorios
        if (!cou_id || !per_id) {
            return res.status(400).json({ 
                message: 'Debe especificar el curso (cou_id) y el periodo (per_id) en la URL.' 
            });
        }

        // 3. Consulta a la base de datos
        const [rows] = await pool.query( `SELECT * FROM AMS_CONVIVENCIA WHERE COU_ID = ? AND PER_ID = ?`,
            [cou_id, per_id]
        );

        // 4. Respuesta al Frontend
        return res.status(200).json({
            data: {
                content: rows, // Aquí va el arreglo [{ est_id, nota_asignacion }]
                status: true,
                message: rows.length > 0 ? 'Notas de convivencia obtenidas correctamente' : 'No hay notas registradas para este curso en este periodo'
            }
        });

    } catch (error) {
        console.error('❌ ERROR OBTENIENDO NOTAS DE CONVIVENCIA:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al obtener las notas',
            error: error.message
        });
    }
};

