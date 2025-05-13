// public/script-store.js

const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const token    = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function fetchJSON(path, opts = {}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Error ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

// — PRODUCTS PAGE —

async function loadProducts() {
  try {
    const prods = await fetchJSON('/products');
    const container = document.getElementById('products');
    container.innerHTML = prods.map(p => `
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

// — CART PAGE —

async function loadCart() {
  try {
    const items = await fetchJSON('/cart');
    const tbody = document.querySelector('#cartTable tbody');
    let total = 0;
    tbody.innerHTML = items.map(ci => {
      total += ci.total_price;
      return `
        <tr>
          <td>${ci.product_name}</td>
          <td>GHS ${ci.unit_price.toFixed(2)}</td>
          <td>
            <input type="number" min="1" value="${ci.quantity}"
                   style="width:60px"
                   onchange="updateQty(${ci.id},this.value)" />
          </td>
          <td>GHS ${ci.total_price.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-danger"
                    onclick="removeItem(${ci.id})">×</button>
          </td>
        </tr>
      `;
    }).join('');
    document.getElementById('grandTotal').textContent = `GHS ${total.toFixed(2)}`;
  } catch (err) {
    alert('Failed to load cart: ' + err.message);
  }
}

async function updateQty(cartId, qty) {
  try {
    await fetchJSON(`/cart/${cartId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: Number(qty) })
    });
    loadCart();
  } catch (err) {
    alert('Update failed: ' + err.message);
  }
}

async function removeItem(cartId) {
  try {
    await fetchJSON(`/cart/${cartId}`, { method: 'DELETE' });
    loadCart();
  } catch (err) {
    alert('Remove failed: ' + err.message);
  }
}

async function loadCheckout() { /* GET /api/cart, render table + total */ }
async function placeOrder() {
  const resp = await fetchJSON('/api/checkout', { method: 'POST' });
  window.location.href = `/thank-you.html?order=${resp.id}`;
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products')) {
    loadProducts();
  }
  if (document.getElementById('cartTable')) {
    loadCart();
    document.getElementById('checkoutBtn').addEventListener('click', async () => {
      // simple checkout: convert cart → order + payment
      try {
        // you may POST { cart: [...] } to a checkout endpoint,
        // but for MVP let's just create an order and clear cart:
        const order = await fetchJSON('/orders', {
          method: 'POST',
          body: JSON.stringify({ /* your quote_id logic here */ })
        });
        alert('Order placed! ID: ' + order.id);
        // clear cart client-side and reload
        await Promise.all((await fetchJSON('/cart')).map(ci =>
          fetchJSON(`/cart/${ci.id}`, { method: 'DELETE' })
        ));
        loadCart();
      } catch (err) {
        alert('Checkout failed: ' + err.message);
      }
    });
  }
});
