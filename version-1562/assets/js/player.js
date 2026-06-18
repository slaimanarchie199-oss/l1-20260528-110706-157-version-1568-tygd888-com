var hlsLibraryPromise = null;

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (!hlsLibraryPromise) {
    hlsLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.5/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('hls unavailable'));
        }
      };
      script.onerror = function () {
        reject(new Error('hls unavailable'));
      };
      document.head.appendChild(script);
    });
  }

  return hlsLibraryPromise;
}

function bindPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-player-button]');
  var status = shell.querySelector('[data-player-status]');
  var videoUrl = shell.getAttribute('data-video-url');
  var ready = false;
  var hlsInstance = null;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function attachSource() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;
    setStatus('正在加载高清片源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败，请刷新后重试');
          }
        });
      } else {
        video.src = videoUrl;
      }
    });
  }

  function playVideo() {
    attachSource().then(function () {
      shell.classList.add('playing');
      setStatus('正在播放');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          shell.classList.remove('playing');
          setStatus('点击播放高清片源');
        });
      }
    }).catch(function () {
      ready = false;
      shell.classList.remove('playing');
      setStatus('播放加载失败，请刷新后重试');
    });
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    shell.classList.add('playing');
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      setStatus('已暂停');
    }
  });

  video.addEventListener('ended', function () {
    shell.classList.remove('playing');
    setStatus('播放结束');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(bindPlayer);
