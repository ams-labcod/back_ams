import { pool } from '../config/db.js'


//* Crear los criterios
export const saveCourseCriteria = async (req, res) => {
    let connection;
    try {
        // 1️⃣ Obtenemos el ID del profesor desde su token
        const tea_id = req.user.tea_peo_id;

        if (!tea_id) {
            return res.status(403).json({ message: 'Solo los docentes pueden configurar estos criterios.' });
        }

        // 2️⃣ Recibimos el periodo y el arreglo de criterios
        const { per_id, criterios } = req.body;

        console.log(per_id)

        console.log(criterios)

        // Validamos que vengan exactamente 4 criterios
        if (!per_id || !criterios || criterios.length !== 4) {
            return res.status(400).json({ message: 'Debe enviar el periodo y exactamente 4 criterios.' });
        }

        // 3️⃣ Lógica de Negocio: Validar que la suma sea EXACTAMENTE 100%
        const sumaTotal = criterios.reduce((acumulador, actual) => acumulador + Number(actual.porcentaje), 0);

        if (sumaTotal !== 100) {
            return res.status(400).json({
                message: `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${sumaTotal}%.`
            });
        }

        // 4️⃣ Operación Segura en Base de Datos
        connection = await pool.getConnection();
        await connection.beginTransaction();


        // Insertamos los 4 criterios nuevos
        for (const item of criterios) {
            await connection.query(
                'INSERT INTO AMS_COURSE_NOTES (PER_ID, COU_NOT_CRITERIA, COU_NOT_PERCENT, TEA_ID) VALUES (?, ?, ?, ?)',
                [per_id, item.nombre, item.porcentaje, tea_id]
            );
        }

        await connection.commit();

        return res.status(200).json({
            data: {
                content: null,
                status: true,
                message: 'Criterios de evaluación guardados correctamente'
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();

        console.error('❌ ERROR GUARDANDO CRITERIOS:', error);

        return res.status(500).json({ errorMessage: 'Error interno del servidor al guardar criterios' });

    } finally {
        if (connection) connection.release();
    }
};

//* Obtener los criterios
export const getCourseCriteria = async (req, res) => {
    try {
        const tea_id = req.user.tea_peo_id;
        const { per_id } = req.params; // Lo recibimos por la URL

        if (!tea_id) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        const [criterios] = await pool.query(
            'SELECT COU_NOT_CRITERIA AS nombre, COU_NOT_PERCENT AS porcentaje FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ?',
            [per_id, tea_id]
        );

        // Si no tiene criterios guardados, devolvemos un arreglo vacío para que el frontend ponga 25% por defecto
        return res.status(200).json({
            data: {
                content: criterios,
                status: true,
                message: 'Criterios obtenidos'
            }
        });

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
};