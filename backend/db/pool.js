// Conexion MySQL


const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || 'capgt_db',
  user:               process.env.DB_USER     || 'proy3',
  password:           process.env.DB_PASSWORD || 'secret',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
  decimalNumbers:     true,
});

module.exports = pool;