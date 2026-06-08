const assetBase = new URL('.', document.currentScript.src);

function toggleMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  let index = 0;

  function activate(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => activate(dotIndex));
  });

  window.setInterval(() => activate(index + 1), 5200);
}

function setupFilters() {
  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-year-filter]');
    const region = panel.querySelector('[data-region-filter]');
    const reset = panel.querySelector('[data-reset-filter]');
    const list = panel.parentElement.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.children);

    if (panel.hasAttribute('data-query-from-url') && input) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');

      if (query) {
        input.value = query;
      }
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      const q = normalize(input ? input.value : '');
      const selectedYear = normalize(year ? year.value : '');
      const selectedRegion = normalize(region ? region.value : '');

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));

        const matchesQuery = !q || haystack.includes(q);
        const matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        const matchesRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
        card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear && matchesRegion));
      });
    }

    [input, year, region].forEach((element) => {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) {
          input.value = '';
        }

        if (year) {
          year.value = '';
        }

        if (region) {
          region.value = '';
        }

        applyFilter();
      });
    }

    applyFilter();
  });
}

async function attachHls(video, source) {
  if (!video || !source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  try {
    const moduleUrl = new URL('hls-dru42stk.js', assetBase);
    const module = await import(moduleUrl.href);
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
  } catch (error) {
    video.dataset.playerError = 'hls-module';
  }

  video.src = source;
}

function setupPlayers() {
  document.querySelectorAll('.movie-player').forEach((video) => {
    const source = video.dataset.hls;
    const overlay = video.parentElement.querySelector('[data-play-overlay]');
    let initialized = false;

    async function startPlayback() {
      if (!initialized) {
        initialized = true;
        await attachHls(video, source);
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.setAttribute('controls', 'controls');
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  toggleMobileMenu();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
});
