(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        start();
      });
    }

    start();
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    if (!cards.length) return;
    var activeCategory = 'all';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-text') || '';
        var category = card.getAttribute('data-category') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === 'all' || category === activeCategory;
        var show = matchText && matchCategory;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  if (!video || !source) return;
  var loaded = false;
  var hlsInstance = null;

  function attach() {
    if (loaded) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    loaded = true;
  }

  function play() {
    attach();
    if (cover) cover.classList.add('is-hidden');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) play();
  });

  video.addEventListener('play', function () {
    if (cover) cover.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}
