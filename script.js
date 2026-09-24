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

  var nameFields = document.querySelectorAll('#signupFirstName, #signupLastName');
  nameFields.forEach(function (input) {
    input.addEventListener('input', function () {
      this.value = this.value.replace(/[^A-Za-z\s'-]/g, '');
    });
  });

  var authForm = document.querySelector('.auth-panel form');
  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameRule = /^[A-Za-z\s'-]+$/;
      var firstName = document.getElementById('signupFirstName');
      var nameError = document.getElementById('signupNameError');

      if (firstName && nameError) {
        var lastName = document.getElementById('signupLastName');
        if (!nameRule.test(firstName.value) || !nameRule.test(lastName.value)) {
          nameError.classList.add('show');
          return;
        }
        nameError.classList.remove('show');
      }

      var pass = authForm.querySelector('input[name="password"]');
      var confirm = authForm.querySelector('input[name="confirm_password"]');
      var passwordError = document.getElementById('signupPasswordError');
      var passwordRule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/;

      if (confirm) {
        if (!passwordRule.test(pass.value)) {
          passwordError.textContent = 'Password must be 8-32 characters with at least one letter and one number.';
          passwordError.classList.add('show');
          return;
        }
        if (pass.value !== confirm.value) {
          passwordError.textContent = 'Passwords do not match.';
          passwordError.classList.add('show');
          return;
        }
        passwordError.classList.remove('show');
      }

      var otpScreen = document.getElementById('otpScreen');
      if (otpScreen) {
        startSignupOtp();
        return;
      }

      alert('Form looks good. Hook this up to your backend to actually submit it.');
    });
  }

  var serviceDetails = {
    'auto-care': {
      kicker: 'Routine Maintenance',
      title: 'Auto Care',
      items: [
        'Engine oil and filter change',
        'Tire rotation and pressure check',
        'Brake fluid, coolant, and transmission fluid top-up',
        'Battery health check',
        'Multi-point visual inspection'
      ]
    },
    'core-fix': {
      kicker: 'Damage Repairs',
      title: 'Core Fix',
      items: [
        'Engine diagnostics and repair',
        'Transmission repair or replacement',
        'Brake system repair (pads, rotors, lines)',
        'Electrical system troubleshooting and fixes',
        'Follow-up test drive after repair'
      ]
    },
    'vehicle-mod': {
      kicker: 'Modifications',
      title: 'Vehicle Mod',
      items: [
        'Custom paint jobs and wraps',
        'Body kit installation',
        'Engine performance upgrades',
        'Suspension and exhaust modifications',
        'Consultation on parts compatibility before work starts'
      ]
    },
    'body-work': {
      kicker: 'Structure Repair',
      title: 'Body Work',
      items: [
        'Dent and scratch removal',
        'Panel replacement after collision',
        'Frame straightening',
        'Rust treatment and repainting',
        'Photo documentation before and after'
      ]
    }
  };

  var serviceModal = document.getElementById('serviceModal');
  if (serviceModal) {
    document.querySelectorAll('.service-info-link').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var data = serviceDetails[btn.dataset.service];
        if (!data) return;

        document.getElementById('modalKicker').textContent = data.kicker;
        document.getElementById('modalTitle').textContent = data.title;

        var list = document.getElementById('modalList');
        list.innerHTML = '';
        data.items.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });

        serviceModal.classList.add('open');
      });
    });

    document.getElementById('modalClose').addEventListener('click', function () {
      serviceModal.classList.remove('open');
    });

    serviceModal.addEventListener('click', function (e) {
      if (e.target === serviceModal) serviceModal.classList.remove('open');
    });
  }
});
