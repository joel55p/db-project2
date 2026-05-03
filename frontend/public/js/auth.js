// Login y logout


document.getElementById('btn-login').addEventListener('click', doLogin); // Permitir login con Enter
document.getElementById('login-pass').addEventListener('keydown', e => { 
  if (e.key === 'Enter') doLogin(); 
});
document.getElementById('btn-logout').addEventListener('click', doLogout);

async function doLogin() { // Validar campos y enviar petición de login
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
    document.getElementById('sidebar-user').textContent = data.usuario.username;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    navegarA('dashboard');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

async function doLogout() { // Enviar peticion de logout y mostrar pantalla de login
  try { await api('/auth/logout', { method: 'POST' }); } catch (_) {}
  document.getElementById('app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-pass').value = '';
}

async function checkSession() { // Verificar si hay sesión activa al cargar la pagina
  try {
    const data = await api('/auth/me');
    document.getElementById('sidebar-user').textContent = data.usuario.username;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    navegarA('dashboard');
  } catch (_) {}
}
