document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
  } else {
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
});
