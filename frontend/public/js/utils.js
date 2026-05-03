//Funciones de utilidad


const API = '/api';

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
  return data;
}

function toast(msg, tipo = 'ok') { // Mostrar mensaje temporal (tipo: ok, error, warn)
  const el = document.createElement('div');
  el.className = 'toast' + (tipo === 'error' ? ' err' : tipo === 'warn' ? ' warn' : '');
  el.textContent = msg;
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Formatea fecha para  aceptar string ISO o Date object, imporante para mostrar fechas en tablas y formularios de manera consistente
function fmtFecha(val) {
  if (!val) return '—';
  // Si viene como "2023-03-01T00:00:00.000Z" solo tomar la parte de fecha
  if (typeof val === 'string') return val.slice(0, 10);
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function fmtQ(n) { // Formatea numero como moneda (Q), importante para mostrar precios y totales de manera consistente
  return 'Q ' + parseFloat(n || 0).toFixed(2);
}

function badgeEstado(e) { // Devuelve un span con clase de color segun el estado de la venta
  const cls = { completada: 'b-green', anulada: 'b-red', pendiente: 'b-yellow' };
  return `<span class="badge ${cls[e] || 'b-gray'}">${e}</span>`;
}

function badgeStock(s, min) { // Igual que badgeEstado solo que devuelve un span con clase de color segun el nivel de stock
  if (s <= 0)   return `<span class="badge b-red">${s}</span>`;
  if (s <= min) return `<span class="badge b-yellow">${s} ⚠</span>`;
  return `<span class="badge b-green">${s}</span>`;
}
