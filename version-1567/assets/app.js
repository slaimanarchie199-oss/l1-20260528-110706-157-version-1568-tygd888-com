
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    const button = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll('[data-hero-panel]'));
    const thumbs = Array.from(document.querySelectorAll('[data-hero-thumb]'));
    const wrap = document.querySelector('[data-hero-slides]');
    if (!slides.length || !thumbs.length || !wrap) return;

    let index = 0;
    const activate = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => activate(Number(thumb.dataset.index || 0)));
    });

    activate(0);
    setInterval(() => activate(index + 1), 6000);
  }

  async function initSearch() {
    const form = document.querySelector('[data-search-form]');
    const container = document.getElementById('searchResults');
    if (!form || !container) return;

    let catalog = [];
    try {
      const response = await fetch('/assets/catalog.json', { cache: 'no-store' });
      catalog = await response.json();
    } catch (error) {
      return;
    }

    const input = form.querySelector('input[name="q"]');
    const params = new URLSearchParams(location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    const render = (query) => {
      const q = query.trim().toLowerCase();
      const list = !q ? catalog.slice(0, 24) : catalog.filter((item) => {
        const text = [item.title, item.region, item.type, item.genre, item.year, ...(item.tags || [])].join(' ').toLowerCase();
        return text.includes(q);
      }).slice(0, 80);
      container.innerHTML = list.map((item, idx) => {
        const hue = (item.id.charCodeAt(0) * 17 + idx * 11) % 360;
        const hue2 = (hue + 40) % 360;
        return `
          <a class="card card-sm" href="${item.url}" style="--hue:${hue}; --hue2:${hue2};">
            <div class="poster">
              <div class="poster-badge">${item.region}</div>
              <div class="poster-center">${item.title}</div>
              <div class="poster-footer"><span>${item.year}</span><span>${item.type}</span></div>
            </div>
            <div class="card-body">
              <div class="card-meta"><span>${item.year}</span><span>·</span><span>${item.region}</span></div>
              <h3 class="card-title">${item.title}</h3>
              <p class="card-line">${item.oneLine}</p>
            </div>
          </a>`;
      }).join('');
    };

    render(initial);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      render(input.value);
      const url = new URL(location.href);
      if (input.value.trim()) url.searchParams.set('q', input.value.trim());
      else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    });
  }

  ready(() => {
    initMenu();
    initHero();
    initSearch();
  });
})();
