(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setStatus(box, message) {
    var status = box.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function initPlayer(box) {
    var video = box.querySelector('video[data-src]');
    var button = box.querySelector('[data-player-toggle]');
    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    var hls = null;

    function markReady() {
      box.classList.add('is-ready');
    }

    function markError(message) {
      box.classList.remove('is-ready');
      setStatus(box, message);
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          markError('网络错误，正在重新加载播放源');
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          markError('媒体错误，正在恢复播放');
          hls.recoverMediaError();
          return;
        }
        markError('播放源暂时无法打开');
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', markReady, { once: true });
    } else {
      video.src = src;
      markError('当前浏览器不支持 HLS，可尝试更换浏览器访问');
    }

    function togglePlay() {
      if (video.paused) {
        video.play().catch(function () {
          markError('浏览器阻止了自动播放，请再次点击播放器');
        });
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
