// Rodrigo Design — interações do site (sem dependências)
(function () {
  "use strict";

  var WHATSAPP = "5521976026444";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Links de WhatsApp com mensagem pronta ----------
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(el.dataset.wa);
    el.target = "_blank";
    el.rel = "noopener";
  });

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Dropdown "Serviços" (abre no clique, fecha fora / Esc) ----------
  document.querySelectorAll("[data-dropdown]").forEach(function (dd) {
    var trigger = dd.querySelector(".nav__trigger");
    function setOpen(open) {
      dd.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    }
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!dd.classList.contains("is-open"));
    });
    document.addEventListener("click", function (e) {
      if (!dd.contains(e.target)) setOpen(false);
    });
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(false); trigger.focus(); }
    });
    dd.addEventListener("focusout", function (e) {
      if (!dd.contains(e.relatedTarget) && window.innerWidth > 860) setOpen(false);
    });
  });

  // ---------- Menu mobile ----------
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggle.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { if (nav.classList.contains("is-open")) setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });

  // ---------- Carrossel do topo ----------
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var slides = carousel.querySelectorAll(".carousel__slide");
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var INTERVAL = 4000;
    var index = 0, timer = null, paused = false;

    var dots = Array.prototype.map.call(slides, function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "carousel__dot";
      b.setAttribute("aria-label", "Mostrar banner " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, n) {
        var active = n === index;
        s.setAttribute("aria-hidden", String(!active));
        s.querySelectorAll("a").forEach(function (a) { a.tabIndex = active ? 0 : -1; });
      });
      dots.forEach(function (d, n) { d.setAttribute("aria-current", String(n === index)); });
    }
    function start() {
      if (reduceMotion || paused) return;
      stop();
      timer = setInterval(function () { go(index + 1); }, INTERVAL);
    }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    carousel.querySelector(".carousel__arrow--prev").addEventListener("click", function () { go(index - 1); restart(); });
    carousel.querySelector(".carousel__arrow--next").addEventListener("click", function () { go(index + 1); restart(); });

    // Pausa enquanto o usuário interage
    carousel.addEventListener("mouseenter", function () { paused = true; stop(); });
    carousel.addEventListener("mouseleave", function () { paused = false; start(); });
    carousel.addEventListener("focusin", function () { paused = true; stop(); });
    carousel.addEventListener("focusout", function (e) { if (!carousel.contains(e.relatedTarget)) { paused = false; start(); } });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    // Arrastar no celular
    var startX = null, startY = null;
    carousel.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    }, { passive: true });

    go(0);
    start();
  }

  // ---------- Filtro do portfólio ----------
  var chips = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll("[data-grid] .card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      cards.forEach(function (card) {
        card.hidden = f !== "todos" && card.dataset.cats.split(" ").indexOf(f) === -1;
      });
    });
  });
})();
