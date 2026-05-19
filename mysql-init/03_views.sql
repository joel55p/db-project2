-- ------------------------------------------------
-- CapGt — Tienda de Gorras en Guate
-- 03_views.sql  — Vistas usadas por el backend para la UI
-- Joel Nerio, 24253
-- --------------------------------------------------

USE capgt_db;
 
-- VIEW 1: Catálogo completo de productos con categoría y proveedor
CREATE OR REPLACE VIEW v_catalogo_productos AS
SELECT
    p.producto_id,
    p.nombre,
    p.marca,
    p.talla,
    p.color,
    p.precio_venta,
    p.precio_compra,
    p.stock,
    p.stock_minimo,
    c.nombre          AS categoria,
    pr.nombre         AS proveedor,
    IF(p.stock <= p.stock_minimo, 1, 0) AS stock_bajo
FROM PRODUCTOS p
JOIN CATEGORIAS  c  ON c.categoria_id  = p.categoria_id
JOIN PROVEEDORES pr ON pr.proveedor_id = p.proveedor_id;
 
-- VIEW 2: Ventas con datos de cliente y empleado
CREATE OR REPLACE VIEW v_ventas_detalle AS
SELECT
    v.venta_id,
    v.fecha_venta,
    v.total,
    v.metodo_pago,
    v.estado,
    cl.nombre AS cliente,
    cl.email  AS cliente_email,
    e.nombre  AS empleado,
    e.puesto  AS empleado_puesto
FROM VENTAS v
JOIN CLIENTES  cl ON cl.cliente_id = v.cliente_id
JOIN EMPLEADOS e  ON e.empleado_id = v.empleado_id;