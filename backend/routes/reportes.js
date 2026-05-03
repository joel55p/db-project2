// Exportacion de reportes (CSV / PDF)


const express = require('express');
const pool    = require('../db/pool');
const PDFDocument = require('pdfkit');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

// GET /api/reportes/ventas/csv  Exporta ventas a CSV (va a estar visible desde la UI)
router.get('/ventas/csv', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        v.venta_id,
        DATE_FORMAT(v.fecha_venta,'%Y-%m-%d %H:%i') AS fecha,
        cl.nombre   AS cliente,
        e.nombre    AS empleado,
        v.total,
        v.metodo_pago,
        v.estado
      FROM VENTAS v
      JOIN CLIENTES  cl ON cl.cliente_id  = v.cliente_id
      JOIN EMPLEADOS e  ON e.empleado_id  = v.empleado_id
      ORDER BY v.fecha_venta DESC
    `);

    const headers = ['ID','Fecha','Cliente','Empleado','Total (Q)','Método de Pago','Estado'];
    const lines   = [headers.join(',')];

    for (const r of rows) {
      lines.push([
        r.venta_id,
        r.fecha,
        `"${r.cliente}"`,
        `"${r.empleado}"`,
        r.total,
        r.metodo_pago,
        r.estado
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ventas_capgt.csv"');
    return res.send('\uFEFF' + lines.join('\n')); // BOM para Excel
  } catch (err) {
    console.error('[reportes/csv]', err);
    return res.status(500).json({ error: 'Error al generar CSV.' });
  }
});

// GET /api/reportes/ventas/pdf , va a  Exportar reporte mensual a PDF
router.get('/ventas/pdf', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH ventas_mes AS (
        SELECT
          DATE_FORMAT(fecha_venta,'%Y-%m') AS mes,
          COUNT(*)                          AS cantidad,
          SUM(total)                        AS total_mes
        FROM VENTAS WHERE estado='completada'
        GROUP BY DATE_FORMAT(fecha_venta,'%Y-%m')
      )
      SELECT mes, cantidad, ROUND(total_mes,2) AS total_mes
      FROM ventas_mes ORDER BY mes DESC
    `);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_capgt.pdf"');
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('CapGt — Reporte Mensual de Ventas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, { align: 'center' });
    doc.moveDown(2);

    // Tabla
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Mes', 50, doc.y, { width: 120 });
    doc.text('Ventas', 170, doc.y - doc.currentLineHeight(), { width: 100 });
    doc.text('Total (Q)', 270, doc.y - doc.currentLineHeight(), { width: 150 });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    for (const r of rows) {
      const y = doc.y;
      doc.text(r.mes,       50,  y, { width: 120 });
      doc.text(String(r.cantidad), 170, y, { width: 100 });
      doc.text(`Q ${r.total_mes}`, 270, y, { width: 150 });
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (err) {
    console.error('[reportes/pdf]', err);
    return res.status(500).json({ error: 'Error al generar PDF.' });
  }
});

// GET /api/reportes/inventario/csv 
router.get('/inventario/csv', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_catalogo_productos ORDER BY nombre');
    const headers = ['ID','Nombre','Marca','Talla','Color','Categoría','Proveedor',
                     'Precio Compra','Precio Venta','Stock','Stock Mínimo','Stock Bajo'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([
        r.producto_id, `"${r.nombre}"`, r.marca, r.talla, r.color,
        `"${r.categoria}"`, `"${r.proveedor}"`,
        r.precio_compra, r.precio_venta, r.stock, r.stock_minimo,
        r.stock_bajo ? 'Sí' : 'No'
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inventario_capgt.csv"');
    return res.send('\uFEFF' + lines.join('\n'));
  } catch (err) {
    return res.status(500).json({ error: 'Error al exportar inventario.' });
  }
});

module.exports = router;
