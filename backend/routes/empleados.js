//  CRUD usando Sequelize ORM

const express = require('express');
const { Empleado } = require('../db/sequelize');
const { requireAuth, requireRol } = require('../middleware/auth');
const router = express.Router();

// GET con ORM en Empleado.findAll()
router.get('/', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const rows = await Empleado.findAll({ order: [['nombre','ASC']] });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});

// GET por ID con ORM en Empleado.findByPk()
router.get('/:id', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const e = await Empleado.findByPk(req.params.id);
    if (!e) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json(e);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener empleado.' });
  }
});

// POST con ORM en Empleado.create()
router.post('/', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  const { nombre, puesto, email, telefono, fecha_contratacion, salario } = req.body;
  if (!nombre || !puesto || !fecha_contratacion || salario == null)
    return res.status(400).json({ error: 'nombre, puesto, fecha_contratacion y salario son requeridos.' });
  try {
    const nuevo = await Empleado.create({
      nombre, puesto,
      email:              email || null,
      telefono:           telefono || null,
      fecha_contratacion, salario,
    });
    return res.status(201).json({ message: 'Empleado creado.', empleado_id: nuevo.empleado_id });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'El email ya está registrado.' });
    return res.status(500).json({ error: 'Error al crear empleado.' });
  }
});

// PUT  con ORM en Empleado.update()
router.put('/:id', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  const { nombre, puesto, email, telefono, fecha_contratacion, salario } = req.body;
  try {
    const [n] = await Empleado.update(
      { nombre, puesto, email: email||null, telefono: telefono||null, fecha_contratacion, salario },
      { where: { empleado_id: req.params.id } }
    );
    if (n === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json({ message: 'Empleado actualizado.' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'El email ya está en uso.' });
    return res.status(500).json({ error: 'Error al actualizar empleado.' });
  }
});

// DELETE con ORM en Empleado.destroy()
router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const n = await Empleado.destroy({ where: { empleado_id: req.params.id } });
    if (n === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json({ message: 'Empleado eliminado.' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError')
      return res.status(409).json({ error: 'No se puede eliminar: tiene ventas asociadas.' });
    return res.status(500).json({ error: 'Error al eliminar empleado.' });
  }
});

module.exports = router;