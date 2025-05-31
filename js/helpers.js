// js/helpers.js

// Redirect to login page if user is not authenticated
function requireLogin() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
  }
}

// Redirect to unauthorized page if user is not an admin
function requireAdmin() {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  if (!token || !user || !user.roles || !user.roles.includes('admin')) {
    window.location.href = '/unauthorized.html';
  }
}

// Get current user from localStorage
function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}
