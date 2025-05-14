// public/script-store.js
const API_BASE = '/api';
const token    = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

// — PRODUCTS PAGE —
async function loadProducts() {
  try {
    const prods = await fetchJSON('/products');
    document.getElementById('products').innerHTML = prods.map(p => `
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text text-truncate">${p.description}</p>
            <div class="mt-auto">
              <strong>GHS ${p.price.toFixed(2)}</strong>
              <button class="btn btn-sm btn-primary float-end"
                      onclick="addToCart(${p.id},1)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    alert('Failed to load products: ' + err.message);
  }
}

async function addToCart(productId, qty) {
  try {
    await fetchJSON('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity: qty })
    });
    alert('Added to cart!');
  } catch (err) {
    alert('Add to cart failed: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
