// routes/auth.js — Autenticación (login / logout / me)

const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../db/pool');
const router  = express.Router();

// POST /api/auth/login 
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validacion básica de entrada
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM USUARIOS WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];
    const match   = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Guardar sesion 
    req.session.usuario = {
      usuario_id:  usuario.usuario_id,
      username:    usuario.username,
      rol:         usuario.rol,
      empleado_id: usuario.empleado_id,
    };

    return res.json({ message: 'Login exitoso.', usuario: req.session.usuario });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/logout 
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión.' });
    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesión cerrada.' });
  });
});

//  GET /api/auth/me
// Retorna el usuario que esat  autenticado actualmente 
router.get('/me', (req, res) => {
  if (req.session && req.session.usuario) {
    return res.json({ usuario: req.session.usuario });
  }
  return res.status(401).json({ error: 'No autenticado.' });
});

module.exports = router;
