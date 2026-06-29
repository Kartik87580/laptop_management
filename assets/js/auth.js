/**
 * auth.js – Authentication layer for LRMS
 *
 * Uses the Neon HTTP SQL API (via db.js's query pattern) to
 * store and look up users. Passwords are hashed with SHA-256
 * (Web Crypto API) before being sent to the database.
 *
 * Session is stored in localStorage as a JSON object:
 *   { id, username, email }
 */

import { NEON_CONNECTION_STRING } from './config.js';

const SESSION_KEY = 'lrms_user';

/* ─────────────────────────────────────────────────────────
   Internal Neon query helper (mirrors db.js but local)
   ───────────────────────────────────────────────────────── */

async function query(sql, params = []) {
  let host;
  try {
    const url = new URL(
      NEON_CONNECTION_STRING
        .replace('postgresql://', 'https://')
        .replace('postgres://', 'https://')
    );
    host = url.hostname;
  } catch {
    throw new Error('Invalid NEON_CONNECTION_STRING in config.js');
  }

  const apiHost = host.replace(/^[^.]+/, 'api');
  const endpoint = `https://${apiHost}/sql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONNECTION_STRING,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      msg = err.message || err.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return response.json();
}

/* ─────────────────────────────────────────────────────────
   SHA-256 helper
   ───────────────────────────────────────────────────────── */

/**
 * Hash a plain-text string with SHA-256.
 * @param {string} text
 * @returns {Promise<string>} Hex digest
 */
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ─────────────────────────────────────────────────────────
   Session helpers
   ───────────────────────────────────────────────────────── */

/** Return the current logged-in user object or null. */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist a user session. */
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
  }));
}

/** Destroy the current session and redirect to login. */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

/**
 * Guard a page: if no session exists, redirect to login.html.
 * Call this at the top of every protected page's script.
 */
export function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

/* ─────────────────────────────────────────────────────────
   Auth operations
   ───────────────────────────────────────────────────────── */

/**
 * Register a new user.
 * @param {string} username
 * @param {string} email
 * @param {string} password  – plain text; hashed before storage
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signup(username, email, password) {
  if (!username || !email || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Simple email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Enter a valid email address.' };
  }

  const hash = await sha256(password);

  try {
    const result = await query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username.trim(), email.trim().toLowerCase(), hash]
    );

    const user = result.rows[0];
    setSession(user);
    return { success: true, user };
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      if (err.message.includes('username')) {
        return { success: false, error: 'Username is already taken.' };
      }
      return { success: false, error: 'Email is already registered.' };
    }
    return { success: false, error: 'Signup failed. Please try again.' };
  }
}

/**
 * Log in an existing user by email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function login(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const hash = await sha256(password);

  try {
    const result = await query(
      `SELECT id, username, email FROM users
       WHERE email = $1 AND password_hash = $2
       LIMIT 1`,
      [email.trim().toLowerCase(), hash]
    );

    if (!result.rows.length) {
      return { success: false, error: 'Incorrect email or password.' };
    }

    const user = result.rows[0];
    setSession(user);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}
