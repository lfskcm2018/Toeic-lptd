/* =========================================================
   TOEIC Recording Engine (standalone, HTTPS domain)
   Chạy độc lập trên GitHub Pages / Cloudflare Pages.
   Giao tiếp với ứng dụng TOEIC chính (GAS) qua window.postMessage().

   Luồng:
   1. Nhận message từ parent: {type: 'START_RECORDING', sessionId, itemIndex}
   2. Yêu cầu micro → MediaRecorder → ghi âm
   3. Khi dừng: chuyển blob → base64 → gửi về parent qua postMessage
   4. Parent (GAS) tiếp nhận và lưu trữ audio
   ========================================================= */

(function () {
  'use strict';

  var state = {
    recorder: null,
    stream: null,
    chunks: [],
    blob: null,
    base64: null,
    sessionId: null,
    itemIndex: null,
    isRecording: false,
    audioEl: null
  };

  var els = {
    btnStart: document.getElementById('btnStart'),
    btnStop: document.getElementById('btnStop'),
    btnPlay: document.getElementById('btnPlay'),
    btnSend: document.getElementById('btnSend'),
    btnReRecord: document.getElementById('btnReRecord'),
    status: document.getElementById('reStatus'),
    info: document.getElementById('reInfo'),
    waveform: document.getElementById('reWaveform')
  };

  function setStatus(msg, cls) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.className = 're-status' + (cls ? ' ' + cls : '');
  }

  function setInfo(msg) {
    if (!els.info) return;
    els.info.innerHTML = '<div>' + msg + '</div>';
  }

  function enable(btn, flag) {
    if (btn) btn.disabled = !flag;
  }

  function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function blobToBase64(blob, cb) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () {
      cb(arrayBufferToBase64(reader.result));
    };
  }

  function sendToParent(data) {
    if (window.opener) {
      window.opener.postMessage(data, '*');
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(data, '*');
    } else {
      console.warn('[RE] No parent/opener to send message to.');
    }
  }

  /* ---------- Recording ---------- */
  async function reStart() {
    try {
      setStatus('Đang yêu cầu quyền micro…', 'warn');
      enable(els.btnStart, false);

      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.stream = stream;

      var recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      state.recorder = recorder;
      state.chunks = [];
      state.isRecording = true;

      recorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) state.chunks.push(e.data);
      };

      recorder.onstop = function () {
        state.stream.getTracks().forEach(function (t) { t.stop(); });
        state.isRecording = false;
        var blob = new Blob(state.chunks, { type: 'audio/webm' });
        state.blob = blob;

        blobToBase64(blob, function (base64) {
          state.base64 = base64;
          setStatus('Đã ghi xong (' + Math.round(blob.size / 1024) + ' KB)', 'ok');
          setInfo('Kích thước: ' + Math.round(blob.size / 1024) + ' KB · Loại: audio/webm');
          enable(els.btnStop, false);
          enable(els.btnPlay, true);
          enable(els.btnSend, true);
          enable(els.btnReRecord, true);
          enable(els.btnStart, false);
          drawWaveform();
        });
      };

      recorder.onerror = function (e) {
        console.error('[RE] MediaRecorder error', e);
        setStatus('Lỗi MediaRecorder: ' + e.message, 'err');
        enable(els.btnStart, true);
      };

      recorder.start(200);
      setStatus('Đang ghi âm… Hãy nói vào micro.', 'rec');
      enable(els.btnStop, true);
      enable(els.btnPlay, false);
      enable(els.btnSend, false);
      enable(els.btnReRecord, false);
      setInfo('Đang thu âm…');

    } catch (err) {
      console.error('[RE] getUserMedia error', err);
      setStatus('Không truy cập được micro: ' + err.message, 'err');
      enable(els.btnStart, true);
    }
  }

  function reStop() {
    if (state.recorder && state.recorder.state === 'recording') {
      state.recorder.stop();
    } else {
      setStatus('Không có phiên ghi âm nào đang chạy.', 'warn');
    }
  }

  function rePlay() {
    if (!state.blob) return;
    var url = URL.createObjectURL(state.blob);
    if (state.audioEl) state.audioEl.pause();
    state.audioEl = new Audio(url);
    state.audioEl.play().catch(function (e) {
      console.error('[RE] Play error', e);
      setStatus('Không phát được bản ghi: ' + e.message, 'err');
    });
    state.audioEl.onended = function () {
      URL.revokeObjectURL(url);
    };
    setStatus('Đang phát lại bản ghi…', 'info');
  }

  function reReRecord() {
    state.blob = null;
    state.base64 = null;
    state.chunks = [];
    if (state.audioEl) {
      state.audioEl.pause();
      state.audioEl = null;
    }
    setStatus('Sẵn sàng ghi lại.', 'warn');
    setInfo('Chưa có bản ghi nào.');
    enable(els.btnStart, true);
    enable(els.btnStop, false);
    enable(els.btnPlay, false);
    enable(els.btnSend, false);
    enable(els.btnReRecord, false);
    els.waveform.innerHTML = '';
  }

  function reSendToParent() {
    if (!state.base64 || !state.sessionId || state.itemIndex == null) {
      setStatus('Thiếu dữ liệu để gửi.', 'err');
      return;
    }

    var msg = {
      type: 'RECORDING_READY',
      sessionId: state.sessionId,
      itemIndex: state.itemIndex,
      audioBase64: state.base64,
      mimeType: state.blob ? state.blob.type : 'audio/webm',
      size: state.blob ? state.blob.size : 0,
      ts: new Date().toISOString()
    };

    sendToParent(msg);
    setStatus('Đã gửi yêu cầu về ứng dụng chính…', 'info');
    setInfo('Đang chờ phản hồi từ ứng dụng TOEIC chính…');
  }

  /* ---------- Waveform (visual only) ---------- */
  function drawWaveform() {
    if (!state.blob) return;
    var barCount = 30;
    var html = '';
    for (var i = 0; i < barCount; i++) {
      var h = 10 + Math.random() * 40;
      html += '<div class="re-bar" style="height:' + h + 'px"></div>';
    }
    els.waveform.innerHTML = html;
  }

  /* ---------- postMessage listener (from parent/GAS) ---------- */
  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (!data.type) return;

    switch (data.type) {
      case 'START_RECORDING':
        state.sessionId = data.sessionId || null;
        state.itemIndex = data.itemIndex != null ? data.itemIndex : null;
        setStatus('Nhận lệnh từ ứng dụng chính. Bắt đầu ghi âm…', 'info');
        setInfo('Item #' + state.itemIndex + ' · Session: ' + (state.sessionId || '-'));
        reStart();
        break;

      case 'STOP_RECORDING':
        reStop();
        break;

      case 'PLAY_RECORDING':
        rePlay();
        break;

      case 'RECORDING_CLEAR':
        reReRecord();
        break;

      default:
        break;
    }
  });

  function announceReady() {
    sendToParent({ type: 'RE_ENGINE_READY', ts: new Date().toISOString() });
  }

  setTimeout(announceReady, 500);

})();