//  Navegación


const titulos = { // Títulos para cada sección
  dashboard: 'Dashboard', productos: 'Productos', categorias: 'Categorías',
  proveedores: 'Proveedores', ventas: 'Ventas', 'nueva-venta': 'Nueva Venta',
  clientes: 'Clientes', empleados: 'Empleados', reportes: 'Reportes',
};

const crudNombres = { // Nombres de entidades para botones de crear
  productos: 'Producto', clientes: 'Cliente', empleados: 'Empleado',
  categorias: 'Categoría', proveedores: 'Proveedor',
};

const loaders = { // Funciones para cargar datos al navegar a cada sección
  dashboard:    () => cargarDashboard(),
  productos:    () => cargarProductos(),
  categorias:   () => cargarCategorias(),
  proveedores:  () => cargarProveedores(),
  ventas:       () => cargarVentas(),
  'nueva-venta':() => prepararNuevaVenta(),
  clientes:     () => cargarClientes(),
  empleados:    () => cargarEmpleados(),
  reportes:     () => cargarReportes(),
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navegarA(item.dataset.sec));
});

function navegarA(sec) { // Cambiar sección visible
  // Marcar nav activo
  document.querySelectorAll('.nav-item').forEach(n =>
    n.classList.toggle('active', n.dataset.sec === sec)
  );
  // Mostrar sección
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + sec);
  if (el) el.classList.add('active');

  // Título
  document.getElementById('page-title').textContent = titulos[sec] || sec;

  // Botón de crear
  const btnEl = document.getElementById('topbar-btn');
  btnEl.innerHTML = '';
  if (crudNombres[sec]) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-blue';
    btn.textContent = '+ Nuevo ' + crudNombres[sec];
    btn.onclick = () => abrirModal('crear', sec);
    btnEl.appendChild(btn);
  }

  if (loaders[sec]) loaders[sec]();
}
