//CRUD Empleados

async function cargarEmpleados() { // Cargar empleados desde el servidor y mostrarlos en la tabla
  try {
    const rows  = await api('/empleados');
    const tbody = document.getElementById('t-empleados');
    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="7" class="vacío">Sin empleados</td></tr>'
      : rows.map(e => `
        <tr>
          <td class="txt-muted">${e.empleado_id}</td>
          <td><b>${e.nombre}</b></td>
          <td><span class="badge b-gray">${e.puesto}</span></td>
          <td>${e.email || '—'}</td>
          <td>${e.fecha_contratacion || '—'}</td>
          <td><b>${fmtQ(e.salario)}</b></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="abrirModal('editar','empleados',${e.empleado_id})">Editar</button>
            <button class="btn btn-red btn-sm" onclick="eliminar('empleados',${e.empleado_id},'${e.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
          </td>
        </tr>`).join('');
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}
