const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const app = document.getElementById('app-user');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadUserView(el.dataset.view);
  })
);

async function loadUserView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'dashboard': return showDashboard();
    case 'requests':  return showRequests();
    case 'invoices':  return showInvoices();
    case 'complaints':return showComplaints();
    default: app.innerHTML = '<p>Unknown view</p>';
  }
}

async function showDashboard() {
  app.innerHTML = `<h3>Welcome to your Dashboard</h3>`;
  // TODO: fetch user summary, commissions, etc.
}

async function showRequests() {
  const res = await fetch(`${API_BASE}/orders`, { headers });
  const orders = await res.json();
  app.innerHTML = `
    <h3>My Requests</h3>
    ${orders.map(o=>`
      <div class="card mb-2">
        <div class="card-body">
          <strong>#${o.id}</strong> — ${o.status} — $${o.total.toFixed(2)}
        </div>
      </div>`).join('')}
  `;
}

async function showInvoices() {
  app.innerHTML = `<h3>Invoices coming soon…</h3>`;
}

async function showComplaints() {
  app.innerHTML = `<h3>Submit a Complaint</h3>`;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadUserView('dashboard');

