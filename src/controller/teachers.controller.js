import { pool } from '../config/db.js'

// ***************************GET A TODOS LOS CURSOS **********************************
export const getAllTeachers = async (req, res) => {
    try {
        // Consultamos todos los cursos
        const [teacher] = await pool.query('SELECT * FROM AMS_TEACHERS');

        const response = {
            content: teacher,
            status: true,
            message: 'Profesores obtenidos correctamente'
        };

        const data = {
            data: response
        };

        return res.status(200).json(data);

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
};

// //* Crear los criterios
// export const saveCourseCriteria = async (req, res) => {
//     let connection;
//     try {
//         // 1️⃣ Obtenemos el ID del profesor desde su token
//         const tea_id = req.user.tea_peo_id;

//         if (!tea_id) {
//             return res.status(403).json({ message: 'Solo los docentes pueden configurar estos criterios.' });
//         }

//         // 2️⃣ Recibimos el periodo y el arreglo de criterios
//         const { per_id, criterios } = req.body;

//         // Validamos que el array que llega del front tenga EXACTAMENTE 4 criterios
//         if (!per_id || !criterios || criterios.length !== 4) {
//             return res.status(400).json({ message: 'Debe enviar el periodo y exactamente 4 criterios.' });
//         }

//         // 3️⃣ Lógica de Negocio: Validar que la suma sea EXACTAMENTE 100%
//         const sumaTotal = criterios.reduce((acumulador, actual) => acumulador + Number(actual.porcentaje), 0);

//         if (sumaTotal !== 100) {
//             return res.status(400).json({
//                 message: `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${sumaTotal}%.`
//             });
//         }

//         // 4️⃣ Operación Segura en Base de Datos
//         connection = await pool.getConnection();
//         await connection.beginTransaction();

//         // 🔍 CONSULTAMOS SI YA EXISTEN CRITERIOS PARA ESTE PROFESOR EN ESTE PERIODO
//         const [existingCriteria] = await connection.query(
//             'SELECT COU_NOT_CRITERIA FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ?',
//             [per_id, tea_id]
//         );

//         // Si ya existen, VALIDAMOS QUE NO SEAN MÁS DE 4 (Seguridad extra en BD)
//         if (existingCriteria.length > 4) {
//             await connection.rollback();
//             return res.status(500).json({
//                 message: 'Inconsistencia en la base de datos: Existen más de 4 criterios registrados.'
//             });
//         }

//         let isUpdate = false;

//         if (existingCriteria.length > 0) {
//             // 🔄 MODO UPDATE: Ya existen, entonces actualizamos los porcentajes
//             isUpdate = true;
//             for (const item of criterios) {
//                 await connection.query(
//                     'UPDATE AMS_COURSE_NOTES SET COU_NOT_PERCENT = ? WHERE PER_ID = ? AND TEA_ID = ? AND COU_NOT_CRITERIA = ?',
//                     [item.porcentaje, per_id, tea_id, item.nombre]
//                 );
//             }
//         } else {
//             // ➕ MODO INSERT: No existen, los creamos por primera vez
//             for (const item of criterios) {
//                 await connection.query(
//                     'INSERT INTO AMS_COURSE_NOTES (PER_ID, COU_NOT_CRITERIA, COU_NOT_PERCENT, TEA_ID) VALUES (?, ?, ?, ?)',
//                     [per_id, item.nombre, item.porcentaje, tea_id]
//                 );
//             }
//         }

//         // Confirmamos los cambios en la BD
//         await connection.commit();

//         return res.status(200).json({
//             data: {
//                 content: null,
//                 status: true,
//                 message: isUpdate
// //                     ? 'Criterios de evaluación actualizados correctamente'
//                     : 'Criterios de evaluación creados correctamente'
//             }
//         });

//     } catch (error) {
//         if (connection) await connection.rollback();

//         console.error('❌ ERROR GUARDANDO/ACTUALIZANDO CRITERIOS:', error);

//         return res.status(500).json({
//             status: false,
//             message: 'Error interno del servidor al procesar los criterios',
//             error: error.message
//         });

//     } finally {
//         if (connection) connection.release();
//     }
// };

//* Crear
export const createCourseCriteria = async (req, res) => {
    let connection;
    try {
        // 1. Obtenemos el ID del profesor
        const tea_id = req.user.tea_peo_id;

        if (!tea_id) {
            return res.status(403).json({ message: 'Solo los docentes pueden configurar estos criterios.' });
        }

        const { per_id, criterios, cou_id } = req.body;

        // 2. Validación de datos
        if (!per_id || !criterios || !cou_id || criterios.length !== 4) {
            return res.status(400).json({ message: 'Debe enviar el periodo, el curso y exactamente 4 criterios.' });
        }

        const sumaTotal = criterios.reduce((acum, actual) => acum + Number(actual.porcentaje), 0);
        if (sumaTotal !== 100) {
            return res.status(400).json({
                message: `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${sumaTotal}%.`
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 3. Validar que NO existan criterios previos
        // const [existingCriteria] = await connection.query(
        //     'SELECT COU_NOT_CRITERIA FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ? LIMIT 1',
        //     [per_id, tea_id]
        // );

        // if (existingCriteria.length > 0) {
        //     await connection.rollback();
        //     return res.status(409).json({
        //         status: false,
        //         message: 'Ya existen criterios de evaluación configurados para este periodo. Use la opción de actualizar.'
        //     });
        // }

        // 4. Insertar los 4 criterios
        for (const item of criterios) {
            await connection.query(
                'INSERT INTO AMS_COURSE_NOTES (PER_ID, COU_ID, COU_NOT_CRITERIA, COU_NOT_PERCENT, TEA_ID) VALUES (?, ?, ?, ?,?)',
                [per_id, cou_id, item.nombre, item.porcentaje, tea_id]
            );
        }

        await connection.commit();

        return res.status(201).json({
            data: {
                content: null,
                status: true,
                message: 'Criterios de evaluación creados correctamente'
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ ERROR CREANDO CRITERIOS:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al crear los criterios',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

//* Actualizar criterio
export const updateCourseCriteria = async (req, res) => {
    let connection;
    try {
        // 1. Obtenemos el ID del profesor y el ID del periodo (de la URL)
        const tea_id = req.user.tea_peo_id;
        const { per_id } = req.params; // Lo tomamos de la URL (Ej: /course-criteria/2)

        if (!tea_id) {
            return res.status(403).json({ message: 'Solo los docentes pueden actualizar estos criterios.' });
        }

        const { criterios } = req.body;

        // 2. Validación de datos
        if (!criterios || criterios.length !== 4) {
            return res.status(400).json({ message: 'Debe enviar exactamente 4 criterios para actualizar.' });
        }

        const sumaTotal = criterios.reduce((acum, actual) => acum + Number(actual.porcentaje), 0);
        if (sumaTotal !== 100) {
            return res.status(400).json({
                message: `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${sumaTotal}%.`
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 3. Validar que SÍ existan criterios previos
        const [existingCriteria] = await connection.query(
            'SELECT COU_NOT_CRITERIA FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ?',
            [per_id, tea_id]
        );

        if (existingCriteria.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: false,
                message: 'No existen criterios para este periodo. Use la opción de crear.'
            });
        }

        // 4. Actualizar los 4 criterios basándonos en el nombre (criterio)
        for (const item of criterios) {
            await connection.query(
                'UPDATE AMS_COURSE_NOTES SET COU_NOT_PERCENT = ? WHERE PER_ID = ? AND TEA_ID = ? AND COU_NOT_CRITERIA = ?',
                [item.porcentaje, per_id, tea_id, item.nombre]
            );
        }

        await connection.commit();

        return res.status(200).json({
            data: {
                content: null,
                status: true,
                message: 'Criterios de evaluación actualizados correctamente'
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ ERROR ACTUALIZANDO CRITERIOS:', error);
        return res.status(500).json({
            status: false,
            message: 'Error interno del servidor al actualizar los criterios',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};




//* Obtener criterios
export const getCourseCriteria = async (req, res) => {
    try {
        const tea_id = req.user.tea_peo_id;
        const { per_id, cou_id } = req.params; // Lo recibimos por la URL

        if (!tea_id) {
            return res.status(403).json({ message: 'Acceso denegado.' });
        }

        if (!cou_id) return res.status(400).json({ errorMessage: 'Debe especificar el ID del Curso para obtener los criterios' })

        const [criterios] = await pool.query(
            'SELECT COU_NOT_CRITERIA AS nombre, COU_NOT_PERCENT AS porcentaje FROM AMS_COURSE_NOTES WHERE PER_ID = ? AND TEA_ID = ? AND COU_ID = ?',
            [per_id, tea_id, cou_id]
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


export const getAllCourseNotes = async (req, res) => {

    try {

        const [data] = await pool.query('SELECT  * FROM AMS_COURSE_NOTES')

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