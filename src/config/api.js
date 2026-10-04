// Single place for every backend endpoint. There is NO backend yet, so every
// value is null and the app runs in local/demo mode (localStorage /
// sessionStorage). Set a URL to switch that feature over to a real API.
// Expected request/response shapes are documented next to each entry.
//
// Nothing here is a real service - do not treat local/demo mode as secure.
// Every entry marked BACKEND REQUIRED has no real behaviour until a server
// implements it; the server must also enforce roles/ownership on every request.
export var API = {
  // ONE login for customers, staff and admins. The SERVER decides the role;
  // the client never picks one. The role controls where the user lands.
  LOGIN: null,                   // POST {email, password} -> {token, role: 'customer'|'staff'|'admin', user:{id, email, firstName, lastName, name}}
  OTP_SEND: null,                // POST {email}
  OTP_VERIFY: null,              // POST {email, code, firstName, lastName, password} -> {token, role?, user}
  CHANGE_PASSWORD: null,         // POST (Bearer token) {currentPassword, newPassword}  BACKEND REQUIRED
  PASSWORD_RESET_REQUEST: null,  // POST {email} -> 204 always (never reveal whether the account exists); server sends the email  BACKEND REQUIRED
  PASSWORD_RESET_CONFIRM: null,  // POST {email, code, newPassword}; server verifies + expires the code, updates the password, ends old sessions  BACKEND REQUIRED
  BOOKINGS: null,                // GET list | POST create | PATCH /:id {status}
  NOTIFICATIONS: null,           // GET list (Bearer token) | PATCH /:id {read: true}. The SERVER creates them when a booking status changes and delivers email/SMS/push  BACKEND REQUIRED
  STAFF_ACCOUNTS: null,          // GET list | POST create | DELETE /:id
  AVAILABILITY: null             // GET ?date=YYYY-MM-DD -> {status, slots:[{hour, available}]}
};
