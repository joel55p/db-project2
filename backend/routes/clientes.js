// CRUD Clientes 


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM CLIENTES WHERE 1=1';
    const args = [];
    if (search) {
      sql += ' AND (nombre LIKE ? OR email LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY nombre';
    const [rows] = await pool.query(sql, args);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener clientes.' });
  }
});

router.get('/:id', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CLIENTES WHERE cliente_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener cliente.' });
  }
});

router.post('/', requireAuth, requireRol('admin','vendedor'), async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO CLIENTES (nombre, email, telefono, direccion, fecha_registro) VALUES (?,?,?,?,CURDATE())',
      [nombre, email || null, telefono || null, direccion || null]
    );
    return res.status(201).json({ message: 'Cliente creado.', cliente_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya está registrado.' });
    return res.status(500).json({ error: 'Error al crear cliente.' });
  }
});

router.put('/:id', requireAuth, requireRol('admin','vendedor'), async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const [result] = await pool.query(
      'UPDATE CLIENTES SET nombre=?, email=?, telefono=?, direccion=? WHERE cliente_id=?',
      [nombre, email || null, telefono || null, direccion || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json({ message: 'Cliente actualizado.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya está en uso.' });
    return res.status(500).json({ error: 'Error al actualizar cliente.' });
  }
});

router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CLIENTES WHERE cliente_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json({ message: 'Cliente eliminado.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'No se puede eliminar: tiene ventas asociadas.' });
    return res.status(500).json({ error: 'Error al eliminar cliente.' });
  }
});

module.exports = router;