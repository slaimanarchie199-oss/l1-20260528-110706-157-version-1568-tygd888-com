(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (navButton && nav) {
    navButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(current - 1);
          startTimer();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          setSlide(current + 1);
          startTimer();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setSlide(index);
          startTimer();
        });
      });
      startTimer();
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");
  var emptyMessage = document.querySelector("[data-empty-message]");

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    filterInput.addEventListener("input", function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.hidden = visible !== 0;
      }
    });
  }

  function initializePlayer(shell) {
    var video = shell.querySelector("video");
    var trigger = shell.querySelector("[data-play-trigger]");
    var stream = shell.getAttribute("data-stream");
    var hls = null;
    var ready = false;

    function showError() {
      shell.classList.remove("is-playing");
      if (trigger) {
        trigger.innerHTML = "<span class=\"play-circle\">▶</span><span>播放加载失败</span>";
      }
    }

    function loadStream() {
      if (!video || !stream) {
        showError();
        return;
      }

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;
      shell.classList.add("is-playing");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showError();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = stream;
        video.play().catch(function () {
          showError();
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", loadStream);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          loadStream();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initializePlayer);
})();
