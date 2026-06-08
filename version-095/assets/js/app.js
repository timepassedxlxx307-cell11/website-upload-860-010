
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var scope = form.closest(".section-inner") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var keyword = form.querySelector("[data-filter-keyword]");
            var type = form.querySelector("[data-filter-type]");
            var region = form.querySelector("[data-filter-region]");
            var year = form.querySelector("[data-filter-year]");

            function includesAny(value, terms) {
                if (!terms) {
                    return true;
                }
                var list = terms.split(/\s+/).filter(Boolean);
                if (!list.length) {
                    return true;
                }
                return list.some(function (term) {
                    return value.indexOf(term) !== -1;
                });
            }

            function apply() {
                var q = keyword ? keyword.value.trim().toLowerCase() : "";
                var t = type ? type.value : "";
                var r = region ? region.value : "";
                var y = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;
                    if (q && search.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (t && cardType.indexOf(t) === -1) {
                        matched = false;
                    }
                    if (r && !includesAny(cardRegion, r)) {
                        matched = false;
                    }
                    if (y && !includesAny(cardYear, y)) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("reset", function () {
                window.setTimeout(apply, 0);
            });
            apply();
        });
    }

    window.initPlayer = function (videoId, buttonId, boxId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var box = document.getElementById(boxId);
        var hls = null;
        var started = false;

        if (!video || !button || !box || !source) {
            return;
        }

        function attach() {
            if (started) {
                return Promise.resolve();
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function play() {
            button.classList.add("is-hidden");
            attach().then(function () {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            });
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            play();
        });

        box.addEventListener("click", function (event) {
            if (event.target === button || button.contains(event.target)) {
                return;
            }
            if (!started) {
                play();
            }
        });

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
}());
