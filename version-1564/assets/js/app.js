(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-slide-dot]'));
        const prev = carousel.querySelector('[data-slide-prev]');
        const next = carousel.querySelector('[data-slide-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const scope = panel.parentElement || document;
        const list = scope.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll('.movie-card'));
        const keywordInput = panel.querySelector('[data-filter-keyword]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const regionSelect = panel.querySelector('[data-filter-region]');
        const typeSelect = panel.querySelector('[data-filter-type]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            const keyword = normalize(keywordInput && keywordInput.value);
            const year = normalize(yearSelect && yearSelect.value);
            const region = normalize(regionSelect && regionSelect.value);
            const type = normalize(typeSelect && typeSelect.value);

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.type,
                    card.textContent
                ].join(' '));
                const cardYear = normalize(card.dataset.year);
                const cardRegion = normalize(card.dataset.region);
                const cardType = normalize(card.dataset.type);
                const matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!year || cardYear === year) &&
                    (!region || cardRegion === region) &&
                    (!type || cardType === type);
                card.classList.toggle('is-filtered-out', !matched);
            });
        }

        [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });
}());
