// CRUD de Ventas
// Transaccio explicita BEGIN/COMMIT/ROLLBACK
// CTE (WITH), JOIN multiples tablas y subquery correlacionado


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

// GET /api/ventas 
// Va a ser el segundo JOIN  que  usa vista v_ventas_detalle (cliente + empleado + venta)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta, empleado_id } = req.query;

    let sql  = 'SELECT * FROM v_ventas_detalle WHERE 1=1';
    const args = [];

    if (estado)      { sql += ' AND estado = ?';          args.push(estado); }
    if (empleado_id) { sql += ' AND venta_id IN (SELECT venta_id FROM VENTAS WHERE empleado_id = ?)';
                       args.push(parseInt(empleado_id)); }
    if (fecha_desde) { sql += ' AND fecha_venta >= ?';    args.push(fecha_desde); }
    if (fecha_hasta) { sql += ' AND fecha_venta <= ?';    args.push(fecha_hasta + ' 23:59:59'); }

    sql += ' ORDER BY fecha_venta DESC';

    const [rows] = await pool.query(sql, args);
    return res.json(rows);
  } catch (err) {
    console.error('[ventas/GET]', err);
    return res.status(500).json({ error: 'Error al obtener ventas.' });
  }
});

//GET /api/ventas/reporte-mensual 
// CTE (WITH) + GROUP BY + HAVING como se ve en la rubrica
// Entonces muestra ventas por mes con total y cantidad
router.get('/reporte-mensual', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH ventas_mes AS (
        SELECT
          DATE_FORMAT(fecha_venta, '%Y-%m') AS mes,
          COUNT(*)                          AS cantidad_ventas,
          SUM(total)                        AS total_mes,
          AVG(total)                        AS promedio_venta
        FROM VENTAS
        WHERE estado = 'completada'
        GROUP BY DATE_FORMAT(fecha_venta, '%Y-%m')
      )
      SELECT
        mes,
        cantidad_ventas,
        ROUND(total_mes, 2)      AS total_mes,
        ROUND(promedio_venta, 2) AS promedio_venta
      FROM ventas_mes
      HAVING total_mes > 0
      ORDER BY mes DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error('[ventas/reporte-mensual]', err);
    return res.status(500).json({ error: 'Error al generar reporte mensual.' });
  }
});

// GET /api/ventas/rendimiento-empleados 
// va a ser el tercer JOIN  en  Empleados + Ventas + Detalle_Ventas con GROUP BY con funciones de agregación
router.get('/rendimiento-empleados', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.empleado_id,
        e.nombre              AS empleado,
        e.puesto,
        COUNT(v.venta_id)     AS total_ventas,
        SUM(v.total)          AS monto_total,
        AVG(v.total)          AS promedio_por_venta,
        SUM(dv.cantidad)      AS unidades_vendidas
      FROM EMPLEADOS e
      LEFT JOIN VENTAS        v   ON v.empleado_id  = e.empleado_id
                                  AND v.estado = 'completada'
      LEFT JOIN DETALLE_VENTAS dv ON dv.venta_id    = v.venta_id
      GROUP BY e.empleado_id, e.nombre, e.puesto
      ORDER BY monto_total DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error('[ventas/rendimiento-empleados]', err);
    return res.status(500).json({ error: 'Error al obtener rendimiento.' });
  }
});

//GET /api/ventas/clientes-frecuentes 
// Hay un Subquery en FROM para clientes que han comprado mas de 1 vez
router.get('/clientes-frecuentes', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        cl.cliente_id,
        cl.nombre   AS cliente,
        cl.email,
        compras.total_compras,
        compras.monto_total
      FROM CLIENTES cl
      JOIN (
        SELECT
          cliente_id,
          COUNT(*)   AS total_compras,
          SUM(total) AS monto_total
        FROM VENTAS
        WHERE estado = 'completada'
        GROUP BY cliente_id
        HAVING COUNT(*) >= 1
      ) compras ON compras.cliente_id = cl.cliente_id
      ORDER BY compras.monto_total DESC
      LIMIT 10
    `);
    return res.json(rows);
  } catch (err) {
    console.error('[ventas/clientes-frecuentes]', err);
    return res.status(500).json({ error: 'Error al obtener clientes frecuentes.' });
  }
});

//GET /api/ventas/:id 
// va a ser el detalle completo de una venta con sus liineas de producto
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Encabezado de la venta
    const [venta] = await pool.query(
      'SELECT * FROM v_ventas_detalle WHERE venta_id = ?',
      [req.params.id]
    );
    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada.' });

    // Lineas de detalle con nombre de producto
    const [detalle] = await pool.query(`
      SELECT
        dv.detalle_id,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre  AS producto,
        p.marca,
        p.color,
        p.talla
      FROM DETALLE_VENTAS dv
      JOIN PRODUCTOS p ON p.producto_id = dv.producto_id
      WHERE dv.venta_id = ?
    `, [req.params.id]);

    return res.json({ ...venta[0], detalle });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener venta.' });
  }
});

// POST /api/ventas 
// Para transaccion explicita en donde BEGIN va a validar stock con INSERT venta e  INSERT detalle_ventas con UPDATE stock y finalmente COMMIT
// Pero si algo falla entonces hace  ROLLBACK
router.post('/', requireAuth, async (req, res) => {
  const { cliente_id, empleado_id, metodo_pago, items } = req.body;

  // Validaciones previas a la transacción
  if (!cliente_id || !empleado_id || !metodo_pago || !items || items.length === 0) {
    return res.status(400).json({ error: 'Datos de venta incompletos.' });
  }

  const conn = await pool.getConnection();
  try {
    // BEGIN
    await conn.beginTransaction();

    // Validar stock y calcular total
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

    // INSERT encabezado de venta
    const [ventaRes] = await conn.query(
      `INSERT INTO VENTAS (cliente_id, empleado_id, fecha_venta, total, metodo_pago, estado)
       VALUES (?, ?, NOW(), ?, ?, 'completada')`,
      [cliente_id, empleado_id, total, metodo_pago]
    );
    const venta_id = ventaRes.insertId;

    // INSERT líneas de detalle + UPDATE stock
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

    // COMMIT
    await conn.commit();
    return res.status(201).json({ message: 'Venta registrada.', venta_id, total });

  } catch (err) {
    //  ROLLBACK 
    await conn.rollback();
    console.error('[ventas/POST - ROLLBACK]', err.message);
    return res.status(400).json({ error: err.message || 'Error al registrar venta. Cambios revertidos.' });
  } finally {
    conn.release();
  }
});

// PUT /api/ventas/:id/estado
// Anular o cambiar estado de una venta (con transaccion)
router.put('/:id/estado', requireAuth, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['completada', 'anulada', 'pendiente'];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [venta] = await conn.query(
      'SELECT estado FROM VENTAS WHERE venta_id = ?',
      [req.params.id]
    );
    if (venta.length === 0) throw new Error('Venta no encontrada.');

    // Si se anula, devolver stock
    if (estado === 'anulada' && venta[0].estado !== 'anulada') {
      const [detalles] = await conn.query(
        'SELECT producto_id, cantidad FROM DETALLE_VENTAS WHERE venta_id = ?',
        [req.params.id]
      );
      for (const d of detalles) {
        await conn.query(
          'UPDATE PRODUCTOS SET stock = stock + ? WHERE producto_id = ?',
          [d.cantidad, d.producto_id]
        );
      }
    }

    await conn.query(
      'UPDATE VENTAS SET estado = ? WHERE venta_id = ?',
      [estado, req.params.id]
    );

    await conn.commit();
    return res.json({ message: `Venta actualizada a estado: ${estado}.` });
  } catch (err) {
    await conn.rollback();
    console.error('[ventas/estado - ROLLBACK]', err.message);
    return res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
