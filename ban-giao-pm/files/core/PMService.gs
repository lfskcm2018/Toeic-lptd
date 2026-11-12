/**
 * PMService.gs — API server cho Pronunciation Master.
 *
 * Nguyên tắc:
 *  - Nội dung (unit/lesson/activity) nằm tĩnh trong PMContent.gs.
 *  - Answer key KHÔNG bao giờ gửi về client trước khi chấm.
 *  - Audio phát từ CDN (Config.CDN_BASE).
 *  - Tiến độ lưu ở client (localStorage) — không cần Sheets/Drive.
 */

/* ---------- tiện ích ---------- */
function pmEsc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pmCourse_() {
  return (typeof PM_COURSE === 'function') ? PM_COURSE() : { units: [], sections: [] };
}

function pmFindUnit_(no) {
  var list = pmCourse_().units || [];
  for (var i = 0; i < list.length; i++) {
    if (Number(list[i].no) === Number(no)) return list[i];
  }
  return null;
}

/** Loại bỏ field nội bộ (đáp án) trước khi gửi client. */
function pmPublicUnit_(u) {
  if (!u) return null;
  var o = {};
  Object.keys(u).forEach(function (k) {
    if (k === 'exercises') return;
    o[k] = u[k];
  });
  o.exercises = (u.exercises || []).map(function (ex) {
    var e = {};
    Object.keys(ex).forEach(function (k) {
      if (k === 'answer' || k === 'answerKey') return;
      e[k] = ex[k];
    });
    return e;
  });
  return o;
}

/* ---------- API ---------- */

/** Tải cấu hình + danh sách unit (nhẹ) để vẽ course map. */
function getBootstrapData() {
  var c = pmCourse_();
  return {
    appName: Config.APP_NAME,
    course: {
      id: c.meta ? c.meta.id : c.id,
      title: c.meta ? c.meta.title : c.title,
      edition: c.meta ? c.meta.edition : '',
      level: c.meta ? c.meta.level : '',
      sections: c.sections || [],
    },
    cdnBase: Config.CDN_BASE,
    units: (c.units || []).map(function (u) {
      return {
        no: u.no,
        id: u.id,
        section: u.section,
        title: u.title,
        topic: u.topic || '',
        page: u.page || null,
        objective: u.objective || '',
        audioCount: (u.audio || []).length,
        exerciseCount: (u.exercises || []).length,
        kind: u.kind || 'unit',
      };
    }),
    reference: c.reference || [],
  };
}

/** Tải 1 unit đầy đủ (không kèm đáp án). */
function getUnit(no) {
  var u = pmFindUnit_(no);
  if (!u) return { error: 'Không tìm thấy unit ' + no };
  var out = pmPublicUnit_(u);
  out.cdnBase = Config.CDN_BASE;
  return out;
}

/** Lấy bộ câu hỏi (không kèm đáp án) — theo spec 10.5 getActivitySet. */
function getActivitySet(unitNo) {
  var u = pmFindUnit_(unitNo);
  if (!u) return { error: 'Không tìm thấy unit ' + unitNo };
  return {
    unitNo: u.no,
    activities: (u.exercises || []).map(function (ex) {
      return {
        id: ex.id,
        no: ex.n,
        type: ex.type,
        prompt: ex.prompt,
        options: ex.options || [],
        items: ex.items || null,
        scoringRule: ex.scoringRule || 'exact',
      };
    }),
  };
}

/* ---------- chấm điểm ---------- */

function pmNormalize_(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pmWords_(s) { return pmNormalize_(s).split(' ').filter(Boolean); }

function pmGradeDictation_(given, expected) {
  var g = pmWords_(given), e = pmWords_(expected);
  if (!e.length) return { score: 0, feedback: 'Đáp án rỗng.' };
  var missing = [], wrong = [], extra = [];
  var pool = e.slice();
  g.forEach(function (w) {
    var ix = pool.indexOf(w);
    if (ix >= 0) pool.splice(ix, 1);
    else extra.push(w);
  });
  e.forEach(function (w) {
    if (g.indexOf(w) < 0) missing.push(w);
  });
  var hit = e.length - missing.length;
  var score = Math.round((hit / e.length) * 100);
  var fb = [];
  if (missing.length) fb.push('Thiếu: ' + missing.join(', '));
  if (extra.length) fb.push('Thừa: ' + extra.join(', '));
  if (!fb.length) fb.push('Chính xác tuyệt đối!');
  return { score: score, feedback: fb.join(' · '), missing: missing, extra: extra };
}

function pmGradeActivity_(ex, answer) {
  var type = ex.type || 'multiple_choice';
  var expected = ex.answer;

  if (type === 'multiple_choice' || type === 'true_false') {
    var ok = String(answer) === String(expected);
    return {
      score: ok ? 100 : 0,
      correct: ok,
      feedback: ok ? 'Chính xác.' : 'Chưa đúng. Đáp án: ' + pmEsc_(expected),
      expected: expected,
    };
  }

  if (type === 'multiple_select') {
    var exp = (Array.isArray(expected) ? expected : [expected]).map(String).sort();
    var got = (Array.isArray(answer) ? answer : [answer]).map(String).sort();
    var hits = exp.filter(function (x, i) { return got[i] === x; }).length;
    var score2 = Math.round((hits / Math.max(exp.length, 1)) * 100);
    return {
      score: score2,
      correct: score2 === 100,
      feedback: score2 === 100 ? 'Chính xác.' : 'Đúng ' + hits + '/' + exp.length + '. Đáp án: ' + exp.join(', '),
      expected: exp,
    };
  }

  if (type === 'dictation') {
    var r = pmGradeDictation_(answer, expected);
    return { score: r.score, correct: r.score >= 90, feedback: r.feedback, expected: expected, missing: r.missing, extra: r.extra };
  }

  if (type === 'matching') {
    /* answer: { "<itemId>": "<optionId>" } ; expected: cùng dạng */
    var expM = expected || {};
    var gotM = answer || {};
    var keys = Object.keys(expM);
    var okN = keys.filter(function (k) { return String(gotM[k]) === String(expM[k]); }).length;
    var scoreM = Math.round((okN / Math.max(keys.length, 1)) * 100);
    return {
      score: scoreM,
      correct: scoreM === 100,
      feedback: scoreM === 100 ? 'Ghép đúng hết.' : 'Đúng ' + okN + '/' + keys.length + ' cặp.',
      expected: expM,
    };
  }

  if (type === 'ordering') {
    /* answer: mảng thứ tự ; expected: mảng đúng */
    var expO = expected || [];
    var gotO = answer || [];
    var posOk = 0;
    for (var i = 0; i < expO.length; i++) {
      if (String(gotO[i]) === String(expO[i])) posOk++;
    }
    var scoreO = Math.round((posOk / Math.max(expO.length, 1)) * 100);
    return {
      score: scoreO,
      correct: scoreO === 100,
      feedback: scoreO === 100 ? 'Đúng thứ tự.' : 'Đúng vị trí ' + posOk + '/' + expO.length + '.',
      expected: expO,
    };
  }

  return { score: 0, correct: false, feedback: 'Loại bài tập chưa hỗ trợ: ' + type };
}

/** Nộp bài và chấm ở server (đáp án không bao giờ rời khỏi server trước khi nộp). */
function submitActivity(payload) {
  payload = payload || {};
  var u = pmFindUnit_(payload.unitNo);
  if (!u) return { error: 'Không tìm thấy unit' };
  var ex = null;
  (u.exercises || []).forEach(function (e) { if (e.id === payload.activityId) ex = e; });
  if (!ex) return { error: 'Không tìm thấy bài tập' };
  var res = pmGradeActivity_(ex, payload.answer);
  return {
    activityId: ex.id,
    unitNo: u.no,
    score: res.score,
    correct: !!res.correct,
    feedback: res.feedback,
    expected: res.expected === undefined ? null : res.expected,
    missing: res.missing || null,
    extra: res.extra || null,
    gradedAt: new Date().toISOString(),
  };
}

/** Lưu tiến độ (client tự lưu; server chỉ xác nhận). */
function saveProgress(payload) {
  return { ok: true, savedAt: new Date().toISOString(), unitNo: payload && payload.unitNo };
}

/** Báo cáo năng lực theo nhóm kỹ năng (tính từ tiến độ client gửi lên). */
function getSkillReport(payload) {
  var progress = (payload && payload.progress) || {};
  var bySkill = {};
  Object.keys(progress).forEach(function (k) {
    var p = progress[k] || {};
    var skill = p.skill || 'unknown';
    if (!bySkill[skill]) bySkill[skill] = { units: 0, done: 0, scoreSum: 0, scoreCount: 0 };
    bySkill[skill].units++;
    if (p.status === 'done') bySkill[skill].done++;
    if (typeof p.bestScore === 'number') {
      bySkill[skill].scoreSum += p.bestScore;
      bySkill[skill].scoreCount++;
    }
  });
  var out = {};
  Object.keys(bySkill).forEach(function (s) {
    var b = bySkill[s];
    out[s] = {
      units: b.units,
      done: b.done,
      avgScore: b.scoreCount ? Math.round(b.scoreSum / b.scoreCount) : null,
    };
  });
  return { bySkill: out, generatedAt: new Date().toISOString() };
}
