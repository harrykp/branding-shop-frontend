const API_BASE_URL = "https://branding-shop-backend.onrender.com/api";
const token = localStorage.getItem("token") || sessionStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_BASE_URL}/products`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(products => {
      if (!Array.isArray(products)) {
        throw new Error("Invalid product response format.");
      }

      const productList = document.getElementById("product-list");
      productList.innerHTML = ""; // Clear any previous content

      products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p>Price: $${product.price}</p>
          <button data-id="${product.id}">Add to Cart</button>
        `;
        productList.appendChild(productItem);
      });

      // Add event listeners to "Add to Cart" buttons
      document.querySelectorAll("button[data-id]").forEach(button => {
        button.addEventListener("click", () => {
          const productId = button.getAttribute("data-id");
          const product = products.find(p => p.id == productId);

          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          const existing = cart.find(item => item.id === product.id);

          if (existing) {
            existing.quantity += 1;
          } else {
            cart.push({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1
            });
          }

          localStorage.setItem("cart", JSON.stringify(cart));
          alert(`Added ${product.name} to cart.`);
        });
      });
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      const productList = document.getElementById("product-list");
      productList.innerHTML = `<p style="color: red;">Failed to load products. Please login or check your connection.</p>`;
    });
});
