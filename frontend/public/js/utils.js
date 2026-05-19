//Funciones compartidas


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

function toast(msg, tipo = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast' + (tipo === 'error' ? ' err' : tipo === 'warn' ? ' warn' : '');
  el.textContent = msg;
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function fmtFecha(val) {
  if (!val) return '—';
  if (typeof val === 'string') return val.slice(0, 10);
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function fmtQ(n) {
  return 'Q ' + parseFloat(n || 0).toFixed(2);
}

function badgeEstado(e) {
  const cls = { completada: 'b-green', anulada: 'b-red', pendiente: 'b-yellow' };
  return `<span class="badge ${cls[e] || 'b-gray'}">${e}</span>`;
}

function badgeStock(s, min) {
  if (s <= 0)   return `<span class="badge b-red">${s}</span>`;
  if (s <= min) return `<span class="badge b-yellow">${s} ⚠</span>`;
  return `<span class="badge b-green">${s}</span>`;
}