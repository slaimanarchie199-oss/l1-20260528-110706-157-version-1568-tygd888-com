(function () {
  function $(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.hasAttribute("hidden");
      if (isOpen) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  function setupHero() {
    $(".hero-slider").forEach(function (slider) {
      var slides = $(".hero-slide", slider);
      var dots = $(".hero-dot", slider);
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      if (slides.length < 2) {
        return;
      }
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("active");
      }));
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
          slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }
      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      slider.addEventListener("mouseenter", function () {
        if (timer) {
          clearInterval(timer);
        }
      });
      slider.addEventListener("mouseleave", restart);
      show(index);
      restart();
    });
  }

  function setupFilters() {
    $(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector(".filter-input");
      var cards = $(".filterable-card", scope);
      var empty = scope.querySelector(".filter-empty");
      if (!input || !cards.length) {
        return;
      }
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-filter"));
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });
  }

  function renderSearchPage() {
    var container = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!container || !input || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var keyword = normalize(input.value);
      if (!keyword) {
        container.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签，快速查找想看的影片。</div>';
        return;
      }
      var results = window.MOVIE_INDEX.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags + " " + item.oneLine).indexOf(keyword) !== -1;
      });
      if (!results.length) {
        container.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
        return;
      }
      container.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + escapeHtml(item.url) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span>' +
          '<h2>' + escapeHtml(item.title) + '</h2>' +
          '<span class="result-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</span>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '</span>' +
          '</a>';
      }).join("");
    }
    input.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (id, url) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var button = shell.querySelector(".play-button");
    var message = shell.querySelector(".player-message");
    var hls = null;
    var started = false;
    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }
    function requestPlay() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }
    function start() {
      if (started) {
        requestPlay();
        return;
      }
      started = true;
      shell.classList.add("is-playing");
      video.controls = true;
      setMessage("");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.load();
        requestPlay();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 45
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(url);
          requestPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setMessage("播放加载遇到异常，请稍后再试。");
          }
        });
      } else {
        video.src = url;
        video.load();
        requestPlay();
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    renderSearchPage();
  });
})();
