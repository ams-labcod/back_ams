import { pool } from '../config/db.js';

export const login = async (req, res) => {

    const { usu_correo, usu_password } = req.body;

    try {
        const [data] = await pool.query(
            'SELECT USU_USER, USU_PASSWORD FROM AMS_USERS WHERE USU_USER = ?',
            [usu_correo]
        );
        console.log(data[0]);
        if (!data || data.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Usuario no encontrado'
            });
        }

        // 👇 USAR EL NOMBRE REAL DE LA COLUMNA
        const storedPassword = data[0].USU_PASSWORD;
        console.log(data[0]);
        if (usu_password !== storedPassword) {
            return res.status(401).json({
                status: false,
                message: 'Password incorrecta'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Usuario logueado correctamente'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error en el servidor'
        });
    }
};
