(function () {
  var loggedIn = localStorage.getItem('lsc_customer_logged_in') === 'true';
  if (loggedIn) return;

  var current = window.location.pathname.split('/').pop();
  window.location.href = 'login.html?redirect=' + encodeURIComponent(current);
})();
