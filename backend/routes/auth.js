// routes/auth.js — Autenticación (login / logout / me)

const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../db/pool');
const router  = express.Router();


// Permisos por rol — qué puede ver/hacer cada uno en la UI
const PERMISOS_POR_ROL = {
  admin: {
    verProductos:    true,
    editarProductos: true,
    verVentas:       true,
    crearVentas:     true,
    anularVentas:    true,
    verClientes:     true,
    editarClientes:  true,
    verEmpleados:    true,
    editarEmpleados: true,
    verReportes:     true,
    verProveedores:  true,
    editarProveedores: true,
    verCategorias:   true,
    editarCategorias: true,
  },
  supervisor: {
    verProductos:    true,
    editarProductos: false,
    verVentas:       true,
    crearVentas:     false,
    anularVentas:    true,
    verClientes:     true,
    editarClientes:  false,
    verEmpleados:    true,
    editarEmpleados: true,
    verReportes:     true,
    verProveedores:  true,
    editarProveedores: false,
    verCategorias:   true,
    editarCategorias: false,
  },
  vendedor: {
    verProductos:    true,
    editarProductos: false,
    verVentas:       true,
    crearVentas:     true,
    anularVentas:    false,
    verClientes:     true,
    editarClientes:  true,
    verEmpleados:    false,
    editarEmpleados: false,
    verReportes:     false,
    verProveedores:  false,
    editarProveedores: false,
    verCategorias:   true,
    editarCategorias: false,
  },
  cajero: {
    verProductos:    true,
    editarProductos: false,
    verVentas:       true,
    crearVentas:     false,
    anularVentas:    false,
    verClientes:     true,
    editarClientes:  false,
    verEmpleados:    false,
    editarEmpleados: false,
    verReportes:     false,
    verProveedores:  false,
    editarProveedores: false,
    verCategorias:   false,
    editarCategorias: false,
  },
  bodeguero: {
    verProductos:    true,
    editarProductos: true,
    verVentas:       false,
    crearVentas:     false,
    anularVentas:    false,
    verClientes:     false,
    editarClientes:  false,
    verEmpleados:    false,
    editarEmpleados: false,
    verReportes:     false,
    verProveedores:  true,
    editarProveedores: false,
    verCategorias:   true,
    editarCategorias: false,
  },
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
    //validacion basica de entrada
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }
 
  try {
    const [rows] = await pool.query(
      'SELECT * FROM USUARIOS WHERE username = ?', [username]
    );
 
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
 
    const usuario = rows[0];
    const match   = await bcrypt.compare(password, usuario.password);
 
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
 
    // Guardar sesión con rol y permisos
    req.session.usuario = {
      usuario_id:  usuario.usuario_id,
      username:    usuario.username,
      rol:         usuario.rol,
      empleado_id: usuario.empleado_id,
      permisos:    PERMISOS_POR_ROL[usuario.rol] || {},
    };
 
    return res.json({
      message: 'Login exitoso.',
      usuario: req.session.usuario,
    });
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
 
// GET /api/auth/me — retorna usuario y permisos actuales
router.get('/me', (req, res) => {
  if (req.session && req.session.usuario) {
    return res.json({ usuario: req.session.usuario });
  }
  return res.status(401).json({ error: 'No autenticado.' });
});
 
module.exports = router;