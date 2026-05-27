// CRUD usando Sequelize ORM


const express = require('express');
const { Categoria } = require('../db/sequelize');
const { requireAuth, requireRol } = require('../middleware/auth');
const router = express.Router();

// GET usa ORM en Categoria.findAll() y ordena por nombre
router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

// POST usa ORM en  Categoria.create() y valida que nombre no este vacio
router.post('/', requireAuth, requireRol('admin'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const nueva = await Categoria.create({ nombre, descripcion: descripcion || null });
    return res.status(201).json({ message: 'Categoría creada.', categoria_id: nueva.categoria_id });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'La categoría ya existe.' });
    }
    return res.status(500).json({ error: 'Error al crear categoría.' });
  }
});

// PUT usa ORM en Categoria.update() 
router.put('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const [actualizado] = await Categoria.update(
      { nombre, descripcion: descripcion || null },
      { where: { categoria_id: req.params.id } }
    );
    if (actualizado === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ message: 'Categoría actualizada.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar categoría.' });
  }
});

// DELETE usa ORM en Categoria.destroy() y maneja error de FK si tiene productos asociados
router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const eliminado = await Categoria.destroy({ where: { categoria_id: req.params.id } });
    if (eliminado === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ message: 'Categoría eliminada.' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ error: 'No se puede eliminar: tiene productos asociados.' });
    }
    return res.status(500).json({ error: 'Error al eliminar categoría.' });
  }
});

module.exports = router;