const API_BASE = 'https://branding-shop-backend.onrender.com/api';

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(user.roles));
    window.location.href = user.roles.includes('super_admin')
      ? 'admin.html'
      : 'user.html';
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});
