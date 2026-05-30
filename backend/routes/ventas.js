// Ventas con Stored Procedures


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth');
const router  = express.Router();

// GET ventas
router.get('/', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;
    let sql = 'SELECT * FROM v_ventas_detalle WHERE 1=1';
    const args = [];
    if (estado)      { sql += ' AND estado = ?';          args.push(estado); }
    if (fecha_desde) { sql += ' AND fecha_venta >= ?';    args.push(fecha_desde); }
    if (fecha_hasta) { sql += ' AND fecha_venta <= ?';    args.push(fecha_hasta + ' 23:59:59'); }
    sql += ' ORDER BY fecha_venta DESC';
    const [rows] = await pool.query(sql, args);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener ventas.' });
  }
});

// GET reporte mensual con CTE y  GROUP BY
router.get('/reporte-mensual', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH ventas_mes AS (
        SELECT DATE_FORMAT(fecha_venta,'%Y-%m') AS mes,
               COUNT(*) AS cantidad_ventas, SUM(total) AS total_mes, AVG(total) AS promedio_venta
        FROM VENTAS WHERE estado='completada'
        GROUP BY DATE_FORMAT(fecha_venta,'%Y-%m')
      )
      SELECT mes, cantidad_ventas,
             ROUND(total_mes,2) AS total_mes, ROUND(promedio_venta,2) AS promedio_venta
      FROM ventas_mes HAVING total_mes > 0 ORDER BY mes DESC
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al generar reporte mensual.' });
  }
});

// GET rendimiento empleados que invoca reporte_ventas_empleado (SP5)
router.get('/rendimiento-empleados', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query('CALL reporte_ventas_empleado(?)', [0]);
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener rendimiento.' });
  }
});

// GET clientes frecuentes con subquery en FROM
router.get('/clientes-frecuentes', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.cliente_id, cl.nombre AS cliente, cl.email,
             compras.total_compras, compras.monto_total
      FROM CLIENTES cl
      JOIN (
        SELECT cliente_id, COUNT(*) AS total_compras, SUM(total) AS monto_total
        FROM VENTAS WHERE estado='completada'
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
router.get('/:id', requireAuth, requireRol('admin','supervisor','vendedor','cajero'), async (req, res) => {
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

// POST nueva venta que invoca registrar_venta  si es 1 producto
router.post('/', requireAuth, requireRol('admin','vendedor'), async (req, res) => {
  const { cliente_id, empleado_id, metodo_pago, items } = req.body;
  if (!cliente_id || !empleado_id || !metodo_pago || !items || items.length === 0)
    return res.status(400).json({ error: 'Datos de venta incompletos.' });

  // 1 producto enotonces  usa Stored procedure registrar_venta 
  if (items.length === 1) {
    try {
      await pool.query(
        'CALL registrar_venta(?,?,?,?,?,@p_vid,@p_total,@p_err)',
        [cliente_id, empleado_id, metodo_pago, items[0].producto_id, items[0].cantidad]
      );
      const [[r]] = await pool.query('SELECT @p_vid AS vid, @p_total AS total, @p_err AS err');
      if (r.err) return res.status(400).json({ error: r.err });
      return res.status(201).json({ message: 'Venta registrada.', venta_id: r.vid, total: r.total });
    } catch (err) {
      return res.status(500).json({ error: 'Error al registrar venta.' });
    }
  }

  // Varios productos entonces hace  transaccion explicita en Node
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    for (const item of items) {
      const [prod] = await conn.query(
        'SELECT stock, precio_venta FROM PRODUCTOS WHERE producto_id = ? FOR UPDATE',
        [item.producto_id]
      );
      if (!prod.length) throw new Error(`Producto ${item.producto_id} no encontrado.`);
      if (prod[0].stock < item.cantidad)
        throw new Error(`Stock insuficiente para producto ID ${item.producto_id}.`);
      item.precio_unitario = prod[0].precio_venta;
      item.subtotal        = prod[0].precio_venta * item.cantidad;
      total               += item.subtotal;
    }
    const [ventaRes] = await conn.query(
      `INSERT INTO VENTAS (cliente_id, empleado_id, fecha_venta, total, metodo_pago, estado)
       VALUES (?,?,NOW(),?,?,'completada')`,
      [cliente_id, empleado_id, total, metodo_pago]
    );
    const venta_id = ventaRes.insertId;
    for (const item of items) {
      await conn.query(
        'INSERT INTO DETALLE_VENTAS (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
      );
      await conn.query('UPDATE PRODUCTOS SET stock = stock - ? WHERE producto_id = ?',
        [item.cantidad, item.producto_id]);
    }
    await conn.commit();
    return res.status(201).json({ message: 'Venta registrada.', venta_id, total });
  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT anular venta que invoca anular_venta  con params OUT
router.put('/:id/estado', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  const { estado } = req.body;
  if (!['completada','anulada','pendiente'].includes(estado))
    return res.status(400).json({ error: 'Estado inválido.' });

  if (estado === 'anulada') {
    try {
      await pool.query('CALL anular_venta(?, @p_ok, @p_msg)', [req.params.id]);
      const [[r]] = await pool.query('SELECT @p_ok AS ok, @p_msg AS msg');
      if (!r.ok) return res.status(400).json({ error: r.msg });
      return res.json({ message: r.msg });
    } catch (err) {
      return res.status(500).json({ error: 'Error al anular venta.' });
    }
  }

  try {
    await pool.query('UPDATE VENTAS SET estado = ? WHERE venta_id = ?', [estado, req.params.id]);
    return res.json({ message: `Venta actualizada a: ${estado}.` });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar venta.' });
  }
});

module.exports = router;