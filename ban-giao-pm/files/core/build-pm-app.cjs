#!/usr/bin/env node
/**
 * build-pm-app.js — dựng thư mục GAS cho Pronunciation Master từ core dùng chung.
 *
 *   node build-pm-app.js <projectDir> <contentJson> <appName> <courseId> <cdnBase> <scriptId>
 *
 * Core dùng chung nằm ở work/pm-core/ (Intermediate là nguồn chuẩn).
 * Advanced tái dùng đúng core này theo khuyến nghị §18 spec Advanced.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');   // gốc workspace
const CORE = path.join(__dirname);

const [projectDir, contentJson, appName, courseId, cdnBase, scriptId] = process.argv.slice(2);
if (!projectDir || !contentJson) {
  console.error('usage: build-pm-app.js <projectDir> <contentJson> <appName> <courseId> <cdnBase> <scriptId>');
  process.exit(1);
}
const OUT = path.join(ROOT, projectDir);
fs.mkdirSync(OUT, { recursive: true });

/* ---- 1. copy core ---- */
['Code.gs', 'PMService.gs', 'Index.html', 'Styles.html', 'App.html'].forEach((f) => {
  fs.copyFileSync(path.join(CORE, f), path.join(OUT, f));
});

/* ---- 2. Config.gs ---- */
const cfg = `/**
 * Config.gs – cấu hình Pronunciation Master.
 * Sinh tự động bởi work/pm-core/build-pm-app.js — có thể chỉnh tay sau.
 */
var Config = {
  APP_NAME: '${appName}',
  APP_VERSION: '1.0.0',
  COURSE_ID: '${courseId}',
  CDN_BASE: '${cdnBase}',
  RECORDING_ENGINE_URL: 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/',
  MAX_UPLOAD_MB: 5,
  CACHE_TTL_SECONDS: 3600,
  ROLES: { STUDENT: 'STUDENT', TEACHER: 'TEACHER', ADMIN: 'ADMIN' },
  COMPLETION_THRESHOLDS: {
    SOUND_DISCRIMINATION: 80, WORD_STRESS: 80, SENTENCE_STRESS: 75,
    LINKING: 75, CONVERSATION: 75, INFORMATION_FOCUS: 80, INTONATION_FUNCTION: 75
  }
};
`;
fs.writeFileSync(path.join(OUT, 'Config.gs'), cfg);

/* ---- 3. PMContent.gs (nội dung tĩnh) ---- */
const content = JSON.parse(fs.readFileSync(path.join(ROOT, contentJson), 'utf8'));
const pmc = `/**
 * PMContent.gs — nội dung khóa học (sinh tự động, KHÔNG sửa tay).
 * Nguồn: ${contentJson}
 * ${content.meta.units} unit · ${content.meta.audioTracks} track audio
 */
function PM_COURSE() { return ${JSON.stringify(content, null, 1)}; }
`;
fs.writeFileSync(path.join(OUT, 'PMContent.gs'), pmc);

/* ---- 4. manifest + clasp ---- */
const manifest = {
  timeZone: 'Asia/Ho_Chi_Minh',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' },
};
fs.writeFileSync(path.join(OUT, 'appsscript.json'), JSON.stringify(manifest, null, 2));
const claspJson = {
  scriptId, rootDir: '',
  scriptExtensions: ['.js', '.gs'],
  htmlExtensions: ['.html'],
  jsonExtensions: ['.json'],
  filePushOrder: [],
  skipSubdirectories: false,
};
const claspPath = path.join(OUT, '.clasp.json');
if (!fs.existsSync(claspPath)) {
  fs.writeFileSync(claspPath, JSON.stringify(claspJson, null, 2));
}

console.log('built', path.relative(ROOT, OUT), '| scriptId', scriptId, '| units', content.units.length);
