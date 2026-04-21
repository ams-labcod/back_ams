
import { pool } from '../config/db.js'


export const createAnnotation = async (req, res) => {
    try {
        // 1. Recibimos los datos del formulario (Body)
        const { 
            est_id, 
            per_id, 
            cou_id, 
            ann_type, //tipo_falta, 
            ann_date, //fecha, 
            ann_suspended, //suspendido, 
            ann_suspended_days, //dias_suspendido, 
            ann_observation //observacion 
        } = req.body;

        // 2. Validación: Los campos clave no pueden estar vacíos
        if (!est_id || !per_id || !cou_id || !ann_type || !ann_date || !ann_observation) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios (est_id, per_id, cou_id, ann_type, ann_date, ann_observation).' 
            });
        }

        // 3. Inserción en la base de datos
        await pool.query('INSERT INTO AMS_ANNOTATIONS (EST_ID, PER_ID, COU_ID, ANN_TYPE, ANN_DATE, ANN_SUSPENDED, ANN_SUSPENDED_DAYS, ANN_OBSERVATION) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                est_id, 
                per_id, 
                cou_id, 
                ann_type, 
                ann_date, 
                ann_suspended ? 1 : 0, // Convertimos a 1 (Sí) o 0 (No) para la BD
                ann_suspended_days || 0, // Si no envían días, por defecto es 0
                ann_observation
            ]
        );

        return res.status(201).json({
            data: {
                content: null,
                status: true,
                message: 'Anotación disciplinaria registrada correctamente'
            }
        });

    } catch (error) {
        console.error('❌ ERROR CREANDO ANOTACIÓN:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al registrar la anotación',
            error: error.message
        });
    }
};

export const getAnnotations = async (req, res) => {
    try {
        const { cou_id, per_id } = req.query;

        if (!cou_id || !per_id) {
            return res.status(400).json({ 
                message: 'Debe especificar el curso (cou_id) y el periodo (per_id) en la URL.' 
            });
        }

        // Hacemos un JOIN con AMS_ESTUDENTS para traer el nombre real del estudiante
        const [rows] = await pool.query(
            `SELECT 
                a.ANN_ID AS id_anotacion,
                e.EST_ID AS id_estudiante,
                CONCAT(e.EST_NAME, ' ', e.EST_LAST_NAME) AS nombre_estudiante,
                a.ANN_DATE AS fecha,
                a.ANN_FAULT_TYPE AS tipo_falta,
                a.ANN_OBSERVATION AS observacion,
                a.ANN_SUSPENDED AS suspendido,
                a.ANN_SUSPENDED_DAYS AS dias_suspendido
            FROM AMS_ANNOTATIONS a
            INNER JOIN AMS_ESTUDENTS e ON a.EST_ID = e.EST_ID
            WHERE a.COU_ID = ? AND a.PER_ID = ?
            ORDER BY a.ANN_DATE DESC`,
            [cou_id, per_id]
        );

        return res.status(200).json({
            data: {
                content: rows,
                status: true,
                message: rows.length > 0 ? 'Anotaciones obtenidas correctamente' : 'No hay anotaciones registradas'
            }
        });

    } catch (error) {
        console.error('❌ ERROR OBTENIENDO ANOTACIONES:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al obtener las anotaciones',
            error: error.message
        });
    }
};



//* Sincronizar Totales de Asistencia (Upsert)
export const syncAssistanceSummary = async (req, res) => {
    try {
        // 1. Recibimos los 4 contadores y los datos clave desde el Frontend
        const { 
            est_peo_id, 
            per_id, 
            asistencias, 
            excusas, 
            suspendidos, 
            ausencias 
        } = req.body;

        // 2. Validación de seguridad básica
        if (!est_peo_id || !per_id) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios (est_peo_id, per_id) para el resumen.' 
            });
        }

        // Calculamos el total de clases sumando todos los estados (Opcional, pero muy útil)
        const total_classes = Number(asistencias || 0) + Number(excusas || 0) + Number(suspendidos || 0) + Number(ausencias || 0);

        // 3. Ejecutamos el UPSERT
        const [result] = await pool.query(
            `INSERT INTO AMS_ASSISTANCE_SUMMARY 
            (EST_PEO_ID, PER_ID, ASS_SUM_TOTAL_CLASSES, ASS_SUM_ATTENDANCES, ASS_SUM_EXCUSES, ASS_SUM_SUSPENSIONS, ASS_SUM_ABSENCES) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            ASS_SUM_TOTAL_CLASSES = VALUES(ASS_SUM_TOTAL_CLASSES),
            ASS_SUM_ATTENDANCES = VALUES(ASS_SUM_ATTENDANCES),
            ASS_SUM_EXCUSES = VALUES(ASS_SUM_EXCUSES),
            ASS_SUM_SUSPENSIONS = VALUES(ASS_SUM_SUSPENSIONS),
            ASS_SUM_ABSENCES = VALUES(ASS_SUM_ABSENCES)`,
            [
                est_peo_id, 
                per_id, 
                total_classes,
                asistencias || 0, 
                excusas || 0, 
                suspendidos || 0, 
                ausencias || 0
            ]
        );

        return res.status(200).json({
            data: {
                // Si affectedRows es 1, se insertó. Si es 2, se actualizó.
                accion: result.affectedRows === 1 ? 'Creado' : 'Actualizado',
                content: null,
                status: true,
                message: 'Resumen de asistencia sincronizado correctamente'
            }
        });

    } catch (error) {
        console.error('❌ ERROR SINCRONIZANDO RESUMEN DE ASISTENCIA:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al actualizar el resumen',
            error: error.message
        });
    }
};



export const getAssistanceSummaries = async (req, res) => {
    try {
        const { per_id, cou_id } = req.query; // Lo ideal es filtrar por periodo y curso

        const [summaries] = await pool.query(
            `SELECT 
                e.EST_ID,
                CONCAT(e.EST_NAME, ' ', e.EST_LAST_NAME) AS nombre_estudiante,
                e.EST_IDENTIFICATION AS identificacion,
                ass.ASS_SUM_TOTAL_CLASSES AS total_clases,
                ass.ASS_SUM_ATTENDANCES AS asistencias,
                ass.ASS_SUM_EXCUSES AS excusas,
                ass.ASS_SUM_SUSPENSIONS AS suspendidos,
                ass.ASS_SUM_ABSENCES AS ausencias,
                ass.ASS_SUM_OBSERVATION AS observacion
            FROM AMS_ASSISTANCE_SUMMARY ass
            INNER JOIN AMS_ESTUDENTS e ON ass.EST_PEO_ID = e.EST_PEO_ID
            WHERE ass.PER_ID = ? AND ass.COU_ID = ?
            ORDER BY e.EST_LAST_NAME ASC`,
            [per_id, cou_id]
        );

        return res.status(200).json({
            data: { content: summaries, status: true }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorMessage: 'Error obteniendo los resúmenes' });
    }
}