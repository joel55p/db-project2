//  Navegación


// permisos del usuario actual  que se llenan al hacer login
let permisosActuales = {};
let rolActual = '';
 
const titulos = {
  dashboard: 'Dashboard', productos: 'Productos', categorias: 'Categorías',
  proveedores: 'Proveedores', ventas: 'Ventas', 'nueva-venta': 'Nueva Venta',
  clientes: 'Clientes', empleados: 'Empleados', reportes: 'Reportes',
};
 
const crudNombres = {
  productos: 'Producto', clientes: 'Cliente', empleados: 'Empleado',
  categorias: 'Categoría', proveedores: 'Proveedor',
};
 
const loaders = {
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
 
// Muestra u oculta elementos del sidebar segun  el rol
function aplicarPermisosUI() {
  const p = permisosActuales;
 
  // Mostrar badge de rol en el sidebar
  document.getElementById('sidebar-rol').textContent = rolActual.toUpperCase();
 
  // Ocultar secciones segun permisos
  const reglas = {
    'nav-ventas':       p.verVentas,
    'nav-nueva-venta':  p.crearVentas,
    'nav-clientes':     p.verClientes,
    'nav-empleados':    p.verEmpleados,
    'nav-reportes':     p.verReportes,
    'nav-proveedores':  p.verProveedores,
    'nav-categorias':   p.verCategorias,
  };
 
  for (const [id, permitido] of Object.entries(reglas)) {
    const el = document.getElementById(id);
    if (el) el.style.display = permitido ? '' : 'none';
  }
}
 
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navegarA(item.dataset.sec));
});
 
function navegarA(sec) {
  document.querySelectorAll('.nav-item').forEach(n =>
    n.classList.toggle('active', n.dataset.sec === sec)
  );
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + sec);
  if (el) el.classList.add('active');
 
  document.getElementById('page-title').textContent = titulos[sec] || sec;
 
  // Botón de crear  solo si tiene permiso de editar
  const btnEl = document.getElementById('topbar-btn');
  btnEl.innerHTML = '';
 
  const puedeEditar = {
    productos:   permisosActuales.editarProductos,
    clientes:    permisosActuales.editarClientes,
    empleados:   permisosActuales.editarEmpleados,
    categorias:  permisosActuales.editarCategorias,
    proveedores: permisosActuales.editarProveedores,
  };
 
  if (crudNombres[sec] && puedeEditar[sec]) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-blue';
    btn.textContent = '+ Nuevo ' + crudNombres[sec];
    btn.onclick = () => abrirModal('crear', sec);
    btnEl.appendChild(btn);
  }
 
  if (loaders[sec]) loaders[sec]();
}