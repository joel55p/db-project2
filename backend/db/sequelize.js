//  Confi  de Sequelize ORM


const { Sequelize, DataTypes } = require('sequelize');

// Inicializar Sequelize con las mismas credenciales que  mismo pool
const sequelize = new Sequelize(
  process.env.DB_NAME     || 'capgt_db',
  process.env.DB_USER     || 'proy3',
  process.env.DB_PASSWORD || 'secret',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,   // no mostrar queries en consola
    define: {
      timestamps:  false,  // las tablas no tienen createdAt/updatedAt
      freezeTableName: true,
    },
  }
);

// Modelos ORM 

// Modelo de tipo CATEGORIAS
const Categoria = sequelize.define('CATEGORIAS', {
  categoria_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:       { type: DataTypes.STRING(60),  allowNull: false },
  descripcion:  { type: DataTypes.TEXT },
});

// Modelo de tipo  CLIENTES 
const Cliente = sequelize.define('CLIENTES', {
  cliente_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:         { type: DataTypes.STRING(80),  allowNull: false },
  email:          { type: DataTypes.STRING(100) },
  telefono:       { type: DataTypes.STRING(20) },
  direccion:      { type: DataTypes.TEXT },
  fecha_registro: { type: DataTypes.DATEONLY,   allowNull: false },
});

// Modelo de tipo  EMPLEADOS 
const Empleado = sequelize.define('EMPLEADOS', {
  empleado_id:        { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  nombre:             { type: DataTypes.STRING(80),   allowNull: false },
  puesto:             { type: DataTypes.STRING(60),   allowNull: false },
  email:              { type: DataTypes.STRING(100) },
  telefono:           { type: DataTypes.STRING(20) },
  fecha_contratacion: { type: DataTypes.DATEONLY,     allowNull: false },
  salario:            { type: DataTypes.DECIMAL(10,2), allowNull: false },
});

module.exports = { sequelize, Categoria, Cliente, Empleado };