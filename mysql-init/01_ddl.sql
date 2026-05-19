-- ------------------------------------------------------
-- CapGt — Tienda de Gorras en Guate
-- 01_ddl.sql  — Definición de tablas (DDL)
-- MySQL 8.0 · InnoDB · utf8mb4
-- Joel Nerio, 24253
-- ------------------------------------------------------

CREATE DATABASE IF NOT EXISTS capgt_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
 
USE capgt_db;
 
CREATE TABLE IF NOT EXISTS CATEGORIAS (
    categoria_id  INT          NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(60)  NOT NULL,
    descripcion   TEXT,
    CONSTRAINT pk_categorias PRIMARY KEY (categoria_id),
    CONSTRAINT uq_cat_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS PROVEEDORES (
    proveedor_id  INT          NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(100) NOT NULL,
    contacto      VARCHAR(80),
    telefono      VARCHAR(20),
    email         VARCHAR(100),
    pais          VARCHAR(60)  NOT NULL,
    CONSTRAINT pk_proveedores PRIMARY KEY (proveedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS EMPLEADOS (
    empleado_id        INT           NOT NULL AUTO_INCREMENT,
    nombre             VARCHAR(80)   NOT NULL,
    puesto             VARCHAR(60)   NOT NULL,
    email              VARCHAR(100),
    telefono           VARCHAR(20),
    fecha_contratacion DATE          NOT NULL,
    salario            DECIMAL(10,2) NOT NULL,
    CONSTRAINT pk_empleados PRIMARY KEY (empleado_id),
    CONSTRAINT uq_emp_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS CLIENTES (
    cliente_id     INT          NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(80)  NOT NULL,
    email          VARCHAR(100),
    telefono       VARCHAR(20),
    direccion      TEXT,
    fecha_registro DATE         NOT NULL,
    CONSTRAINT pk_clientes  PRIMARY KEY (cliente_id),
    CONSTRAINT uq_cli_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS PRODUCTOS (
    producto_id   INT           NOT NULL AUTO_INCREMENT,
    categoria_id  INT           NOT NULL,
    proveedor_id  INT           NOT NULL,
    nombre        VARCHAR(120)  NOT NULL,
    marca         VARCHAR(60)   NOT NULL,
    talla         VARCHAR(10)   NOT NULL,
    color         VARCHAR(40)   NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta  DECIMAL(10,2) NOT NULL,
    stock         INT           NOT NULL DEFAULT 0,
    stock_minimo  INT           NOT NULL DEFAULT 5,
    CONSTRAINT pk_productos PRIMARY KEY (producto_id),
    CONSTRAINT fk_prod_cat  FOREIGN KEY (categoria_id)
        REFERENCES CATEGORIAS(categoria_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_prod_prov FOREIGN KEY (proveedor_id)
        REFERENCES PROVEEDORES(proveedor_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS VENTAS (
    venta_id    INT           NOT NULL AUTO_INCREMENT,
    cliente_id  INT           NOT NULL,
    empleado_id INT           NOT NULL,
    fecha_venta DATETIME      NOT NULL,
    total       DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30)   NOT NULL,
    estado      VARCHAR(20)   NOT NULL DEFAULT 'completada',
    CONSTRAINT pk_ventas  PRIMARY KEY (venta_id),
    CONSTRAINT fk_vta_cli FOREIGN KEY (cliente_id)
        REFERENCES CLIENTES(cliente_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_vta_emp FOREIGN KEY (empleado_id)
        REFERENCES EMPLEADOS(empleado_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS DETALLE_VENTAS (
    detalle_id      INT           NOT NULL AUTO_INCREMENT,
    venta_id        INT           NOT NULL,
    producto_id     INT           NOT NULL,
    cantidad        INT           NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    CONSTRAINT pk_detalle  PRIMARY KEY (detalle_id),
    CONSTRAINT fk_det_vta  FOREIGN KEY (venta_id)
        REFERENCES VENTAS(venta_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_det_prod FOREIGN KEY (producto_id)
        REFERENCES PRODUCTOS(producto_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
CREATE TABLE IF NOT EXISTS USUARIOS (
    usuario_id  INT          NOT NULL AUTO_INCREMENT,
    username    VARCHAR(60)  NOT NULL,
    password    VARCHAR(255) NOT NULL,
    rol         VARCHAR(20)  NOT NULL DEFAULT 'vendedor',
    empleado_id INT,
    CONSTRAINT pk_usuarios PRIMARY KEY (usuario_id),
    CONSTRAINT uq_username  UNIQUE (username),
    CONSTRAINT fk_usr_emp   FOREIGN KEY (empleado_id)
        REFERENCES EMPLEADOS(empleado_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;