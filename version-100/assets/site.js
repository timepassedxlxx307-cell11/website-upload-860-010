(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    initHero();
    initSearch();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) {
      return;
    }
    var queryInput = document.getElementById("search-input");
    var typeFilter = document.getElementById("type-filter");
    var regionFilter = document.getElementById("region-filter");
    var yearFilter = document.getElementById("year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("#search-results .movie-card"));
    var emptyState = document.getElementById("empty-state");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function regionGroup(value) {
      var text = String(value || "");
      if (/中国|大陆|香港|台湾|华语/.test(text)) {
        return "华语";
      }
      if (/日本|韩国|泰国|印度|亚洲/.test(text)) {
        return "日韩亚洲";
      }
      if (/美国|英国|法国|德国|西班牙|俄罗斯|意大利|澳大利亚|加拿大|欧洲/.test(text)) {
        return "欧美";
      }
      return "其他地区";
    }

    function typeGroup(value) {
      var text = String(value || "");
      if (/电影/.test(text)) {
        return "电影";
      }
      if (/剧|TV|电视/.test(text)) {
        return "剧集";
      }
      if (/动画|动漫/.test(text)) {
        return "动画";
      }
      if (/纪录/.test(text)) {
        return "纪录片";
      }
      if (/综艺/.test(text)) {
        return "综艺";
      }
      return text;
    }

    function applyFilters() {
      var query = normalize(queryInput ? queryInput.value : "");
      var typeValue = typeFilter ? typeFilter.value : "";
      var regionValue = regionFilter ? regionFilter.value : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) >= 0;
        var matchesType = !typeValue || typeGroup(card.getAttribute("data-type")) === typeValue;
        var matchesRegion = !regionValue || regionGroup(card.getAttribute("data-region")) === regionValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var show = matchesQuery && matchesType && matchesRegion && matchesYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [queryInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("main-video");
    var trigger = document.getElementById("play-trigger");
    var hls;
    var loaded = false;

    if (!video || !trigger || !source) {
      return;
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          trigger.classList.remove("is-hidden");
        });
      }
    }

    function load() {
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        playVideo();
        return;
      }
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
    }

    function start() {
      trigger.classList.add("is-hidden");
      load();
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      trigger.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
