/* =========================================================
   TOEIC Recording Engine v2 — popup ghi âm độc lập (Approach A)
   Chạy trên GitHub Pages / bất kỳ hosting HTTPS tĩnh nào.
   Giao tiếp với web app (GAS iframe) qua window.postMessage().

   Vì sao tồn tại trang này:
     Web app GAS chạy trong iframe sandbox không có allow="microphone"
     → Chrome chặn getUserMedia + Web Speech API
       ("Permissions policy violation: microphone is not allowed").
     Popup này là tài liệu top-level → micro + nhận giọng nói hoạt động.

   Giao thức postMessage (app → engine):
     START_RECORDING  { sessionId, itemIndex, targetText, autoSend }
     STOP_RECORDING   {}
     START_RECOGNITION{ sessionId, itemIndex, targetText }
     RECORDING_CLEAR  {}

   Giao thức postMessage (engine → app, gửi về window.opener):
     RE_ENGINE_READY  { version }
     RECORDING_STARTED{ sessionId, itemIndex }
     RECORDING_READY  { sessionId, itemIndex, audioBase64, mimeType,
                         size, durationMs, transcript }
     RECORDING_ERROR  { sessionId, itemIndex, error }
     RECOGNITION_READY{ sessionId, itemIndex, transcript }
     RECOGNITION_ERROR{ sessionId, itemIndex, error }
   ========================================================= */

(function () {
  'use strict';

  var SR_CLASS = window.SpeechRecognition || window.webkitSpeechRecognition;
  var MAX_RECORD_MS = 20000;   // tự dừng sau 20s cho an toàn
  var FINALIZE_GRACE_MS = 900;  // chờ Web Speech trả kết quả cuối

  var state = {
    mode: 'idle',              // 'idle' | 'recording' | 'recognizing' | 'ready'
    recorder: null,
    stream: null,
    chunks: [],
    blob: null,
    base64: null,
    mimeType: 'audio/webm',
    sessionId: null,
    itemIndex: null,
    targetText: '',
    transcript: '',
    recognition: null,
    recStartedAt: 0,
    finalizeTimer: null,
    autoStopTimer: null,
    sent: false,
    audioEl: null,
  };

  var els = {
    btnStart: document.getElementById('btnStart'),
    btnStop: document.getElementById('btnStop'),
    btnPlay: document.getElementById('btnPlay'),
    btnSend: document.getElementById('btnSend'),
    btnReRecord: document.getElementById('btnReRecord'),
    status: document.getElementById('reStatus'),
    info: document.getElementById('reInfo'),
    waveform: document.getElementById('reWaveform'),
    target: document.getElementById('reTarget'),
    targetText: document.getElementById('reTargetText'),
    transcript: document.getElementById('reTranscript'),
    transcriptText: document.getElementById('reTranscriptText'),
  };

  /* ---------- Helpers ---------- */
  function setStatus(msg, cls) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.className = 're-status' + (cls ? ' ' + cls : '');
  }

  function setInfo(msg) {
    if (!els.info) return;
    els.info.innerHTML = '<div>' + msg + '</div>';
  }

  function setTarget(text) {
    state.targetText = String(text || '');
    if (!els.target || !els.targetText) return;
    if (state.targetText) {
      els.targetText.textContent = state.targetText;
      els.target.hidden = false;
    } else {
      els.target.hidden = true;
    }
  }

  function showTranscript(text) {
    if (!els.transcript || !els.transcriptText) return;
    if (text) {
      els.transcriptText.textContent = text;
      els.transcript.hidden = false;
    }
  }

  function enable(btn, flag) {
    if (btn) btn.disabled = !flag;
  }

  function resetButtons(recording) {
    enable(els.btnStart, !recording);
    enable(els.btnStop, recording);
    enable(els.btnPlay, !recording && !!state.blob);
    enable(els.btnSend, !recording && !!state.base64);
    enable(els.btnReRecord, !recording && !!state.blob);
  }

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var CHUNK = 0x8000; // 32764 bytes mỗi lượt, tránh tràn stack
    var parts = [];
    for (var i = 0; i < bytes.length; i += CHUNK) {
      parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK)));
    }
    return window.btoa(parts.join(''));
  }

  function blobToBase64(blob, cb) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () { cb(arrayBufferToBase64(reader.result)); };
    reader.onerror = function () { cb(''); };
  }

  function sendToParent(data) {
    var target = null;
    if (window.opener && !window.opener.closed) target = window.opener;
    else if (window.parent && window.parent !== window) target = window.parent;
    if (!target) {
      console.warn('[RE] Không có cửa sổ ứng dụng chính để gửi kết quả.');
      return;
    }
    try { target.postMessage(data, '*'); } catch (e) {
      console.error('[RE] postMessage lỗi:', e);
    }
  }

  function sendRecordError(msg) {
    setStatus('Lỗi: ' + msg, 'err');
    sendToParent({
      type: 'RECORDING_ERROR',
      sessionId: state.sessionId,
      itemIndex: state.itemIndex,
      error: msg,
      ts: new Date().toISOString(),
    });
  }

  /* ---------- Web Speech (chấm % trong popup) ---------- */
  function startRecognitionInternal() {
    if (!SR_CLASS) return null;
    try {
      var r = new SR_CLASS();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            var t = e.results[i][0] ? e.results[i][0].transcript : '';
            if (t) {
              state.transcript = (state.transcript + ' ' + t).replace(/\s+/g, ' ').trim();
              showTranscript(state.transcript);
            }
          }
        }
      };
      r.onerror = function (e) {
        console.warn('[RE] SpeechRecognition error:', e.error);
        /* 'no-speech' / 'network' thường tự phục hồi bằng cách restart */
        if (state.mode === 'recognizing') {
          state.mode = 'idle';
          sendToParent({
            type: 'RECOGNITION_ERROR',
            sessionId: state.sessionId,
            itemIndex: state.itemIndex,
            error: e.error || 'speech-error',
            ts: new Date().toISOString(),
          });
          setStatus('Lỗi nhận giọng nói: ' + e.error, 'err');
          enable(els.btnStart, true);
        }
      };
      r.onend = function () {
        state.recognition = null;
        if (state.mode === 'recording') {
          /* Chrome SR tự dừng sau im lặng → restart để nghe tiếp */
          setTimeout(function () {
            if (state.mode === 'recording') startRecognitionInternal();
          }, 250);
        } else if (state.mode === 'recognizing') {
          /* chế độ chỉ nhận giọng nói (nút Chấm % bên app) */
          state.mode = 'idle';
          if (state.transcript) {
            sendToParent({
              type: 'RECOGNITION_READY',
              sessionId: state.sessionId,
              itemIndex: state.itemIndex,
              transcript: state.transcript,
              ts: new Date().toISOString(),
            });
            setStatus('Đã nhận giọng nói ✓', 'ok');
          } else {
            sendToParent({
              type: 'RECOGNITION_ERROR',
              sessionId: state.sessionId,
              itemIndex: state.itemIndex,
              error: 'no-speech',
              ts: new Date().toISOString(),
            });
            setStatus('Không nhận được giọng nói.', 'warn');
          }
          enable(els.btnStart, true);
        } else if (state.finalizeTimer) {
          /* ghi âm đã dừng, SR vừa trả nốt kết quả → gửi ngay */
          clearTimeout(state.finalizeTimer);
          state.finalizeTimer = null;
          finalizeAndSend();
        }
      };
      r.start();
      state.recognition = r;
      return r;
    } catch (e) {
      console.warn('[RE] Không mở được SpeechRecognition:', e.message);
      return null;
    }
  }

  function stopRecognition() {
    if (state.recognition) {
      try { state.recognition.stop(); } catch (e) {}
      state.recognition = null;
    }
  }

  /* ---------- Ghi âm ---------- */
  function pickMimeType() {
    var list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', ''];
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
    for (var i = 0; i < list.length; i++) {
      if (!list[i] || MediaRecorder.isTypeSupported(list[i])) return list[i];
    }
    return '';
  }

  function stopStream() {
    if (state.stream) {
      try { state.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      state.stream = null;
    }
  }

  async function reStart() {
    if (state.mode === 'recording') { reStop(); return; }
    try {
      setStatus('Đang yêu cầu quyền micro…', 'warn');
      resetButtons(true);
      state.blob = null;
      state.base64 = null;
      state.chunks = [];
      state.transcript = '';
      state.sent = false;
      if (els.transcript) els.transcript.hidden = true;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        sendRecordError('Trình duyệt không hỗ trợ getUserMedia (cần HTTPS + Chrome/Edge).');
        resetButtons(false);
        return;
      }

      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.stream = stream;
      state.recStartedAt = Date.now();
      state.mimeType = pickMimeType();

      var options = state.mimeType ? { mimeType: state.mimeType } : undefined;
      var recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream); // fallback không mimeType
        state.mimeType = recorder.mimeType || 'audio/webm';
      }
      state.recorder = recorder;
      state.mode = 'recording';

      recorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) state.chunks.push(e.data);
      };

      recorder.onstop = function () {
        state.mode = 'ready';
        stopStream();
        state.blob = new Blob(state.chunks, { type: state.mimeType || 'audio/webm' });
        state.mimeType = state.blob.type || state.mimeType;
        setStatus('Đã ghi xong (' + Math.round(state.blob.size / 1024) + ' KB)', 'ok');
        setInfo('Kích thước: ' + Math.round(state.blob.size / 1024) + ' KB · Loại: ' + state.mimeType);
        blobToBase64(state.blob, function (b64) {
          state.base64 = b64;
          resetButtons(false);
          drawWaveform();
        });
        /* đợi Web Speech trả nốt kết quả rồi tự gửi */
        if (!state.sent) {
          state.finalizeTimer = setTimeout(function () {
            state.finalizeTimer = null;
            finalizeAndSend();
          }, FINALIZE_GRACE_MS);
        }
      };

      recorder.onerror = function (e) {
        sendRecordError('MediaRecorder: ' + (e && e.message ? e.message : 'lỗi không xác định'));
        state.mode = 'idle';
        resetButtons(false);
      };

      recorder.start(200);
      setStatus('Đang ghi âm… Hãy nói vào micro.', 'rec');
      setInfo('Đang thu âm… đọc to câu cần shadowing.');
      if (els.waveform) els.waveform.hidden = false;
      drawWaveform(true);

      /* chạy song song Web Speech để có transcript chấm % */
      startRecognitionInternal();

      sendToParent({
        type: 'RECORDING_STARTED',
        sessionId: state.sessionId,
        itemIndex: state.itemIndex,
        ts: new Date().toISOString(),
      });

      state.autoStopTimer = setTimeout(function () {
        if (state.mode === 'recording') reStop();
      }, MAX_RECORD_MS);
    } catch (err) {
      console.error('[RE] getUserMedia error', err);
      sendRecordError(err && err.message ? err.message : String(err));
      state.mode = 'idle';
      resetButtons(false);
    }
  }

  function reStop() {
    if (state.autoStopTimer) { clearTimeout(state.autoStopTimer); state.autoStopTimer = null; }
    if (state.recorder && state.recorder.state === 'recording') {
      setStatus('Đang kết thúc…', 'info');
      try { state.recorder.stop(); } catch (e) {}
      stopRecognition();
    } else if (state.mode === 'recognizing') {
      stopRecognition(); /* onend sẽ tự xử lý */
    } else {
      setStatus('Không có phiên ghi âm nào đang chạy.', 'warn');
    }
  }

  function finalizeAndSend() {
    if (state.sent) return;
    if (!state.blob) { sendRecordError('Không có dữ liệu ghi âm.'); return; }
    if (!state.base64) {
      /* base64 chưa kịp xong → chờ chút rồi thử lại */
      setTimeout(finalizeAndSend, 200);
      return;
    }
    state.sent = true;
    sendToParent({
      type: 'RECORDING_READY',
      sessionId: state.sessionId,
      itemIndex: state.itemIndex,
      audioBase64: state.base64,
      mimeType: state.mimeType,
      size: state.blob.size,
      durationMs: state.recStartedAt ? Date.now() - state.recStartedAt : 0,
      transcript: state.transcript,
      ts: new Date().toISOString(),
    });
    setStatus('Đã gửi bản ghi về ứng dụng chính ✓', 'ok');
    setInfo('Đã gửi ' + Math.round(state.blob.size / 1024) + ' KB + transcript về ứng dụng chính.');
  }

  function rePlay() {
    if (!state.blob) return;
    var url = URL.createObjectURL(state.blob);
    if (state.audioEl) state.audioEl.pause();
    state.audioEl = new Audio(url);
    state.audioEl.onended = function () { URL.revokeObjectURL(url); };
    state.audioEl.play().catch(function (e) {
      console.error('[RE] Play error', e);
      setStatus('Không phát được bản ghi: ' + e.message, 'err');
    });
    setStatus('Đang phát lại bản ghi…', 'info');
  }

  function reReRecord() {
    state.blob = null;
    state.base64 = null;
    state.chunks = [];
    state.transcript = '';
    state.sent = false;
    if (state.audioEl) { state.audioEl.pause(); state.audioEl = null; }
    if (els.waveform) els.waveform.innerHTML = '';
    if (els.transcript) els.transcript.hidden = true;
    setStatus('Sẵn sàng ghi lại.', 'warn');
    setInfo('Chưa có bản ghi nào.');
    resetButtons(false);
    reStart();
  }

  function reSendToParent() {
    if (!state.base64) { setStatus('Thiếu dữ liệu để gửi.', 'err'); return; }
    finalizeAndSend();
  }

  /* Chỉ nhận giọng nói (không ghi audio) — phục vụ nút "Chấm %" bên app. */
  function reRecognize() {
    if (!SR_CLASS) {
      sendToParent({
        type: 'RECOGNITION_ERROR',
        sessionId: state.sessionId,
        itemIndex: state.itemIndex,
        error: 'unsupported',
        ts: new Date().toISOString(),
      });
      setStatus('Trình duyệt không hỗ trợ Web Speech API.', 'err');
      return;
    }
    state.transcript = '';
    state.mode = 'recognizing';
    setStatus('Đang nghe… hãy đọc to câu trên.', 'rec');
    enable(els.btnStart, false);
    startRecognitionInternal();
  }

  /* ---------- Waveform (trực quan) ---------- */
  function drawWaveform(active) {
    if (!els.waveform) return;
    var barCount = 30;
    var html = '';
    for (var i = 0; i < barCount; i++) {
      var h = 8 + Math.random() * 30;
      html += '<div class="re-bar" style="height:' + h + 'px"></div>';
    }
    els.waveform.innerHTML = html;
    if (els.waveform.hidden && active) els.waveform.hidden = false;
  }

  /* ---------- postMessage từ ứng dụng chính ---------- */
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || typeof data.type !== 'string') return;
    switch (data.type) {
      case 'START_RECORDING':
        state.sessionId = data.sessionId || null;
        state.itemIndex = data.itemIndex != null ? Number(data.itemIndex) : null;
        setTarget(data.targetText || '');
        setStatus('Nhận lệnh ghi âm từ ứng dụng chính…', 'info');
        setInfo('Câu #' + (state.itemIndex != null ? state.itemIndex + 1 : '-') +
          (state.sessionId ? ' · Session: ' + state.sessionId : ''));
        reStart();
        break;

      case 'STOP_RECORDING':
        reStop();
        break;

      case 'START_RECOGNITION':
        state.sessionId = data.sessionId || null;
        state.itemIndex = data.itemIndex != null ? Number(data.itemIndex) : null;
        setTarget(data.targetText || '');
        setStatus('Nhận lệnh chấm điểm từ ứng dụng chính…', 'info');
        reRecognize();
        break;

      case 'RECORDING_CLEAR':
        reReRecord();
        break;

      default:
        break;
    }
  });

  /* ---------- Nút bấm ---------- */
  if (els.btnStart) els.btnStart.addEventListener('click', function () { reStart(); });
  if (els.btnStop) els.btnStop.addEventListener('click', function () { reStop(); });
  if (els.btnPlay) els.btnPlay.addEventListener('click', function () { rePlay(); });
  if (els.btnSend) els.btnSend.addEventListener('click', function () { reSendToParent(); });
  if (els.btnReRecord) els.btnReRecord.addEventListener('click', function () { reReRecord(); });

  /* ---------- Báo sẵn sàng về ứng dụng chính ---------- */
  function announceReady() {
    sendToParent({
      type: 'RE_ENGINE_READY',
      engine: 'lptd-recording-engine',
      version: 2,
      speechRecognition: !!SR_CLASS,
      ts: new Date().toISOString(),
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', announceReady);
  } else {
    announceReady();
  }

})();
