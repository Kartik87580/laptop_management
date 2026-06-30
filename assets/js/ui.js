/**
 * ui.js – Shared UI utilities for LRMS
 * Handles toasts, sidebar toggle, status badge rendering, and common helpers.
 */

/* ────────────────────────────────────────────────────────────
   Toast Notifications
   ──────────────────────────────────────────────────────────── */

let _toastContainer = null;

function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.className = 'toast-container';
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message  – Text to display
 * @param {'success'|'error'|'info'} type – Toast colour
 * @param {number} duration – Auto-dismiss ms (default 3500)
 */
export function showToast(message, type = 'success', duration = 3500) {
  const container = getToastContainer();
  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `<i class="bi ${icons[type]}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ────────────────────────────────────────────────────────────
   Loading Spinner
   ──────────────────────────────────────────────────────────── */

let _spinnerEl = null;

/** Show a full-page loading overlay. */
export function showSpinner() {
  if (!_spinnerEl) {
    _spinnerEl = document.createElement('div');
    _spinnerEl.className = 'spinner-overlay';
    _spinnerEl.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary" style="width:2.5rem;height:2.5rem;"></div>
        <div class="mt-2 text-secondary" style="font-size:13px;">Loading…</div>
      </div>`;
    document.body.appendChild(_spinnerEl);
  }
  _spinnerEl.style.display = 'flex';
}

/** Hide the loading overlay. */
export function hideSpinner() {
  if (_spinnerEl) _spinnerEl.style.display = 'none';
}

/* ────────────────────────────────────────────────────────────
   Status Badge
   ──────────────────────────────────────────────────────────── */

const STATUS_CLASS_MAP = {
  'Received':        'badge-received',
  'Diagnosing':      'badge-diagnosing',
  'Waiting for Parts':'badge-waiting',
  'Repairing':       'badge-repairing',
  'Ready':           'badge-ready',
  'Delivered':       'badge-delivered',
  'Cancel':          'badge-cancel',
};

/**
 * Return HTML string for a status badge.
 * @param {string} status
 */
export function statusBadge(status) {
  const cls = STATUS_CLASS_MAP[status] || 'badge-received';
  return `<span class="badge-status ${cls}">${escapeHtml(status)}</span>`;
}

/* ────────────────────────────────────────────────────────────
   Sidebar Toggle (mobile)
   ──────────────────────────────────────────────────────────── */

/** Initialise the mobile sidebar open/close behaviour. */
export function initSidebar() {
  const toggle   = document.getElementById('sidebarToggle');
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');

  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (overlay) overlay.addEventListener('click', () => sidebar.classList.remove('open'));
}

/* ────────────────────────────────────────────────────────────
   Active Nav Link
   ──────────────────────────────────────────────────────────── */

/** Highlight the nav link matching the current page filename. */
export function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ────────────────────────────────────────────────────────────
   Confirmation Dialog
   ──────────────────────────────────────────────────────────── */

/**
 * Show a simple confirm dialog and return boolean.
 * @param {string} message
 */
export function confirmAction(message) {
  return window.confirm(message);
}

/* ────────────────────────────────────────────────────────────
   Date / Time Formatters
   ──────────────────────────────────────────────────────────── */

/**
 * Format an ISO date string to DD-MMM-YYYY.
 * @param {string} dateStr
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a time string (HH:MM:SS or HH:MM) to 12-hour format.
 * @param {string} timeStr
 */
export function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/* ────────────────────────────────────────────────────────────
   Security / Sanitisation
   ──────────────────────────────────────────────────────────── */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 */
export function escapeHtml(str) {
  if (str == null) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ────────────────────────────────────────────────────────────
   Form Validation
   ──────────────────────────────────────────────────────────── */

/**
 * Validate required fields in a form element.
 * Adds Bootstrap 'is-invalid' class to empty required fields.
 * @param {HTMLFormElement} form
 * @returns {boolean} true if valid
 */
export function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      valid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  });
  return valid;
}

/**
 * Clear all validation states from a form.
 * @param {HTMLFormElement} form
 */
export function clearValidation(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

/* ────────────────────────────────────────────────────────────
   URL Query Params
   ──────────────────────────────────────────────────────────── */

/**
 * Get a URL search parameter value.
 * @param {string} key
 */
export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/* ────────────────────────────────────────────────────────────
   Empty State Renderer
   ──────────────────────────────────────────────────────────── */

/**
 * Return HTML for an empty-state message.
 * @param {string} message
 */
export function emptyStateHtml(message = 'No records found.') {
  return `
    <div class="empty-state">
      <i class="bi bi-inbox"></i>
      <p class="fw-semibold">${escapeHtml(message)}</p>
    </div>`;
}
