//  CRUD  y  actualizar_stock 


const express = require('express');
const pool    = require('../db/pool');
const { requireAuth, requireRol } = require('../middleware/auth');
const router  = express.Router();

// GET todos
router.get('/', requireAuth, async (req, res) => {
  try {
    const { marca, categoria_id, stock_bajo } = req.query;
    let sql = 'SELECT * FROM v_catalogo_productos WHERE 1=1';
    const args = [];
    if (marca)        { sql += ' AND marca = ?'; args.push(marca); }
    if (categoria_id) { sql += ' AND producto_id IN (SELECT producto_id FROM PRODUCTOS WHERE categoria_id = ?)'; args.push(parseInt(categoria_id)); }
    if (stock_bajo === '1') { sql += ' AND stock_bajo = 1'; }
    sql += ' ORDER BY nombre';
    const [rows] = await pool.query(sql, args);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

// GET marcas
router.get('/marcas', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT marca FROM PRODUCTOS ORDER BY marca');
    return res.json(rows.map(r => r.marca));
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener marcas.' });
  }
});

// GET mas vendidos  con  GROUP BY  y HAVING
router.get('/mas-vendidos', requireAuth, requireRol('admin','supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.nombre, p.marca, c.nombre AS categoria,
             SUM(dv.cantidad) AS total_vendido, SUM(dv.subtotal) AS ingresos_total, p.stock
      FROM DETALLE_VENTAS dv
      JOIN PRODUCTOS p  ON p.producto_id  = dv.producto_id
      JOIN CATEGORIAS c ON c.categoria_id = p.categoria_id
      JOIN VENTAS v     ON v.venta_id     = dv.venta_id
      WHERE v.estado = 'completada'
      GROUP BY p.producto_id, p.nombre, p.marca, c.nombre, p.stock
      HAVING SUM(dv.cantidad) >= 1
      ORDER BY total_vendido DESC LIMIT 10
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener reporte.' });
  }
});

// GET stock critico con  EXISTS subquery
router.get('/stock-critico', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.nombre, p.marca, p.stock, p.stock_minimo,
             c.nombre AS categoria, pr.nombre AS proveedor, pr.email AS proveedor_email
      FROM PRODUCTOS p
      JOIN CATEGORIAS c   ON c.categoria_id  = p.categoria_id
      JOIN PROVEEDORES pr ON pr.proveedor_id = p.proveedor_id
      WHERE p.stock <= p.stock_minimo
        AND EXISTS (SELECT 1 FROM DETALLE_VENTAS dv WHERE dv.producto_id = p.producto_id)
      ORDER BY p.stock ASC
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener stock crítico.' });
  }
});

// GET por ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_catalogo_productos WHERE producto_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener producto.' });
  }
});

// POST  que es SQL directo
router.post('/', requireAuth, requireRol('admin','bodeguero'), async (req, res) => {
  const { categoria_id, proveedor_id, nombre, marca, talla, color,
          precio_compra, precio_venta, stock, stock_minimo } = req.body;
  if (!categoria_id || !proveedor_id || !nombre || !marca || !talla || !color
      || precio_compra == null || precio_venta == null)
    return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
  if (parseFloat(precio_venta) <= parseFloat(precio_compra))
    return res.status(400).json({ error: 'El precio de venta debe ser mayor al precio de compra.' });
  try {
    const [result] = await pool.query(
      `INSERT INTO PRODUCTOS (categoria_id, proveedor_id, nombre, marca, talla, color,
         precio_compra, precio_venta, stock, stock_minimo) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [categoria_id, proveedor_id, nombre, marca, talla, color,
       precio_compra, precio_venta, stock || 0, stock_minimo || 5]
    );
    return res.status(201).json({ message: 'Producto creado.', producto_id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear producto.' });
  }
});

// PUT  con  SQL directo para datos  y  actualizar_stock  para el stock
router.put('/:id', requireAuth, requireRol('admin','bodeguero'), async (req, res) => {
  const { categoria_id, proveedor_id, nombre, marca, talla, color,
          precio_compra, precio_venta, stock, stock_minimo } = req.body;
  if (precio_compra && precio_venta && parseFloat(precio_venta) <= parseFloat(precio_compra))
    return res.status(400).json({ error: 'El precio de venta debe ser mayor al precio de compra.' });
  try {
    const [result] = await pool.query(
      `UPDATE PRODUCTOS SET categoria_id=?, proveedor_id=?, nombre=?, marca=?,
         talla=?, color=?, precio_compra=?, precio_venta=?
       WHERE producto_id=?`,
      [categoria_id, proveedor_id, nombre, marca, talla, color,
       precio_compra, precio_venta, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado.' });

    // Actualizar stock via el procedimiento actualizar_stock 
    if (stock != null && stock_minimo != null) {
      await pool.query('CALL actualizar_stock(?, ?, ?, @p_ok, @p_msg)',
        [req.params.id, stock, stock_minimo]);
      const [[r]] = await pool.query('SELECT @p_ok AS ok, @p_msg AS msg');
      if (!r.ok) return res.status(400).json({ error: r.msg });
    }

    return res.json({ message: 'Producto actualizado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar producto.' });
  }
});

// DELETE
router.delete('/:id', requireAuth, requireRol('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM PRODUCTOS WHERE producto_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json({ message: 'Producto eliminado.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ error: 'No se puede eliminar: tiene ventas asociadas.' });
    return res.status(500).json({ error: 'Error al eliminar producto.' });
  }
});

module.exports = router;