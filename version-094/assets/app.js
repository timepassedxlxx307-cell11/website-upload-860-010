(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function setupHeaderSearch() {
    $all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function cardHtml(movie) {
    var cover = './' + movie.cover + '.jpg';
    return [
      '<article class="movie-card">',
      '<a class="card-cover" href="' + movie.url + '" style="--cover: url(\'' + cover + '\');" aria-label="' + escapeHtml(movie.title) + '">',
      '<span class="badge badge-dark">' + escapeHtml(movie.type) + '</span>',
      '<span class="badge badge-accent">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-mark">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var input = $('#searchInput');
    var button = $('#searchButton');
    var results = $('#searchResults');
    var title = $('#searchTitle');
    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        title.textContent = '推荐片单';
        results.innerHTML = window.MOVIE_INDEX.slice(0, 24).map(cardHtml).join('');
        return;
      }
      var terms = query.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      }).slice(0, 120);
      title.textContent = '搜索结果';
      if (!matched.length) {
        results.innerHTML = '<div class="search-empty">未找到匹配影片</div>';
        return;
      }
      results.innerHTML = matched.map(cardHtml).join('');
    }

    input.addEventListener('input', render);
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  window.initPlayer = function (options) {
    var video = $('#moviePlayer');
    var cover = $('[data-play]');
    if (!video || !options || !options.source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('hidden');
          }
        });
      }
    }

    if (options.poster) {
      video.poster = options.poster;
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupSearchPage();
  });
})();
