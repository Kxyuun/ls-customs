document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('staffLoginForm');
  if (!form) return;

  var STAFF_LOGIN_API_URL = null;
  var errorBox = document.getElementById('staffLoginError');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = form.querySelector('input[name="email"]').value.trim();
    var password = form.querySelector('input[name="password"]').value;

    if (!email || !password) {
      errorBox.classList.add('show');
      return;
    }
    errorBox.classList.remove('show');

    if (!STAFF_LOGIN_API_URL) {
      window.location.href = 'dashboard.html';
      return;
    }

    var submitBtn = form.querySelector('.auth-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    fetch(STAFF_LOGIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Login failed');
        return res.json();
      })
      .then(function (data) {
        localStorage.setItem('lsc_token', data.token);
        localStorage.setItem('lsc_role', data.role);
        window.location.href = 'dashboard.html';
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login \u2192';
        errorBox.textContent = 'Invalid email or password.';
        errorBox.classList.add('show');
      });
  });
});
