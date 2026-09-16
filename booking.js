document.addEventListener('DOMContentLoaded', function () {
  var panel = document.querySelector('.booking-panel');
  if (!panel) return;

  var booking = {
    vehicle: null,
    services: [],
    date: null,
    slot: null,
    payment: null
  };

  var vehicleOptions = document.getElementById('vehicleOptions');
  var serviceOptions = document.getElementById('serviceOptions');
  var payOptions = document.getElementById('payOptions');
  var dateInput = document.getElementById('bookingDate');
  var slotGrid = document.getElementById('slotGrid');

  var today = new Date();
  dateInput.min = today.toISOString().split('T')[0];

  vehicleOptions.querySelectorAll('.option-card').forEach(function (card) {
    card.addEventListener('click', function () {
      vehicleOptions.querySelectorAll('.option-card').forEach(function (c) {
        c.classList.remove('selected');
      });
      card.classList.add('selected');
      booking.vehicle = card.dataset.value;
      hideError('error1');
    });
  });

  serviceOptions.querySelectorAll('.service-select-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var value = card.dataset.value;
      var price = Number(card.dataset.price);
      var index = booking.services.findIndex(function (s) { return s.name === value; });

      if (index === -1) {
        booking.services.push({ name: value, price: price });
        card.classList.add('selected');
      } else {
        booking.services.splice(index, 1);
        card.classList.remove('selected');
      }
      hideError('error2');
    });
  });

  function buildSlots() {
    slotGrid.innerHTML = '';
    if (!dateInput.value) return;

    var day = new Date(dateInput.value + 'T00:00:00').getDay();
    if (day === 0) {
      slotGrid.innerHTML = '<p class="mono" style="color:#ff6b6b; font-size:11px;">Closed on Sundays. Pick another date.</p>';
      return;
    }

    var closeHour = day === 6 ? 17 : 21;
    var hour = 8;

    while (hour < closeHour) {
      var label = formatHour(hour);
      var slot = document.createElement('div');
      slot.className = 'slot';
      slot.textContent = label;
      slot.dataset.value = label;
      slot.addEventListener('click', function () {
        slotGrid.querySelectorAll('.slot').forEach(function (s) {
          s.classList.remove('selected');
        });
        this.classList.add('selected');
        booking.slot = this.dataset.value;
        hideError('error3');
      });
      slotGrid.appendChild(slot);
      hour += 2;
    }
  }

  function formatHour(hour) {
    var period = hour >= 12 ? 'PM' : 'AM';
    var display = hour % 12 === 0 ? 12 : hour % 12;
    return display + ':00 ' + period;
  }

  dateInput.addEventListener('change', function () {
    booking.date = dateInput.value;
    booking.slot = null;
    buildSlots();
    hideError('error3');
  });

  payOptions.querySelectorAll('.option-card').forEach(function (card) {
    card.addEventListener('click', function () {
      payOptions.querySelectorAll('.option-card').forEach(function (c) {
        c.classList.remove('selected');
      });
      card.classList.add('selected');
      booking.payment = card.dataset.value;
      hideError('error4');
    });
  });

  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = btn.closest('.booking-screen').dataset.screen;
      if (!validateStep(current)) return;
      if (current === '3') renderSummary();
      goToStep(btn.dataset.next);
    });
  });

  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(btn.dataset.back);
    });
  });

  document.getElementById('confirmBtn').addEventListener('click', function () {
    if (!validateStep('4')) return;
    submitBooking();
  });

  var BOOKING_API_URL = null;

  function submitBooking() {
    var confirmBtn = document.getElementById('confirmBtn');
    var payload = {
      vehicle: booking.vehicle,
      services: booking.services,
      date: booking.date,
      timeSlot: booking.slot,
      payment: booking.payment,
      totalEstimate: totalPrice()
    };

    if (!BOOKING_API_URL) {
      showConfirmation(makeLocalReference());
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Booking...';

    fetch(BOOKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Booking request failed');
        return res.json();
      })
      .then(function (data) {
        showConfirmation(data.referenceCode || makeLocalReference());
      })
      .catch(function (err) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Booking';
        showError('error4');
        document.getElementById('error4').textContent = 'Could not reach the server. Try again.';
      });
  }

  function makeLocalReference() {
    return 'LSC-' + Math.floor(100000 + Math.random() * 900000);
  }

  function validateStep(step) {
    if (step === '1') {
      if (!booking.vehicle) return showError('error1');
    }
    if (step === '2') {
      if (booking.services.length === 0) return showError('error2');
    }
    if (step === '3') {
      if (!booking.date || !booking.slot) return showError('error3');
    }
    if (step === '4') {
      if (!booking.payment) return showError('error4');
    }
    return true;
  }

  function showError(id) {
    document.getElementById(id).classList.add('show');
    return false;
  }

  function hideError(id) {
    document.getElementById(id).classList.remove('show');
  }

  function goToStep(step) {
    document.querySelectorAll('.booking-screen').forEach(function (screen) {
      screen.hidden = screen.dataset.screen !== step;
    });
    document.querySelectorAll('.progress-step').forEach(function (el) {
      var n = el.dataset.step;
      el.classList.remove('active', 'done');
      if (n === step) el.classList.add('active');
      else if (Number(n) < Number(step)) el.classList.add('done');
    });
  }

  function totalPrice() {
    return booking.services.reduce(function (sum, s) { return sum + s.price; }, 0);
  }

  function renderSummary() {
    var list = document.getElementById('summaryList');
    var serviceNames = booking.services.map(function (s) { return s.name; }).join(', ');
    list.innerHTML =
      summaryRow('Vehicle', booking.vehicle) +
      summaryRow('Services', serviceNames) +
      summaryRow('Date', booking.date) +
      summaryRow('Time', booking.slot) +
      summaryRow('Estimated Total', '\u20B1' + totalPrice().toLocaleString() + '+');
  }

  function summaryRow(label, value) {
    return '<div class="summary-row"><span>' + label + '</span><span>' + value + '</span></div>';
  }

  function showConfirmation(referenceCode) {
    document.getElementById('confirmCode').textContent = referenceCode;

    var serviceNames = booking.services.map(function (s) { return s.name; }).join(', ');
    document.getElementById('confirmSummary').innerHTML =
      summaryRow('Vehicle', booking.vehicle) +
      summaryRow('Services', serviceNames) +
      summaryRow('Date', booking.date) +
      summaryRow('Time', booking.slot) +
      summaryRow('Payment', booking.payment) +
      summaryRow('Estimated Total', '\u20B1' + totalPrice().toLocaleString() + '+');

    document.querySelectorAll('.booking-screen').forEach(function (screen) {
      screen.hidden = screen.dataset.screen !== 'done';
    });
    document.querySelectorAll('.progress-step').forEach(function (el) {
      el.classList.add('done');
      el.classList.remove('active');
    });
  }
});
