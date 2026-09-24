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
  var todayStr = today.toISOString().split('T')[0];
  dateInput.min = todayStr;
  dateInput.value = todayStr;

  var maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  var maxDateStr = maxDate.toISOString().split('T')[0];
  dateInput.max = maxDateStr;

  var fullyBookedDates = getDemoFullyBookedDates();
  var dateHint = document.getElementById('dateHint');
  if (dateHint) {
    dateHint.textContent = 'Currently full: ' + fullyBookedDates.join(', ');
  }

  function getDemoFullyBookedDates() {
    var dates = [];
    for (var i = 3; i <= 5; i++) {
      var d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

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

  var detailPanel = document.getElementById('serviceDetailPanel');
  serviceOptions.querySelectorAll('.service-info-icon').forEach(function (icon) {
    icon.addEventListener('click', function (e) {
      e.stopPropagation();

      var data = serviceDetails[icon.dataset.detail];
      if (!data) return;

      document.getElementById('detailKicker').textContent = data.kicker;
      document.getElementById('detailTitle').textContent = data.title;

      var list = document.getElementById('detailList');
      list.innerHTML = '';
      data.items.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });

      detailPanel.hidden = false;
    });
  });

  function buildSlots() {
    slotGrid.innerHTML = '';
    if (!dateInput.value) return;

    if (fullyBookedDates.indexOf(dateInput.value) !== -1) {
      slotGrid.innerHTML = '<p class="mono" style="color:#ff6b6b; font-size:11px;">Fully booked that day. Pick another date.</p>';
      return;
    }

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

  booking.date = dateInput.value;
  buildSlots();

  dateInput.addEventListener('change', function () {
    if (dateInput.value < todayStr || dateInput.value > maxDateStr) {
      dateInput.value = todayStr;
    }

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

  function formatTotal() {
    var total = totalPrice();
    return total === 0 ? 'To be discussed' : '\u20B1' + total.toLocaleString() + '+';
  }

  function renderSummary() {
    var list = document.getElementById('summaryList');
    var serviceNames = booking.services.map(function (s) { return s.name; }).join(', ');
    list.innerHTML =
      summaryRow('Vehicle', booking.vehicle) +
      summaryRow('Services', serviceNames) +
      summaryRow('Date', booking.date) +
      summaryRow('Time', booking.slot) +
      summaryRow('Estimated Total', formatTotal());
  }

  function summaryRow(label, value) {
    return '<div class="summary-row"><span>' + label + '</span><span>' + value + '</span></div>';
  }

  function showConfirmation(referenceCode) {
    document.getElementById('confirmCode').textContent = referenceCode;
    lastReferenceCode = referenceCode;

    var serviceNames = booking.services.map(function (s) { return s.name; }).join(', ');
    document.getElementById('confirmSummary').innerHTML =
      summaryRow('Vehicle', booking.vehicle) +
      summaryRow('Services', serviceNames) +
      summaryRow('Date', booking.date) +
      summaryRow('Time', booking.slot) +
      summaryRow('Payment', booking.payment) +
      summaryRow('Estimated Total', formatTotal());

    document.querySelectorAll('.booking-screen').forEach(function (screen) {
      screen.hidden = screen.dataset.screen !== 'done';
    });
    document.querySelectorAll('.progress-step').forEach(function (el) {
      el.classList.add('done');
      el.classList.remove('active');
    });
  }

  var lastReferenceCode = null;

  document.getElementById('downloadPdfBtn').addEventListener('click', function () {
    var jsPDFLib = window.jspdf.jsPDF;
    var doc = new jsPDFLib();
    var serviceNames = booking.services.map(function (s) { return s.name; }).join(', ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('LS Customs — Booking Confirmation', 20, 25);

    doc.setDrawColor(200);
    doc.line(20, 30, 190, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    var lines = [
      ['Reference Code', lastReferenceCode],
      ['Vehicle', booking.vehicle],
      ['Service(s)', serviceNames],
      ['Date', booking.date],
      ['Time', booking.slot],
      ['Payment Method', booking.payment],
      ['Estimated Total', totalPrice() === 0 ? 'To be discussed' : 'PHP ' + totalPrice().toLocaleString() + '+']
    ];

    var y = 45;
    lines.forEach(function (row) {
      doc.setFont('helvetica', 'bold');
      doc.text(row[0] + ':', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(row[1]), 80, y);
      y += 10;
    });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('LS Customs — Pasay City, PH. Est. 2019.', 20, y + 10);

    doc.save(lastReferenceCode + '.pdf');
  });
});
