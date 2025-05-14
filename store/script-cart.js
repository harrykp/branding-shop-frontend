const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";

// Helper to decode JWT and extract payload
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartActions = document.getElementById("cart-actions");
  const checkoutButton = document.getElementById("checkout");

  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const token = localStorage.getItem("token");
  const userData = parseJwt(token);

  if (!userData || !userData.user_id) {
    checkoutButton.disabled = true;
    checkoutButton.innerText = "Login to Checkout";
  }

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartActions.style.display = "none";
      return;
    }

    cartActions.style.display = "block";
    let total = 0;

    cartItems.forEach(item => {
      total += item.price * item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
        <h2>${item.name}</h2>
        <p>Quantity: ${item.quantity}</p>
        <p>Price: $${item.price}</p>
        <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
      `;
      cartItemsContainer.appendChild(itemDiv);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-total";
    totalDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
    cartItemsContainer.appendChild(totalDiv);
  }

  renderCart();

  document.getElementById("clear-cart").addEventListener("click", () => {
    localStorage.removeItem("cart");
    cartItems = [];
    renderCart();
  });

  checkoutButton.addEventListener("click", () => {
    if (!userData || !userData.user_id) {
      alert("Please log in to proceed with checkout.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const orderPayload = {
      customer_id: userData.user_id,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    })
      .then(response => {
        if (!response.ok) throw new Error("Order creation failed.");
        return response.json();
      })
      .then(data => {
        localStorage.removeItem("cart");
        window.location.href = "thankyou.html";
      })
      .catch(error => {
        console.error("Checkout error:", error);
        alert("Failed to place order.");
      });
  });
});
