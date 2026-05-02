/**
 * main.js - Application entry point
 * Suraksha Election Literacy Assistant
 *
 * FUNCTIONALITY CHECKLIST
 * [ ] All nav links anchor-scroll to correct sections
 * [ ] Timeline expands correct detail panel per node
 * [ ] Quiz scores calculate correctly for all 5 questions
 * [ ] Quiz feedback announces correctly to screen reader (aria-live)
 * [ ] Confetti fires only on quiz completion screen
 * [ ] Chat sends message and renders bot reply
 * [ ] Chat bot refuses off-topic questions with redirect message
 * [ ] Quick reply chips populate input and send correctly
 * [ ] Email form rejects invalid format with accessible error
 * [ ] Email form shows success state after valid submission
 * [ ] FAQ accordion opens/closes with keyboard and mouse
 * [ ] Back-to-top button appears after 300px scroll
 *
 * ACCESSIBILITY CHECKLIST
 * [ ] Skip link appears and works on focus
 * [ ] Full keyboard navigation end-to-end (no mouse)
 * [ ] Chat dialog focus trap works correctly
 * [ ] Escape closes chat and returns focus to trigger button
 * [ ] All images have meaningful alt text
 * [ ] Lighthouse accessibility score >= 90
 *
 * PERFORMANCE CHECKLIST
 * [ ] No console errors on page load
 * [ ] Animations only run under prefers-reduced-motion: no-preference
 * [ ] Lighthouse performance score >= 90
 * [ ] Fonts load without layout shift (font-display: swap)
 *
 * SECURITY CHECKLIST
 * [ ] API key never appears in frontend bundle
 * [ ] User input rendered with textContent, never innerHTML
 * [ ] All external links have rel="noopener noreferrer"
 */

import { initTimeline } from './timeline.js';
import { initQuiz } from './quiz.js';
import { initChatbot } from './chatbot.js';
import { debounce, isValidEmail } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initTimeline();
  initQuiz();
  initChatbot();
  initFAQ();
  initNotifyForm();
  initBackToTop();
  initSmoothScroll();
});

/* ── NAVBAR ─────────────────────────────────────────────────────────────── */

/**
 * Initialize navbar scroll behavior and mobile hamburger menu.
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');

  if (!navbar) return;

  // Add .scrolled class for backdrop blur effect
  const handleScroll = debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close drawer when any link inside is clicked
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
  }
}

/* ── SCROLL ANIMATIONS ───────────────────────────────────────────────────── */

/**
 * Use IntersectionObserver to trigger scroll animations.
 * Zero scroll event listeners — all observation-based.
 */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll(
    '.animate-fade-up, .animate-fade-in, .animate-scale-in'
  );
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Animate once only
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  animatedEls.forEach((el) => observer.observe(el));
}

/* ── FAQ ACCORDION ───────────────────────────────────────────────────────── */

/**
 * Initialize FAQ accordion with keyboard navigation.
 */
function initFAQ() {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const btn = accordion.querySelector('.accordion__btn');
    const panel = accordion.querySelector('.accordion__panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      toggleAccordion(btn, panel, !isExpanded);
    });
  });

  // Arrow key navigation between FAQ items
  const faqSection = document.getElementById('faq');
  if (!faqSection) return;

  faqSection.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const btns = Array.from(faqSection.querySelectorAll('.accordion__btn'));
    const current = btns.indexOf(document.activeElement);
    if (current === -1) return;

    e.preventDefault();
    const next = e.key === 'ArrowDown'
      ? (current + 1) % btns.length
      : (current - 1 + btns.length) % btns.length;
    btns[next].focus();
  });
}

/**
 * Toggle an accordion item open or closed.
 * @param {HTMLElement} btn
 * @param {HTMLElement} panel
 * @param {boolean} open
 */
function toggleAccordion(btn, panel, open) {
  btn.setAttribute('aria-expanded', String(open));

  if (open) {
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => panel.classList.add('is-open'));
  } else {
    panel.classList.remove('is-open');
    panel.addEventListener(
      'transitionend',
      () => { if (!panel.classList.contains('is-open')) panel.setAttribute('hidden', ''); },
      { once: true }
    );
  }
}

/* ── NOTIFICATION FORM ───────────────────────────────────────────────────── */

/**
 * Initialize the email notification form with real-time validation.
 */
function initNotifyForm() {
  const form = document.getElementById('notify-form');
  const input = document.getElementById('notify-email');
  const errorEl = document.getElementById('notify-error');
  const successEl = document.getElementById('notify-success');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      showError('⚠️ Please enter a valid email address (e.g. you@example.com)');
      return;
    }

    hideError();
    // Show success — replace form
    form.style.display = 'none';
    if (successEl) {
      successEl.classList.add('is-visible');
      successEl.textContent = "✅ You're on the list! We'll notify you about important election dates.";
      successEl.focus();
    }
  });

  // Real-time validation on blur
  input.addEventListener('blur', () => {
    const email = input.value.trim();
    if (email && !isValidEmail(email)) {
      showError('⚠️ Please enter a valid email address');
    } else {
      hideError();
    }
  });

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.add('is-visible');
    input.setAttribute('aria-describedby', 'notify-error');
    input.setAttribute('aria-invalid', 'true');
  }

  function hideError() {
    if (!errorEl) return;
    errorEl.classList.remove('is-visible');
    input.removeAttribute('aria-invalid');
  }
}

/* ── BACK TO TOP ─────────────────────────────────────────────────────────── */

/**
 * Show/hide back-to-top button after 300px scroll.
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const handleScroll = debounce(() => {
    btn.classList.toggle('is-visible', window.scrollY > 300);
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── SMOOTH SCROLL ───────────────────────────────────────────────────────── */

/**
 * Smooth scroll for all in-page anchor links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Move focus to section for screen readers
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  });
}
