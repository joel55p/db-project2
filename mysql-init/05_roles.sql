-- CapGt — Se inicia el proyecto3 con roles
--  justamente este archivo se trata de los roles en el DBMS con permisos granulares
-- Joel Nerio, 24253
-- ---------------------------------------------------------------------------------
-- Ahora bien se definen 5 roles con CREATE ROLE y permisos con GRANT/REVOKE
-- Los roles existen en el DBMS, no solo en la lógica de aplicación
-- ---------------------------------------------------------------------------------

USE capgt_db;

--  se crean los 5 Roles.

-- Rol 1: Administrador = acceso total a totalmente todo
CREATE ROLE IF NOT EXISTS 'rol_admin';

-- Rol 2: Supervisor = puede VER todo y tambien gestionar a  empleados o reportes
CREATE ROLE IF NOT EXISTS 'rol_supervisor';

-- Rol 3: Vendedor = puede registrar ventas y ver productos o clientes
CREATE ROLE IF NOT EXISTS 'rol_vendedor';

-- Rol 4: Cajero = solo puede ver ventas y registrar pagos tambien 
CREATE ROLE IF NOT EXISTS 'rol_cajero';

-- Rol 5: Bodeguero = solo puede ver y actualizar stock de productos
CREATE ROLE IF NOT EXISTS 'rol_bodeguero';


--  privilegios ROL_ADMIN (todo)  
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.CATEGORIAS    TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.PROVEEDORES    TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.PRODUCTOS      TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.CLIENTES       TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.EMPLEADOS      TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.VENTAS         TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.DETALLE_VENTAS TO 'rol_admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.USUARIOS       TO 'rol_admin';


-- privilegios ROL_SUPERVISOR 
-- Puede ver todo, gestionar empleados, ver reportes
-- Lo que no puede es  eliminar ventas ni modificar productos críticos
GRANT SELECT                         ON capgt_db.CATEGORIAS    TO 'rol_supervisor';
GRANT SELECT                         ON capgt_db.PROVEEDORES    TO 'rol_supervisor';
GRANT SELECT                         ON capgt_db.PRODUCTOS      TO 'rol_supervisor';
GRANT SELECT                         ON capgt_db.CLIENTES       TO 'rol_supervisor';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.EMPLEADOS      TO 'rol_supervisor';
GRANT SELECT, UPDATE                 ON capgt_db.VENTAS         TO 'rol_supervisor';
GRANT SELECT                         ON capgt_db.DETALLE_VENTAS TO 'rol_supervisor';
GRANT SELECT                         ON capgt_db.USUARIOS       TO 'rol_supervisor';


-- privilegios ROL_VENDEDOR 
-- Puede registrar ventas, ver productos y clientes
--  no puede modificar productos ni empleados
GRANT SELECT                         ON capgt_db.CATEGORIAS    TO 'rol_vendedor';
GRANT SELECT                         ON capgt_db.PROVEEDORES    TO 'rol_vendedor';
GRANT SELECT                         ON capgt_db.PRODUCTOS      TO 'rol_vendedor';
GRANT SELECT, INSERT, UPDATE, DELETE ON capgt_db.CLIENTES       TO 'rol_vendedor';
GRANT SELECT                         ON capgt_db.EMPLEADOS      TO 'rol_vendedor';
GRANT SELECT, INSERT                 ON capgt_db.VENTAS         TO 'rol_vendedor';
GRANT SELECT, INSERT                 ON capgt_db.DETALLE_VENTAS TO 'rol_vendedor';


-- privilegios ROL_CAJERO 
-- Solo puede ver ventas y actualizar su estado  osea completar/anular
-- Lo que no puede es crear productos ni modificar clientes
GRANT SELECT                         ON capgt_db.PRODUCTOS      TO 'rol_cajero';
GRANT SELECT                         ON capgt_db.CLIENTES       TO 'rol_cajero';
GRANT SELECT, UPDATE                 ON capgt_db.VENTAS         TO 'rol_cajero';
GRANT SELECT                         ON capgt_db.DETALLE_VENTAS TO 'rol_cajero';


-- privilegios para ROL_BODEGUERO 
-- Solo puede ver y actualizar stock de productos
-- Lo que no puede es ver ventas ni clientes
GRANT SELECT                         ON capgt_db.CATEGORIAS    TO 'rol_bodeguero';
GRANT SELECT                         ON capgt_db.PROVEEDORES    TO 'rol_bodeguero';
GRANT SELECT, UPDATE                 ON capgt_db.PRODUCTOS      TO 'rol_bodeguero';


--  Crear users en MySQL con sus roles
-- Un usuario de base de datos por rol para calificación

-- user admin
CREATE USER IF NOT EXISTS 'usr_admin'@'%'     IDENTIFIED BY 'secret';
CREATE USER IF NOT EXISTS 'usr_supervisor'@'%' IDENTIFIED BY 'secret';
CREATE USER IF NOT EXISTS 'usr_vendedor'@'%'   IDENTIFIED BY 'secret';
CREATE USER IF NOT EXISTS 'usr_cajero'@'%'     IDENTIFIED BY 'secret';
CREATE USER IF NOT EXISTS 'usr_bodeguero'@'%'  IDENTIFIED BY 'secret';

-- Asignar roles a los usuarios
GRANT 'rol_admin'      TO 'usr_admin'@'%';
GRANT 'rol_supervisor' TO 'usr_supervisor'@'%';
GRANT 'rol_vendedor'   TO 'usr_vendedor'@'%';
GRANT 'rol_cajero'     TO 'usr_cajero'@'%';
GRANT 'rol_bodeguero'  TO 'usr_bodeguero'@'%';

-- Activar roles por defecto al conectarse
SET DEFAULT ROLE 'rol_admin'      TO 'usr_admin'@'%';
SET DEFAULT ROLE 'rol_supervisor' TO 'usr_supervisor'@'%';
SET DEFAULT ROLE 'rol_vendedor'   TO 'usr_vendedor'@'%';
SET DEFAULT ROLE 'rol_cajero'     TO 'usr_cajero'@'%';
SET DEFAULT ROLE 'rol_bodeguero'  TO 'usr_bodeguero'@'%';

FLUSH PRIVILEGES;