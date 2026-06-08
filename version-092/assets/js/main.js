(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;

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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
    var active = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var filter = normalize(active);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = filter === "all" || haystack.indexOf(filter) !== -1;
        card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });
})();
