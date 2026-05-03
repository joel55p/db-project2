
// server.js — Servidor Express principal


const express        = require('express');
const session        = require('express-session');
const cors           = require('cors');
const path           = require('path');

const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permitir peticiones desde el frontend (Nginx en puerto 80)
app.use(cors({
  origin:      ['http://localhost', 'http://localhost:80', 'http://frontend'],
  credentials: true,
}));

// Sesiones en memoria 
app.use(session({
  secret:            process.env.SESSION_SECRET || 'capgt_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge:   8 * 60 * 60 * 1000,  // 8 horas
  },
}));

//  Rutas de la API 
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/productos',  require('./routes/productos'));
app.use('/api/ventas',     require('./routes/ventas'));
app.use('/api/clientes',   require('./routes/clientes'));
app.use('/api/empleados',  require('./routes/empleados'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/proveedores',require('./routes/proveedores'));

//  Health check 
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//  Manejo global de errores 
app.use((err, _req, res, _next) => {
  console.error('[ERROR GLOBAL]', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// Iniciar servidor
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` CapGt backend escuchando en puerto ${PORT}`);
});
