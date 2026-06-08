(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('.nav-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(next);
                start();
            });
        });
        var hero = document.querySelector('.hero-carousel');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector('.js-filter-input');
            var region = panel.querySelector('.js-region-filter');
            var type = panel.querySelector('.js-type-filter');
            var year = panel.querySelector('.js-year-filter');
            var count = panel.querySelector('.js-visible-count');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }
            function apply() {
                var q = normalize(input && input.value);
                var selectedRegion = normalize(region && region.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var match = true;
                    if (q && haystack.indexOf(q) === -1) {
                        match = false;
                    }
                    if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
                        match = false;
                    }
                    if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
                        match = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
                        match = false;
                    }
                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible;
                }
                var old = scope.querySelector('.no-results');
                if (old) {
                    old.remove();
                }
                if (visible === 0) {
                    var empty = document.createElement('div');
                    empty.className = 'no-results';
                    empty.textContent = '没有找到匹配影片';
                    var grid = scope.querySelector('.js-movie-list');
                    if (grid) {
                        grid.appendChild(empty);
                    }
                }
            }
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var trigger = box.querySelector('.play-trigger');
            var stream = box.getAttribute('data-stream');
            var loaded = false;
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function play() {
                load();
                box.classList.add('is-playing');
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
            if (trigger) {
                trigger.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
