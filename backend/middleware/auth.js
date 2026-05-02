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

/**
 * requireAdmin  verifica que el usuario sea admin.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado. Se requiere rol admin.' });
}

module.exports = { requireAuth, requireAdmin };
