
(function () {
  const ready = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setHeaderState() {
    const header = qs(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setActiveNav() {
    const current = location.pathname.split("/").pop() || "index.html";
    qsa(".nav a").forEach((a) => {
      if (a.getAttribute("href") === current) {
        a.classList.add("active");
      }
    });
  }

  function setupMobileNav() {
    const btn = qs("[data-menu-toggle]");
    const nav = qs(".nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => nav.classList.toggle("is-open"));
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      nav.classList.remove("is-open");
    });
  }

  function setupFilter() {
    const input = qs("[data-filter-input]");
    if (!input) return;
    const items = qsa("[data-filter-item]");
    const counter = qs("[data-filter-count]");
    const apply = () => {
      const query = (input.value || "").trim().toLowerCase();
      let visible = 0;
      items.forEach((el) => {
        const bag = [
          el.dataset.title || "",
          el.dataset.genre || "",
          el.dataset.region || "",
          el.dataset.year || "",
          el.dataset.tags || "",
        ].join(" ").toLowerCase();
        const show = !query || bag.includes(query);
        el.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (counter) counter.textContent = String(visible);
    };
    input.addEventListener("input", apply);
    apply();
  }

  function setupCarousel() {
    const root = qs("[data-carousel]");
    if (!root) return;
    const slides = qsa(".hero-slide", root);
    const dotsWrap = qs("[data-dots]", root);
    const prev = qs("[data-prev]", root);
    const next = qs("[data-next]", root);
    if (!slides.length) return;

    let index = 0;
    let timer = null;
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.className = "hero-dot";
      b.setAttribute("aria-label", `切换到第 ${i + 1} 屏`);
      b.addEventListener("click", () => go(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === index));
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === index));
    }
    function go(i) {
      show(i);
      restart();
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5000);
    }

    prev && prev.addEventListener("click", () => go(index - 1));
    next && next.addEventListener("click", () => go(index + 1));
    show(0);
    restart();

    root.addEventListener("mouseenter", () => timer && clearInterval(timer));
    root.addEventListener("mouseleave", restart);
  }

  function setupPlayer() {
    const wrap = qs("[data-player]");
    if (!wrap) return;
    const video = qs("video", wrap);
    const buttons = qsa("[data-source]", wrap);
    if (!video || !buttons.length) return;

    let hls = null;
    const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl");
    const ensureHls = () => window.Hls && !canNativeHls;

    function cleanup() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function load(src) {
      cleanup();
      if (ensureHls() && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      buttons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.source === src);
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        load(btn.dataset.source);
      });
    });

    const first = buttons[0].dataset.source;
    load(first);
  }

  function setupCopyButtons() {
    qsa("[data-copy-link]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = btn.dataset.copyLink;
        try {
          await navigator.clipboard.writeText(url);
          const old = btn.textContent;
          btn.textContent = "已复制";
          setTimeout(() => (btn.textContent = old), 1200);
        } catch (e) {}
      });
    });
  }

  ready(() => {
    setHeaderState();
    setActiveNav();
    setupMobileNav();
    setupCarousel();
    setupFilter();
    setupPlayer();
    setupCopyButtons();
  });
})();
