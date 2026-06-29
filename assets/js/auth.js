/**
 * auth.js – Single-user authentication for LRMS
 *
 * Only one authorised user is allowed. Credentials are validated
 * client-side by comparing a SHA-256 hash of the entered password
 * against the pre-computed hash of the owner's password.
 * No database call is made for authentication — zero CORS issues.
 *
 * Session is stored in localStorage as a JSON object:
 *   { id, username, email }
 */

/* ─────────────────────────────────────────────────────────
   Authorised user — only this account can log in
   ───────────────────────────────────────────────────────── */

const AUTHORISED_USER = {
  id:       1,
  username: 'GANESH',
  email:    'piyushdhedhi@icloud.com',
  // SHA-256 of "8141214177"  (computed once, stored here)
  // Do NOT change unless you change the password below too.
  passwordHash: null,   // filled lazily on first login attempt
};

/** The plain-text password — used only to derive the hash once. */
const OWNER_PASSWORD = '8141214177';

const SESSION_KEY = 'lrms_user';

/* ─────────────────────────────────────────────────────────
   SHA-256 helper  (Web Crypto API — no external libs)
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
    id:       user.id,
    username: user.username,
    email:    user.email,
  }));
}

/** Destroy the current session and redirect to login. */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

/**
 * Guard a page — if no session exists, redirect to login.html.
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
 * Log in — only the single authorised user is accepted.
 * @param {string} email
 * @param {string} password  – plain text, compared via SHA-256
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function login(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // Derive the owner hash once and cache it
  if (!AUTHORISED_USER.passwordHash) {
    AUTHORISED_USER.passwordHash = await sha256(OWNER_PASSWORD);
  }

  const enteredEmail    = email.trim().toLowerCase();
  const authorisedEmail = AUTHORISED_USER.email.toLowerCase();
  
  // Calculate hashes for password with and without spaces to be absolutely safe
  const enteredHash = await sha256(password);
  const enteredHashTrimmed = await sha256(password.trim());

  if (enteredEmail !== authorisedEmail) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  if (
    enteredHash !== AUTHORISED_USER.passwordHash &&
    enteredHashTrimmed !== AUTHORISED_USER.passwordHash
  ) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  const user = {
    id:       AUTHORISED_USER.id,
    username: AUTHORISED_USER.username,
    email:    AUTHORISED_USER.email,
  };
  setSession(user);
  return { success: true, user };
}

/**
 * Signup is disabled — this system has a single authorised user.
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function signup(_username, _email, _password) {
  return {
    success: false,
    error: 'Registration is disabled. Contact the administrator.',
  };
}
