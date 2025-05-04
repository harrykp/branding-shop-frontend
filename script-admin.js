// script-admin.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const app = document.getElementById('app-admin');

// helper to GET and parse JSON
async function fetchJSON(path) {
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// wire up navigation links
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    loadAdminView(el.dataset.view);
  })
);

async function loadAdminView(view) {
  app.innerHTML = `<h3>Loading ${view}…</h3>`;
  try {
    switch (view) {
      case 'users':  return showUsers();
      case 'roles':  return showRoles();
      default:
        app.innerHTML = `<p>View "${view}" not implemented yet.</p>`;
    }
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading ${view}: ${err.message}</div>`;
  }
}

// Show list of users and allow role assignment
async function showUsers() {
  // fetch all users and roles
  const [users, allRoles] = await Promise.all([
    fetchJSON('/users'),
    fetchJSON('/roles')
  ]);

  // build HTML
  const html = users.map(u => `
    <div class="card mb-3 p-3">
      <div class="row align-items-center">
        <div class="col-md-4">
          <strong>${u.name}</strong><br>
          <small>${u.email}</small><br>
          <small>Phone: ${u.phone_number || '—'}</small>
        </div>
        <div class="col-md-4">
          <label for="role-select-${u.id}" class="form-label">Role</label>
          <select id="role-select-${u.id}" class="form-select">
            ${allRoles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary"
            onclick="updateUserRole(${u.id})">
            Update Role
          </button>
        </div>
      </div>
    </div>
  `).join('');

  app.innerHTML = `<h3 class="mb-4">Manage Users</h3>${html}`;

  // after injecting, fetch each user’s current role and set the select
  for (let u of users) {
    try {
      const userRoles = await fetchJSON(`/users/${u.id}/roles`);
      if (userRoles.length) {
        document
          .getElementById(`role-select-${u.id}`)
          .value = userRoles[0].id;  // assume single role
      }
    } catch (err) {
      console.warn(`Could not fetch roles for user ${u.id}:`, err);
    }
  }
}

// Send updated role to backend
async function updateUserRole(userId) {
  const select = document.getElementById(`role-select-${userId}`);
  const roleId = select.value;
  try {
    await fetch(`${API_BASE}/users/${userId}/roles`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ roles: [roleId] })
    });
    alert('Role updated successfully.');
  } catch (err) {
    alert('Failed to update role: ' + err.message);
  }
}

// Show list of roles
async function showRoles() {
  try {
    const roles = await fetchJSON('/roles');
    app.innerHTML = `
      <h3 class="mb-4">Roles</h3>
      <ul class="list-group">
        ${roles.map(r => `<li class="list-group-item">${r.id}. ${r.name}</li>`).join('')}
      </ul>
    `;
  } catch (err) {
    app.innerHTML = `<div class="alert alert-danger">Error loading roles: ${err.message}</div>`;
  }
}

// initial view
loadAdminView('users');
