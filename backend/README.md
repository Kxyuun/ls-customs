# LS Customs API

Node.js + Express + Mongoose backend for the LS Customs frontend.

## 1. Setup
```bash
npm install
```
Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `JWT_SECRET`
(`.env` is git-ignored, never commit it).

## 2. Create the first admin
```bash
npm run seed
```
Default login: `admin@lscustoms.com` / `Admin12345` (change it in `.env` before seeding, or add a new admin later from the admin panel).

## 3. Run
```bash
npm run dev
```
You should see `API running on port 4000`. Check http://localhost:4000/api/health

## 4. Connect the frontend
In the frontend's `src/config/api.js`, switch features on one at a time:
```js
export var API = {
  LOGIN: 'http://localhost:4000/api/login',
  OTP_SEND: 'http://localhost:4000/api/otp/send',
  OTP_VERIFY: 'http://localhost:4000/api/otp/verify',
  CHANGE_PASSWORD: 'http://localhost:4000/api/password/change',
  PASSWORD_RESET_REQUEST: 'http://localhost:4000/api/password/reset-request',
  PASSWORD_RESET_CONFIRM: 'http://localhost:4000/api/password/reset-confirm',
  CHANGE_EMAIL_REQUEST: 'http://localhost:4000/api/email/change-request',
  CHANGE_EMAIL_CONFIRM: 'http://localhost:4000/api/email/change-confirm',
  BOOKINGS: 'http://localhost:4000/api/bookings',
  NOTIFICATIONS: 'http://localhost:4000/api/notifications',
  STAFF_ACCOUNTS: 'http://localhost:4000/api/staff',
  AVAILABILITY: 'http://localhost:4000/api/availability'
};
```

## Email (OTP codes, status updates, change email)
Emails are sent through Gmail SMTP. Fill in `SMTP_*` in `.env` (see `.env.example`;
Gmail needs an App Password). Without them, sending a code fails with an error
(set `MAIL_CONSOLE=true` only for offline dev to print emails in the terminal). On start the API prints `Email: SMTP connected` or the
reason the login failed.

Emails sent: signup code, password-reset code, change-email code (to the NEW
address), "your email was changed" (to the OLD address), and a detailed booking
email on every status change (In Progress, Ready, Completed, Cancelled).

## Quick test with curl
```bash
curl -X POST http://localhost:4000/api/login -H "Content-Type: application/json" \
  -d '{"email":"admin@lscustoms.com","password":"Admin12345"}'
```

## Notes
- Slot capacity is `SLOT_CAPACITY` in `.env` (default 1 booking per time slot).
- Shop hours live in `utils/schedule.js` and mirror the frontend's `businessHours.js`.
- Passwords use `bcryptjs` (same bcrypt algorithm, no native build step).
- The server computes booking totals itself (`utils/pricing.js`). Car Wash is priced per vehicle type; keep that table in sync with the frontend's `serviceData.js`.

## Known limitations
- Slot availability is checked before a booking is saved but not locked, so two requests arriving at the same moment for the last free slot could both succeed.
- Payments (GCash, Maya, Cash) are only recorded, not processed.
- Notifications go out by email and in the app only (no SMS).
- Service names and prices are defined in code (`utils/pricing.js` and the frontend `serviceData.js`) and are not editable from the dashboard.
