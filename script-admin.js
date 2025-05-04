const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const app = document.getElementById('app-admin');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  switch (view) {
    case 'users':    return showUsers();
    case 'roles':    return showRoles();
    case 'products': return showProducts();
    case 'quotes':   return showQuotes();
    case 'orders':   return showOrders();
    case 'jobs':     return showJobs();
    case 'crm':      return showCRM();
    case 'hr':       return showHR();
    case 'finance':  return showFinance();
    case 'reports':  return showReports();
    default: app.innerHTML = '<p>Unknown view</p>';
  }
}

async function showUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers });
  const users = await res.json();
  app.innerHTML = `<h3>Users</h3>` + users.map(u=>`
    <div class="card mb-2">
      <div class="card-body">
        ${u.name} — ${u.email}
      </div>
    </div>`).join('');
}

// Stub functions for other views:
async function showRoles()    { app.innerHTML = `<h3>Roles</h3>`;    }
async function showProducts(){ app.innerHTML = `<h3>Products</h3>`; }
async function showQuotes()  { app.innerHTML = `<h3>Quotes</h3>`;   }
async function showOrders()  { app.innerHTML = `<h3>Orders</h3>`;   }
async function showJobs()    { app.innerHTML = `<h3>Production</h3>`;}
async function showCRM()     { app.innerHTML = `<h3>CRM</h3>`;      }
async function showHR()      { app.innerHTML = `<h3>HR</h3>`;       }
async function showFinance(){ app.innerHTML = `<h3>Finance</h3>`;  }
async function showReports(){ app.innerHTML = `<h3>Reports</h3>`;  }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// initial load
loadAdminView('users');

