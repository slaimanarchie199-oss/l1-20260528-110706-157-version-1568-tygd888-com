(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var yearNodes = document.querySelectorAll('[data-current-year]');
  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var controls = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-control]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      controls.forEach(function (control, controlIndex) {
        control.classList.toggle('active', controlIndex === activeIndex);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function () {
        showSlide(Number(control.getAttribute('data-hero-control')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var resetButton = filterRoot.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var empty = filterRoot.querySelector('[data-filter-empty]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var query = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var sameType = !type || normalize(card.getAttribute('data-type')) === type;
        var sameYear = !year || normalize(card.getAttribute('data-year')) === year;
        var sameQuery = !query || text.indexOf(query) !== -1;
        var matched = sameType && sameYear && sameQuery;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', filterCards);
        node.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        filterCards();
      });
    }
  }

  var globalInput = document.querySelector('[data-global-search]');
  var globalButton = document.querySelector('[data-global-search-button]');
  var globalResults = document.querySelector('[data-search-results]');
  var globalEmpty = document.querySelector('[data-search-empty]');

  if (globalInput && globalResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function searchMovies() {
      var query = globalInput.value.trim().toLowerCase();
      globalResults.innerHTML = '';

      if (!query) {
        if (globalEmpty) {
          globalEmpty.textContent = '输入关键词开始搜索。';
          globalEmpty.classList.add('show');
        }
        return;
      }

      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.text.indexOf(query) !== -1;
      }).slice(0, 80);

      matches.forEach(function (movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        var item = document.createElement('a');
        item.className = 'movie-card';
        item.href = './movies/' + movie.file;
        item.innerHTML = [
          '<span class="card-cover">',
          '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="cover-shade"></span>',
          '<span class="duration-chip">' + escapeHtml(movie.duration) + '</span>',
          '</span>',
          '<span class="card-body">',
          '<span class="card-meta">' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>',
          '<strong>' + escapeHtml(movie.title) + '</strong>',
          '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
          '<span class="tag-row">' + tags + '</span>',
          '</span>'
        ].join('');
        globalResults.appendChild(item);
      });

      if (globalEmpty) {
        if (matches.length) {
          globalEmpty.classList.remove('show');
        } else {
          globalEmpty.textContent = '没有找到匹配的影片。';
          globalEmpty.classList.add('show');
        }
      }
    }

    globalInput.addEventListener('input', searchMovies);
    if (globalButton) {
      globalButton.addEventListener('click', searchMovies);
    }
  }
})();
