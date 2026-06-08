import { H as Hls } from './hls-dru42stk.js';

function setStatus(container, message) {
  const status = container.querySelector('[data-video-status]');
  if (status) {
    status.textContent = message;
  }
}

function attachSource(video, src, container) {
  if (!src) {
    setStatus(container, '未找到播放源');
    return null;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    setStatus(container, '正在使用浏览器原生播放能力');
    return null;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(container, '播放源已加载，正在准备播放');
    });

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setStatus(container, '播放源加载失败，请刷新或切换浏览器');
        hls.destroy();
      }
    });

    return hls;
  }

  video.src = src;
  setStatus(container, '当前浏览器可能不支持该播放源，请使用 Chrome、Safari 或 Edge');
  return null;
}

function setupPlayer(container) {
  const video = container.querySelector('video');
  const playButton = container.querySelector('[data-play]');
  let hlsInstance = null;
  let initialized = false;

  async function play() {
    if (!video) {
      return;
    }

    const sourceButton = document.querySelector('.source-button.is-active');
    const src = sourceButton ? sourceButton.dataset.src : container.dataset.src;

    if (!initialized) {
      hlsInstance = attachSource(video, src, container);
      initialized = true;
    }

    if (playButton) {
      playButton.classList.add('is-hidden');
    }

    try {
      await video.play();
      setStatus(container, '正在播放');
    } catch (error) {
      setStatus(container, '已加载播放源，请再次点击视频播放');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    setStatus(container, '播放已暂停');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
