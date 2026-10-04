import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import RequireCustomerAuth from '../components/RequireCustomerAuth.js';
import PasswordField from '../components/PasswordField.js';
import { API } from '../config/api.js';
import { authErrorMessage, changeCustomerPassword, updateCustomerProfile, useCustomerSession } from '../utils/auth.js';
import { listNotifications, markNotificationRead, subscribeNotifications } from '../utils/notificationsStore.js';
import { listBookings, subscribeBookings, updateBookingStatus } from '../utils/bookingsStore.js';
import { STATUS_LABELS, customerCanCancel } from '../utils/bookingStatus.js';
import { formatEstimatedTotal } from '../utils/pricing.js';
import { EMAIL_MAX, NAME_MAX, NAME_MESSAGE, PASSWORD_MESSAGE, isValidName, isValidPassword, normalizeName } from '../utils/validation.js';
import { usePageTitle } from '../utils/usePageTitle.js';

function MyBookings({ customer }) {
  var [state, setState] = useState({ status: 'loading', bookings: [] });
  var [busyId, setBusyId] = useState(null);
  var [actionError, setActionError] = useState('');

  var load = useCallback(function (silent) {
    if (!silent) setState({ status: 'loading', bookings: [] });
    return listBookings({ customerEmail: customer.email, token: customer.token }).then(function (bookings) {
      setState({ status: 'ready', bookings: bookings });
    }).catch(function () {
      setState({ status: 'error', bookings: [] });
    });
  }, [customer.email, customer.token]);

  useEffect(function () {
    load(false);
    // Same store as the staff Dashboard: status changes made there show up here.
    return subscribeBookings(function () { load(true); });
  }, [load]);

  async function handleCancel(booking) {
    if (busyId) return;
    if (!window.confirm('Cancel booking ' + booking.referenceCode + '?')) return;
    setBusyId(booking.id);
    setActionError('');
    try {
      await updateBookingStatus(booking.id, 'cancelled', { customerEmail: customer.email, token: customer.token });
      await load(true);
    } catch (err) {
      setActionError("Couldn't cancel that booking. It may have already been updated.");
      load(true);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="booking-panel" style={{ marginTop: '30px' }}>
      <h2 className="booking-step-title">My Bookings</h2>

      {state.status === 'loading' && <p className="booking-step-sub">Loading your bookings...</p>}
      {state.status === 'error' && (
        <div>
          <p className="booking-error mono show" role="alert">Could not load your bookings.</p>
          <button type="button" className="btn btn-outline" onClick={function () { load(false); }}>Try again</button>
        </div>
      )}
      {state.status === 'ready' && state.bookings.length === 0 && (
        <p className="booking-step-sub">You have no bookings yet.</p>
      )}
      {state.status === 'ready' && state.bookings.length > 0 && (
        <p className="booking-step-sub">Bookings made on this browser (demo storage, not yet synced to a server).</p>
      )}
      {actionError && <p className="booking-error mono show" role="alert">{actionError}</p>}

      {state.bookings.map(function (b) {
        return (
          <div className="summary-list" key={b.id} style={{ marginTop: '20px' }}>
            <div className="summary-row"><span>Reference</span><span className="mono">{b.referenceCode}</span></div>
            <div className="summary-row"><span>Service(s)</span><span>{(b.services || []).join(', ')}</span></div>
            <div className="summary-row"><span>Vehicle</span><span>{b.vehicle}</span></div>
            <div className="summary-row"><span>Date &amp; Time</span><span>{b.date} &middot; {b.timeSlot}</span></div>
            <div className="summary-row"><span>Estimated Total</span><span>{formatEstimatedTotal(b.totalEstimate)}</span></div>
            <div className="summary-row">
              <span>Status</span>
              <span className={'status-pill mono st-' + b.status}>{STATUS_LABELS[b.status] || b.status}</span>
            </div>
            {customerCanCancel(b.status) && (
              <div className="booking-nav" style={{ marginTop: '12px' }}>
                <span></span>
                <button type="button" className="btn btn-outline" disabled={busyId === b.id} onClick={function () { handleCancel(b); }}>
                  {busyId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Notifications({ customer }) {
  var [state, setState] = useState({ status: 'loading', items: [] });
  var [busy, setBusy] = useState(false);

  var load = useCallback(function () {
    return listNotifications({ customerEmail: customer.email, token: customer.token }).then(function (items) {
      setState({ status: 'ready', items: items });
    }).catch(function () {
      setState({ status: 'error', items: [] });
    });
  }, [customer.email, customer.token]);

  useEffect(function () {
    load();
    return subscribeNotifications(function () { load(); });
  }, [load]);

  async function handleRead(item) {
    if (busy) return;
    setBusy(true);
    try {
      await markNotificationRead(item.id, { customerEmail: customer.email, token: customer.token });
    } catch (err) { /* the list reload below shows the real state */ }
    await load();
    setBusy(false);
  }

  var unread = state.items.filter(function (n) { return !n.read; }).length;

  return (
    <div className="booking-panel" style={{ marginTop: '30px' }}>
      <h2 className="booking-step-title">Notifications{unread > 0 ? ' (' + unread + ' new)' : ''}</h2>
      <p className="field-hint mono">
        {API.NOTIFICATIONS
          ? 'Updates from the shop about your bookings.'
          : 'Demo: these appear here only, on this browser. No email, SMS or push message is sent. Real notification delivery needs a backend.'}
      </p>

      {state.status === 'loading' && <p className="booking-step-sub">Loading notifications...</p>}
      {state.status === 'error' && (
        <div>
          <p className="booking-error mono show" role="alert">Could not load notifications.</p>
          <button type="button" className="btn btn-outline" onClick={load}>Try again</button>
        </div>
      )}
      {state.status === 'ready' && state.items.length === 0 && (
        <p className="booking-step-sub">No notifications yet. You'll see an update here when a booking is ready for pickup or completed.</p>
      )}

      {state.status === 'ready' && state.items.map(function (n) {
        return (
          <div className="summary-list" key={n.id} style={{ marginTop: '14px' }}>
            <div className="summary-row">
              <span>{n.read ? 'Read' : 'New'}</span>
              <span>{n.message}</span>
            </div>
            <div className="summary-row">
              <span>Booking</span>
              <span className="mono">{n.referenceCode} &middot; {n.createdAt ? new Date(n.createdAt).toLocaleString('en-PH') : ''}</span>
            </div>
            {!n.read && (
              <div className="booking-nav" style={{ marginTop: '10px' }}>
                <span></span>
                <button type="button" className="btn btn-outline" disabled={busy} onClick={function () { handleRead(n); }}>Mark as read</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChangePassword() {
  var [current, setCurrent] = useState('');
  var [next, setNext] = useState('');
  var [confirm, setConfirm] = useState('');
  var [error, setError] = useState('');
  var [done, setDone] = useState(false);
  var [busy, setBusy] = useState(false);
  var busyRef = useRef(false);

  function edit(setter) {
    return function (e) { setter(e.target.value); setDone(false); };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busyRef.current) return;
    setDone(false);

    if (!current) { setError('Enter your current password.'); return; }
    if (!isValidPassword(next)) { setError(PASSWORD_MESSAGE); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    if (next === current) { setError('Choose a new password that is different from the current one.'); return; }

    busyRef.current = true;
    setBusy(true);
    setError('');

    try {
      await changeCustomerPassword(current, next);
      // Never keep passwords in state longer than needed.
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (err) {
      if (err && err.status === 401) setError('Your current password is incorrect.');
      else if (err && err.status === 501) setError('Changing your password needs the server, which is not connected yet.');
      else setError(authErrorMessage(err, "Couldn't change your password. Try again."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="booking-panel" style={{ marginTop: '30px' }}>
      <h2 className="booking-step-title">Change Password</h2>
      <p className="field-hint mono">
        {API.CHANGE_PASSWORD
          ? 'Your new password takes effect on your next login.'
          : 'Demo only: this updates the login stored on this browser. It is not real account security. Updating a real password needs a backend.'}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
        <div className="field">
          <label htmlFor="acctCurrentPassword">Current Password</label>
          <PasswordField id="acctCurrentPassword" name="current_password" placeholder="CURRENT PASSWORD" maxLength={32} required value={current} onChange={edit(setCurrent)} />
        </div>
        <div className="field">
          <label htmlFor="acctNewPassword">New Password</label>
          <PasswordField id="acctNewPassword" name="new_password" placeholder="NEW PASSWORD" minLength={8} maxLength={32} required value={next} onChange={edit(setNext)} />
          <p className="field-hint mono">8-32 characters, at least one letter and one number.</p>
        </div>
        <div className="field">
          <label htmlFor="acctConfirmPassword">Confirm New Password</label>
          <PasswordField id="acctConfirmPassword" name="confirm_new_password" placeholder="CONFIRM NEW PASSWORD" minLength={8} maxLength={32} required value={confirm} onChange={edit(setConfirm)} />
        </div>

        <p className={'booking-error mono' + (error ? ' show' : '')} role="alert">{error}</p>
        {done && <p className="field-hint mono" role="status" style={{ color: 'var(--green)' }}>Password updated{API.CHANGE_PASSWORD ? '.' : ' on this browser (demo).'}</p>}

        <div className="booking-nav">
          <span></span>
          <button type="submit" className="btn btn-yellow" disabled={busy}>{busy ? 'Updating...' : 'Update Password'}</button>
        </div>
      </form>
    </div>
  );
}

function AccountForm({ customer }) {
  var [firstName, setFirstName] = useState(customer.firstName);
  var [lastName, setLastName] = useState(customer.lastName);
  var [error, setError] = useState(false);
  var [saved, setSaved] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaved(false);

    if (!isValidName(firstName) || !isValidName(lastName)) {
      setError(true);
      return;
    }
    setError(false);

    var f = normalizeName(firstName);
    var l = normalizeName(lastName);
    updateCustomerProfile(f, l);
    setFirstName(f);
    setLastName(l);
    setSaved(true);
  }

  return (
    <main className="booking-page">
      <div className="container">
        <div className="booking-head">
          <p className="auth-eyebrow mono">Your account</p>
          <h1>My Account</h1>
        </div>

        <div className="booking-panel">
          <h2 className="booking-step-title">Profile</h2>
          <p className="booking-step-sub">Update your details below.</p>

          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="booking-field">
                <label htmlFor="acctFirst">First Name</label>
                <input
                  id="acctFirst"
                  type="text"
                  maxLength={NAME_MAX}
                  value={firstName}
                  onChange={function (e) { setFirstName(e.target.value); setSaved(false); }}
                />
              </div>
              <div className="booking-field">
                <label htmlFor="acctLast">Last Name</label>
                <input
                  id="acctLast"
                  type="text"
                  maxLength={NAME_MAX}
                  value={lastName}
                  onChange={function (e) { setLastName(e.target.value); setSaved(false); }}
                />
              </div>
            </div>

            <div className="booking-field">
              <label htmlFor="acctEmail">Email</label>
              <input id="acctEmail" type="email" maxLength={EMAIL_MAX} readOnly value={customer.email} />
            </div>

            <p className={'booking-error mono' + (error ? ' show' : '')}>{NAME_MESSAGE}</p>
            {saved && <p className="field-hint mono" role="status" style={{ color: 'var(--green)' }}>Saved on this browser (demo storage, no backend yet).</p>}

            <div className="booking-nav">
              <span></span>
              <button type="submit" className="btn btn-yellow">Save Changes</button>
            </div>
          </form>
        </div>

        <ChangePassword />

        <Notifications customer={customer} />

        <MyBookings customer={customer} />
      </div>
    </main>
  );
}

function AccountRoute() {
  var session = useCustomerSession();
  return session ? <AccountForm key={session.email} customer={session} /> : null;
}

function Account() {
  usePageTitle('My Account — LS Customs');

  return (
    <RequireCustomerAuth>
      <Header variant="account" />
      <AccountRoute />
      <Footer />
    </RequireCustomerAuth>
  );
}

export default Account;
