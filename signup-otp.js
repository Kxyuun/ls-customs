var OTP_SEND_API_URL = null;
var OTP_VERIFY_API_URL = null;
var currentDemoOtp = null;

function loginUrlWithRedirect() {
  var params = new URLSearchParams(window.location.search);
  var redirectParam = params.get('redirect');
  return redirectParam ? 'login.html?redirect=' + encodeURIComponent(redirectParam) : 'login.html';
}

function startSignupOtp() {
  var email = document.getElementById('signupEmail').value.trim();
  document.getElementById('otpEmailTarget').textContent = email;
  document.getElementById('otpInput').value = '';
  document.getElementById('otpError').classList.remove('show');

  document.getElementById('signupFormScreen').hidden = true;
  document.getElementById('otpScreen').hidden = false;

  sendOtp(email);
}

function sendOtp(email) {
  if (!OTP_SEND_API_URL) {
    currentDemoOtp = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('otpDemoHint').textContent = 'Demo mode, no email backend yet: your code is ' + currentDemoOtp;
    return;
  }

  document.getElementById('otpDemoHint').textContent = '';

  fetch(OTP_SEND_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  }).catch(function () {
    document.getElementById('otpError').textContent = 'Could not send the code. Check your connection and try Resend.';
    document.getElementById('otpError').classList.add('show');
  });
}

function verifyOtp() {
  var code = document.getElementById('otpInput').value.trim();
  var errorBox = document.getElementById('otpError');
  var verifyBtn = document.getElementById('verifyOtpBtn');

  if (code.length !== 6) {
    errorBox.textContent = 'Enter the full 6-digit code.';
    errorBox.classList.add('show');
    return;
  }

  if (!OTP_VERIFY_API_URL) {
    if (code === currentDemoOtp) {
      errorBox.classList.remove('show');
      alert('Account verified. Hook this up to your backend to actually create the account.');
      window.location.href = loginUrlWithRedirect();
    } else {
      errorBox.textContent = 'That code doesn\'t match. Try again.';
      errorBox.classList.add('show');
    }
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';

  var email = document.getElementById('signupEmail').value.trim();

  fetch(OTP_VERIFY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, code: code })
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Invalid code');
      return res.json();
    })
    .then(function () {
      window.location.href = loginUrlWithRedirect();
    })
    .catch(function () {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify & Create Account';
      errorBox.textContent = 'That code doesn\'t match. Try again.';
      errorBox.classList.add('show');
    });
}

document.getElementById('verifyOtpBtn').addEventListener('click', verifyOtp);

document.getElementById('resendOtpLink').addEventListener('click', function (e) {
  e.preventDefault();
  var email = document.getElementById('signupEmail').value.trim();
  sendOtp(email);
});
