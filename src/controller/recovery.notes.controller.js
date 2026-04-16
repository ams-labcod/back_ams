import { request, response } from 'express'
import { pool } from '../config/db.js'


export const saveRecoveryNote = async (req, res) => {
    let connection;
    try {
        // 1. Validar que quien hace la petición es un profesor
        const tea_id = req.user.tea_peo_id;

        if (!tea_id) {
            return res.status(403).json({ message: 'Solo los docentes pueden registrar notas de recuperación.' });
        }

        // 2. Extraer los datos del cuerpo de la petición (Body)
        const {
            est_id,
            cos_id,
            per_id,
            cou_id,
            id_cou_notes, // Opcional (Si recupera un criterio específico)
            eva_id,       // Opcional (Si recupera una evaluación específica)
            rec_value,
            rec_old_value, // Opcional (La nota que tenía antes)
            rec_observation // Opcional (Comentarios del profe)
        } = req.body;

        // 3. Validar los campos estrictamente obligatorios
        if (!est_id || !cos_id || !per_id || !cou_id || rec_value === undefined) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios (est_id, cos_id, per_id, cou_id, rec_value).' 
            });
        }

        connection = await pool.getConnection();

        // 4. Insertar la nota en la tabla
        await connection.query(
            `INSERT INTO AMS_RECOVERY_NOTES 
            (EST_ID, COS_ID, PER_ID, COU_ID, ID_COU_NOTES, EVA_ID, REC_VALUE, REC_OLD_VALUE, REC_OBSERVATION) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                est_id, 
                cos_id, 
                per_id, 
                cou_id,
                id_cou_notes || null, // Si no viene, guarda NULL
                eva_id || null,       // Si no viene, guarda NULL
                rec_value,
                rec_old_value || null,
                rec_observation || null
            ]
        );

        return res.status(201).json({
            data: {
                content: null,
                status: true,
                message: 'Nota de recuperación registrada correctamente'
            }
        });

    } catch (error) {
        console.error('❌ ERROR GUARDANDO RECUPERACIÓN:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al registrar la recuperación',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};
