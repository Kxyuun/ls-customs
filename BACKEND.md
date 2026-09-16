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
