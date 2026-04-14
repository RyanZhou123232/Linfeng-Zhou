/**
 * Ryan Zhou — portfolio interactions
 * - Initial load fade-in
 * - Sticky navbar: solid background on scroll
 * - Smooth in-page scrolling with fixed-header offset
 * - Active nav highlight via IntersectionObserver
 * - Reveal-on-scroll for .reveal elements
 * - Mobile menu toggle
 * - Scroll-to-top button
 */

(function () {
    "use strict";
  
    const header = document.querySelector(".site-header");
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    /** Section ids in page order — used for scroll-based active nav */
    const SECTION_ORDER = ["about", "focus", "experience", "projects", "leadership", "skills", "contact"];
    const revealEls = document.querySelectorAll("[data-reveal]");
    const menuToggle = document.querySelector(".navbar__toggle");
    const primaryMenu = document.getElementById("primary-menu");
    const scrollTopBtn = document.getElementById("scroll-top");
  const themeToggleBtn = document.getElementById("theme-toggle");
    const yearEl = document.getElementById("year");
  const THEME_STORAGE_KEY = "ryan-site-theme";
  
    /** Read navbar height from CSS for scroll offset */
    function getScrollPadding() {
      const h = header ? header.offsetHeight : 72;
      return h + 12;
    }
  
    /** Fade body in after first paint (subtle loading polish) */
    function initLoadState() {
      requestAnimationFrame(function () {
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
      });
    }
  
    /** Navbar background when user scrolls */
    function onScrollNavbar() {
      if (!header) return;
      const y = window.scrollY || window.pageYOffset;
      header.classList.toggle("is-scrolled", y > 24);
    }
  
    /** Scroll-to-top visibility */
    function onScrollTopButton() {
      if (!scrollTopBtn) return;
      const y = window.scrollY || window.pageYOffset;
      scrollTopBtn.classList.toggle("is-visible", y > 420);
    }
  
    /** Smooth scroll to hash targets accounting for sticky header */
    function scrollToHash(hash, { updateHistory = true } = {}) {
      if (!hash || hash === "#") return;
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;
  
      const top = el.getBoundingClientRect().top + window.pageYOffset - getScrollPadding();
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  
      if (updateHistory) {
        history.pushState(null, "", hash);
      }
    }
  
    /** In-page link clicks (navbar + footer): smooth scroll + close mobile menu */
    function initSmoothScroll() {
      document.addEventListener("click", function (e) {
        const a = e.target.closest('a[href^="#"]');
        if (!a || !a.getAttribute("href").startsWith("#")) return;
        if (a.hasAttribute("data-placeholder-link")) {
          e.preventDefault();
          return;
        }
        const href = a.getAttribute("href");
        if (href.length <= 1) return;
  
        const target = document.querySelector(href);
        if (!target) return;
  
        e.preventDefault();
        scrollToHash(href);
        closeMobileMenu();
      });
    }
  
    /** Set active nav link from section id */
    function setActiveNav(sectionId) {
      navLinks.forEach(function (link) {
        const sec = link.getAttribute("data-section");
        link.classList.toggle("is-active", sec === sectionId);
      });
    }
  
    /**
     * Highlight nav while scrolling — scroll spy (reliable across mobile / short sections)
     */
    function updateActiveNavFromScroll() {
      if (!navLinks.length) return;
  
      const y = window.scrollY || window.pageYOffset;
      if (y < 72) {
        navLinks.forEach(function (link) {
          link.classList.remove("is-active");
        });
        return;
      }
  
      const line = getScrollPadding();
      let activeId = SECTION_ORDER[0];
  
      SECTION_ORDER.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= line + 12) {
          activeId = id;
        }
      });
  
      setActiveNav(activeId);
    }
  
    /** Active nav updates run from the shared scroll handler (see onScroll). */
    function initSectionSpy() {
      updateActiveNavFromScroll();
    }
  
    /** Reveal elements when they enter the viewport */
    function initReveal() {
      if (!revealEls.length) return;
  
      const io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const delay = entry.target.getAttribute("data-reveal-delay");
            var el = entry.target;
            if (delay) {
              setTimeout(function () {
                el.classList.add("is-visible");
              }, parseInt(delay, 10));
            } else {
              el.classList.add("is-visible");
            }
            obs.unobserve(entry.target);
          });
        },
        { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
  
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  
    /** Mobile menu */
    function openMobileMenu() {
      if (!header || !menuToggle) return;
      header.classList.add("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
    }
  
    function closeMobileMenu() {
      if (!header || !menuToggle) return;
      header.classList.remove("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
    }
  
    function initMobileMenu() {
      if (!menuToggle || !primaryMenu) return;
  
      menuToggle.addEventListener("click", function () {
        if (header.classList.contains("is-menu-open")) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
  
      primaryMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          closeMobileMenu();
        });
      });
  
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMobileMenu();
      });
  
      window.addEventListener(
        "resize",
        function () {
          if (window.innerWidth > 900) closeMobileMenu();
        },
        { passive: true }
      );
    }
  
    /** Hero / metric cards: light stagger via reveal delays (handled in HTML + reveal observer) */
  
    /** Scroll-to-top */
    function initScrollTop() {
      if (!scrollTopBtn) return;
      scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.pushState(null, "", window.location.pathname);
      });
    }
  
    /** Footer year */
    function initYear() {
      if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
      }
    }

  /** Theme toggle: dark/light with localStorage persistence */
  function applyTheme(theme) {
    if (!themeToggleBtn) return;
    document.body.setAttribute("data-theme", theme);
    const isLight = theme === "light";
    themeToggleBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    themeToggleBtn.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
    const icon = themeToggleBtn.querySelector(".theme-toggle__icon");
    if (icon) icon.textContent = isLight ? "🌙" : "☀";
  }

  function initThemeToggle() {
    if (!themeToggleBtn) return;

    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (_) {
      savedTheme = null;
    }

    const systemPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = savedTheme || (systemPrefersLight ? "light" : "dark");
    applyTheme(initialTheme);

    themeToggleBtn.addEventListener("click", function () {
      const currentTheme = document.body.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (_) {
        /* no-op when storage is unavailable */
      }
    });
  }
  
    /** Combined scroll listener */
    function onScroll() {
      onScrollNavbar();
      onScrollTopButton();
      updateActiveNavFromScroll();
    }
  
    /** Boot */
    function init() {
      initLoadState();
      initSmoothScroll();
      initSectionSpy(); /* registers updateActiveNavFromScroll; first run via onScroll */
      initReveal();
      initMobileMenu();
      initScrollTop();
      initThemeToggle();
      initYear();
  
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
  
      /** Deep link on load */
      if (window.location.hash) {
        setTimeout(function () {
          scrollToHash(window.location.hash, { updateHistory: false });
        }, 50);
      }
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
  