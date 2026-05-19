// Middleware de autenticación de sesion


/**
 * requireAuth lo que hace es que  verifica que haya una sesion activa.
 * Si no hay sesion, responde 401.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
}

// Verifica que el usuario tenga alguno de los roles permitidos
function requireRol(...rolesPermitidos) { // recibe un array de roles permitidos
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) { // si no hay sesion activa
      return res.status(401).json({ error: 'No autenticado.' }); // 401 Unauthorized
    }
    const rol = req.session.usuario.rol; // se obtiene el rol del usuario de la sesion
    if (!rolesPermitidos.includes(rol)) { // si el rol del usuario no esta en el array de roles permitidos
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}. Tu rol es: ${rol}`
      });
    }
    return next();
  };
}
 
// Verifica que sea admin
function requireAdmin(req, res, next) {
  return requireRol('admin')(req, res, next);
}
 
module.exports = { requireAuth, requireRol, requireAdmin };