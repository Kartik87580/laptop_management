/**
 * app.js – Main application entry point for LRMS.
 * Each page imports this file to bootstrap sidebar, navigation, and global events.
 */

import { initSidebar, setActiveNav } from './ui.js';

// Initialise shared UI on every page
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  setActiveNav();
});
