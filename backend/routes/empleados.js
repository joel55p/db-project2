//CRUD de Empleados


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM EMPLEADOS ORDER BY nombre'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM EMPLEADOS WHERE empleado_id = ?', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener empleado.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, puesto, email, telefono, fecha_contratacion, salario } = req.body;
  if (!nombre || !puesto || !fecha_contratacion || salario == null) {
    return res.status(400).json({ error: 'nombre, puesto, fecha_contratacion y salario son requeridos.' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO EMPLEADOS (nombre, puesto, email, telefono, fecha_contratacion, salario)
       VALUES (?,?,?,?,?,?)`,
      [nombre, puesto, email || null, telefono || null, fecha_contratacion, salario]
    );
    return res.status(201).json({ message: 'Empleado creado.', empleado_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya está registrado.' });
    return res.status(500).json({ error: 'Error al crear empleado.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { nombre, puesto, email, telefono, fecha_contratacion, salario } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE EMPLEADOS SET nombre=?,puesto=?,email=?,telefono=?,fecha_contratacion=?,salario=?
       WHERE empleado_id=?`,
      [nombre, puesto, email || null, telefono || null, fecha_contratacion, salario, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json({ message: 'Empleado actualizado.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya está en uso.' });
    return res.status(500).json({ error: 'Error al actualizar empleado.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM EMPLEADOS WHERE empleado_id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleado no encontrado.' });
    return res.json({ message: 'Empleado eliminado.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar: el empleado tiene ventas asociadas.' });
    }
    return res.status(500).json({ error: 'Error al eliminar empleado.' });
  }
});

module.exports = router;
