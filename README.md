# LS Customs

Auto shop website — Pasay City, PH. Course project.

Dark theme, yellow/red accents, "Laging Sira? We Can Fix It!" — Los Santos Customs inspired.

## What's built right now

### Pages
| File | What it is |
|---|---|
| `index.html` | Landing page — hero, service menu (Auto Care, Core Fix, Vehicle Mod, Body Work), weekly hours, how-to-book steps, trust badges, contact info |
| `login.html` | Login form (email + password) |
| `signup.html` | Registration form (name, email, password, confirm password) |
| `book.html` | 4-step booking flow — this is the main interactive piece |

### Shared files
| File | What it is |
|---|---|
| `style.css` | All styling for every page. One shared stylesheet, no page has its own styles. |
| `script.js` | Runs on every page — mobile nav toggle, password show/hide buttons, basic signup validation |
| `booking.js` | Only runs on `book.html` — the booking flow logic |

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

Everything above runs entirely in the browser. There's no database and no server yet — closing the tab loses the booking.

## What's NOT done yet (this is where the group comes in)

- **Backend / database** — bookings aren't saved anywhere real. See `BACKEND.md` for exactly where to plug this in.
- **Real photos and icons** — current images are placeholders (clearly labeled, e.g. "AUTO CARE"). Trust-badge icons are real SVGs but generic; swap for final assets before submission.
- **Auth** — login/signup forms validate input shape but don't check against real accounts yet.
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
└── README.md          this file
```
