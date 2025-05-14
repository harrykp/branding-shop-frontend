const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userData = parseJwt(token);
  const historyContainer = document.getElementById("order-history");

  if (!userData || !userData.user_id) {
    alert("Please log in to view your orders.");
    window.location.href = "login.html";
    return;
  }

  fetch(`${API_BASE_URL}/orders?customer_id=${userData.user_id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(orders => {
      if (!orders.length) {
        historyContainer.innerHTML = "<p>No orders yet.</p>";
        return;
      }

      orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "order-block";
        div.innerHTML = `
          <h2>Order #${order.id}</h2>
          <p>Status: ${order.status}</p>
          <p>Created: ${new Date(order.created_at).toLocaleString()}</p>
          <ul>
            ${order.items.map(item =>
              `<li>${item.product_name} x ${item.quantity}</li>`
            ).join("")}
          </ul>
        `;
        historyContainer.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      historyContainer.innerHTML = "<p>Error loading orders.</p>";
    });
});
