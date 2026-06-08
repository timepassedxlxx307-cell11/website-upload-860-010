(function () {
  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var streamUrl = config.source;
    var bound = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (bound) {
        return;
      }

      bound = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlay() {
      bindStream();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
        hlsInstance.stopLoad();
      }
    });
  };
})();
