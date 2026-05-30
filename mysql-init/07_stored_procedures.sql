

—- Stored Procedures
-- ----------------------------------------------------

USE capgt_db;

DELIMITER $$


-- 1: registrar_venta
-- Registra una venta con START TRANSACTION y  ROLLBACK
-- IN: cliente_id, empleado_id, metodo_pago, producto_id, cantidad
-- OUT: p_venta_id, p_total, p_error
-- -----------------------------------------------------------
DROP PROCEDURE IF EXISTS registrar_venta $$
CREATE PROCEDURE registrar_venta(
    IN  p_cliente_id   INT,
    IN  p_empleado_id  INT,
    IN  p_metodo_pago  VARCHAR(30),
    IN  p_producto_id  INT,
    IN  p_cantidad     INT,
    OUT p_venta_id     INT,
    OUT p_total        DECIMAL(10,2),
    OUT p_error        VARCHAR(255)
)
BEGIN
    DECLARE v_stock    INT DEFAULT 0;
    DECLARE v_precio   DECIMAL(10,2) DEFAULT 0;
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_venta_id = 0;
        SET p_total    = 0;
        SET p_error    = 'Error interno al registrar la venta. Cambios revertidos.';
    END;

    SET p_error    = '';
    SET p_venta_id = 0;
    SET p_total    = 0;

    SELECT stock, precio_venta INTO v_stock, v_precio
    FROM PRODUCTOS
    WHERE producto_id = p_producto_id
    FOR UPDATE;

    IF v_stock IS NULL THEN
        SET p_error = 'Producto no encontrado.';
        LEAVE registrar_venta;
    END IF;

    IF v_stock < p_cantidad THEN
        SET p_error = CONCAT('Stock insuficiente. Disponible: ', v_stock);
        LEAVE registrar_venta;
    END IF;

    SET v_subtotal = v_precio * p_cantidad;
    SET p_total    = v_subtotal;

    START TRANSACTION;

        INSERT INTO VENTAS (cliente_id, empleado_id, fecha_venta, total, metodo_pago, estado)
        VALUES (p_cliente_id, p_empleado_id, NOW(), p_total, p_metodo_pago, 'completada');

        SET p_venta_id = LAST_INSERT_ID();

        INSERT INTO DETALLE_VENTAS (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (p_venta_id, p_producto_id, p_cantidad, v_precio, v_subtotal);

        UPDATE PRODUCTOS SET stock = stock - p_cantidad
        WHERE producto_id = p_producto_id;

    COMMIT;

    SET p_error = '';
END $$


-- 2: anular_venta
-- Anula una venta y devuelve el stock
-- IN: p_venta_id
-- OUT: p_ok (1=exito, 0=error), p_mensaje
-- ---------------------------------------------
DROP PROCEDURE IF EXISTS anular_venta $$
CREATE PROCEDURE anular_venta(
    IN  p_venta_id  INT,
    OUT p_ok        TINYINT,
    OUT p_mensaje   VARCHAR(255)
)
BEGIN
    DECLARE v_estado   VARCHAR(20);
    DECLARE v_producto INT;
    DECLARE v_cantidad INT;
    DECLARE done       INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT producto_id, cantidad FROM DETALLE_VENTAS WHERE venta_id = p_venta_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ok      = 0;
        SET p_mensaje = 'Error al anular la venta. Cambios revertidos.';
    END;

    SET p_ok      = 0;
    SET p_mensaje = '';

    SELECT estado INTO v_estado FROM VENTAS WHERE venta_id = p_venta_id;

    IF v_estado IS NULL THEN
        SET p_mensaje = 'Venta no encontrada.';
        LEAVE anular_venta;
    END IF;

    IF v_estado = 'anulada' THEN
        SET p_mensaje = 'La venta ya esta anulada.';
        LEAVE anular_venta;
    END IF;

    START TRANSACTION;

        OPEN cur;
        loop_detalle: LOOP
            FETCH cur INTO v_producto, v_cantidad;
            IF done THEN LEAVE loop_detalle; END IF;
            UPDATE PRODUCTOS SET stock = stock + v_cantidad
            WHERE producto_id = v_producto;
        END LOOP;
        CLOSE cur;

        UPDATE VENTAS SET estado = 'anulada' WHERE venta_id = p_venta_id;

    COMMIT;

    SET p_ok      = 1;
    SET p_mensaje = 'Venta anulada correctamente. Stock devuelto.';
END $$


-- 3: actualizar_stock
-- Actualiza stock de un producto con validaciones
-- IN: p_producto_id, p_nuevo_stock, p_nuevo_minimo
-- OUT: p_ok, p_mensaje
-- ---------------------------------------------------
DROP PROCEDURE IF EXISTS actualizar_stock $$
CREATE PROCEDURE actualizar_stock(
    IN  p_producto_id  INT,
    IN  p_nuevo_stock  INT,
    IN  p_nuevo_minimo INT,
    OUT p_ok           TINYINT,
    OUT p_mensaje      VARCHAR(255)
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_ok      = 0;
        SET p_mensaje = 'Error al actualizar el stock.';
    END;

    SELECT COUNT(*) INTO v_existe FROM PRODUCTOS WHERE producto_id = p_producto_id;

    IF v_existe = 0 THEN
        SET p_ok      = 0;
        SET p_mensaje = 'Producto no encontrado.';
        LEAVE actualizar_stock;
    END IF;

    IF p_nuevo_stock < 0 THEN
        SET p_ok      = 0;
        SET p_mensaje = 'El stock no puede ser negativo.';
        LEAVE actualizar_stock;
    END IF;

    UPDATE PRODUCTOS
    SET stock        = p_nuevo_stock,
        stock_minimo = p_nuevo_minimo
    WHERE producto_id = p_producto_id;

    SET p_ok      = 1;
    SET p_mensaje = 'Stock actualizado correctamente.';
END $$



-- 4: crear_cliente
-- Crea un cliente validando email duplicado
-- IN: nombre, email, telefono, direccion
-- OUT: p_cliente_id, p_ok, p_mensaje
-- -------------------------------------------------
DROP PROCEDURE IF EXISTS crear_cliente $$
CREATE PROCEDURE crear_cliente(
    IN  p_nombre     VARCHAR(80),
    IN  p_email      VARCHAR(100),
    IN  p_telefono   VARCHAR(20),
    IN  p_direccion  TEXT,
    OUT p_cliente_id INT,
    OUT p_ok         TINYINT,
    OUT p_mensaje    VARCHAR(255)
)
BEGIN
    DECLARE v_duplicado INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_ok         = 0;
        SET p_cliente_id = 0;
        SET p_mensaje    = 'Error al crear el cliente.';
    END;

    IF p_email IS NOT NULL AND p_email != '' THEN
        SELECT COUNT(*) INTO v_duplicado
        FROM CLIENTES WHERE email = p_email;

        IF v_duplicado > 0 THEN
            SET p_ok         = 0;
            SET p_cliente_id = 0;
            SET p_mensaje    = 'El email ya esta registrado.';
            LEAVE crear_cliente;
        END IF;
    END IF;

    INSERT INTO CLIENTES (nombre, email, telefono, direccion, fecha_registro)
    VALUES (p_nombre, NULLIF(p_email,''), NULLIF(p_telefono,''), NULLIF(p_direccion,''), CURDATE());

    SET p_cliente_id = LAST_INSERT_ID();
    SET p_ok         = 1;
    SET p_mensaje    = 'Cliente creado correctamente.';
END $$



-- 5: reporte_ventas_empleado
-- Reporte de ventas por empleado
-- IN: p_empleado_id (0 = todos)
-- ----------------------------------------------
DROP PROCEDURE IF EXISTS reporte_ventas_empleado $$
CREATE PROCEDURE reporte_ventas_empleado(
    IN p_empleado_id INT
)
BEGIN
    IF p_empleado_id = 0 THEN
        SELECT
            e.empleado_id,
            e.nombre     AS empleado,
            e.puesto,
            COUNT(v.venta_id)            AS total_ventas,
            IFNULL(SUM(v.total),    0)   AS monto_total,
            IFNULL(AVG(v.total),    0)   AS promedio_venta,
            IFNULL(SUM(dv.cantidad),0)   AS unidades_vendidas
        FROM EMPLEADOS e
        LEFT JOIN VENTAS v          ON v.empleado_id = e.empleado_id AND v.estado = 'completada'
        LEFT JOIN DETALLE_VENTAS dv ON dv.venta_id   = v.venta_id
        GROUP BY e.empleado_id, e.nombre, e.puesto
        ORDER BY monto_total DESC;
    ELSE
        SELECT
            e.empleado_id,
            e.nombre     AS empleado,
            e.puesto,
            COUNT(v.venta_id)            AS total_ventas,
            IFNULL(SUM(v.total),    0)   AS monto_total,
            IFNULL(AVG(v.total),    0)   AS promedio_venta,
            IFNULL(SUM(dv.cantidad),0)   AS unidades_vendidas
        FROM EMPLEADOS e
        LEFT JOIN VENTAS v          ON v.empleado_id = e.empleado_id AND v.estado = 'completada'
        LEFT JOIN DETALLE_VENTAS dv ON dv.venta_id   = v.venta_id
        WHERE e.empleado_id = p_empleado_id
        GROUP BY e.empleado_id, e.nombre, e.puesto;
    END IF;
END $$
