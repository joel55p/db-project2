//  CRUD usando Sequelize ORM + SP sp_crear_cliente

const express = require('express');
const { Cliente } = require('../db/sequelize');
const pool = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth');
const router = express.Router();

// GET ORM igual en Cliente.findAll()
router.get('/', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? {
      [require('sequelize').Op.or]: [
        { nombre:   { [require('sequelize').Op.like]: `%${search}%` } },
        { email:    { [require('sequelize').Op.like]: `%${search}%` } },
      ]
    } : {};
    const rows = await Cliente.findAll({ where, order: [['nombre','ASC']] });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener clientes.' });
  }
});

// GET por ID con  ORM en  Cliente.findByPk() y maneja caso de no encontrado
router.get('/:id', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
  try {
    const c = await Cliente.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json(c);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener cliente.' });
  }
});

// POST en donde invoca SP sp_crear_cliente
router.post('/', requireAuth, requireRol('admin','vendedor'), async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    // Llamada al sp con parametros OUT
    await pool.query('CALL sp_crear_cliente(?, ?, ?, ?, @p_id, @p_ok, @p_msg)',
      [nombre, email || '', telefono || '', direccion || '']);
    const [[result]] = await pool.query('SELECT @p_id AS id, @p_ok AS ok, @p_msg AS msg');
    if (!result.ok) return res.status(409).json({ error: result.msg });
    return res.status(201).json({ message: result.msg, cliente_id: result.id });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear cliente.' });
  }
});

// PUT con  ORM en Cliente.update() y valida que nombre no este vacio, maneja caso de no encontrado y error de email duplicado
router.put('/:id', requireAuth, requireRol('admin','vendedor'), async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' });
  try {
    const [n] = await Cliente.update(
      { nombre, email: email||null, telefono: telefono||null, direccion: direccion||null },
      { where: { cliente_id: req.params.id } }
    );
    if (n === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json({ message: 'Cliente actualizado.' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'El email ya está en uso.' });
    return res.status(500).json({ error: 'Error al actualizar cliente.' });
  }
});

// DELETE con  ORM en Cliente.destroy() y maneja caso de no encontrado y error de FK si tiene ventas asociadas
router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const n = await Cliente.destroy({ where: { cliente_id: req.params.id } });
    if (n === 0) return res.status(404).json({ error: 'Cliente no encontrado.' });
    return res.json({ message: 'Cliente eliminado.' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError')
      return res.status(409).json({ error: 'No se puede eliminar: tiene ventas asociadas.' });
    return res.status(500).json({ error: 'Error al eliminar cliente.' });
  }
});

module.exports = router;