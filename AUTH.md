# Authentication & roles — customer / staff / admin

This site needs three kinds of logged-in users: **customer** (books appointments, tracks their own car), **staff** (runs the day-to-day: sees every booking, updates status), and **admin** (everything staff can do, plus manages staff accounts). This doc is for whoever builds login/auth on the backend.

## Why a hidden admin URL isn't enough on its own

`admin-login.html` not being linked anywhere on the site keeps regular customers from stumbling onto it, but it does **not** protect any data. Anyone who finds that URL (view source, guessed filename, shared by accident) can open the page. The real security has to happen on the server, not by hiding a filename. Everything below is what actually protects staff/admin data.

## What each role can actually do

**Customer**
- Book appointments
- View their own booking history and current status
- Cannot see anyone else's bookings

**Staff**
- View every current booking (not just their own — that's the point of the dashboard)
- Update a booking's status: Pending → In Progress → Ready for Pickup → Completed
- View customer contact info attached to a booking
- Cannot create, edit, or remove staff/admin accounts
- Cannot change site-wide settings (pricing, hours, service list)

**Admin**
- Everything Staff can do, plus:
- Create new staff accounts
- Deactivate/remove a staff account
- (Optional, if the group wants it) edit service menu / pricing / shop hours

Note: prefer a "Cancelled" status over actually deleting a booking row, even for admins — keeps a record instead of losing history.

## Database

One `users` table works for all three roles — don't build separate tables per role. Add a `role` column:

```
users
- id
- name
- email
- password_hash
- role         ("customer", "staff", or "admin")
```

Staff and admin accounts get created manually or through the admin account-management endpoint below — there's no public "sign up as staff/admin" form, matching that `admin-login.html` / staff login isn't linked publicly either.

## Login flow

1. User submits email + password on the matching login page (`login.html` for customers, a separate staff/admin login page for the other two).
2. Backend checks the credentials against the `users` table.
3. If valid, backend returns a **token** (JWT is the standard choice, but a session cookie works too) that encodes the user's `id` and `role`.
4. Frontend stores that token (e.g. in `localStorage` or a cookie) and sends it along with every future request that needs to know who's asking.

## The part that actually matters: checking role on every request

Any backend endpoint that returns or changes data meant only for staff/admin must check the token's role **on that request**, not just trust that the person made it past login once.

```
GET /api/staff/bookings
  -> read the token from the request
  -> decode it, check role === "staff" OR role === "admin"
  -> if neither: respond 403 Forbidden, no booking data
  -> otherwise: respond with the full booking list
```

```
POST /api/admin/staff-accounts
  -> read the token
  -> check role === "admin" specifically (staff alone is not enough)
  -> if not admin: respond 403 Forbidden
  -> otherwise: create the new staff account
```

Compare both of those to the customer's own tracking request, which only needs their own bookings, not everyone's:

```
GET /api/bookings/mine
  -> read the token, get the user's id
  -> return only bookings where user_id matches
```

The dashboard page loading in the browser is not the security boundary — the API refusing to send data to the wrong role is.

## What the frontend will send

The staff dashboard and the customer track page will call these endpoints with the stored token attached (typically as an `Authorization: Bearer <token>` header). No other frontend changes needed once these endpoints exist — same pattern as `BOOKING_API_URL` in `booking.js`, just applied to login/dashboard/tracking/account-management instead of booking submission.

## Summary checklist for whoever builds this

- [ ] `users` table with a `role` column (`customer` / `staff` / `admin`)
- [ ] `POST /api/login` — checks credentials, returns a token with `id` + `role`
- [ ] `GET /api/staff/bookings` — staff or admin, checks role before returning data
- [ ] `PATCH /api/staff/bookings/:id` — staff or admin, updates a booking's status
- [ ] `GET /api/bookings/mine` — customer-only, returns just their own bookings
- [ ] `POST /api/admin/staff-accounts` — admin-only, creates a new staff account
- [ ] `DELETE /api/admin/staff-accounts/:id` — admin-only, deactivates/removes a staff account
