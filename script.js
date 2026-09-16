document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('nav-open');
    });
  }

  var showButtons = document.querySelectorAll('.field-toggle');
  showButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    });
  });

  var authForm = document.querySelector('.auth-panel form');
  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var pass = authForm.querySelector('input[name="password"]');
      var confirm = authForm.querySelector('input[name="confirm_password"]');
      if (pass && confirm && pass.value !== confirm.value) {
        alert('Passwords do not match.');
        return;
      }
      alert('Form looks good. Hook this up to your backend to actually submit it.');
    });
  }
});
