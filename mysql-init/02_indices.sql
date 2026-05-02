-- -------------------------------------------
-- CapGt — Tienda de Gorras en Guate
-- 02_indices.sql — Índices explícitos
-- Joel Nerio, 24253
-- ---------------------------------------------

USE capgt_db;

-- Índice 1: Productos por marca
-- Justificación: el catálogo filtra por marca (New Era, Nike, Adidas…).
-- Sin este índice cada filtro requiere full-scan de PRODUCTOS.
CREATE INDEX idx_productos_marca
    ON PRODUCTOS (marca);

-- Índice 2: Productos por categoría
-- Justificación: navegación por categoría (Snapback, Fitted, Trucker…)
-- es el flujo principal del catálogo y del JOIN con CATEGORIAS.
CREATE INDEX idx_productos_categoria
    ON PRODUCTOS (categoria_id);

-- Índice 3: Ventas por fecha
-- Justificación: todos los reportes usan WHERE fecha_venta BETWEEN … AND …
-- Sin índice cada reporte escanea toda la tabla VENTAS.
CREATE INDEX idx_ventas_fecha
    ON VENTAS (fecha_venta);

-- Índice 4: Ventas por empleado
-- Justificación: módulo de comisiones y rendimiento filtra por empleado_id.
CREATE INDEX idx_ventas_empleado
    ON VENTAS (empleado_id);

-- Índice 5: Detalle por venta (acelera JOIN más frecuente)
CREATE INDEX idx_detalle_venta
    ON DETALLE_VENTAS (venta_id);
