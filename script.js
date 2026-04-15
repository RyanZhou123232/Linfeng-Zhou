/**
 * Linfeng (Ryan) Zhou — portfolio
 * - Floating name: large centered → shrinks to top bar on scroll (inverse when scrolling up)
 * - Sticky navbar state, smooth scroll, scroll-spy, reveal, mobile menu, scroll-top
 */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  const SECTION_ORDER = ["hero", "job-experience", "certifications", "hobbies", "contact"];
  const revealEls = document.querySelectorAll("[data-reveal]");
  const menuToggle = document.querySelector(".navbar__toggle");
  const primaryMenu = document.getElementById("primary-menu");
  const scrollTopBtn = document.getElementById("scroll-top");
  const yearEl = document.getElementById("year");
  const heroEl = document.getElementById("hero");
  const siteNameEl = document.getElementById("site-name");

  const prefersReducedMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getScrollPadding() {
    const h = header ? header.offsetHeight : 64;
    return h + 8;
  }

  function smoothstep(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  /** Interpolate floating H1 from viewport center (large) toward top-left (compact) */
  function updateFloatingName() {
    if (!siteNameEl || !heroEl || prefersReducedMotion) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const range = Math.min(heroEl.offsetHeight * 0.52, 460);
    let t = range > 0 ? scrollY / range : 0;
    t = smoothstep(Math.min(1, t));

    const iw = window.innerWidth;
    const ih = window.innerHeight;

    const startFont = Math.min(4.35 * 16, iw * 0.088);
    const endFont = iw < 400 ? 14 : iw < 600 ? 15 : 16;
    const fontPx = startFont + (endFont - startFont) * t;

    const startY = ih * 0.33;
    const endY = 30;
    const y = startY + (endY - startY) * t;

    const startX = iw / 2;
    const approxHalfWidth = endFont * 6.2;
    const endCenterX = Math.min(24 + approxHalfWidth, iw * 0.46);
    const x = startX + (endCenterX - startX) * t;

    siteNameEl.style.fontSize = fontPx + "px";
    siteNameEl.style.left = x + "px";
    siteNameEl.style.top = y + "px";
    siteNameEl.style.transform = "translate(-50%, -50%)";

    document.body.classList.toggle("is-name-collapsed", t > 0.82);
  }

  function initLoadState() {
    requestAnimationFrame(function () {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      updateFloatingName();
    });
  }

  function onScrollNavbar() {
    if (!header) return;
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 16);
  }

  function onScrollTopButton() {
    if (!scrollTopBtn) return;
    const y = window.scrollY || window.pageYOffset;
    scrollTopBtn.classList.toggle("is-visible", y > 400);
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

    if (y < 80) {
      setActiveNav("hero");
      return;
    }

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

  let revealTicking = false;
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
      { root: null, threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
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

  let scrollTick = false;
  function onScroll() {
    onScrollNavbar();
    onScrollTopButton();
    updateActiveNavFromScroll();

    if (!scrollTick) {
      window.requestAnimationFrame(function () {
        updateFloatingName();
        scrollTick = false;
      });
      scrollTick = true;
    }
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
    window.addEventListener(
      "resize",
      function () {
        updateFloatingName();
      },
      { passive: true }
    );

    if (window.location.hash) {
      setTimeout(function () {
        scrollToHash(window.location.hash, { updateHistory: false });
      }, 60);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
