const API_BASE = 'https://branding-shop-backend.onrender.com/api';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone_number = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone_number, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(user.roles));
    window.location.href = user.roles.includes('super_admin')
      ? 'admin.html'
      : 'user.html';
  } catch (err) {
    alert(err.message);
  }
});
