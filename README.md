# LS Customs

Auto shop booking website for LS Customs, Pasay City. A full-stack MERN course project (BSIT).

- Customers sign up with an emailed one-time code (OTP), book a service, download a PDF confirmation, and track their bookings.
- Staff and admins log in through the same page and manage bookings. Admins also manage staff accounts.

## Folders

```
ls-customs/
├── frontend/   React + Vite app (the website)
├── backend/    Node + Express + MongoDB API
└── README.md   this file
```

Each folder has its own README with more detail.

## How to run it

You need two terminals, one for each folder. Start the backend first.

**1. Backend** (runs on http://localhost:4000)

```
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your own values (MongoDB connection string, JWT secret, Gmail App Password). The `.env` file is ignored by git, never commit it.

```
npm run seed
npm run dev
```

`npm run seed` creates the first admin account. It only needs to run once.

**2. Frontend** (runs on http://localhost:5173)

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Before you present or deploy

- Change the default admin email and password in `backend/.env` before running `npm run seed`.
- Make sure no `.env` file was ever committed.
