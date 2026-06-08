(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function matchesItem(item, query) {
    var text = [item.t, item.g, item.r, item.y, item.c].join(" ").toLowerCase();
    return text.indexOf(query.toLowerCase()) !== -1;
  }

  function renderMiniResults(input, panel) {
    var query = input.value.trim();
    if (!query || typeof SITE_SEARCH_INDEX === "undefined") {
      panel.innerHTML = "";
      panel.classList.remove("is-open");
      return;
    }

    var results = SITE_SEARCH_INDEX.filter(function (item) {
      return matchesItem(item, query);
    }).slice(0, 8);

    if (!results.length) {
      panel.innerHTML = '<a href="./search.html?q=' + encodeURIComponent(query) + '"><strong>查看完整搜索</strong><small>输入更多关键词试试</small></a>';
      panel.classList.add("is-open");
      return;
    }

    panel.innerHTML = results.map(function (item) {
      return '<a href="' + item.u + '"><strong>' + item.t + '</strong><small>' + item.y + ' · ' + item.r + ' · ' + item.c + '</small></a>';
    }).join("");
    panel.classList.add("is-open");
  }

  function initSearchBoxes() {
    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var form = input.closest("form");
      var panel = form ? form.querySelector("[data-search-results]") : null;
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        renderMiniResults(input, panel);
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("mainNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    function show(nextIndex) {
      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initLocalFilters() {
    var buttons = document.querySelectorAll("[data-filter]");
    var cards = document.querySelectorAll("[data-card]");
    if (!buttons.length || !cards.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter");
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || ""
          ].join(" ");
          if (filter === "all" || haystack.indexOf(filter) !== -1) {
            card.classList.remove("hidden-card");
          } else {
            card.classList.add("hidden-card");
          }
        });
      });
    });
  }

  function initSearchPage() {
    var container = document.querySelector("[data-search-page-results]");
    var input = document.querySelector("[data-search-page-input]");
    if (!container || !input || typeof SITE_SEARCH_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function draw(value) {
      var text = value.trim();
      if (!text) {
        container.innerHTML = "";
        return;
      }
      var results = SITE_SEARCH_INDEX.filter(function (item) {
        return matchesItem(item, text);
      }).slice(0, 120);
      if (!results.length) {
        container.innerHTML = '<div class="content-card"><p>没有找到匹配内容。</p></div>';
        return;
      }
      container.innerHTML = results.map(function (item) {
        return '<a class="side-link" href="' + item.u + '"><img src="' + item.i + '" alt="' + item.t + '"><span><strong>' + item.t + '</strong><span>' + item.y + ' · ' + item.r + ' · ' + item.c + '</span></span></a>';
      }).join("");
    }

    draw(query);
    input.addEventListener("input", function () {
      draw(input.value);
    });
  }

  ready(function () {
    initMenu();
    initSearchBoxes();
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
