# Esquema de Roles — CapGt Proyecto 3
Joel Nerio — 24253

## Resumen

Se def 5 roles en el DBMS usando `CREATE ROLE`, `GRANT` y `REVOKE`.
Cada rol corresponde a un tipo de usuario con responsabilidades distintas.

'x'= si
'o' = nx

---

## Roles definidos

### 1. rol_admin
**Usuario de prueba:** admin / admin123
**Descripción:** Acceso total al sistema. Puede hacer todo.

| Tabla           | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| CATEGORIAS      | x     | x     | x     | x     |
| PROVEEDORES     | x     | x     | x     | x     |
| PRODUCTOS       | x     | x     | x     | x     |
| CLIENTES        | x     | x     | x     | x     |
| EMPLEADOS       | x     | x     | x     | x     |
| VENTAS          | x     | x     | x     | x     |
| DETALLE_VENTAS  | x     | x     | x     | x     |
| USUARIOS        | x     | x     | x     | x     |

---

### 2. rol_supervisor
**Usuario de prueba:** supervisor1 / secret123
**Descripción:** Supervisa operaciones. Gestiona empleados y ve reportes. No puede modificar productos ni eliminar ventas.

| Tabla           | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| CATEGORIAS      | x     | o     | o     | o     |
| PROVEEDORES     | x     | o     | o     | o     |
| PRODUCTOS       | x     | o     | o     | o     |
| CLIENTES        | x     | o     | o     | o     |
| EMPLEADOS       | x     | x     | x     | x     |
| VENTAS          | x     | o     | x     | o     |
| DETALLE_VENTAS  | x     | o     | o     | o     |
| USUARIOS        | x     | o     | o     | o     |

--x

### 3. rol_vendedor
**Usuario de prueba:** vendedor1 / secret123
**Descripción:** Registra ventas y gestiona clientes. No puede ver reportes ni empleados.

| Tabla           | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| CATEGORIAS      | x     | o     | o     | o     |
| PROVEEDORES     | o     | o     | o     | o     |
| PRODUCTOS       | x     | o     | o     | o     |
| CLIENTES        | x     | x     | x     | x     |
| EMPLEADOS       | x     | o     | o     | o     |
| VENTAS          | x     | x     | o     | o     |
| DETALLE_VENTAS  | x     | x     | o     | o     |

---

### 4. rol_cajero
**Usuario de prueba:** cajero1 / secret123
**Descripción:** Solo ve ventas y actualiza su estado. No crea ni modifica nada mas.
| Tabla           | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| PRODUCTOS       | x     | o     | o     | o     |
| CLIENTES        | x     | o     | o     | o     |
| VENTAS          | x     | o     | x     | o     |
| DETALLE_VENTAS  | x     | o     | o     | o     |

---

### 5. rol_bodeguero
**Usuario de prueba:** bodeguero1 / secret123
**Descripción:** Gestiona el inventario. Solo puede ver y actualizar stock de productos. No ve ventas ni clientes.

| Tabla           | SELECT | INSERT | UPDATE | DELETE |
|-----------------|--------|--------|--------|--------|
| CATEGORIAS      | x     | o     | o     | o     |
| PROVEEDORES     | x     | o     | o     | o     |
| PRODUCTOS       | x     | x     | x     | o     |

---

## Resumen de acceso a la UI por rol

| Sección         | Admin | Supervisor | Vendedor | Cajero | Bodeguero |
|-----------------|-------|------------|----------|--------|-----------|
| Dashboard       | x    | x         | x       | x     | x        |
| Productos (ver) | x    | x         | x       | x     | x        |
| Productos (editar)| x  | o         | o       | o     | x        |
| Categorías      | x    | x         | x       | o     | x        |
| Proveedores     | x    | x         | o       | o     | x        |
| Ventas (ver)    | x    | x         | x       | x     | o        |
| Nueva Venta     | x    | o         | x       | o     | o        |
| Anular Venta    | x    | x         | o       | o     | o        |
| Clientes        | x    | x         | x       | x     | o        |
| Empleados       | x    | x         | o       | o     | o        |
| Reportes        | x    | x         | o       | o     | o        |