
(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", panel.classList.contains("is-open"));
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    window.location.href = "./library.html";
                    return;
                }
                event.preventDefault();
                window.location.href = "./library.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!input && !year) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var movieYear = card.getAttribute("data-year") || "";
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !selectedYear || movieYear === selectedYear;
                var matched = matchedQuery && matchedYear;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-overlay");
            var stream = player.getAttribute("data-stream");
            var loaded = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }

            function start() {
                load();
                player.classList.add("is-playing");
                var playAction = video.play();
                if (playAction && typeof playAction.catch === "function") {
                    playAction.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });

            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
