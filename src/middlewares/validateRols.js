import { pool } from '../config/db.js';

export const validateRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1️⃣ Usuario autenticado
      if (!req.user || !req.user.usu_role || !req.user.usu_identification) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      // 2️⃣ Validar si el rol del usuario está dentro de los permitidos
      if (!allowedRoles.includes(req.user.usu_role)) {
        return res.status(403).json({
          message: `El usuario no tiene los privilegios requeridos para esta acción`
        });
      }

      // 3️⃣ Validar estado activo en AMS_PEOPLE
      const [rows] = await pool.query(
        'SELECT 1 FROM AMS_PEOPLE WHERE PEO_IDENTIFICATION = ? AND PEO_STATE = ? LIMIT 1',
        [req.user.usu_identification, 'A']
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: 'El usuario está inactivo' });
      }

      // 4️⃣ Todo OK, pasa al controlador
      next();

    } catch (error) {
      console.error('❌ Error en validateRoles:', error);
      return res.status(500).json({ message: 'Error validando permisos del usuario' });
    }
  };
};
















// export const validateRolDocente = async (req = request, res = response, next) => {

//   try {

//     // 1️⃣ Usuario autenticado
//     if (!req.user || !req.user.usu_role || !req.user.usu_identification) {
//       return res.status(401).json({
//         message: 'Usuario no autenticado'
//       });
//     }

//     console.log('ROLE:', req.user.usu_role);

//     // 2️⃣ Validar rol
//     const allowedRoles = ['ROL_TEACHER'];

//     if (!allowedRoles.includes(req.user.usu_role)) {
//       return res.status(403).json({
//         message: `El usuario ${req.user.usu_identification} no tiene permisos para esta acción`
//       });
//     }

//     // 3️⃣ Validar estado en AMS_PEOPLE
//     const [rows] = await pool.query(
//       'SELECT 1 FROM AMS_PEOPLE WHERE PEO_IDENTIFICATION = ? AND PEO_STATE = ? LIMIT 1',
//       [req.user.usu_identification, 'A']
//     );

//     if (rows.length === 0) {
//       return res.status(403).json({
//         message: `El usuario ${req.user.usu_identification} está inactivo`
//       });
//     }

//     // 4️⃣ Todo OK
//     next();

//   } catch (error) {

//     console.error('❌ Error en validateRolAdmin:', error);

//     return res.status(500).json({
//       message: 'Error validando permisos del usuario'
//     });
//   }
// };
