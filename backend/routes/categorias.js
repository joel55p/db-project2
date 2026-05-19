// CRUD Categorias

const express = require('express');
const pool    = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM CATEGORIAS ORDER BY nombre');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

router.post('/', requireAuth, requireRol('admin'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO CATEGORIAS (nombre, descripcion) VALUES (?,?)',
      [nombre, descripcion || null]
    );
    return res.status(201).json({ message: 'Categoría creada.', categoria_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'La categoría ya existe.' });
    return res.status(500).json({ error: 'Error al crear categoría.' });
  }
});

router.put('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE CATEGORIAS SET nombre=?, descripcion=? WHERE categoria_id=?',
      [nombre, descripcion || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ message: 'Categoría actualizada.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar categoría.' });
  }
});

router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CATEGORIAS WHERE categoria_id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ message: 'Categoría eliminada.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'No se puede eliminar: tiene productos asociados.' });
    return res.status(500).json({ error: 'Error al eliminar categoría.' });
  }
});

module.exports = router;