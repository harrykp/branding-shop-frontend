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
  const users = await fetchJSON('/users');
  const allRoles = await fetchJSON('/roles');

  const html = users.map(u => {
    const userRoles = JSON.parse(localStorage.getItem('roles')); // admin’s roles
    return `
      <div class="card mb-2 p-3">
        <strong>${u.name} (${u.email})</strong>
        <select id="roles-${u.id}" class="form-select form-select-sm my-2">
          ${allRoles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        </select>
        <button class="btn btn-sm btn-primary"
          onclick="updateUserRole(${u.id})">
          Update Role
        </button>
      </div>
    `;
  }).join('');

  app.innerHTML = `<h3>Manage Users & Roles</h3>${html}`;
}

async function updateUserRole(userId) {
  const sel = document.getElementById(`roles-${userId}`);
  const roleId = sel.value;
  await fetch(`${API_BASE}/users/${userId}/roles`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ roles: [roleId] })
  });
  alert('Role updated.');
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

