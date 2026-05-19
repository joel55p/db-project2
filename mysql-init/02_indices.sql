-- -------------------------------------------
-- CapGt — Tienda de Gorras en Guate
-- 02_indices.sql — Índices explícitos
-- Joel Nerio, 24253
-- ---------------------------------------------
USE capgt_db;
 
-- Productos por marca filtros del catálogo
CREATE INDEX idx_productos_marca     ON PRODUCTOS (marca);
 
-- Productos por categoría navegación principal
CREATE INDEX idx_productos_categoria ON PRODUCTOS (categoria_id);
 
-- Ventas por fecha reportes diarios/mensuales
CREATE INDEX idx_ventas_fecha        ON VENTAS (fecha_venta);
 
-- Ventas por empleado  que es módulo de rendimiento
CREATE INDEX idx_ventas_empleado     ON VENTAS (empleado_id);
 
-- Detalle por venta que es JOIN más frecuente
CREATE INDEX idx_detalle_venta       ON DETALLE_VENTAS (venta_id);
 