/**
 * split-audio.js — tách 4 CD MP3 của "English Pronunciation in Use Intermediate"
 * thành từng track theo file .cue (CUE sheet), giữ nguyên ID marker của sách (A1, A2, …).
 *
 * Cách dùng:
 *   node split-audio.js
 *
 * Kết quả:
 *   work/audio/INT-CD1-Track01.mp3 … (ASCII tên file cho CDN)
 *   work/audio/manifest.json  → map track → { cd, index, cueTitle, marker, startSec, durationSec }
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'work', 'audio');
const FFMPEG = process.env.FFMPEG_PATH
  || 'C:/Users/kcm.lfs/AppData/Local/Temp/opencode/node_modules/ffmpeg-static/ffmpeg.exe';

const CD_DIRS = [
  { dir: 'CD A', cd: 'A', file: 'CD1' },
  { dir: 'CD B', cd: 'B', file: 'CD2' },
  { dir: 'CD C', cd: 'C', file: 'CD3' },
  { dir: 'CD D', cd: 'D', file: 'CD4' },
];

/* "00:34:30" (mm:ss:ff, 75 fps) → giây */
function cueTime(s) {
  const m = String(s).match(/^(\d+):(\d+):(\d+)$/);
  if (!m) return 0;
  const mm = +m[1], ss = +m[2], ff = +m[3];
  return mm * 60 + ss + ff / 75;
}

function parseCue(text) {
  const tracks = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const l = raw.trim();
    let m;
    if ((m = l.match(/^TRACK\s+(\d+)\s+AUDIO/i))) {
      cur = { no: +m[1], title: '', startSec: 0 };
      tracks.push(cur);
      continue;
    }
    if (!cur) continue;
    if ((m = l.match(/^TITLE\s+"(.*)"$/i))) { cur.title = m[1]; continue; }
    if ((m = l.match(/^INDEX\s+01\s+(\d+:\d+:\d+)/i))) { cur.startSec = cueTime(m[1]); continue; }
  }
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].endSec = i + 1 < tracks.length ? tracks[i + 1].startSec : null;
  }
  return tracks;
}

function fmt(n) { return String(n).padStart(2, '0'); }

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];

for (const cd of CD_DIRS) {
  const dir = path.join(ROOT, cd.dir);
  if (!fs.existsSync(dir)) { console.log('! thiếu thư mục', cd.dir); continue; }
  const cueFile = fs.readdirSync(dir).find((n) => /\.cue$/i.test(n));
  const mp3File = fs.readdirSync(dir).find((n) => /\.mp3$/i.test(n));
  if (!cueFile || !mp3File) { console.log('! thiếu cue/mp3 trong', cd.dir); continue; }

  const inFile = path.join(dir, mp3File);
  const tracks = parseCue(fs.readFileSync(path.join(dir, cueFile), 'utf8'));
  console.log(`\n${cd.dir}: ${tracks.length} track từ ${cueFile}`);

  tracks.forEach((t, i) => {
    const outName = `INT-${cd.file}-Track${fmt(i + 1)}.mp3`;
    const outPath = path.join(OUT, outName);
    const dur = (t.endSec == null ? null : t.endSec - t.startSec);
    if (!fs.existsSync(outPath)) {
      const args = ['-hide_banner', '-loglevel', 'error', '-y'];
      if (dur != null) args.push('-ss', String(t.startSec.toFixed(3)), '-t', String(dur.toFixed(3)));
      else args.push('-ss', String(t.startSec.toFixed(3)));
      args.push('-i', inFile, '-c', 'copy', '-map_metadata', '-1', '-write_xing', '0', outPath);
      execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    }
    const size = fs.statSync(outPath).size;
    manifest.push({
      cd: cd.cd, cdFile: cd.file, index: i + 1, file: outName,
      cueTitle: t.title, marker: (t.title.split(/\s+/)[0] || ''),
      startSec: Number(t.startSec.toFixed(3)),
      durationSec: dur == null ? null : Number(dur.toFixed(3)),
      bytes: size,
    });
    process.stdout.write(`  ${outName} ${(size / 1024).toFixed(0)}KB  marker=${t.title}\n`);
  });
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({
  source: 'English Pronunciation in Use Intermediate (Mark Hancock) — CD1..CD4',
  total: manifest.length,
  tracks: manifest,
}, null, 2), 'utf8');
console.log('\nDONE —', manifest.length, 'track →', OUT);
