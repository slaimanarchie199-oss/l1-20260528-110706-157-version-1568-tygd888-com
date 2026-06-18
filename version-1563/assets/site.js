(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var input = panel.querySelector('[data-search-input]');
      var typeSelect = panel.querySelector('[data-type-filter]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var items = Array.prototype.slice.call(section.querySelectorAll('.filter-item'));

      function matchYear(itemYear, selected) {
        if (!selected) {
          return true;
        }
        var number = parseInt(itemYear, 10);
        if (selected === '2022') {
          return number <= 2022;
        }
        return itemYear.indexOf(selected) !== -1;
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        items.forEach(function (item) {
          var text = [
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-type'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-tags'),
            item.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var itemType = item.getAttribute('data-type') || '';
          var itemGenre = item.getAttribute('data-genre') || '';
          var itemYear = item.getAttribute('data-year') || '';
          var ok = (!q || text.indexOf(q) !== -1) && (!type || itemType.indexOf(type) !== -1 || itemGenre.indexOf(type) !== -1) && matchYear(itemYear, year);
          item.classList.toggle('hidden-by-filter', !ok);
        });
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playButton');
    if (!video || !streamUrl) {
      return;
    }
    var hls = null;
    var attached = false;

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }
      video.src = streamUrl;
      return Promise.resolve();
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function start() {
      attach().then(function () {
        hideOverlay();
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
