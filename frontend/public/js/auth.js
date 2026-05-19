// Login y logout


document.getElementById('btn-login').addEventListener('click', doLogin); 
document.getElementById('login-pass').addEventListener('keydown', e => { // Permite hacer login con Enter
  if (e.key === 'Enter') doLogin();
});
document.getElementById('btn-logout').addEventListener('click', doLogout);
 
async function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl    = document.getElementById('login-error');
  errEl.style.display = 'none';
 
  if (!username || !password) {
    errEl.textContent = 'Ingresa usuario y contraseña.';
    errEl.style.display = 'block';
    return;
  }
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
 
    // Guardar permisos globalmente
    permisosActuales = data.usuario.permisos || {};
    rolActual        = data.usuario.rol || '';
 
    document.getElementById('sidebar-user').textContent = data.usuario.username;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
 
    // Aplicar permisos a la UI antes de navegar
    aplicarPermisosUI();
    navegarA('dashboard');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}
 
async function doLogout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch (_) {}
  permisosActuales = {};
  rolActual = '';
  document.getElementById('app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-pass').value = '';
}
 
async function checkSession() {
  try {
    const data = await api('/auth/me');
    permisosActuales = data.usuario.permisos || {};
    rolActual        = data.usuario.rol || '';
 
    document.getElementById('sidebar-user').textContent = data.usuario.username;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
 
    aplicarPermisosUI();
    navegarA('dashboard');
  } catch (_) {}
}