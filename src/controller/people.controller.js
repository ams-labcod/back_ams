import { pool } from '../config/db.js';

// export const create_person = async (req, res) => {


//     const { usu_nombre, usu_apellido,
//         usu_correo, usu_direccion,
//         usu_telefono, usu_tipo_de_id,
//         usu_identificacion, usu_password,
//         usu_repet_password } = req.body

//     const usu_fecha = new Date().toISOString().split('T')[0]
//      //comparamos la password
//     if (usu_password !== usu_repet_password) return res.status(401).json({ errorMessage: 'Credenciales invalidas' })     
// }