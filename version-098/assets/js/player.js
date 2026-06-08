(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-player-overlay]");
    var button = root.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function begin() {
      if (!stream) {
        return;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      video.muted = false;

      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
