(function () {
  const toggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCardFilters() {
    const textInput = document.querySelector('[data-card-filter]');
    const selects = Array.from(document.querySelectorAll('[data-filter-field]'));
    const emptyState = document.querySelector('[data-empty-state]');

    if (!textInput && selects.length === 0) {
      return;
    }

    const selector = textInput ? textInput.getAttribute('data-card-filter') : '.movie-card';
    const cards = Array.from(document.querySelectorAll(selector));

    function applyFilters() {
      const query = normalize(textInput ? textInput.value : '');
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        const textMatches = !query || haystack.indexOf(query) !== -1;
        const selectMatches = selects.every(function (select) {
          const field = select.getAttribute('data-filter-field');
          const value = normalize(select.value);
          return !value || normalize(card.dataset[field]).indexOf(value) !== -1;
        });

        const show = textMatches && selectMatches;
        card.style.display = show ? '' : 'none';
        if (show) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }

  function cardHtml(movie) {
    const tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="movie/' + movie.id + '.html" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ')) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + movie.image_no + '.jpg" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '    <div class="poster-overlay"><span class="play-dot">▶</span></div>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <div class="tag-row">' + tags + '</div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p class="movie-line">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span class="rating">★ ' + movie.rating.toFixed(1) + '</span></div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    const app = document.querySelector('[data-search-app]');

    if (!app || !window.MOVIE_DATA) {
      return;
    }

    const input = app.querySelector('[data-search-input]');
    const typeSelect = app.querySelector('[data-search-type]');
    const yearSelect = app.querySelector('[data-search-year]');
    const results = app.querySelector('[data-search-results]');
    const count = app.querySelector('[data-search-count]');

    function runSearch() {
      const keyword = normalize(input.value);
      const typeValue = normalize(typeSelect.value);
      const yearValue = normalize(yearSelect.value);

      const filtered = window.MOVIE_DATA.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.one_line,
          (movie.tags || []).join(' ')
        ].join(' '));
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchType = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1 || normalize(movie.genre).indexOf(typeValue) !== -1;
        const matchYear = !yearValue || normalize(movie.year) === yearValue;
        return matchKeyword && matchType && matchYear;
      }).slice(0, 120);

      results.innerHTML = filtered.map(cardHtml).join('\n');
      count.textContent = '找到 ' + filtered.length + ' 部影片' + (filtered.length === 120 ? '（最多显示前 120 部）' : '');
    }

    input.addEventListener('input', runSearch);
    typeSelect.addEventListener('change', runSearch);
    yearSelect.addEventListener('change', runSearch);

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword');
    if (keyword) {
      input.value = keyword;
      runSearch();
    }
  }

  setupCardFilters();
  setupSearchPage();
})();
