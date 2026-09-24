# Backend integration — booking flow

The booking flow on `book.html` currently works fully client-side (in the browser, no server). This doc is for whoever's building the backend to plug real persistence in.

## Where to look

Open `booking.js`. Near the top:

```js
var BOOKING_API_URL = null;
```

That's the only switch you need to flip. While it's `null`, the site fakes a booking reference locally so the front end keeps working on its own. Once you set it to a real URL, it starts actually calling your API.

## What you need to build

One endpoint:

```
POST <your BOOKING_API_URL>
```

**Request body it will send (JSON):**
```json
{
  "vehicle": "Sedan",
  "services": [
    { "name": "Auto Care", "price": 3500 },
    { "name": "Core Fix", "price": 4000 }
  ],
  "date": "2026-09-20",
  "timeSlot": "10:00 AM",
  "payment": "GCash",
  "totalEstimate": 7500
}
```

**Response it expects back (JSON, 200 OK):**
```json
{ "referenceCode": "LSC-284917" }
```

If your server returns a non-2xx status, or the request fails to reach the server at all, the front end already shows an error message on the confirm screen ("Could not reach the server. Try again.") and re-enables the Confirm button — you don't need to build that part.

## Steps to hook it up

1. Build the endpoint above (any stack — Node/Express, PHP, whatever the group is using).
2. Make sure it accepts `Content-Type: application/json` and allows CORS from wherever the site is hosted (needed if frontend and backend run on different ports/domains during dev).
3. In `booking.js`, change:
   ```js
   var BOOKING_API_URL = null;
   ```
   to:
   ```js
   var BOOKING_API_URL = 'http://localhost:PORT/api/bookings';
   ```
   (or whatever the real URL ends up being)
4. Test by going through the booking flow on `book.html` and confirming — check your server logs / database to see the booking land.

## Optional next steps once this works

- Persist bookings to a real database (this doc doesn't assume one — pick whatever the group already knows)
- Add a `GET /api/bookings/:code` endpoint if you want a "Track My Car" page to actually look something up
- Hook `login.html` / `signup.html` up to real auth once this pattern is proven — same idea, different endpoint

## Email OTP for signup

`signup.html` now has a two-step flow: fill the form, then enter a 6-digit code sent to that email before the account actually gets created. Right now it's fully faked in `signup-otp.js` — it generates a random code client-side and just tells you what it is on screen (clearly labeled "Demo mode"), since there's no email backend yet.

Two switches at the top of `signup-otp.js`, same pattern as `BOOKING_API_URL`:

```js
var OTP_SEND_API_URL = null;
var OTP_VERIFY_API_URL = null;
```

**`OTP_SEND_API_URL`** — `POST` with `{ "email": "..." }`. Your backend generates a code, emails it (any provider works — Nodemailer, SendGrid, etc.), and stores it somewhere temporary (a DB row with an expiry, or an in-memory cache) so it can be checked in the next step.

**`OTP_VERIFY_API_URL`** — `POST` with `{ "email": "...", "code": "123456" }`. Checks the code against what you stored, and if it matches, creates the actual user account and returns success. If it doesn't match, respond with a non-2xx status — the frontend already shows "That code doesn't match" automatically.

Once both URLs are set, the demo hint showing the code on-screen disappears on its own (that line only runs when `OTP_SEND_API_URL` is `null`).

## Advance booking limit

`booking.js` currently caps how far ahead someone can book at 30 days:

```js
var maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 30);
dateInput.max = maxDate.toISOString().split('T')[0];
```

Change the `30` if the group wants a different window. There's also a small demo-only `fullyBookedDates` array a few lines below it that fakes a few "shop's fully booked that day" dates — swap that for a real check against actual booking counts once the database exists.
