# LS Customs — React conversion

A 1:1 React port of the original vanilla HTML/CSS/JS site. Same dark theme,
same yellow/red accents, same demo-only behavior (no real backend yet).

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## What to install

Already required and listed in `package.json` — a plain `npm install` gets
everything:

- `react`, `react-dom` — the framework
- `react-router-dom` — client-side routing (replaces the separate `.html`
  pages)
- `jspdf` — the "Download PDF" button on the booking confirmation screen
  (the original loaded this from a CDN `<script>` tag; here it's a proper
  npm dependency and import instead)
- `vite`, `@vitejs/plugin-react` — dev server / bundler (already included in
  any standard Vite + React setup, listed here so `npm install` needs no
  extra step)

Nothing else needs installing.

## Project structure

```
ls-customs-react/
├── index.html              Vite entry HTML (mounts <div id="root">)
├── package.json
├── vite.config.js           configured so .js files can contain JSX (see note below)
└── src/
    ├── main.js               ReactDOM root + BrowserRouter
    ├── App.js                 route table (maps old .html pages to routes)
    ├── style.css               the stylesheet
    ├── assets/                  photos imported by components (see Assets)
    ├── config/
    │   └── api.js               every backend endpoint in one place (all null = local demo mode)
    ├── data/
    │   ├── serviceData.js        service "what's included" content and options
    │   ├── businessInfo.js        name, phone, email, address, coordinates, established year
    │   ├── businessHours.js       opening hours, slot interval, booking window
    │   └── bookingContent.js      vehicle/payment options and booking-step copy
    ├── utils/
    │   ├── api.js                 fetch wrapper + ApiError
    │   ├── auth.js                 customer + staff sessions, demo account stores, useCustomerSession/useStaffSession
    │   ├── storage.js              guarded localStorage/sessionStorage helpers + change events
    │   ├── validation.js           name / email / password rules
    │   ├── redirect.js             safeRedirect / loginUrlFor (post-login redirect allow-list)
    │   ├── bookingsStore.js        bookings model: list / create / status changes
    │   ├── bookingStatus.js        status labels and allowed transitions
    │   ├── bookingDraft.js         per-account booking draft
    │   ├── notificationsStore.js   in-app customer notifications (local demo; server-owned in API mode)
    │   ├── staffStore.js           staff-account management (admin panel)
    │   ├── availability.js         demo slot availability
    │   ├── pricing.js              price formatting and totals
    │   ├── dates.js                YYYY-MM-DD helpers (Asia/Manila)
    │   ├── useShopNow.js           "is the shop open now" hook
    │   └── usePageTitle.js         document title hook
    ├── components/
    │   ├── Header.js               shared site header (Home/Book/Account)
    │   ├── Footer.js               shared site footer
    │   ├── AuthFooter.js           footer variant for login/signup/staff-login
    │   ├── AuthVisual.js           split-screen photo panel on Login/Signup
    │   ├── ConfirmDialog.js        accessible confirm modal (used for Log Out)
    │   ├── PasswordField.js        password input + Show/Hide toggle
    │   ├── ServiceModal.js         the homepage "What's Included" popup
    │   ├── ProgressTrack.js        the 4-step booking progress bar
    │   ├── ChoiceCard.js           selectable card used in the booking flow
    │   ├── ScrollManager.js        scroll-to-top / hash scrolling on route change
    │   ├── RequireCustomerAuth.js  customer route guard
    │   ├── RequireStaffAuth.js     staff route guard
    │   └── RedirectIfAuthenticated.js  sends signed-in customers away from Login/Signup
    └── pages/
        ├── Home.js        (was index.html)
        ├── Login.js       (was login.html)
        ├── Signup.js      (was signup.html + signup-otp.js)
        ├── ForgotPassword.js  password recovery flow (demo; real recovery is backend-required)
        ├── Book.js        (was book.html + booking.js)
        ├── StaffLogin.js  one-time demo "create first admin" setup (staff now sign in on /login)
        ├── Dashboard.js   (was dashboard.html + dashboard.js)
        ├── Account.js     (was account.html + account.js)
        └── NotFound.js    404 page
```

## How the old pages map to routes

| Old file | New route |
|---|---|
| `index.html` | `/` |
| `login.html` | `/login` — the ONE login for customers, staff and admins (accepts `?redirect=` for customers) |
| — | `/forgot-password` — password recovery flow (demo, see below) |
| `signup.html` | `/signup` |
| `book.html` | `/book` (still requires being "logged in" — see below) |
| `staff-login.html` | `/staff-login` — no longer a login page. Only the one-time demo "create first admin" setup; once a staff account exists it forwards to `/login`. Not linked in the nav |
| `dashboard.html` | `/dashboard` |
| `account.html` | `/account` (requires being "logged in") |

Internal links use React Router's `<Link>` everywhere the old site used
`<a href="...html">`.

## How the vanilla JS became React

- **DOM queries / `classList` toggling** → `useState` + conditional
  `className` strings. Every `.selected`, `.show`, `.active`, `.done` class
  from the original CSS is still applied — just driven by state instead of
  `classList.add/remove`.
- **`customer-guard.js`** (redirect to login if not "logged in") →
  `RequireCustomerAuth`, a wrapper component used around `Book` and
  `Account`, using `useNavigate`/`useLocation` instead of
  `window.location.href`.
- **`localStorage` "auth"** — still exactly localStorage, just centralized
  in `src/utils/auth.js` instead of being read/written ad hoc in three
  different files. This is still a demo, not real auth — see the note
  below.
- **The booking wizard (`booking.js`)** → all of `booking`'s mutable state
  (`vehicle`, `services`, `date`, `slot`, `payment`) is now `useState` in
  `Book.js`; the step screens are conditionally rendered instead of
  `hidden` attribute toggling.
- **jsPDF** — same PDF layout/content as the original, generated the same
  way, just imported as a module instead of coming off a CDN `<script>`.
- **OTP flow (`signup-otp.js`)** — same fake-it-locally demo behavior,
  reimplemented as component state (`screen`, `demoOtp`, etc.) instead of
  global functions wired to DOM elements by ID.

## A note on `.js` instead of `.jsx`

Per the project requirement, every React component here is a `.js` file
containing JSX, not `.jsx`. Vite's default esbuild transform only parses
JSX syntax out of `.jsx`/`.tsx` files, so `vite.config.js` explicitly tells
esbuild to treat `.js` files under `src/` as JSX (both for the dev
optimizer and the main build). This is the standard workaround for this
setup — nothing else about the build is unusual.

## Backend / auth: not built yet

There is **no backend**. Everything runs in local demo mode (browser
storage), structured so a real API can replace it.

Every endpoint lives in **`src/config/api.js`** (`LOGIN`, `OTP_SEND`,
`OTP_VERIFY`, `CHANGE_PASSWORD`, `PASSWORD_RESET_REQUEST`,
`PASSWORD_RESET_CONFIRM`, `BOOKINGS`, `NOTIFICATIONS`, `STAFF_ACCOUNTS`,
`AVAILABILITY`). All values are `null`, which means local mode. Set one to a URL
and that feature calls the server instead; the expected request/response shape is
documented next to each entry. Whatever a client checks (roles, ownership,
booking status rules) must also be enforced by the server on every request,
since client-side checks are not real security.

**One login for every role.** `/login` posts to `API.LOGIN`; the *server* answers
with `role: 'customer' | 'staff' | 'admin'`. The app only uses that role to pick
the session type and the destination (customer: their `?redirect=` target or
Home; staff/admin: `/dashboard`). There is no role picker.

**BACKEND REQUIRED (nothing below is real until a server does it):**

| Feature | What the server must do |
|---|---|
| Login / roles | Verify credentials, issue a token, return the role, enforce the role on every request |
| Signup OTP | Send and verify the emailed code, create the account |
| Change password | `API.CHANGE_PASSWORD`: verify the current password, store a new hash, end other sessions. Locally it only edits this browser's demo login |
| Forgot password | `API.PASSWORD_RESET_REQUEST` / `API.PASSWORD_RESET_CONFIRM`: email a single-use expiring code/link (same reply whether or not the account exists), rate-limit, verify, set the password, end sessions. Locally the code is shown on screen and no email is sent |
| Notifications | `API.NOTIFICATIONS`: create a notification when a booking becomes Ready for Pickup / Completed and deliver email/SMS/push. Locally it is an in-app note on this browser only |
| Staff accounts | Provision staff/admin server-side |

## Before launch

- The owner must confirm the **phone, email, address, coordinates and
  established year** in `src/data/businessInfo.js`. They were carried over from
  earlier content and have not been verified.
- Remove the **first-admin bootstrap** (the `/staff-login` setup screen,
  `createFirstAdminLocal` in `src/utils/auth.js`) once a backend exists. It is
  disabled when `API.LOGIN` is set, but should not ship. Real staff must be
  provisioned server-side.
- Remove the demo **forgot-password code** that is shown on screen
  (`ForgotPassword.js`) and rely on the server's emailed reset.

## Assets

Real photos now live in `src/assets/` and are imported directly into the
components that use them — no more `placehold.co` placeholders:

| File | Used in |
|---|---|
| `assets/lsc.jpg` | `Home.js` — hero workshop photo |
| `assets/maintenance.jpg` | `Home.js` — Auto Care service card |
| `assets/core-fix.jpg` | `Home.js` — Core Fix service card |
| `assets/vehicle-mod.jpg` | `Home.js` — Vehicle Mod service card |
| `assets/body-work.jpg` | `Home.js` — Body Work service card |
| `assets/tire-hero.jpg` | `components/AuthVisual.js` — left panel on Login/Signup |

Fonts are still pulled from Google Fonts via the `@import` at the top of
`style.css`, unchanged.

## Login / Signup layout

`Login.js` and `Signup.js` were restructured to match the new split-screen
design: a slim top bar with just the brand mark, then a two-column layout
— a full-bleed tire photo with an overlay tagline on the left
(`components/AuthVisual.js`, shared between both pages so the copy only
lives in one place), and the existing form panel (unchanged markup/logic,
still using `.auth-card` / `.auth-panel` / `.field`) on the right. The new
layout classes (`.auth-topbar`, `.auth-split`, `.auth-visual`,
`.auth-form-col`, etc.) were added to `style.css` alongside the originals
rather than replacing anything, so nothing else that reused the old
`.auth-*` classes (e.g. `StaffLogin.js`, which keeps its original centered
layout since no redesign was requested for it) was affected. All form
state, validation, and the OTP flow are untouched — only the JSX wrapper
around them changed.

## Local demo behavior (after the 38-issue audit fixes)

There is still **no backend**. Everything below is browser-local demo behavior,
structured so a real API can replace it. All endpoints live in
`src/config/api.js` (every value is `null` = local mode).

- **Customer auth** (`utils/auth.js`): accounts are stored per browser
  (salted SHA-256 hashed, *not* real security). Login validates them; signup
  creates the account after the OTP step and signs the user in. Identity is
  per account; logout clears the session and that account's booking draft.
  Auth state syncs across tabs. Redirects after login only allow `/book`,
  `/account` (and `/book?service=<known key>`).
- **Staff auth**: staff and admins sign in on the same `/login` page. The role
  comes from the authenticated account (no role picker) and decides the
  destination: `/dashboard` for staff/admin. `/dashboard` requires a staff
  session. One email belongs to one role (a customer email can't also be a
  staff email), and a browser holds one session at a time. With no staff
  accounts on the browser, `/staff-login` offers a one-time demo "create first
  admin" step, disabled once `API.LOGIN` is set.
- **Logout**: Log Out asks for confirmation, then clears the session (and that
  account's booking draft) and returns to `/login`.
- **Account page**: shows the signed-in customer's name, Change Password
  (demo-only, see the backend table) and Notifications.
- **Service arrows** (Home cards and the "Book This Service" modal button) go to
  `/book?service=<key>`. Signed-out users are sent to Login first, then land on
  the "Pick your vehicle" step with that service already selected.
- **Bookings** (`utils/bookingsStore.js`): one data model/storage shared by
  Book, My Bookings and the Dashboard. Status rules are in
  `utils/bookingStatus.js` (Completed/Cancelled are final).
- **Availability** (`utils/availability.js`): local demo data (sample "full"
  days), not real shop capacity. Opening hours, slot interval and booking
  window come only from `data/businessHours.js`. Dates are `YYYY-MM-DD` strings in
  Asia/Manila time.
- **Business facts** (`data/businessInfo.js`): phone, email, address and
  coordinates were carried over from the existing content and need owner
  confirmation.
- Run with `npm install`, then `npm run dev` / `npm run build` / `npm run preview`.
