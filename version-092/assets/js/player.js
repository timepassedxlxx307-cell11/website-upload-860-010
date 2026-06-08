(function () {
  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      loaded = true;
    }

    function startPlayback() {
      attachSource();
      overlay.classList.add("is-hidden");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
