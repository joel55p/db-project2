//  Dashboard y  Productos


async function cargarDashboard() { // Cargar datos para mostrar en el dashboard
  try {
    const [prods, critico, ventas, clientes] = await Promise.all([
      api('/productos'), api('/productos/stock-critico'),
      api('/ventas'), api('/clientes'),
    ]);

    document.getElementById('st-productos').textContent = prods.length;
    document.getElementById('st-critico').textContent   = critico.length;
    document.getElementById('st-clientes').textContent  = clientes.length;
    document.getElementById('st-ventas').textContent    = ventas.length;

    // Stock critico
    const stEl = document.getElementById('dash-critico');
    if (critico.length === 0) {
      stEl.innerHTML = '<div class="vacío">Sin alertas de stock</div>';
    } else {
      stEl.innerHTML = '<div class="tabla-wrap"><table><thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead><tbody>' +
        critico.slice(0, 5).map(p =>
          `<tr class="stock-bajo"><td>${p.nombre}</td><td>${badgeStock(p.stock, p.stock_minimo)}</td><td>${p.stock_minimo}</td></tr>`
        ).join('') + '</tbody></table></div>';
    }

    // ultimas ventas
    const vEl = document.getElementById('dash-ventas');
    if (ventas.length === 0) {
      vEl.innerHTML = '<div class="vacío">Sin ventas aún</div>';
    } else {
      vEl.innerHTML = '<div class="tabla-wrap"><table><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead><tbody>' +
        ventas.slice(0, 5).map(v =>
          `<tr><td>#${v.venta_id}</td><td>${v.cliente}</td><td><b>${fmtQ(v.total)}</b></td><td>${badgeEstado(v.estado)}</td></tr>`
        ).join('') + '</tbody></table></div>';
    }
  } catch (err) {
    toast('Error en dashboard: ' + err.message, 'error');
  }
}

async function cargarProductos() { // Cargar productos desde el servidor y mostrarlos en la tabla
  try {
    const cat    = document.getElementById('f-prod-cat').value;
    const stock  = document.getElementById('f-prod-stock').value;
    const search = document.getElementById('f-prod-search').value;

    const params = new URLSearchParams();
    if (cat)   params.set('categoria_id', cat);
    if (stock) params.set('stock_bajo', stock);

    const [prods, cats] = await Promise.all([
      api('/productos?' + params), api('/categorias'),
    ]);

    // Llenar select de categorias solo la primera vez
    const cSel = document.getElementById('f-prod-cat');
    if (cSel.options.length <= 1) {
      cats.forEach(c => cSel.appendChild(new Option(c.nombre, c.categoria_id)));
    }

    const lista = search
      ? prods.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                          p.marca.toLowerCase().includes(search.toLowerCase()))
      : prods;

    const tbody = document.getElementById('t-productos');
    if (lista.length === 0) { // Si no hay resultados despues de aplicar busqueda entonces  muestra  mensaje
      tbody.innerHTML = '<tr><td colspan="9" class="vacío">Sin resultados</td></tr>';
      return;
    }
    tbody.innerHTML = lista.map(p => `
      <tr class="${p.stock_bajo ? 'stock-bajo' : ''}">
        <td class="txt-muted">${p.producto_id}</td>
        <td><b>${p.nombre}</b></td>
        <td>${p.marca}</td>
        <td>${p.talla}</td>
        <td>${p.color}</td>
        <td><span class="badge b-blue">${p.categoria}</span></td>
        <td><b>${fmtQ(p.precio_venta)}</b></td>
        <td>${badgeStock(p.stock, p.stock_minimo)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="abrirModal('editar','productos',${p.producto_id})">Editar</button>
          <button class="btn btn-red btn-sm" onclick="eliminar('productos',${p.producto_id},'${p.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

async function cargarCategorias() { // Cargar categorias desde el servidor y mostrarlos en la tabla
  try {
    const rows  = await api('/categorias');
    const tbody = document.getElementById('t-categorias');
    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="4" class="vacío">Sin categorías</td></tr>'
      : rows.map(c => `
        <tr>
          <td class="txt-muted">${c.categoria_id}</td>
          <td><b>${c.nombre}</b></td>
          <td class="txt-muted">${c.descripcion || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="abrirModal('editar','categorias',${c.categoria_id})">Editar</button>
            <button class="btn btn-red btn-sm" onclick="eliminar('categorias',${c.categoria_id},'${c.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
          </td>
        </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

async function cargarProveedores() { // Cargar proveedores desde el servidor y  tambien mostrarlos en la tabla
  try {
    const rows  = await api('/proveedores');
    const tbody = document.getElementById('t-proveedores');
    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="6" class="vacío">Sin proveedores</td></tr>'
      : rows.map(p => `
        <tr>
          <td class="txt-muted">${p.proveedor_id}</td>
          <td><b>${p.nombre}</b></td>
          <td>${p.contacto || '—'}</td>
          <td>${p.pais}</td>
          <td>${p.email || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="abrirModal('editar','proveedores',${p.proveedor_id})">Editar</button>
            <button class="btn btn-red btn-sm" onclick="eliminar('proveedores',${p.proveedor_id},'${p.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
          </td>
        </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}
