// Ventas y nueva venta


let items = [];  // productos de la venta en curso
let ventaActualId = null;

// ahora bien el listado de ventas

async function cargarVentas() {
  try {
    const estado = document.getElementById('f-venta-estado').value;
    const desde  = document.getElementById('f-venta-desde').value;
    const hasta  = document.getElementById('f-venta-hasta').value;

    const p = new URLSearchParams();
    if (estado) p.set('estado', estado);
    if (desde)  p.set('fecha_desde', desde);
    if (hasta)  p.set('fecha_hasta', hasta);

    const rows  = await api('/ventas?' + p);
    const tbody = document.getElementById('t-ventas');
    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="8" class="vacío">Sin ventas</td></tr>'
      : rows.map(v => `
        <tr>
          <td class="txt-muted">#${v.venta_id}</td>
          <td>${fmtFecha(v.fecha_venta)}</td>
          <td>${v.cliente}</td>
          <td>${v.empleado}</td>
          <td><b>${fmtQ(v.total)}</b></td>
          <td>${v.metodo_pago}</td>
          <td>${badgeEstado(v.estado)}</td>
          <td><button class="btn btn-outline btn-sm" onclick="verVenta(${v.venta_id})">Ver</button></td>
        </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// modal con el detalle de venta

async function verVenta(id) {
  ventaActualId = id;
  try {
    const v = await api('/ventas/' + id);
    document.getElementById('modal-venta-titulo').textContent = 'Venta #' + v.venta_id;
    document.getElementById('btn-anular').style.display = v.estado !== 'anulada' ? '' : 'none';

    document.getElementById('modal-venta-cuerpo').innerHTML = `
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group"><label>Cliente</label><input readonly value="${v.cliente}" /></div>
        <div class="form-group"><label>Empleado</label><input readonly value="${v.empleado}" /></div>
        <div class="form-group"><label>Fecha</label><input readonly value="${fmtFecha(v.fecha_venta)}" /></div>
        <div class="form-group"><label>Método</label><input readonly value="${v.metodo_pago}" /></div>
        <div class="form-group"><label>Estado</label><input readonly value="${v.estado}" /></div>
        <div class="form-group"><label>Total</label><input readonly value="${fmtQ(v.total)}" /></div>
      </div>
      <div class="tabla-wrap">
        <table>
          <thead><tr><th>Producto</th><th>Talla</th><th>Color</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${(v.detalle || []).map(d => `
              <tr>
                <td>${d.producto}</td><td>${d.talla}</td><td>${d.color}</td>
                <td>${d.cantidad}</td><td>${fmtQ(d.precio_unitario)}</td><td><b>${fmtQ(d.subtotal)}</b></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    document.getElementById('modal-venta-fondo').style.display = 'flex';
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

function cerrarModalVenta() { //cierra el modal de detalle de venta
  document.getElementById('modal-venta-fondo').style.display = 'none';
}

async function anularVenta() {// Anula la venta actual, importante para manejar devoluciones y errores en el proceso de venta
  if (!confirm('¿Anular esta venta? El stock será devuelto.')) return;
  try {
    await api('/ventas/' + ventaActualId + '/estado', {
      method: 'PUT',
      body: JSON.stringify({ estado: 'anulada' }),
    });
    toast('Venta anulada. Stock devuelto.', 'warn');
    cerrarModalVenta();
    cargarVentas();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// cuando se hace nueva venta
async function prepararNuevaVenta() {
  items = [];
  renderItems();
  document.getElementById('nv-error').style.display = 'none';
  document.getElementById('nv-ok').style.display    = 'none';
  document.getElementById('nv-total').textContent   = '0.00';

  try {
    const [clientes, empleados, prods] = await Promise.all([
      api('/clientes'), api('/empleados'), api('/productos'),
    ]);

    const cSel = document.getElementById('nv-cliente');
    cSel.innerHTML = '<option value="">Seleccionar cliente...</option>';
    clientes.forEach(c => cSel.appendChild(new Option(c.nombre, c.cliente_id)));

    const eSel = document.getElementById('nv-empleado');
    eSel.innerHTML = '<option value="">Seleccionar empleado...</option>';
    empleados.forEach(e => eSel.appendChild(new Option(e.nombre + ' (' + e.puesto + ')', e.empleado_id)));

    const pSel = document.getElementById('nv-prod');
    pSel.innerHTML = '<option value="">Seleccionar producto...</option>';
    prods.forEach(p => {
      const o = new Option(p.nombre + ' - ' + p.marca + ' (Stock: ' + p.stock + ')', p.producto_id);
      o.dataset.precio = p.precio_venta;
      o.dataset.stock  = p.stock;
      pSel.appendChild(o);
    });

    pSel.onchange = () => {
      const opt = pSel.options[pSel.selectedIndex];
      document.getElementById('nv-precio').value = opt.dataset.precio ? fmtQ(opt.dataset.precio) : '';
    };
  } catch (err) {
    toast('Error cargando datos: ' + err.message, 'error');
  }
}

function agregarItem() { // Agrega un producto a la venta en curso, importante para construir el detalle de la venta antes de registrarla
  const pSel = document.getElementById('nv-prod'); // select de productos en el formulario de nueva venta
  const cant = parseInt(document.getElementById('nv-cant').value);
  const opt  = pSel.options[pSel.selectedIndex];

  if (!opt.value) { toast('Selecciona un producto.', 'warn'); return; }
  if (!cant || cant < 1) { toast('Cantidad inválida.', 'warn'); return; }
  if (cant > parseInt(opt.dataset.stock)) {
    toast('Stock insuficiente. Disponible: ' + opt.dataset.stock, 'error'); return; // validacion importante para evitar vender mas de lo que hay en stock, aunque el backend tambien debe validar esto por seguridad.
  }

  const existe = items.find(i => i.producto_id === parseInt(opt.value)); // Si el producto ya fue agregado, solo actualizar la cantidad y subtotal, en lugar de agregar una nueva linea al detalle de venta
  if (existe) {
    existe.cantidad += cant;
    existe.subtotal  = existe.cantidad * existe.precio;
  } else {
    items.push({
      producto_id: parseInt(opt.value),
      nombre:      opt.text.split(' - ')[0],
      cantidad:    cant,
      precio:      parseFloat(opt.dataset.precio),
      subtotal:    cant * parseFloat(opt.dataset.precio),
    });
  }

  renderItems();
  pSel.value = '';
  document.getElementById('nv-precio').value = '';
  document.getElementById('nv-cant').value   = '1';
}

function renderItems() { // Renderiza la tabla de productos agregados a la venta, importante para mostrar al usuario el detalle de lo que está vendiendo antes de confirmar la venta
  const tbody = document.getElementById('nv-items');
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="vacío">Sin productos agregados</td></tr>';
    document.getElementById('nv-total').textContent = '0.00';
    return;
  }
  tbody.innerHTML = items.map((it, i) => `
    <tr>
      <td>${it.nombre}</td>
      <td><input type="number" value="${it.cantidad}" min="1" style="width:65px"
            onchange="cambiarCant(${i}, this.value)" /></td>
      <td>${fmtQ(it.precio)}</td>
      <td><b>${fmtQ(it.subtotal)}</b></td>
      <td><button class="btn btn-red btn-sm" onclick="quitarItem(${i})">✕</button></td>
    </tr>`).join('');

  document.getElementById('nv-total').textContent =
    items.reduce((s, i) => s + i.subtotal, 0).toFixed(2);
}

function cambiarCant(idx, val) { // Cambia la cantidad de un producto ya agregado a la venta, importante para permitir al usuario ajustar las cantidades antes de confirmar la venta
  const c = parseInt(val);
  if (!c || c < 1) return;
  items[idx].cantidad = c;
  items[idx].subtotal = c * items[idx].precio;
  renderItems();
}

function quitarItem(idx) { // Quita un producto del detalle de venta, importante para permitir al usuario corregir errores o cambiar de opinión antes de confirmar la venta
  items.splice(idx, 1);
  renderItems();
}

async function registrarVenta() { // Registra la venta en el servidor, importante para guardar la venta en la base de datos y actualizar el stock de los productos vendidos
  const errEl = document.getElementById('nv-error');
  const okEl  = document.getElementById('nv-ok');
  errEl.style.display = 'none';
  okEl.style.display  = 'none';

  const cliente_id  = document.getElementById('nv-cliente').value;
  const empleado_id = document.getElementById('nv-empleado').value;
  const metodo_pago = document.getElementById('nv-metodo').value;

  if (!cliente_id)      { errEl.textContent = 'Selecciona un cliente.';       errEl.style.display = 'block'; return; }
  if (!empleado_id)     { errEl.textContent = 'Selecciona un empleado.';      errEl.style.display = 'block'; return; }
  if (items.length ===0){ errEl.textContent = 'Agrega al menos un producto.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('btn-venta');
  btn.disabled = true;
  try {
    // Transaccion BEGIN/COMMIT/ROLLBACK que  ocurre en el backend
    const data = await api('/ventas', {
      method: 'POST',
      body: JSON.stringify({
        cliente_id:  parseInt(cliente_id),
        empleado_id: parseInt(empleado_id),
        metodo_pago,
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      }),
    });
    okEl.textContent = 'Venta #' + data.venta_id + ' registrada por ' + fmtQ(data.total);
    okEl.style.display = 'block';
    toast('Venta registrada correctamente.');
    items = [];
    renderItems();
    document.getElementById('nv-cliente').value  = '';
    document.getElementById('nv-empleado').value = '';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}
