

async function cargarReportes() {
  try {
    const [mensual, empleados, clientes, stock, top] = await Promise.all([
      api('/ventas/reporte-mensual'),
      api('/ventas/rendimiento-empleados'),
      api('/ventas/clientes-frecuentes'),
      api('/productos/stock-critico'),
      api('/productos/mas-vendidos'),
    ]);

    document.getElementById('r-mensual').innerHTML = mensual.length === 0
      ? '<tr><td colspan="4" class="vacío">Sin datos</td></tr>'
      : mensual.map(r => `
        <tr>
          <td><b>${r.mes}</b></td><td>${r.cantidad_ventas}</td>
          <td><b>${fmtQ(r.total_mes)}</b></td><td class="txt-muted">${fmtQ(r.promedio_venta)}</td>
        </tr>`).join('');

    document.getElementById('r-empleados').innerHTML = empleados.length === 0
      ? '<tr><td colspan="5" class="vacío">Sin datos</td></tr>'
      : empleados.map(e => `
        <tr>
          <td><b>${e.empleado}</b></td><td><span class="badge b-gray">${e.puesto}</span></td>
          <td>${e.total_ventas || 0}</td><td><b>${fmtQ(e.monto_total)}</b></td>
          <td class="txt-muted">${fmtQ(e.promedio_por_venta)}</td>
        </tr>`).join('');

    document.getElementById('r-clientes').innerHTML = clientes.length === 0
      ? '<tr><td colspan="4" class="vacío">Sin datos</td></tr>'
      : clientes.map(c => `
        <tr>
          <td><b>${c.cliente}</b></td><td>${c.email || '—'}</td>
          <td>${c.total_compras}</td><td><b>${fmtQ(c.monto_total)}</b></td>
        </tr>`).join('');

    document.getElementById('r-stock').innerHTML = stock.length === 0
      ? '<tr><td colspan="6" class="vacío">Sin productos en stock crítico</td></tr>'
      : stock.map(p => `
        <tr>
          <td><b>${p.nombre}</b></td><td>${p.marca}</td><td>${p.categoria}</td>
          <td>${badgeStock(p.stock, p.stock_minimo)}</td><td>${p.stock_minimo}</td><td>${p.proveedor}</td>
        </tr>`).join('');

    document.getElementById('r-top').innerHTML = top.length === 0
      ? '<tr><td colspan="4" class="vacío">Sin datos</td></tr>'
      : top.map(p => `
        <tr>
          <td><b>${p.nombre}</b></td><td>${p.marca}</td>
          <td><b>${p.total_vendido}</b></td><td><b>${fmtQ(p.ingresos_total)}</b></td>
        </tr>`).join('');

  } catch (err) {
    toast('Error cargando reportes: ' + err.message, 'error');
  }
}