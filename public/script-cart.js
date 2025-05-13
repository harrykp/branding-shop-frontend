const API_BASE = 'https://branding-shop-backend.onrender.com/api';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};

async function fetchJSON(path, opts={}) {
  const res = await fetch(API_BASE + path, { headers, ...opts });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

async function loadCart() {
  const cart = await fetchJSON('/checkout/cart');
  const container = document.getElementById('cart-list');
  if (!cart.length) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  let html = '<table class="table"><thead><tr>' +
             '<th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th>' +
             '</tr></thead><tbody>';
  cart.forEach(item => {
    html += `<tr>
      <td>${item.product_name}</td>
      <td>${item.price.toFixed(2)}</td>
      <td><input type="number" value="${item.quantity}" min="1"
                 onchange="updateQty(${item.id},this.value)" /></td>
      <td>${(item.price * item.quantity).toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">×</button></td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

async function updateQty(cartItemId, qty) {
  await fetchJSON('/checkout/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: null, quantity: null }), // placeholder
  });
  // You’ll actually want a PUT/PATCH/POST to /cart with cartItemId & qty;
  // adjust above route accordingly.
  loadCart();
}

async function removeItem(id) {
  await fetchJSON(`/checkout/cart/${id}`, { method: 'DELETE' });
  loadCart();
}

document.getElementById('btn-checkout').addEventListener('click', async () => {
  try {
    const resp = await fetchJSON('/checkout', { method: 'POST' });
    alert(`Order #${resp.order.id} placed!`);
    window.location.href = '/orders.html'; // or wherever you show orders
  } catch (err) {
    alert('Checkout failed: ' + err.message);
  }
});

// initial load
loadCart();
