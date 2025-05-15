const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  const payload = parseJwt(token);
  const historyContainer = document.getElementById("order-history");

  if (!token || !payload?.userId) {
    historyContainer.innerHTML = "<p class='text-danger'>Please log in to view your orders.</p>";
    return;
  }

  fetch(`${API_BASE_URL}/orders?customer_id=${payload.userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(orders => {
      if (!Array.isArray(orders) || orders.length === 0) {
        historyContainer.innerHTML = "<p>No orders found.</p>";
        return;
      }

      orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "border rounded p-3 mb-4";

        const statusColor = {
          pending: "text-warning",
          processing: "text-primary",
          completed: "text-success",
          cancelled: "text-danger"
        }[order.status.toLowerCase()] || "text-secondary";

        const itemsList = order.items?.map(item =>
          `<li>${item.product_name} x ${item.quantity}</li>`).join("") || "<li>No items listed</li>";

        div.innerHTML = `
          <h5>Order #${order.id}</h5>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p class="${statusColor}"><strong>Status:</strong> ${order.status}</p>
          <ul>${itemsList}</ul>
          <a href="${API_BASE_URL}/orders/${order.id}/receipt" class="btn btn-sm btn-outline-secondary mt-2" target="_blank">Download Receipt</a>
        `;

        historyContainer.appendChild(div);
      });
    })
    .catch(error => {
      console.error("Error loading order history:", error);
      historyContainer.innerHTML = "<p class='text-danger'>Failed to load order history.</p>";
    });
});
