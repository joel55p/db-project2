# CapGt — Proyecto 3: Seguridad, Roles, Stored Procedures y ORM

**Bases de Datos 1,  Universidad del Valle de Guatemala**
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

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | Admin |
| supervisor1 | secret123 | Supervisor |
| vendedor1 | secret123 | Vendedor |
| cajero1 | secret123 | Cajero |
| bodeguero1 | secret123 | Bodeguero |

## Credenciales BD (rúbrica)
```
DB_USER=proy3
DB_PASSWORD=secret
```

---

## Estructura

```
capgt/
├── docker-compose.yml
├── .env.example
├── ROLES.md
├── mysql-init/
│   ├── 01_ddl.sql
│   ├── 02_indices.sql
│   ├── 03_views.sql
│   ├── 04_seed.sql
│   ├── 05_roles.sql          ← CREATE ROLE + GRANT/REVOKE
│   ├── 06_usuarios_roles.sql ← usuarios de prueba por rol
│   └── 07_stored_procedures.sql ← 5 Stored Procedures
├── backend/
│   ├── server.js             ← arranca Sequelize ORM
│   ├── db/
│   │   ├── pool.js           ← conexión mysql2 (SQL directo)
│   │   └── sequelize.js      ← ORM: modelos Categoria, Cliente, Empleado
│   ├── middleware/auth.js    ← requireAuth + requireRol
│   └── routes/
│       ├── auth.js           ← login/logout con permisos por rol
│       ├── categorias.js     ← CRUD con Sequelize ORM
│       ├── clientes.js       ← ORM + SP sp_crear_cliente
│       ├── empleados.js      ← CRUD con Sequelize ORM
│       ├── productos.js      ← SQL + SP sp_actualizar_stock
│       ├── ventas.js         ← SP sp_registrar_venta + sp_anular_venta
│       └── proveedores.js    ← CRUD SQL directo
└── frontend/
    └── public/
        ├── index.html
        ├── css/style.css
        └── js/ (utils, auth, nav, productos, ventas, clientes, empleados, reportes, modal, app)
```

---

## Stored Procedures (5)

| SP | Descripción | Tipo |
|---|---|---|
| `sp_registrar_venta` | Registra venta con START TRANSACTION + ROLLBACK | IN/OUT + transacción |
| `sp_anular_venta` | Anula venta con cursor + ROLLBACK | IN/OUT + excepciones |
| `sp_actualizar_stock` | Actualiza stock con validaciones | IN/OUT |
| `sp_crear_cliente` | Crea cliente validando email duplicado | IN/OUT |
| `sp_reporte_ventas_empleado` | Reporte de ventas por empleado | IN |

## ORM — Sequelize (3 entidades)

| Entidad | Operaciones ORM |
|---|---|
| `Categoria` | findAll, create, update, destroy |
| `Cliente` | findAll, findByPk, update, destroy |
| `Empleado` | findAll, findByPk, create, update, destroy |