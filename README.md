Levantar el proyecto para avances 
Requisitos

Docker Desktop instalado y corriendo
Git

Pasos
bash# 1. Clonar y entrar al repo
git clone https://github.com/joel55p/db-project2.git
cd db-project2

# 2. Cambiar a la rama del proyecto 3
git checkout proyecto-3

# 3. Crear el .env
cp .env.example .env

# 4. Levantar
docker compose up --build
Acceso
ServicioURLFrontendhttp://localhostBackendhttp://localhost:3000MySQLlocalhost:3306

Usuarios de prueba por rol
UsuarioContraseñaRolPuede haceradminadmin123AdminTodosupervisor1secret123SupervisorVer todo, gestionar empleados, anular ventas, ver reportesvendedor1secret123VendedorRegistrar ventas, gestionar clientescajero1secret123CajeroVer ventas y productosbodeguero1secret123BodegueroVer y editar inventario

Credenciales de base de datos (rúbrica)
DB_USER=proy3
DB_PASSWORD=secret



Apagar
bashdocker compose down
# Con borrar datos:
docker compose down -v