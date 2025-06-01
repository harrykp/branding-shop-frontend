// js/includes.js

async function includeHTML() {
  const elements = document.querySelectorAll("[w3-include-html]");
  for (const el of elements) {
    const file = el.getAttribute("w3-include-html");
    if (!file) continue;

    try {
      const res = await fetch(file);
      const text = await res.text();
      el.innerHTML = text;
      el.removeAttribute("w3-include-html");
    } catch (e) {
      el.innerHTML = "Failed to load navigation.";
    }
  }
  await injectNavLinks(); // Inject dynamic nav items after loading
}

async function injectNavLinks() {
  const user = getCurrentUser();
  if (!user) return;

  const isAdmin = user.roles.includes("admin");
  const navId = isAdmin ? "admin-nav-links" : "user-nav-links";
  const container = document.getElementById(navId);
  if (!container) return;

  // Clear existing nav links to avoid duplicates
  container.innerHTML = "";

  const adminLinks = {
    "Dashboard": "admin.html",
    "Users": "admin-users.html",
    "Roles": "admin-roles.html",
    "Products": "admin-products.html",
    "Quotes": "admin-quotes.html",
    "Orders": "admin-orders.html",
    "Production": "admin-production.html",
    "Suppliers": "admin-suppliers.html",
    "Catalog": "admin-catalog.html",
    "Purchase Orders": "admin-purchase-orders.html",
    "Leads": "admin-leads.html",
    "Deals": "admin-deals.html",
    "HR": "admin-hr.html",
    "Finance": "admin-finance.html",
    "Reports": "admin-reports.html",
    "Pricing Rules": "admin-pricing.html"
  };

  const userLinks = {
    "Dashboard": "dashboard.html",
    "Customers": "customers.html",
    "Products": "products.html",
    "Quotes": "quotes.html",
    "Orders": "orders.html",
    "Production": "production.html",
    "Suppliers": "suppliers.html",
    "Catalog": "catalog.html",
    "Purchase Orders": "purchase-orders.html",
    "Leads": "leads.html",
    "Deals": "deals.html",
    "HR": "hr.html",
    "Finance/Payments": "finance.html",
    "Reports": "reports.html"
  };

  const links = isAdmin ? adminLinks : userLinks;

  for (const [label, href] of Object.entries(links)) {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a class="nav-link" href="${href}">${label}</a>`;
    container.appendChild(li);
  }

  // Append current user and logout
  const nav = container.closest(".navbar").querySelector(".navbar-nav");
  if (nav) {
    const info = document.createElement("li");
    info.className = "nav-item";
    info.innerHTML = `<span class="navbar-text text-light ms-3">${user.full_name || user.email}</span>`;
    nav.appendChild(info);

    const logoutLi = document.createElement("li");
    logoutLi.className = "nav-item";
    logoutLi.innerHTML = `<button class="btn btn-sm btn-outline-light ms-2" onclick="logout()">Logout</button>`;
    nav.appendChild(logoutLi);
  }
}
