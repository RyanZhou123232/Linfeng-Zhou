/**
 * Linfeng (Ryan) Zhou — portfolio interactions
 * - Initial load fade-in
 * - Sticky navbar: solid background on scroll
 * - Smooth in-page scrolling with fixed-header offset
 * - Active nav highlight while scrolling
 * - Reveal-on-scroll for .reveal elements
 * - Mobile menu toggle
 * - Scroll-to-top button
 */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  /** Section ids in page order — scroll spy */
  const SECTION_ORDER = [
    "hero",
    "job-experience",
    "certifications",
    "activities",
    "interests",
    "contact",
  ];
  const revealEls = document.querySelectorAll("[data-reveal]");
  const menuToggle = document.querySelector(".navbar__toggle");
  const primaryMenu = document.getElementById("primary-menu");
  const scrollTopBtn = document.getElementById("scroll-top");
  const yearEl = document.getElementById("year");

  function getScrollPadding() {
    const h = header ? header.offsetHeight : 72;
    return h + 12;
  }

  function initLoadState() {
    requestAnimationFrame(function () {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    });
  }

  function onScrollNavbar() {
    if (!header) return;
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 24);
  }

  function onScrollTopButton() {
    if (!scrollTopBtn) return;
    const y = window.scrollY || window.pageYOffset;
    scrollTopBtn.classList.toggle("is-visible", y > 420);
  }

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

  function setActiveNav(sectionId) {
    navLinks.forEach(function (link) {
      const sec = link.getAttribute("data-section");
      link.classList.toggle("is-active", sec === sectionId);
    });
  }

  function updateActiveNavFromScroll() {
    if (!navLinks.length) return;

    const y = window.scrollY || window.pageYOffset;
    const line = getScrollPadding();

    if (y < 96) {
      setActiveNav("hero");
      return;
    }

    let activeId = SECTION_ORDER[0];

    SECTION_ORDER.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top <= line + 16) {
        activeId = id;
      }
    });

    setActiveNav(activeId);
  }

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
      { root: null, threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

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

  function initScrollTop() {
    if (!scrollTopBtn) return;
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.pushState(null, "", window.location.pathname);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function onScroll() {
    onScrollNavbar();
    onScrollTopButton();
    updateActiveNavFromScroll();
  }

  function init() {
    initLoadState();
    initSmoothScroll();
    initReveal();
    initMobileMenu();
    initScrollTop();
    initYear();

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

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
