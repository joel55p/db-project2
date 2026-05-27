// Servidor Express con Sequelize ORM

const express    = require('express');
const session    = require('express-session');
const cors       = require('cors');
const { sequelize } = require('./db/sequelize');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin:      ['http://localhost', 'http://localhost:80', 'http://frontend'],
  credentials: true,
}));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'capgt_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 },
}));

// Rutas
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/ventas',      require('./routes/ventas'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/empleados',   require('./routes/empleados'));
app.use('/api/categorias',  require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = parseInt(process.env.PORT) || 3000;

// Conectar Sequelize ORM y luego iniciar servidor
sequelize.authenticate()
  .then(() => {
    console.log('Sequelize ORM conectado correctamente.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CapGt backend escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error conectando Sequelize:', err);
    // Arrancar igual aunque falle Sequelize (pool sigue funcionando)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CapGt backend en puerto ${PORT} (sin ORM)`);
    });
  });