// /js/helpers.js

if (typeof window.API_BASE === "undefined") {
  window.API_BASE = "https://branding-shop-backend.onrender.com";
}

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const token = getStoredToken();
  return token ? parseJwt(token) : null;
}

function requireLogin() {
  const token = getStoredToken();
  const user = parseJwt(token);
  if (!token || !user || !user.userId) {
    alert("Login required.");
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const token = getStoredToken();
  const user = parseJwt(token);
  if (!token || !user || !user.roles || !user.roles.includes("admin")) {
    alert("Admin access required.");
    window.location.href = "unauthorized.html";
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };
  return fetch(fullUrl, { ...options, headers });
}

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
}

function renderPagination(totalItems, containerId, onPageClick, perPage = 10, currentPage = 1) {
  const totalPages = Math.ceil(totalItems / perPage);
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-primary mx-1';
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => onPageClick(i);
    container.appendChild(btn);
  }
}

function exportTableToCSV(tableId, filename = "export.csv") {
  const rows = document.querySelectorAll(`#${tableId} tr`);
  if (!rows.length) return;

  const csv = Array.from(rows).map(row =>
    Array.from(row.cells).map(cell => `"${cell.innerText.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function printElementById(elementId) {
  const content = document.getElementById(elementId);
  if (!content) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('<link rel="stylesheet" href="/style.css" />');
  printWindow.document.write('</head><body>');
  printWindow.document.write(content.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

async function populateSelect(endpoint, selectElOrId) {
  try {
    const selectElement = typeof selectElOrId === 'string' ? document.getElementById(selectElOrId) : selectElOrId;
    if (!selectElement) return;

    const res = await fetch(`${API_BASE}/api/${endpoint}`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    const result = await res.json();

    selectElement.innerHTML = '<option value="">-- Select --</option>';

    let data = Array.isArray(result.data) ? result.data
              : Array.isArray(result.customers) ? result.customers
              : Array.isArray(result) ? result
              : [];

    data.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
    
      let label = item.name || item.job_name || `ID ${item.id}`;
      if (!item.name) {
        if (endpoint === "orders") label = `Order #${item.id}`;
        if (endpoint === "deals") label = `Deal #${item.id}`;
      }
    
      opt.textContent = label;
      if (item.unit_price) opt.dataset.price = item.unit_price;
      selectElement.appendChild(opt);
    });

  } catch (error) {
    console.error(`Failed to populate ${endpoint} select:`, error);
  }
}

function calculateItemTotal(row) {
  const qty = parseFloat(row.querySelector('.item-qty')?.value || 0);
  const price = parseFloat(row.querySelector('.item-price')?.value || 0);
  row.querySelector('.item-subtotal').textContent = (qty * price).toFixed(2);
  return qty * price;
}

function recalculateTotal(containerId, totalFieldId) {
  const rows = document.querySelectorAll(`#${containerId} .item-row`);
  let total = 0;
  rows.forEach(row => total += calculateItemTotal(row));
  const totalField = document.getElementById(totalFieldId);
  if (totalField) totalField.value = total.toFixed(2);
}

function addItemRow(containerId, products, onRemoveCallback) {
  const container = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-center item-row mb-2';

  row.innerHTML = `
    <div class="col-md-4">
      <select class="form-select item-product" required>
        <option value="">-- Select Product --</option>
        ${products.map(p => `<option value="${p.id}" data-price="${p.unit_price}">${p.name}</option>`).join('')}
      </select>
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control item-qty" placeholder="Qty" value="1" required />
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control item-price" placeholder="Price" required />
    </div>
    <div class="col-md-2">
      <span class="item-subtotal">0.00</span>
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-danger btn-sm remove-item">Remove</button>
    </div>
  `;

  container.appendChild(row);
  setupRowListeners(row, onRemoveCallback);
}

function setupRowListeners(row, onRemoveCallback) {
  const select = row.querySelector('.item-product');
  const qty = row.querySelector('.item-qty');
  const price = row.querySelector('.item-price');
  const remove = row.querySelector('.remove-item');

  if (select && price) {
    select.addEventListener('change', () => {
      const selected = select.options[select.selectedIndex];
      price.value = selected.dataset.price || 0;
      calculateItemTotal(row);
      if (onRemoveCallback) onRemoveCallback();
    });
  }
  if (qty) qty.addEventListener('input', () => {
    calculateItemTotal(row);
    if (onRemoveCallback) onRemoveCallback();
  });
  if (price) price.addEventListener('input', () => {
    calculateItemTotal(row);
    if (onRemoveCallback) onRemoveCallback();
  });
  if (remove) remove.addEventListener('click', () => {
    row.remove();
    if (onRemoveCallback) onRemoveCallback();
  });
}
