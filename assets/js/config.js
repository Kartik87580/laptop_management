/**
 * config.js – LRMS Application Configuration
 *
 * ⚠️  THIS FILE IS LISTED IN .gitignore
 *     NEVER commit real credentials to version control.
 *
 * ─── HOW TO GET YOUR NEON CONNECTION STRING ───────────────
 * 1. Go to https://console.neon.tech
 * 2. Open your project → Connection Details
 * 3. Select Role, Database, and Branch
 * 4. Copy the full connection string. It looks like:
 *       postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/dbname?sslmode=require
 * 5. Paste it below as NEON_CONNECTION_STRING
 *
 * ─── NEON HTTP SQL API ─────────────────────────────────────
 * LRMS communicates with Neon via its HTTP SQL API:
 *   POST https://<host>/sql
 *   Authorization: Bearer <connection-string>
 *   Body: { "query": "...", "params": [...] }
 *
 * The host is extracted automatically from NEON_CONNECTION_STRING.
 * No npm packages or backend required.
 *
 * ─── VERCEL DEPLOYMENT ─────────────────────────────────────
 * For personal-use deployment on Vercel, the connection string is
 * bundled in this file. For public apps, use a Vercel Edge Function
 * to proxy database calls server-side.
 */

// ← Replace this with your actual Neon connection string
export const NEON_CONNECTION_STRING =
  'postgresql://neondb_owner:npg_1hBCVGRJ4mPj@ep-orange-smoke-ao3idb7v-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// ─── Shop Details (shown on printed job sheets) ──────────────
export const SHOP_NAME = 'My Laptop Repair Shop';
export const SHOP_PHONE = '+91 98765 43210';
export const SHOP_ADDRESS = '123, Main Street, Your City – 600001';
