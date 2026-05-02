// CRUD de Proveedores


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM PROVEEDORES ORDER BY nombre');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener proveedores.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, contacto, telefono, email, pais } = req.body;
  if (!nombre || !pais) return res.status(400).json({ error: 'Nombre y país son requeridos.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO PROVEEDORES (nombre, contacto, telefono, email, pais) VALUES (?,?,?,?,?)',
      [nombre, contacto || null, telefono || null, email || null, pais]
    );
    return res.status(201).json({ message: 'Proveedor creado.', proveedor_id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear proveedor.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { nombre, contacto, telefono, email, pais } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE PROVEEDORES SET nombre=?,contacto=?,telefono=?,email=?,pais=? WHERE proveedor_id=?',
      [nombre, contacto || null, telefono || null, email || null, pais, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proveedor no encontrado.' });
    return res.json({ message: 'Proveedor actualizado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar proveedor.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM PROVEEDORES WHERE proveedor_id=?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proveedor no encontrado.' });
    return res.json({ message: 'Proveedor eliminado.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar: tiene productos asociados.' });
    }
    return res.status(500).json({ error: 'Error al eliminar proveedor.' });
  }
});

module.exports = router;
