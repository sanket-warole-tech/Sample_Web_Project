/* ================================================
   SCRIPT.JS — Portfolio JavaScript
   ================================================

   This file handles three things:
   1. Sticky navbar background (appears after scrolling)
   2. Active nav link highlighting (based on scroll position)
   3. Mobile menu toggle (hamburger button)

   Keep in mind: JavaScript runs AFTER the HTML is
   parsed (because the <script> tag is at the bottom
   of <body>), so all elements below are guaranteed
   to exist when this code runs.

   ================================================ */


/* ================================================
   HELPER: Get an element by its CSS selector.
   This just saves typing document.querySelector
   every time.
   ================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);


/* ================================================
   ELEMENT REFERENCES
   We grab references to DOM elements once at the
   top instead of searching for them every scroll event.
   ================================================ */
const navbar      = $('#navbar');
const hamburger   = $('#hamburger');
const mobileMenu  = $('#mobile-menu');
const navLinks    = $$('.nav-link');   // NodeList of all desktop nav links
const mobLinks    = $$('.mob-link');   // NodeList of mobile menu links
const footerYear  = $('#footer-year');

// All the sections we want to track for active-link highlighting.
// Must match the IDs used in index.html.
const sections = $$('section[id]');


/* ================================================
   FOOTER YEAR
   Automatically keeps the copyright year current.
   ================================================ */
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


/* ================================================
   SCROLL HANDLER
   This function runs every time the user scrolls.
   It does two jobs:
   a) Add/remove the .scrolled class on the navbar
   b) Determine which section is in view and
      highlight its corresponding nav link
   ================================================ */
function onScroll() {

  /* ---- a) Navbar background ---- */
  // If scrolled more than 60px from top, show solid navbar background
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  /* ---- b) Active section detection ---- */
  // We loop through each section and check if it's currently
  // "in view" — meaning its top edge has passed the middle of
  // the viewport.

  let currentSection = '';  // Will hold the ID of the active section

  sections.forEach((section) => {
    // getBoundingClientRect() returns the position of an element
    // relative to the viewport (the visible browser window).
    const rect = section.getBoundingClientRect();

    // The section is "active" if its top is above the middle of the screen
    // AND its bottom is still below the top of the screen.
    // The 120px offset accounts for the navbar height.
    if (rect.top <= window.innerHeight / 2 && rect.bottom > 120) {
      currentSection = section.id;
    }
  });

  // Now update the nav links — add .active to the matching one,
  // remove it from all others.
  navLinks.forEach((link) => {
    // link.dataset.section reads the data-section="..." attribute
    // we set on each <a> in the HTML
    if (link.dataset.section === currentSection) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Attach the scroll handler to the window's scroll event.
// The 'passive: true' option is a performance hint — it tells
// the browser this handler won't try to prevent scrolling,
// allowing it to scroll more smoothly.
window.addEventListener('scroll', onScroll, { passive: true });

// Run once on page load so the navbar state is correct immediately
onScroll();


/* ================================================
   MOBILE MENU TOGGLE
   Clicking the hamburger button opens/closes the
   slide-down mobile menu.
   ================================================ */
hamburger.addEventListener('click', () => {
  // .toggle() adds the class if absent, removes it if present
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');

  // Accessibility: update aria-expanded so screen readers know
  // whether the menu is open or closed
  const isOpen = mobileMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);

  // Prevent body from scrolling while the menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// When a mobile menu link is clicked, close the menu.
// This improves UX — no need to manually close the menu
// after tapping a link to scroll to a section.
mobLinks.forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


/* ================================================
   SCROLL-TRIGGERED FADE-IN (OPTIONAL ENHANCEMENT)
   This uses the IntersectionObserver API to add a
   .visible class to elements when they scroll into
   view, triggering a CSS fade-in animation.

   To use it on an element, add the class
   "reveal" in your HTML. The CSS for .reveal and
   .reveal.visible is below — you can customise it.
   ================================================ */

// First, inject the reveal styles dynamically so they're
// self-contained in this file (no changes needed in style.css).
const revealStyles = document.createElement('style');
revealStyles.textContent = `
  /* Start hidden and slightly below natural position */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  /* Once .visible is added by JS, animate to natural position */
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyles);

// IntersectionObserver fires our callback whenever a watched
// element enters or exits the viewport.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // entry.isIntersecting === true means the element just
      // scrolled into the visible area
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop watching this element
        // (no need to animate it again)
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    // Trigger when 15% of the element is visible
    threshold: 0.15,
  }
);

// Watch all project cards, stat cards, and about text
$$('.project-card, .stat-card, .about-text, .contact-body').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


/* ================================================
   CLOSE MOBILE MENU ON RESIZE
   If the user resizes to desktop width while the
   mobile menu is open, close it automatically.
   ================================================ */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});
