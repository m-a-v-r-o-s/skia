/* =========================================================
   SKIÁ ATHENS - motion
   GSAP + ScrollTrigger. Scroll-linked motion is transform/opacity only.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* -------------------------------------------------------
     NAV - colour inversion per section, floating -> stuck
     ------------------------------------------------------- */
  var nav = document.getElementById('nav');

  function setNavTheme(theme) {
    nav.classList.toggle('is-light', theme === 'light');
    nav.classList.toggle('is-dark-stuck', theme === 'dark');
  }

  function initNav() {
    var sections = [].slice.call(document.querySelectorAll('[data-theme]'));
    if (!sections.length || !hasGSAP) return;

    var LINE = 72;

    /* the section sitting under the nav line; past the last boundary
       (short final section, page bottom) fall back to the last one started */
    function themeAtLine() {
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= LINE && r.bottom > LINE) return sections[i].dataset.theme;
        if (r.top <= LINE) current = sections[i];
      }
      return current.dataset.theme;
    }

    var last = null;
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function () {
        var theme = themeAtLine();
        if (theme !== last) { last = theme; setNavTheme(theme); }
      }
    });

    setNavTheme(themeAtLine());

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'bottom top+=90',
      onEnter: function () { nav.classList.add('is-stuck'); },
      onLeaveBack: function () { nav.classList.remove('is-stuck'); }
    });
  }

  /* -------------------------------------------------------
     MOBILE OVERLAY - hamburger morph + staggered reveal
     ------------------------------------------------------- */
  function initOverlay() {
    var burger = document.getElementById('burger');
    var overlay = document.getElementById('overlay');
    if (!burger || !overlay) return;

    function close() {
      burger.classList.remove('is-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      var open = !overlay.classList.contains('is-open');
      burger.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      overlay.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  /* -------------------------------------------------------
     MANIFESTO - scrubbing word reveal
     ------------------------------------------------------- */
  function initManifesto() {
    var el = document.querySelector('[data-split]');
    if (!el) return;

    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';

    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });

    if (reduced || !hasGSAP) {
      el.querySelectorAll('.word').forEach(function (w) { w.style.opacity = 1; });
      return;
    }

    var words = el.querySelectorAll('.word');

    /* scrubs in on the way down, then locks. Once every word has landed the
       trigger is killed and the words are pinned visible, so scrolling back up
       never un-reveals the paragraph. Also covers loading the page already
       scrolled past this section. */
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.35,
      scrollTrigger: {
        trigger: el,
        start: 'top 78%',
        end: 'bottom 58%',
        scrub: true,
        onUpdate: function (self) {
          if (self.progress < 1) return;
          self.kill();
          gsap.set(words, { opacity: 1 });
        }
      }
    });

    /* safety net for the one remaining scroll-driven fade on the page: the
       moment the paragraph leaves the viewport upwards it is pinned fully
       opaque, so a scrub that never completed (mid-page reload, ScrollTrigger
       not settling) can't leave a wall of text sitting at 12%. */
    if (typeof IntersectionObserver !== 'undefined') {
      var guard = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) return;
          if (entry.boundingClientRect.bottom > 0) return;   /* below, not past */
          gsap.set(words, { opacity: 1 });
          guard.disconnect();
        });
      });
      guard.observe(el);
    }
  }

  /* -------------------------------------------------------
     COLLECTION - pinned split (desktop only)
     ------------------------------------------------------- */
  function initPin() {
    if (reduced || !hasGSAP) return;

    var mm = gsap.matchMedia();

    mm.add('(min-width: 900px)', function () {
      ScrollTrigger.create({
        trigger: '.collection',
        start: 'top top',
        end: 'bottom bottom',
        pin: '#collectionPin',
        pinSpacing: false,
        anticipatePin: 1
      });
    });
  }

  /* -------------------------------------------------------
     MEDIA - one-shot reveal, deliberately NOT on ScrollTrigger

     The old version ran two *scrubbed* tweens per frame that both wrote
     `opacity` (one fading in on entry, one fading back out to .2 on exit).
     They fought over the same property, and because they were scrubbed every
     ScrollTrigger.refresh() - window load, resize, font swap, pin recalc -
     re-evaluated them and could stamp the exit value onto a frame sitting in
     full view. Hence frames stuck looking faded for no reason.

     IntersectionObserver is the right tool for a fire-once reveal: no scroll
     maths, no refresh cycle, and no interaction with the collection pin. Each
     frame is unobserved the moment it lands, so once a frame has appeared
     nothing in the page can ever touch its opacity again.

     Fail-safe by construction: frames are visible in CSS by default and only
     opt in to the hidden start state via .reveal, which is added here. If this
     function bails, or the observer somehow never fires, content ends up
     visible rather than invisible.
     ------------------------------------------------------- */
  function initMedia() {
    var frames = document.querySelectorAll(
      '.piece .media, .prod__frame, .atelier__media'
    );
    if (!frames.length) return;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    frames.forEach(function (frame) { frame.classList.add('reveal'); });

    function land(frame) { frame.classList.add('is-in'); }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        land(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });

    frames.forEach(function (frame) { io.observe(frame); });

    /* last-resort guard: nothing stays hidden, whatever happens above */
    setTimeout(function () {
      frames.forEach(function (frame) {
        if (!frame.classList.contains('is-in')) land(frame);
      });
    }, 3000);
  }

  /* -------------------------------------------------------
     LOOKBOOK - touch/keyboard support for the accordion
     ------------------------------------------------------- */
  function initAccordion() {
    var accordion = document.getElementById('accordion');
    if (!accordion) return;

    var slices = accordion.querySelectorAll('.slice');

    slices.forEach(function (slice) {
      slice.setAttribute('tabindex', '0');

      function open() {
        slices.forEach(function (s) { s.classList.remove('is-open'); });
        slice.classList.add('is-open');
      }

      slice.addEventListener('click', open);
      /* focusin, not focus: it bubbles, so tabbing to the Acquire button inside
         a closed slice opens that slice instead of leaving the button hidden */
      slice.addEventListener('focusin', open);
    });
  }

  /* -------------------------------------------------------
     ACQUIRE - in-page enquiry drawer

     NOTE: front-end only. Nothing is transmitted on submit.
     To make this live, POST the payload in submit() below to a
     real endpoint and only show the confirmation on a 2xx.
     ------------------------------------------------------- */
  function initEnquiry() {
    var enq = document.getElementById('enq');
    if (!enq) return;

    var panel = enq.querySelector('.enq__panel');
    var form = document.getElementById('enqForm');
    var body = document.getElementById('enqBody');
    var done = document.getElementById('enqDone');
    var errEl = document.getElementById('enqError');
    var lastTrigger = null;

    function setText(id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    var pieceMeta = enq.querySelector('.enq__pieceMeta');
    var doneFor = document.getElementById('enqDoneFor');

    function open(trigger) {
      lastTrigger = trigger;

      /* three modes:
         - general enquiry from the header/menu: no piece at all
         - a shop piece: carries data-price and sits next to a .status
         - a collection piece or a lookbook look: named, but not priced, so the
           price/status line is suppressed rather than left blank */
      var general = trigger.hasAttribute('data-acquire-general');
      var price = trigger.dataset.price || '';

      pieceMeta.hidden = general || !price;
      doneFor.hidden = general;

      if (general) {
        setText('enqPiece', 'General enquiry');
      } else {
        setText('enqPiece', trigger.dataset.piece || '');
        if (price) {
          var prod = trigger.closest('.prod');
          var statusEl = prod ? prod.querySelector('.status') : null;
          setText('enqPrice', price);
          setText('enqStatus', statusEl ? statusEl.textContent.trim() : '');
        }
      }

      // always reopen on the form, never on a stale confirmation
      body.hidden = false;
      done.hidden = true;
      errEl.hidden = true;
      form.reset();
      form.querySelectorAll('.is-bad').forEach(function (f) {
        f.classList.remove('is-bad');
      });

      enq.classList.add('is-open');
      enq.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(function () {
        var first = form.querySelector('input');
        if (first) first.focus();
      }, 420);
    }

    function close() {
      enq.classList.remove('is-open');
      enq.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('[data-acquire]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn); });
    });

    /* header + mobile-menu ACQUIRE: same drawer, no piece attached.
       the href="#acquire" stays as the no-JS fallback */
    document.querySelectorAll('[data-acquire-general]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var overlay = document.getElementById('overlay');
        var burger = document.getElementById('burger');
        if (overlay && overlay.classList.contains('is-open') && burger) burger.click();
        open(el);
      });
    });

    enq.querySelectorAll('[data-enq-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && enq.classList.contains('is-open')) close();
    });

    /* keep tabbing inside the panel while it is open */
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('button, input, textarea, a[href]');
      var open = [].slice.call(f).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!open.length) return;
      var first = open[0];
      var last = open[open.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var problems = [];

      [name, email].forEach(function (f) { f.classList.remove('is-bad'); });

      if (!name.value.trim()) {
        problems.push('a name');
        name.classList.add('is-bad');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        problems.push('a valid email');
        email.classList.add('is-bad');
      }

      if (problems.length) {
        errEl.textContent = 'Please add ' + problems.join(' and ') + '.';
        errEl.hidden = false;
        (problems[0] === 'a name' ? name : email).focus();
        return;
      }

      errEl.hidden = true;

      /* payload is assembled but deliberately not sent - no backend yet */
      var payload = {
        piece: document.getElementById('enqPiece').textContent,
        price: document.getElementById('enqPrice').textContent,
        name: name.value.trim(),
        email: email.value.trim(),
        notes: form.elements.notes.value.trim()
      };
      if (window.console) console.info('[skia] enquiry payload', payload);

      setText('enqDonePiece', payload.piece);
      body.hidden = true;
      done.hidden = false;
      done.querySelector('.btn').focus();
    });
  }

  /* -------------------------------------------------------
     HERO - settle in on load
     ------------------------------------------------------- */
  function initHero() {
    if (reduced || !hasGSAP) return;

    /* masthead reveal: mark settles, rules draw left to right, rows lift */
    gsap.from('.hero__mark', {
      yPercent: 12, opacity: 0, duration: 1.5, ease: 'power3.out'
    });
    gsap.from('.hero__rule', {
      scaleX: 0, duration: 1.2, delay: 0.24, stagger: 0.12, ease: 'power3.out'
    });
    gsap.from('.hero__meta span', {
      y: 16, opacity: 0, duration: 1, delay: 0.42, stagger: 0.08, ease: 'power3.out'
    });
    gsap.from('.hero__act', {
      y: 16, opacity: 0, duration: 1, delay: 0.56, stagger: 0.08, ease: 'power3.out'
    });
  }

  /* ------------------------------------------------------- */
  function boot() {
    initOverlay();
    initEnquiry();
    initAccordion();
    initManifesto();
    initNav();
    initPin();
    initMedia();
    initHero();

    if (hasGSAP) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
