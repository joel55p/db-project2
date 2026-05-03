Bienvenidos a CapGT, sistema de gestion de Gorras

**Bases de Datos 1 — Proyecto 2 - Universidad del Valle de Guatemala**  
**Joel Nerio — 24253**

---

DESCRIPCION

Aplicación web fullstack para gestionar el inventario y las ventas de CapGt, una tienda de gorras en Guatemala. Incluye:

- Frontend: SPA (HTML/CSS/JS) servido por Nginx
- Backend: Node.js + Express con SQL explícito (sin ORM)
- Base de datos: MySQL 8.0 con motor InnoDB
- Infraestructura: Docker Compose

---

LEVANTAR EL PROYECTO

Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y CORRIENDO(importante)
- Git

----Pasos-------------

```bash
# 1. Clonar el repositorio
git clone https://github.com/joel55p/db-project2.git
cd db-project2

# 2. Crear el archivo .env (credenciales fijas segun el apartado)
cp .env.example .env

# 3. Levantar todos los servicios
docker compose up --build
```


ACCESO

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost            |
| Backend   | http://localhost:3000       |
| MySQL     | localhost:3306              |

CREDENCIALES de DEMO

| Campo    | Valor      |
|----------|------------|
| Usuario  | `admin`    |
| Password | `admin123` |

CREDENCIALES BD

```
DB_USER=proy2
DB_PASSWORD=secret
```

---

Estructura del proyecto

```
capgt/
├── docker-compose.yml        # servicios
├── .env.example              # Variables de entorno (template)
├── .env                      # Variables activas 
│
├── mysql-init/               # Scripts SQL ejecutados al iniciar MySQL
│   ├── 01_ddl.sql            # DDL: CREATE TABLE con PK, FK, NOT NULL
│   ├── 02_indices.sql        # Índices explícitos (CREATE INDEX)
│   ├── 03_views.sql          # VIEWs usadas por el backend
│   └── 04_seed.sql           # 25 registros por tabla
│
├── backend/                  # Node.js + Express
│   ├── server.js             # Punto de entrada
│   ├── db/pool.js            # Pool de conexiones MySQL2
│   ├── middleware/auth.js    # Autenticación de sesión
│   └── routes/
│       ├── auth.js           # Login / Logout
│       ├── productos.js      # CRUD + JOINs + Subqueries + GROUP BY
│       ├── ventas.js         # CRUD + Transacción explicita + CTE
│       ├── clientes.js       # CRUD completo
│       ├── empleados.js      # CRUD completo
│       ├── categorias.js     # CRUD completo
│       ├── proveedores.js    # CRUD completo
│       
│
└── frontend/                 # Nginx + HTML/CSS/JS
    ├── Dockerfile
    ├── nginx.conf            # Proxy /api/ en backend:3000
    └── public/
        ├── index.html        # SPA principal
        ├── css/style.css     # Estilos 
        └── js/app.js         # Logica de la aplicación
```

---

BASES DE DATOS
Entidades (7 tablas)

| Tabla           | Descripción                                   |
|-----------------|-----------------------------------------------|
| CATEGORIAS    | Tipos de gorras (Snapback, Fitted, etc.)      |
| PROVEEDORES   | Empresas que suministran gorras               |
| PRODUCTOS     | Catalogo de gorras con stock e inventario     |
| CLIENTES      | Compradores registrados                        |
| EMPLEADOS     | Personal de la tienda                          |
| VENTAS        | Encabezado de cada transaccion de venta       |
| DETALLE_VENTAS| Lineas de producto por venta (relacion N:M)  |
| USUARIOS      | Cuentas para autenticación en la app          |



APAGAR EL PROJECT

```bash
docker compose down
```

Para también eliminar los datos persistidos:
```bash
docker compose down -v
```

---

VERIFICACION

si se desea ver realmente los datos se hace lo siguiente en terminal donde esta el project

1. docker exec -it capgt_db mysql -uproy2 -psecret capgt_db
2. Eso te abre una consola de MySQL. Desde ahi se  puede escribir queries directamente
3. por ejemplo si se quieren ver las ventas registradas  con un 'SELECT * FROM VENTAS; '


CONCLUSION
-todas las consultas usan SQL explícito con mysql2/promise
-En las Transacciones se uso BEGIN / COMMIT / ROLLBACK explícitos en creación y anulación de ventas
-En las sesiones es express-session con cookies httpOnly
-en las contraseñas estan hashed con bcryptjs
-Ahora bien el stock se descuenta automaticamente al registrar una venta y  se devuelve al anular




