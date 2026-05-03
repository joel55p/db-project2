//CRUD Clientes

async function cargarClientes() { // Cargar clientes desde el servidor y mostrarlos en la tabla
  try {
    const search = document.getElementById('f-cli-search').value;
    const rows   = await api('/clientes' + (search ? '?search=' + encodeURIComponent(search) : '')); // Obtener clientes (con busqueda opcional)
    const tbody  = document.getElementById('t-clientes');
    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="6" class="vacío">Sin clientes</td></tr>'
      : rows.map(c => `
        <tr>
          <td class="txt-muted">${c.cliente_id}</td> 
          <td><b>${c.nombre}</b></td>
          <td>${c.email || '—'}</td>
          <td>${c.telefono || '—'}</td>
          <td>${c.fecha_registro || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="abrirModal('editar','clientes',${c.cliente_id})">Editar</button>
            <button class="btn btn-red btn-sm" onclick="eliminar('clientes',${c.cliente_id},'${c.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
          </td>
        </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}
