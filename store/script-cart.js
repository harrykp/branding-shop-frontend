// public/script-cart.js
const API_BASE = '/api';
const token    = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function fetchJSON(path, opts={}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function loadCart() {
  const items = await fetchJSON('/cart');
  if (!items.length) {
    document.getElementById('cart-list').innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  let total = 0;
  const rows = items.map(ci => {
    total += ci.total_price;
    return `
      <tr>
        <td>${ci.product_name}</td>
        <td>GHS ${ci.unit_price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${ci.quantity}" style="width:60px"
                 onchange="updateQty(${ci.id}, this.value)" />
        </td>
        <td>GHS ${ci.total_price.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${ci.id})">×</button>
        </td>
      </tr>
    `;
  }).join('');
  document.getElementById('cart-list').innerHTML = `
    <table class="table"><thead><tr>
      <th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th>
    </tr></thead><tbody>${rows}</tbody></table>
    <h4>Grand Total: GHS ${total.toFixed(2)}</h4>
  `;
}

async function updateQty(id, qty) {
  await fetchJSON(`/cart/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity: Number(qty) })
  });
  loadCart();
}

async function removeItem(id) {
  await fetchJSON(`/cart/${id}`, { method: 'DELETE' });
  loadCart();
}

document.getElementById('btn-checkout').addEventListener('click', async () => {
  try {
    const { id } = await fetchJSON('/checkout', { method: 'POST' });
    alert(`Order placed! ID: ${id}`);
    window.location.href = 'products.html';
  } catch (err) {
    alert('Checkout failed: ' + err.message);
  }
});

document.addEventListener('DOMContentLoaded', loadCart);
