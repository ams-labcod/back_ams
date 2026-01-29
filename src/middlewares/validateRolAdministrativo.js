
import { response, request } from 'express';

export const validateRolAdministrativo = (req = request, res = response, next) => {

  if (!req.user) {
    return res.status(401).json({
      message: 'Usuario no autenticado'
    });
  }

  const { nombre, authorities } = req.user;

  // Validación segura: que exista el array y tenga roles
  if (!Array.isArray(authorities) || authorities.length === 0) {
    return res.status(403).json({
      message: 'Usuario no autorizado o no tiene cookies'
    });
  }

  // Roles permitidos
  const allowedRoles = ['ROL_ADMINISTRATIVO'];

  // Verificar si alguno de los roles del usuario está permitido
  const hasPermission = authorities.some(role =>
    allowedRoles.includes(role)
  );

  if (!hasPermission) {
    return res.status(403).json({
      message: `${nombre} no tiene permisos para esta acción`
    });
  }
}

