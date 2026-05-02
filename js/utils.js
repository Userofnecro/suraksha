/**
 * utils.js - Shared utility functions
 * Suraksha Election Literacy Assistant
 */

/**
 * Sanitize a string for safe DOM insertion.
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized string
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, (char) => {
    const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
    return map[char];
  });
}

/**
 * Debounce a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Trap focus within a given element (for modals/dialogs).
 * Returns a cleanup function to remove the listener.
 * @param {HTMLElement} container - The element to trap focus within
 * @returns {Function} Cleanup function
 */
export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  if (first) first.focus();

  return () => container.removeEventListener('keydown', handleKeydown);
}

/**
 * Validate an email address format.
 * @param {string} email - Email string to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Smoothly scroll to an element by selector.
 * @param {string} selector - CSS selector of target element
 */
export function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
