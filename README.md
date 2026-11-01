# Arcade Customer Accounts

A staff system for managing arcade customer records, contacts, fees, and payments. Payments record a date and method (cash, bank transfer, or card), and can be allocated to customer fees.

## Project structure

- `clientside/` — React and Vite interface
- `serverside/` — Express API and PostgreSQL access
- `serverside/arcade_customer_management.sql` — customer, contact, fee, payment, and allocation schema

## Run locally

Start the API:

```bash
cd serverside
npm install
npm start
```

Start the web app in another terminal:

```bash
cd clientside
npm install
npm run dev
```

The API defaults to port `3002`; Vite proxies `/api` to that port. Set `VITE_API_URL` in `clientside/.env` when using a different API URL.

For Vercel, add `VITE_API_URL` to the **frontend project's** Environment Variables using the full deployed API origin, including the protocol (for example, `https://your-api-project.vercel.app`). Do not include `/auth/login` or another endpoint path. Redeploy the frontend after changing the variable. Set `FRONTEND_URL` in the API project's Environment Variables to the exact frontend origin (for example, `https://your-frontend-project.vercel.app`) so credentialed API requests pass CORS validation.

## Configuration

Configure the PostgreSQL connection and JWT secrets in `serverside/app/config/db.config.js`. Set `PORT` and `FRONTEND_URL` in `serverside/.env` as needed. The database schema in `serverside/arcade_customer_management.sql` must be applied to PostgreSQL before using customer management.

The customer management page is available at `/arcade/customers` and requires an administrator account. Customer API endpoints are also restricted to authenticated administrators.

## Customer API

- `GET /arcade/customers` and `GET /arcade/customers/:id`
- `POST /arcade/customers`, `PUT /arcade/customers/:id`, and `DELETE /arcade/customers/:id`
- `POST /arcade/customers/:customerId/contacts`
- `POST /arcade/fees`, `PUT /arcade/fees/:id`, and `DELETE /arcade/fees/:id`
- `POST /arcade/payments` — accepts `cash`, `bank_transfer`, or `card`, a payment date, and optional fee allocations
- `PUT /arcade/payments/:id` and `DELETE /arcade/payments/:id`
- `GET /arcade/payments/report`
- `GET /arcade/dashboard/stats?year=YYYY` — yearly totals and monthly fee/payment totals
