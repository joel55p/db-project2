# CapGt — Proyecto 3: Seguridad, Roles, Stored Procedures y ORM

**Bases de Datos 1, Universidad del Valle de Guatemala**
**Joel Nerio — 24253 | Rama obligatoria: `proyecto-3`**

---

## Levantar el proyecto

```bash
git clone https://github.com/joel55p/db-project2.git
cd db-project2
git checkout proyecto-3
cp .env.example .env
docker compose up --build
```

> Primera vez: `docker compose up --build`
> Siguientes veces: `docker compose up`
> Limpiar datos: `docker compose down -v`

## Acceso

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Backend  | http://localhost:3000 |
| MySQL    | localhost:3306 |

## Credenciales BD ( segun la rubrica)

```
DB_USER=proy3
DB_PASSWORD=secret
```

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | Admin |
| supervisor1 | secret123 | Supervisor |
| vendedor1 | secret123 | Vendedor |
| cajero1 | secret123 | Cajero |
| bodeguero1 | secret123 | Bodeguero |

---

## Estructura

```
capgt/
├── docker-compose.yml
├── .env.example
├── ROLES.md
├── mysql-init/
│   ├── 01_ddl.sql               <- Definición de tablas
│   ├── 02_indices.sql           <- Índices explícitos
│   ├── 03_views.sql             <- Vistas del backend
│   ├── 04_seed.sql              <- Datos de prueba
│   ├── 05_roles.sql             <- CREATE ROLE y  GRANT/REVOKE (5 roles DBMS)
│   ├── 06_usuarios_roles.sql    <- Usuarios de prueba por rol
│   └── 07_stored_procedures.sql <- 5 Stored Procedures
├── backend/
│   ├── server.js                <- Express y Sequelize ORM
│   ├── db/
│   │   ├── pool.js              <- Conexión mysql2 (SQL directo)
│   │   └── sequelize.js         <- ORM: modelos Categoria, Cliente, Empleado
│   ├── middleware/auth.js       <- requireAuth y requireRol
│   └── routes/
│       ├── auth.js              <- login/logout con permisos por rol
│       ├── categorias.js        <- CRUD con Sequelize ORM
│       ├── clientes.js          <- ORM y SP crear_cliente
│       ├── empleados.js         <- CRUD con Sequelize ORM
│       ├── productos.js         <- SQL y SP actualizar_stock
│       ├── ventas.js            <- SP registrar_venta y anular_venta
│       └── proveedores.js       <- CRUD SQL directo
└── frontend/
    └── public/
        ├── index.html
        ├── css/style.css
        └── js/ (utils, auth, nav, productos, ventas, clientes, empleados, reportes, modal, app)
```

---

## Seguridad y Roles

Los 5 roles están definidos directamente en MySQL mediante `CREATE ROLE`, con permisos granulares asignados por tabla y operación usando `GRANT` y `REVOKE`. Ver `mysql-init/05_roles.sql` y `ROLES.md` para el esquema completo.

| Rol DBMS | Usuario de prueba | Descripción |
|---|---|---|
| `rol_admin` | admin / admin123 | Acceso total al sistema |
| `rol_supervisor` | supervisor1 / secret123 | Ve todo, gestiona empleados y reportes |
| `rol_vendedor` | vendedor1 / secret123 | Registra ventas y gestiona clientes |
| `rol_cajero` | cajero1 / secret123 | Solo ve ventas y actualiza estado |
| `rol_bodeguero` | bodeguero1 / secret123 | Solo ve y actualiza stock de productos |

La autenticación usa sesiones Express (`express-session`). El middleware `requireAuth` y `requireRol` protege cada ruta del backend. En el frontend, el sidebar y los botones de acción se ocultan o muestran según los permisos retornados al hacer login.

---

##  Stored Procedures ( que son 5)

Todos los SPs son invocados desde el backend (no desde scripts independientes). Se puede ver en  `mysql-init/07_stored_procedures.sql`.

| SP | Invocado en | Descripción | IN/OUT | Transacción |
|---|---|---|---|---|
| `registrar_venta` | `routes/ventas.js` | Registra venta para 1 producto | si | `START TRANSACTION` + `ROLLBACK` |
| `anular_venta` | `routes/ventas.js` | Anula venta con cursor y devuelve stock | si | `START TRANSACTION` + `ROLLBACK` |
| `actualizar_stock` | `routes/productos.js` | Actualiza stock con validaciones | si | — |
| `crear_cliente` | `routes/clientes.js` | Crea cliente validando email duplicado | si | — |
| `reporte_ventas_empleado` | `routes/ventas.js` | Reporte de ventas por empleado | si | — |

Todos los SPs usan `DECLARE EXIT HANDLER FOR SQLEXCEPTION` para manejo de excepciones.

