document.addEventListener('DOMContentLoaded', function () {
  var emailField = document.getElementById('acctEmail');
  var firstNameField = document.getElementById('acctFirstName');
  var lastNameField = document.getElementById('acctLastName');
  var form = document.getElementById('accountForm');
  var errorBox = document.getElementById('acctError');
  var nameRule = /^[A-Za-z\s'-]+$/;

  emailField.value = localStorage.getItem('lsc_customer_email') || '';
  firstNameField.value = localStorage.getItem('lsc_customer_first_name') || '';
  lastNameField.value = localStorage.getItem('lsc_customer_last_name') || '';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!nameRule.test(firstNameField.value) || !nameRule.test(lastNameField.value)) {
      errorBox.classList.add('show');
      return;
    }
    errorBox.classList.remove('show');

    localStorage.setItem('lsc_customer_first_name', firstNameField.value);
    localStorage.setItem('lsc_customer_last_name', lastNameField.value);

    alert('Saved locally for this demo. Hook this up to your backend to persist it for real.');
  });

  document.getElementById('logoutLink').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('lsc_customer_logged_in');
    localStorage.removeItem('lsc_customer_email');
    window.location.href = 'index.html';
  });
});
