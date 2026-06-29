# LRMS – Laptop Repair Management System

## Project Overview

LRMS is a lightweight, browser-based Laptop Repair Shop Management System.
It replaces a paper register with a clean, responsive web application backed by
Neon PostgreSQL (serverless). No Node.js / Python backend required — all database
communication happens through the [Neon HTTP API](https://neon.tech/docs/serverless/serverless-driver).

---

## Features

- **Dashboard** – Summary cards (Total / Pending / Repairing / Ready / Delivered) + Recent repairs table
- **All Repairs** – Full list with search (Job ID, Name, Phone, Brand, Model, Serial) and status filter
- **Add Repair** – Clean form with auto-generated Job ID, accessories checkboxes, validation
- **Edit Repair** – Pre-populated form; update any field
- **Repair Details** – Full record view with status timeline and printable job sheet
- **Delete** – Confirmation modal before permanent deletion
- **Print Job Sheet** – Printer-friendly receipt via browser print

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JS (ES6)     |
| Styling   | Bootstrap 5.3 + Bootstrap Icons   |
| Database  | Neon PostgreSQL (serverless HTTP) |
| Hosting   | Vercel (static)                   |
| Version Control | Git + GitHub               |

---

## Folder Structure

```
LRMS/
├── index.html            # Dashboard
├── repairs.html          # All Repairs list
├── add-repair.html       # Add new repair
├── edit-repair.html      # Edit repair
├── repair-details.html   # View repair details + print
├── schema.sql            # Database schema + seed data
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css     # Custom stylesheet
    └── js/
        ├── config.js     # ⚠️ Neon credentials (gitignored)
        ├── db.js         # Database layer (Neon HTTP API)
        ├── ui.js         # Shared UI utilities
        └── app.js        # App bootstrap
```

---

## Installation (Local Development)

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/LRMS.git
   cd LRMS
   ```

2. **Configure credentials**  
   Edit `assets/js/config.js` (already gitignored):
   ```js
   export const NEON_CONNECTION_STRING =
     'postgresql://user:password@ep-yourproject.us-east-2.aws.neon.tech/dbname?sslmode=require';
   export const SHOP_NAME    = 'My Laptop Repair Shop';
   export const SHOP_PHONE   = '+91 98765 43210';
   export const SHOP_ADDRESS = '123, Main Street, City – 600001';
   ```

3. **Serve locally** (required for ES modules)
   ```bash
   # Using Python
   python -m http.server 3000

   # Or install live-server globally
   npx live-server --port=3000
   ```

4. Open `http://localhost:3000` in your browser.

> **Note:** Opening `index.html` directly via `file://` will fail due to ES module CORS restrictions. Always use a local server.

---

## Neon Database Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new **Project**
3. Open the **SQL Editor** and run `schema.sql`
4. Go to **Connection Details** → copy the full **connection string**
   (looks like `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/dbname?sslmode=require`)
5. Paste it as `NEON_CONNECTION_STRING` in `assets/js/config.js`

### Table: `repairs`

| Column           | Type                | Notes                         |
|-----------------|---------------------|-------------------------------|
| id              | SERIAL PRIMARY KEY  | Auto-increment                |
| job_id          | VARCHAR(20) UNIQUE  | e.g. JOB-0001                |
| customer_name   | VARCHAR(100)        | Required                      |
| phone           | VARCHAR(15)         | Required                      |
| alternate_phone | VARCHAR(15)         | Optional                      |
| brand           | VARCHAR(50)         | Required                      |
| model           | VARCHAR(100)        | Required                      |
| serial_number   | VARCHAR(100)        | Optional                      |
| service_tag     | VARCHAR(100)        | Optional                      |
| problem         | TEXT                | Required                      |
| accessories     | TEXT                | Comma-separated               |
| technician      | VARCHAR(100)        | Optional                      |
| estimated_amount| NUMERIC(10,2)       | Default 0                     |
| repair_notes    | TEXT                | Optional                      |
| status          | VARCHAR(30)         | Default 'Received'            |
| received_date   | DATE                | Required                      |
| received_time   | TIME                | Optional                      |
| delivery_date   | DATE                | Optional                      |
| delivery_time   | TIME                | Optional                      |
| created_at      | TIMESTAMP WITH TZ   | Auto-set                      |

---

## Deployment on Vercel

### Steps

1. Push your code to GitHub (ensure `config.js` is in `.gitignore`)
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Framework Preset: **Other** (static site, no build step)
4. Root Directory: `./`
5. Click **Deploy**

### Environment Variables

Since this is a pure frontend app, credentials in `config.js` will be visible in the browser.
For personal use this is acceptable. For production, use a Vercel Edge Function to proxy Neon calls.

| Variable                  | Value                                                        |
|---------------------------|--------------------------------------------------------------|
| `NEON_CONNECTION_STRING`  | `postgresql://user:pass@ep-xyz.aws.neon.tech/db?sslmode=require` |

> For a pure-static deploy, these variables must be hardcoded in `config.js` before pushing,
> or use a Vercel serverless function to inject them at runtime.

### Deployment Checklist

- [ ] `schema.sql` executed on Neon
- [ ] `config.js` filled with correct credentials
- [ ] Tested locally with a dev server
- [ ] `config.js` is in `.gitignore` (do NOT push real credentials)
- [ ] Vercel project created and repo connected
- [ ] All pages load without console errors
- [ ] CRUD operations verified end-to-end
- [ ] Print function tested in browser

---

## Screenshots

> _(Add screenshots here after deployment)_

---

## Future Improvements

- [ ] Serverless function proxy to protect Neon API key
- [ ] SMS / WhatsApp notification when repair is ready
- [ ] Invoice PDF generation
- [ ] Customer portal (read-only status lookup by Job ID)
- [ ] Analytics dashboard (monthly revenue, average turnaround time)
- [ ] Multi-technician management
- [ ] Barcode / QR sticker printing for laptops
