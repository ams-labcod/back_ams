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
        const [result] = await pool.query('INSERT INTO AMS_CONVIVENCIA (EST_ID, PER_ID, COU_ID, CON_NOTE,CON_FINAL_NOTE, CON_ACTIVITY) VALUES (?, ?, ?, ?, ?,?) ON DUPLICATE KEY UPDATE  CON_NOTE = VALUES(CON_NOTE), CON_FINAL_NOTE = COALESCE(VALUES(CON_FINAL_NOTE), CON_FINAL_NOTE), CON_ACTIVITY = VALUES(CON_ACTIVITY)',
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
                content: null,
                status: true,
                message: 'Nota de convivencia asignada correctamente',
                action: result.affectedRows === 1 ? 'Creada' : 'Actualizada'
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


//* Obtener Notas de Convivencia por Curso y Periodo
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
        const [rows] = await pool.query( `SELECT EST_ID AS est_id, CON_NOTE AS nota_asignacion FROM AMS_CONVIVENCIA WHERE COU_ID = ? AND PER_ID = ? AND COU_ACTIVITY = 'Asignacion'  `,
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

