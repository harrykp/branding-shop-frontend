const API_BASE = 'https://branding-shop-backend.onrender.com/api';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone_number = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const security_question = document.getElementById("security-question").value;
  const security_answer = document.getElementById("security-answer").value;
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone_number: phone, password, security_question, security_answer })
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
