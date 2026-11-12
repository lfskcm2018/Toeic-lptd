/* =========================================================
   op/app/lptd-data.js
   Catalog LPTD 1–4 + bộ dựng URL audio/tài liệu cho cả local và GAS.

   Phụ thuộc: op/app/lptd-lessons-data.js (window.LPTD_LESSONS_RAW)
   Không phụ thuộc core.js — có thể nạp độc lập.

   Cấu hình:
     window.LPTD_LOCAL_BASE = '../'   // tiền tố đường dẫn tới thư mục gốc dự án
     LPTD.setAudioMode('auto'|'local'|'cdn')
   ========================================================= */
(function (global) {
  'use strict';

  var CDN_BASE = 'https://toeic-audio.pages.dev/audio/lptd';
  var AUDIO_MODE_KEY = 'toeic_lptd_audio_mode';
  var PROGRESS_KEY = 'toeic_lptd_progress';

  var BOOKS = [
    {
      book: 1,
      code: 'LPTD 1',
      title: 'Listening Practice Through Dictation 1',
      short: 'Beginner',
      level: 'Beginner',
      icon: '🌱',
      accent: '#10b981',
      units: 40,
    },
    {
      book: 2,
      code: 'LPTD 2',
      title: 'Listening Practice Through Dictation 2',
      short: 'Elementary',
      level: 'Elementary',
      icon: '🌿',
      accent: '#3b82f6',
      units: 40,
    },
    {
      book: 3,
      code: 'LPTD 3',
      title: 'Listening Practice Through Dictation 3',
      short: 'Intermediate',
      level: 'Intermediate',
      icon: '🌳',
      accent: '#f59e0b',
      units: 40,
    },
    {
      book: 4,
      code: 'LPTD 4',
      title: 'Listening Practice Through Dictation 4',
      short: 'Upper-intermediate',
      level: 'Upper-intermediate',
      icon: '🏔️',
      accent: '#8b5cf6',
      units: 40,
    },
    {
      book: 5,
      code: 'Hacker 1',
      title: 'Hackers TOEIC 1000 LC — Hacker 1',
      short: 'TOEIC LC',
      level: '10 TEST · 30 track',
      icon: '📘',
      accent: '#0ea5e9',
      units: 30,
    },
    {
      book: 6,
      code: 'Dictation Part 2',
      title: 'Dictation Part 2 — TOEIC Part 2',
      short: 'Part 2',
      level: '11 chuyên đề',
      icon: '📘',
      accent: '#0ea5e9',
      units: 11,
    },
    {
      book: 7,
      code: '600+',
      title: '600+ · Dictation & Shadowing',
      short: '600+',
      level: '20 ngày · 32 audio',
      icon: '📘',
      accent: '#f59e0b',
      units: 32,
    },
    {
      book: 8,
      code: '750+',
      title: '750+ · Dictation & Shadowing',
      short: '750+',
      level: '20 ngày · 20 audio',
      icon: '📘',
      accent: '#8b5cf6',
      units: 20,
    },
    {
      book: 9,
      code: 'EPI Elementary',
      title: 'English Pronunciation in Use Elementary',
      short: 'EPI',
      level: '50 unit + Section E · 351 audio',
      icon: '🗣️',
      accent: '#ec4899',
      units: 58,
    },
  ];

  /* Tài liệu đính kèm theo từng cuốn (đường dẫn tương đối từ gốc dự án). */
  var DOCS = {
    1: [
      { label: 'Sách LPTD 1', type: 'book', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 1/Listening Practice Through Dictation 1.pdf' },
      { label: 'Transcript LPTD 1', type: 'transcript', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 1/Audio + Transcipt/ListeningPracticeThroughDictation_1_Transcripts.pdf' },
    ],
    2: [
      { label: 'Sách LPTD 2', type: 'book', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 2/Listening Practice Through Dictation 2.pdf' },
      { label: 'Transcript LPTD 2', type: 'transcript', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 2/Audio + Transcipt/LPTD 2_Transcripts.pdf' },
    ],
    3: [
      { label: 'Sách LPTD 3', type: 'book', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 3/Listening Practice Through Dictation 3.pdf' },
      { label: 'Transcript LPTD 3', type: 'transcript', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 3/Audio + Transcipt/LPTD 3_transcript.pdf' },
      { label: 'Answer Key LPTD 3', type: 'answer', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 3/LPTD_3_Answer_key.pdf' },
    ],
    4: [
      { label: 'Transcript LPTD 4', type: 'transcript', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 4/Audio + Transcipt/ListeningPracticeThroughDictation_4_transcript.pdf' },
      { label: 'Transcript LPTD 4 (bản 2)', type: 'transcript', file: 'Listening Practice Through Dictation/Listening Practice Through Dictation 4/LPTD4.pdf' },
    ],
  };

  var isGas = typeof global.google !== 'undefined' && global.google.script && global.google.script.run;

  var LPTD = {
    CDN_BASE: CDN_BASE,
    BOOKS: BOOKS,
    DOCS: DOCS,
    PROGRESS_KEY: PROGRESS_KEY,
    lessons: [],
    lessonsById: {},
    lessonsByBook: { 1: [], 2: [], 3: [], 4: [] },
    loaded: false,
    isGas: !!isGas,

    /* Tiền tố đường dẫn tới gốc dự án. op/index.html đặt '../'. */
    localBase: typeof global.LPTD_LOCAL_BASE === 'string' ? global.LPTD_LOCAL_BASE : '',

    /* 'auto' = local khi chạy máy, CDN khi GAS. */
    audioMode: (function () {
      try {
        var saved = global.localStorage && global.localStorage.getItem(AUDIO_MODE_KEY);
        if (saved === 'local' || saved === 'cdn' || saved === 'auto') return saved;
      } catch (e) {}
      return 'auto';
    })(),

    pad2: function (n) { return String(n).padStart(2, '0'); },

    bookMeta: function (book) {
      for (var i = 0; i < BOOKS.length; i++) if (BOOKS[i].book === Number(book)) return BOOKS[i];
      return null;
    },

    audioName: function (book, unit) {
      return 'LPTD' + Number(book) + 'U' + this.pad2(unit) + '.mp3';
    },

    encodePath: function (value) {
      return String(value || '').split('/').map(encodeURIComponent).join('/');
    },

    cdnUrl: function (lesson) {
      if (!lesson) return '';
      if (lesson.cdnUrl) return lesson.cdnUrl;
      var name = lesson.cdnName || this.audioName(lesson.book, lesson.unit);
      return CDN_BASE + '/' + name;
    },

    localUrl: function (lesson) {
      if (!lesson || !lesson.localPath) return '';
      return this.localBase + this.encodePath(lesson.localPath);
    },

    /* URL phát audio theo mode. auto: local khi chạy máy, CDN khi GAS. */
    unitUrl: function (lesson, mode) {
      var m = mode || this.audioMode;
      if (m === 'cdn') return this.cdnUrl(lesson);
      if (m === 'local') return this.localUrl(lesson);
      return this.isGas ? this.cdnUrl(lesson) : this.localUrl(lesson);
    },

    /* URL dự phòng khi nguồn chính lỗi. */
    fallbackUrl: function (lesson, mode) {
      var m = mode || this.audioMode;
      var primaryIsCdn = (m === 'cdn') || (m === 'auto' && this.isGas);
      return primaryIsCdn ? this.localUrl(lesson) : this.cdnUrl(lesson);
    },

    docUrl: function (doc) {
      if (!doc || !doc.file) return '';
      /* GAS không phục vụ được file tĩnh trong project → chỉ bật khi có CDN tài liệu. */
      if (this.isGas && !this.docsCdnBase) return '';
      if (this.docsCdnBase) return String(this.docsCdnBase).replace(/\/+$/, '') + '/' + this.encodePath(doc.file);
      return this.localBase + this.encodePath(doc.file);
    },

    docsForBook: function (book) { return DOCS[Number(book)] || []; },

    setAudioMode: function (mode) {
      if (mode !== 'auto' && mode !== 'local' && mode !== 'cdn') return this.audioMode;
      this.audioMode = mode;
      try { global.localStorage && global.localStorage.setItem(AUDIO_MODE_KEY, mode); } catch (e) {}
      return this.audioMode;
    },

    setLocalBase: function (base) { this.localBase = String(base || ''); },

    /* Nạp dữ liệu local từ window.LPTD_LESSONS_RAW. */
    loadLocal: function () {
      var raw = global.LPTD_LESSONS_RAW;
      if (!Array.isArray(raw)) throw new Error('Thiếu window.LPTD_LESSONS_RAW — hãy nạp op/app/lptd-lessons-data.js trước.');
      return this.setLessons(raw);
    },

    setLessons: function (list) {
      this.lessons = Array.isArray(list) ? list.slice() : [];
      this.lessonsById = {};
      this.lessonsByBook = { 1: [], 2: [], 3: [], 4: [] };
      for (var i = 0; i < this.lessons.length; i++) {
        var u = this.lessons[i];
        if (!u || !u.id) continue;
        this.lessonsById[u.id] = u;
        if (!this.lessonsByBook[u.book]) this.lessonsByBook[u.book] = [];
        this.lessonsByBook[u.book].push(u);
      }
      this.loaded = true;
      return this.lessons;
    },

    get: function (book, unit) {
      var id = 'lptd-' + Number(book) + '-' + this.pad2(unit);
      if (this.lessonsById[id]) return this.lessonsById[id];
      var list = this.byBook(book);
      for (var i = 0; i < list.length; i++) {
        if (Number(list[i].unit) === Number(unit)) return list[i];
      }
      return null;
    },

    byBook: function (book) { return this.lessonsByBook[Number(book)] || []; },

    stats: function () {
      var lines = 0, words = 0;
      this.lessons.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
      return { units: this.lessons.length, lines: lines, words: words };
    },

    /* Tiến độ localStorage (tách riêng khỏi Hackers/ETS). */
    loadProgress: function () {
      try {
        var raw = global.localStorage && global.localStorage.getItem(PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    },

    saveProgress: function (progress) {
      try { global.localStorage && global.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress || {})); } catch (e) {}
    },

    unitKey: function (lesson) { return Number(lesson.book) + '-' + Number(lesson.unit); },
  };

  global.LPTD = LPTD;

  /* Tự nạp dữ liệu local nếu đã có sẵn (không ném lỗi khi chạy GAS). */
  if (global.LPTD_LESSONS_RAW) {
    try { LPTD.loadLocal(); } catch (e) { /* để UI báo lỗi sau */ }
  }
})(typeof window !== 'undefined' ? window : this);
