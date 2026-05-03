// Modal CRUD generico


let modoModal   = null; // 'crear' o 'editar'
let entidadModal= null; // 'productos', 'clientes', 'empleados', 'categorias' o 'proveedores'
let idModal     = null; // ID del elemento a editar (solo en modo 'editar')

async function abrirModal(modo, entidad, id = null) { // Abrir modal para crear o editar un elemento
  modoModal    = modo;
  entidadModal = entidad;
  idModal      = id;

  const nombres = { productos: 'Producto', clientes: 'Cliente', empleados: 'Empleado', //categorias: 'Categoría', proveedores: 'Proveedor' };
                    categorias: 'Categoría', proveedores: 'Proveedor' };
  document.getElementById('modal-titulo').textContent =
    (modo === 'crear' ? 'Nuevo ' : 'Editar ') + (nombres[entidad] || entidad);

  let data = {};
  if (modo === 'editar' && id) { // Cargar datos del elemento a editar
    try { data = await api('/' + entidad + '/' + id); }
    catch (err) { toast(err.message, 'error'); return; }
  }

  document.getElementById('modal-cuerpo').innerHTML = formulario(entidad, data);

  // Cargar selects de categoria y proveedor para productos
  if (entidad === 'productos') {
    const [cats, provs] = await Promise.all([api('/categorias'), api('/proveedores')]);
    const cSel = document.getElementById('f-cat');
    cats.forEach(c => {
      const o = new Option(c.nombre, c.categoria_id);
      if (data.categoria_id == c.categoria_id) o.selected = true;
      cSel.appendChild(o);
    });
    const pSel = document.getElementById('f-prov');
    provs.forEach(p => {
      const o = new Option(p.nombre, p.proveedor_id);
      if (data.proveedor_id == p.proveedor_id) o.selected = true;
      pSel.appendChild(o);
    });
  }

  document.getElementById('modal-guardar').textContent = modo === 'crear' ? 'Crear' : 'Guardar';
  document.getElementById('modal-fondo').style.display = 'flex';
}

function cerrarModal() { // Cerrar modal y limpiar campos
  document.getElementById('modal-fondo').style.display = 'none';
}

function cerrarModalFondo(e) { // Cerrar modal al hacer click fuera del contenido
  if (e.target === document.getElementById('modal-fondo')) cerrarModal();
}

async function guardarModal() { // Recoger datos del formulario y enviar peticion de crear o actualizar
  // Recoger todos los campos
  const inputs = document.querySelectorAll('#modal-cuerpo input, #modal-cuerpo select, #modal-cuerpo textarea');
  const body = {};
  let valido = true;

  inputs.forEach(el => {
    body[el.name] = el.value;
    if (el.required && !el.value) { el.classList.add('err'); valido = false; }
    else el.classList.remove('err');
  });

  if (!valido) { toast('Completa los campos obligatorios.', 'warn'); return; }

  const btn = document.getElementById('modal-guardar');
  btn.disabled = true;
  try {
    if (modoModal === 'crear') {
      await api('/' + entidadModal, { method: 'POST', body: JSON.stringify(body) });
      toast('Creado correctamente.');
    } else {
      await api('/' + entidadModal + '/' + idModal, { method: 'PUT', body: JSON.stringify(body) });
      toast('Actualizado correctamente.');
    }
    cerrarModal();
    // Recargar tabla correspondiente
    const recargar = { productos: cargarProductos, clientes: cargarClientes,
                       empleados: cargarEmpleados, categorias: cargarCategorias,
                       proveedores: cargarProveedores };
    if (recargar[entidadModal]) recargar[entidadModal]();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function eliminar(entidad, id, nombre) { // Confirmar y enviar peticion de eliminacion
  if (!confirm('¿Eliminar "' + nombre + '"?')) return;
  try {
    await api('/' + entidad + '/' + id, { method: 'DELETE' });
    toast('"' + nombre + '" eliminado.');
    const recargar = { productos: cargarProductos, clientes: cargarClientes,
                       empleados: cargarEmpleados, categorias: cargarCategorias,
                       proveedores: cargarProveedores };
    if (recargar[entidad]) recargar[entidad]();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// Genera el HTML del formulario segun entidad
function formulario(entidad, d) {
  const inp = (lbl, name, type = 'text', req = false, ph = '') =>
    `<div class="form-group">
       <label>${lbl}${req ? ' *' : ''}</label>
       <input type="${type}" name="${name}" value="${d[name] ?? ''}" placeholder="${ph}" ${req ? 'required' : ''} />
     </div>`;

  const sel = (lbl, name, opciones, req = false) => // Para campos de seleccion como puesto, categoria o proveedor
    `<div class="form-group">
       <label>${lbl}${req ? ' *' : ''}</label>
       <select name="${name}" ${req ? 'required' : ''}>
         <option value="">Seleccionar...</option>
         ${opciones.map(([v,t]) => `<option value="${v}" ${d[name]===v?'selected':''}>${t}</option>`).join('')}
       </select>
     </div>`;

  const ta = (lbl, name) => // Para campos de texto largo como descripcion o direccion
    `<div class="form-group" style="flex:1 1 100%">
       <label>${lbl}</label>
       <textarea name="${name}" rows="2">${d[name] ?? ''}</textarea>
     </div>`;

  const forms = { // HTML de formularios para cada entidad
    productos: `<div class="form-row">
      <div class="form-group"><label>Categoría *</label><select name="categoria_id" id="f-cat" required><option value="">Cargando...</option></select></div>
      <div class="form-group"><label>Proveedor *</label><select name="proveedor_id" id="f-prov" required><option value="">Cargando...</option></select></div>
      ${inp('Nombre','nombre','text',true)}
      ${inp('Marca','marca','text',true)}
      ${inp('Talla','talla','text',true,'S, M, L, Única...')}
      ${inp('Color','color','text',true)}
      ${inp('Precio Compra (Q)','precio_compra','number',true)}
      ${inp('Precio Venta (Q)','precio_venta','number',true)}
      ${inp('Stock','stock','number')}
      ${inp('Stock Mínimo','stock_minimo','number')}
    </div>`,

    clientes: `<div class="form-row">
      ${inp('Nombre','nombre','text',true)}
      ${inp('Email','email','email')}
      ${inp('Teléfono','telefono')}
      ${ta('Dirección','direccion')}
    </div>`,

    empleados: `<div class="form-row">
      ${inp('Nombre','nombre','text',true)}
      ${sel('Puesto','puesto',[['Supervisor','Supervisor'],['Vendedor','Vendedor'],['Cajero','Cajero'],['Bodeguero','Bodeguero']],true)}
      ${inp('Email','email','email')}
      ${inp('Teléfono','telefono')}
      ${inp('Fecha Contratación','fecha_contratacion','date',true)}
      ${inp('Salario (Q)','salario','number',true)}
    </div>`,

    categorias: `<div class="form-row">
      ${inp('Nombre','nombre','text',true)}
      ${ta('Descripción','descripcion')}
    </div>`,

    proveedores: `<div class="form-row">
      ${inp('Nombre','nombre','text',true)}
      ${inp('Contacto','contacto')}
      ${inp('Teléfono','telefono')}
      ${inp('Email','email','email')}
      ${inp('País','pais','text',true)}
    </div>`,
  };

  return forms[entidad] || '<p>Formulario no disponible</p>';
}
