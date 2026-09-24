# LS Customs

Auto shop website — Pasay City, PH. Course project.

Dark theme, yellow/red accents, "Laging Sira? We Can Fix It!" — Los Santos Customs inspired.

## Staff/Admin access

`staff-login.html` is not linked anywhere on the public site — open it directly by filename (`staff-login.html` in your project folder, or `yoursite.com/staff-login.html` once hosted). Any email/password works right now since there's no real backend yet. It logs you into `dashboard.html`, where a "Viewing as: Staff / Admin" dropdown up top lets you preview both roles.

## What's built right now

### Pages
| File | What it is |
|---|---|
| `index.html` | Landing page — hero, service menu (Auto Care, Core Fix, Vehicle Mod, Body Work), weekly hours, how-to-book steps, trust badges, contact info |
| `login.html` | Login form (email + password) |
| `signup.html` | Registration form (name, email, password, confirm password) |
| `book.html` | 4-step booking flow — this is the main interactive piece |
| `staff-login.html` | Login for staff/admin accounts — not linked anywhere in the public nav, direct URL only |
| `dashboard.html` | Staff/admin dashboard — every booking, status updates, admin-only staff account management |

### Shared files
| File | What it is |
|---|---|
| `style.css` | All styling for every page. One shared stylesheet, no page has its own styles. |
| `script.js` | Runs on every page — mobile nav toggle, password show/hide buttons, basic signup validation |
| `booking.js` | Only runs on `book.html` — the booking flow logic |
| `staff-login.js` | Runs on `staff-login.html` — handles the login form |
| `dashboard.js` | Runs on `dashboard.html` — mock bookings, status changes, role toggle, staff account management |

## What actually works (no backend needed)

- Full site navigation (Home / Services / Schedule / About, all scroll to the right section)
- Mobile hamburger menu below ~960px width
- Login and signup pages link to each other
- Password fields have a working Show/Hide toggle
- Signup form checks that both password fields match before "submitting"
- **Booking flow (`book.html`)** — the real functionality:
  1. Pick a vehicle type (Sedan / SUV / Motorcycle)
  2. Pick one or more services — running total updates live
  3. Pick a date and time slot — **this has actual logic**: pick a Sunday and it tells you we're closed, pick a Saturday and slots only go to 5 PM, weekdays go to 9 PM
  4. Review a summary, pick a payment method, confirm
  5. Get a booking reference number and a confirmation screen
- **Staff/admin dashboard (`dashboard.html`)** — go there via `staff-login.html` (not linked publicly, direct URL only). Shows every booking with a status dropdown you can actually change (Pending / In Progress / Ready for Pickup / Completed). There's a "Viewing as: Staff / Admin" dropdown in the top bar for demo purposes only — switching it to Admin reveals a staff account management panel (add/remove staff, assign roles). Once real auth exists, that dropdown goes away and the role comes from the login token instead.
- **PDF export** — after confirming a booking, there's a "Download PDF" button that generates a real PDF of the confirmation (via jsPDF, loaded from a CDN, no backend needed)
- **Consultation option** — a 5th "service" in the booking flow for anyone who doesn't know what they need; goes through the same flow as a normal service, just marked "Free / To be discussed"
- **Service info modal** — each service card on the homepage has a "What's Included" button that pops up a checklist of what's actually covered
- **Email OTP signup** — signup now has a 2-step flow (fill form → enter 6-digit code) before the account is created. Fully faked right now (see `BACKEND.md` for what the real version needs)
- **Field validation** — password fields require 8-64 characters with at least one letter and one number, enforced with a real error message, not just the browser's default popup
- **Advance booking limit** — booking flow only lets you pick a date up to 30 days out
- **Blocked-date demo** — a few fake "fully booked" dates are hardcoded in `booking.js` to demonstrate the UI; real version needs this driven by actual booking counts once there's a database

Everything above runs entirely in the browser. There's no database and no server yet — closing the tab loses the booking.

## What's NOT done yet (this is where the group comes in)

- **Backend / database** — bookings aren't saved anywhere real. See `BACKEND.md` for exactly where to plug this in.
- **Real photos and icons** — current images are placeholders (clearly labeled, e.g. "AUTO CARE"). Trust-badge icons are real SVGs but generic; swap for final assets before submission.
- **Auth** — login/signup forms validate input shape but don't check against real accounts yet. Three roles are planned: customer, staff, admin. See `AUTH.md` for the full breakdown and what each role can/can't do.
- **Dead-end buttons** — none left after the booking flow was added, but double check as more pages get built.

## How to run it

No build step, no install. Just open `index.html` in a browser. All pages link to each other with relative paths, so keep every file in the same folder.

## File map

```
ls-customs/
├── index.html      landing page
├── login.html
├── signup.html
├── book.html        booking flow
├── style.css         shared styles
├── script.js         shared JS (nav, password toggle, signup check)
├── booking.js        booking flow logic
├── BACKEND.md         instructions for whoever builds the backend
├── AUTH.md            login/roles plan (customer, staff, admin)
└── README.md          this file
```
