// CRUD de Ventas
// Transaccio explicita BEGIN/COMMIT/ROLLBACK
// CTE (WITH), JOIN multiples tablas y subquery correlacionado


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth'); //esto cambia 
const router  = express.Router();
 
// GET ventas para admin, supervisor, vendedor, cajero
router.get('/', requireAuth, requireRol('admin', 'supervisor', 'vendedor', 'cajero'), async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;
    let sql = 'SELECT * FROM v_ventas_detalle WHERE 1=1';
    const args = [];
    if (estado)      { sql += ' AND estado = ?';                    args.push(estado); }
    if (fecha_desde) { sql += ' AND fecha_venta >= ?';              args.push(fecha_desde); }
    if (fecha_hasta) { sql += ' AND fecha_venta <= ?';              args.push(fecha_hasta + ' 23:59:59'); }
    sql += ' ORDER BY fecha_venta DESC';
    const [rows] = await pool.query(sql, args);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener ventas.' });
  }
});
 
// GET reporte mensual solo admin y supervisor
router.get('/reporte-mensual', requireAuth, requireRol('admin', 'supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH ventas_mes AS (
        SELECT DATE_FORMAT(fecha_venta, '%Y-%m') AS mes,
               COUNT(*)   AS cantidad_ventas,
               SUM(total) AS total_mes,
               AVG(total) AS promedio_venta
        FROM VENTAS WHERE estado = 'completada'
        GROUP BY DATE_FORMAT(fecha_venta, '%Y-%m')
      )
      SELECT mes, cantidad_ventas,
             ROUND(total_mes, 2) AS total_mes,
             ROUND(promedio_venta, 2) AS promedio_venta
      FROM ventas_mes
      HAVING total_mes > 0
      ORDER BY mes DESC
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al generar reporte mensual.' });
  }
});
 
// GET rendimiento empleados solo admin y supervisor
router.get('/rendimiento-empleados', requireAuth, requireRol('admin', 'supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.empleado_id, e.nombre AS empleado, e.puesto,
             COUNT(v.venta_id)  AS total_ventas,
             SUM(v.total)       AS monto_total,
             AVG(v.total)       AS promedio_por_venta,
             SUM(dv.cantidad)   AS unidades_vendidas
      FROM EMPLEADOS e
      LEFT JOIN VENTAS v         ON v.empleado_id = e.empleado_id AND v.estado = 'completada'
      LEFT JOIN DETALLE_VENTAS dv ON dv.venta_id  = v.venta_id
      GROUP BY e.empleado_id, e.nombre, e.puesto
      ORDER BY monto_total DESC
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener rendimiento.' });
  }
});
 
// GET clientes frecuentes  solo admin y supervisor
router.get('/clientes-frecuentes', requireAuth, requireRol('admin', 'supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.cliente_id, cl.nombre AS cliente, cl.email,
             compras.total_compras, compras.monto_total
      FROM CLIENTES cl
      JOIN (
        SELECT cliente_id, COUNT(*) AS total_compras, SUM(total) AS monto_total
        FROM VENTAS WHERE estado = 'completada'
        GROUP BY cliente_id HAVING COUNT(*) >= 1
      ) compras ON compras.cliente_id = cl.cliente_id
      ORDER BY compras.monto_total DESC LIMIT 10
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener clientes frecuentes.' });
  }
});
 
// GET detalle de venta
router.get('/:id', requireAuth, requireRol('admin', 'supervisor', 'vendedor', 'cajero'), async (req, res) => {
  try {
    const [venta] = await pool.query('SELECT * FROM v_ventas_detalle WHERE venta_id = ?', [req.params.id]);
    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada.' });
    const [detalle] = await pool.query(`
      SELECT dv.detalle_id, dv.cantidad, dv.precio_unitario, dv.subtotal,
             p.nombre AS producto, p.marca, p.color, p.talla
      FROM DETALLE_VENTAS dv
      JOIN PRODUCTOS p ON p.producto_id = dv.producto_id
      WHERE dv.venta_id = ?
    `, [req.params.id]);
    return res.json({ ...venta[0], detalle });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener venta.' });
  }
});
 
// POST nueva venta  solo admin y vendedor
router.post('/', requireAuth, requireRol('admin', 'vendedor'), async (req, res) => {
  const { cliente_id, empleado_id, metodo_pago, items } = req.body;
 
  if (!cliente_id || !empleado_id || !metodo_pago || !items || items.length === 0) {
    return res.status(400).json({ error: 'Datos de venta incompletos.' });
  }
 
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
 
    let total = 0;
    for (const item of items) {
      const [prod] = await conn.query(
        'SELECT stock, precio_venta FROM PRODUCTOS WHERE producto_id = ? FOR UPDATE',
        [item.producto_id]
      );
      if (prod.length === 0) throw new Error(`Producto ${item.producto_id} no encontrado.`);
      if (prod[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ID ${item.producto_id}. Disponible: ${prod[0].stock}`);
      }
      item.precio_unitario = prod[0].precio_venta;
      item.subtotal        = prod[0].precio_venta * item.cantidad;
      total               += item.subtotal;
    }
 
    const [ventaRes] = await conn.query(
      `INSERT INTO VENTAS (cliente_id, empleado_id, fecha_venta, total, metodo_pago, estado)
       VALUES (?, ?, NOW(), ?, ?, 'completada')`,
      [cliente_id, empleado_id, total, metodo_pago]
    );
    const venta_id = ventaRes.insertId;
 
    for (const item of items) {
      await conn.query(
        `INSERT INTO DETALLE_VENTAS (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
      );
      await conn.query(
        'UPDATE PRODUCTOS SET stock = stock - ? WHERE producto_id = ?',
        [item.cantidad, item.producto_id]
      );
    }
 
    await conn.commit();
    return res.status(201).json({ message: 'Venta registrada.', venta_id, total });
  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ error: err.message || 'Error al registrar venta.' });
  } finally {
    conn.release();
  }
});
 
// PUT cambiar estado, solo admin y supervisor pueden anular
router.put('/:id/estado', requireAuth, requireRol('admin', 'supervisor'), async (req, res) => {
  const { estado } = req.body;
  if (!['completada', 'anulada', 'pendiente'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }
 
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [venta] = await conn.query('SELECT estado FROM VENTAS WHERE venta_id = ?', [req.params.id]);
    if (venta.length === 0) throw new Error('Venta no encontrada.');
 
    if (estado === 'anulada' && venta[0].estado !== 'anulada') {
      const [detalles] = await conn.query(
        'SELECT producto_id, cantidad FROM DETALLE_VENTAS WHERE venta_id = ?', [req.params.id]
      );
      for (const d of detalles) {
        await conn.query(
          'UPDATE PRODUCTOS SET stock = stock + ? WHERE producto_id = ?',
          [d.cantidad, d.producto_id]
        );
      }
    }
 
    await conn.query('UPDATE VENTAS SET estado = ? WHERE venta_id = ?', [estado, req.params.id]);
    await conn.commit();
    return res.json({ message: `Venta actualizada a: ${estado}.` });
  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});
 
module.exports = router;