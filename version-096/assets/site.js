(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    uniqueSorted(values).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupLocalFilters() {
    var cards = Array.from(document.querySelectorAll(".filter-card"));
    var input = document.querySelector(".filter-input");
    var typeSelect = document.querySelector('.filter-select[data-filter-field="type"]');
    var yearSelect = document.querySelector('.filter-select[data-filter-field="year"]');
    var empty = document.querySelector(".empty-state");

    if (!cards.length || (!input && !typeSelect && !yearSelect)) {
      return;
    }

    fillSelect(typeSelect, cards.map(function (card) {
      return card.getAttribute("data-type");
    }));

    fillSelect(yearSelect, cards.map(function (card) {
      return card.getAttribute("data-year");
    }));

    function apply() {
      var query = normalize(input ? input.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
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
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || normalize(card.getAttribute("data-type")) === type;
        var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
        var show = matchQuery && matchType && matchYear;

        card.classList.toggle("is-filter-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function createMovieCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a href="./' + movie.file + '" aria-label="' + escapeHTML(movie.title) + '">',
      '<div class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '<span class="poster-year">' + escapeHTML(movie.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHTML(movie.title) + '</h3>',
      '<p>' + escapeHTML(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHTML(movie.region) + '</span>',
      '<span>' + escapeHTML(movie.genre) + '</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join("");
    return article;
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupGlobalSearch() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var results = document.getElementById("searchResults");

    if (!data.length || !results) {
      return;
    }

    var heroInput = document.getElementById("globalSearchInput");
    var liveInput = document.getElementById("liveSearchInput");
    var typeSelect = document.getElementById("searchTypeSelect");
    var yearSelect = document.getElementById("searchYearSelect");
    var empty = document.getElementById("searchEmpty");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (heroInput) {
      heroInput.value = initialQuery;
    }

    if (liveInput) {
      liveInput.value = initialQuery;
    }

    fillSelect(typeSelect, data.map(function (movie) {
      return movie.type;
    }));

    fillSelect(yearSelect, data.map(function (movie) {
      return movie.year;
    }));

    function render() {
      var query = normalize(liveInput ? liveInput.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var matches = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return (!query || haystack.indexOf(query) !== -1) &&
          (!type || normalize(movie.type) === type) &&
          (!year || normalize(movie.year) === year);
      }).slice(0, 96);

      results.innerHTML = "";
      matches.forEach(function (movie) {
        results.appendChild(createMovieCard(movie));
      });

      if (empty) {
        empty.classList.toggle("is-visible", matches.length === 0);
      }
    }

    [liveInput, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", render);
        element.addEventListener("change", render);
      }
    });

    if (initialQuery) {
      render();
    }
  }

  ready(function () {
    setupMenu();
    setupLocalFilters();
    setupGlobalSearch();
  });
})();
