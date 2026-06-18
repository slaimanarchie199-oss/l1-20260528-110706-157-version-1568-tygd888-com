(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var slider = document.querySelector('.hero-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }
    start();
  }

  function setupFiltering() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var counter = document.querySelector('[data-filter-count]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    if (!input || cards.length === 0) {
      if (counter) {
        counter.textContent = String(cards.length);
      }
      return;
    }

    function applyFilter() {
      var query = normalize(input.value);
      var visibleCount = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });
      if (counter) {
        counter.textContent = String(visibleCount);
      }
    }

    input.addEventListener('input', applyFilter);
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-filter-value') || '';
        applyFilter();
        input.focus();
      });
    });
    applyFilter();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
  });
})();
