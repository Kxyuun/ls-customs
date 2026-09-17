document.addEventListener('DOMContentLoaded', function () {
  var DASHBOARD_API_URL = null;
  var STAFF_ACCOUNTS_API_URL = null;

  var bookings = [
    {
      customer: 'Maria Santos',
      contact: '+63 917 111 2233',
      vehicle: 'Sedan',
      services: 'Auto Care',
      date: '2026-09-18',
      time: '10:00 AM',
      status: 'pending'
    },
    {
      customer: 'Jayson Cruz',
      contact: '+63 917 444 5566',
      vehicle: 'SUV',
      services: 'Core Fix, Body Work',
      date: '2026-09-18',
      time: '1:00 PM',
      status: 'progress'
    },
    {
      customer: 'Anna Reyes',
      contact: '+63 917 777 8899',
      vehicle: 'Motorcycle',
      services: 'Vehicle Mod',
      date: '2026-09-19',
      time: '9:00 AM',
      status: 'ready'
    },
    {
      customer: 'Paolo Ramos',
      contact: '+63 917 222 3344',
      vehicle: 'Sedan',
      services: 'Auto Care',
      date: '2026-09-17',
      time: '2:00 PM',
      status: 'done'
    }
  ];

  var staffAccounts = [
    { name: 'Kate Azul', email: 'kateazul@lscustoms.ph', role: 'admin' },
    { name: 'Ben Torres', email: 'ben@lscustoms.ph', role: 'staff' }
  ];

  var statusLabels = {
    pending: 'Pending',
    progress: 'In Progress',
    ready: 'Ready for Pickup',
    done: 'Completed'
  };

  var rowsEl = document.getElementById('bookingRows');
  var adminPanel = document.getElementById('adminPanel');
  var staffListEl = document.getElementById('staffList');
  var roleSwitch = document.getElementById('roleSwitch');

  function renderBookings() {
    rowsEl.innerHTML = '';

    bookings.forEach(function (booking, index) {
      var row = document.createElement('tr');

      row.innerHTML =
        '<td><div class="cust-name">' + booking.customer + '</div><div class="cust-contact mono">' + booking.contact + '</div></td>' +
        '<td>' + booking.vehicle + '</td>' +
        '<td>' + booking.services + '</td>' +
        '<td class="mono">' + booking.date + '</td>' +
        '<td class="mono">' + booking.time + '</td>' +
        '<td></td>';

      var statusCell = row.querySelector('td:last-child');
      var select = document.createElement('select');
      select.className = 'status-select st-' + booking.status;
      select.dataset.index = index;

      Object.keys(statusLabels).forEach(function (key) {
        var option = document.createElement('option');
        option.value = key;
        option.textContent = statusLabels[key];
        if (key === booking.status) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener('change', function () {
        var i = Number(this.dataset.index);
        bookings[i].status = this.value;
        this.className = 'status-select st-' + this.value;
        updateBookingStatus(bookings[i]);
      });

      statusCell.appendChild(select);
      rowsEl.appendChild(row);
    });
  }

  function updateBookingStatus(booking) {
    if (!DASHBOARD_API_URL) return;

    fetch(DASHBOARD_API_URL + '/' + booking.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: booking.status })
    }).catch(function () {
      alert('Could not save that status change. Check your connection.');
    });
  }

  function renderStaffList() {
    staffListEl.innerHTML = '';

    staffAccounts.forEach(function (account, index) {
      var row = document.createElement('div');
      row.className = 'staff-row';
      row.innerHTML =
        '<div><div class="staff-row-name">' + account.name + '</div><div class="staff-row-role mono">' + account.role + ' &middot; ' + account.email + '</div></div>';

      var removeBtn = document.createElement('button');
      removeBtn.className = 'remove-staff-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        removeStaffAccount(index);
      });

      row.appendChild(removeBtn);
      staffListEl.appendChild(row);
    });
  }

  function removeStaffAccount(index) {
    staffAccounts.splice(index, 1);
    renderStaffList();

    if (!STAFF_ACCOUNTS_API_URL) return;
    fetch(STAFF_ACCOUNTS_API_URL, { method: 'DELETE' }).catch(function () {});
  }

  document.getElementById('addStaffForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('newStaffName').value.trim();
    var email = document.getElementById('newStaffEmail').value.trim();
    var role = document.getElementById('newStaffRole').value;

    if (!name || !email) return;

    staffAccounts.push({ name: name, email: email, role: role });
    renderStaffList();
    this.reset();

    if (!STAFF_ACCOUNTS_API_URL) return;
    fetch(STAFF_ACCOUNTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, role: role })
    }).catch(function () {});
  });

  roleSwitch.addEventListener('change', function () {
    adminPanel.hidden = this.value !== 'admin';
  });

  renderBookings();
  renderStaffList();
});
