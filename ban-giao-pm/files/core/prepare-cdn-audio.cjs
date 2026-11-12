#!/usr/bin/env node
/**
 * prepare-cdn-audio.js — chuẩn hoá tên audio (ASCII) + đẩy lên GitHub Pages.
 *
 *   Intermediate: work/audio/INT-CD{n}-Track{NN}.mp3  → op/pm-intermediate-audio/
 *   Advanced:    "CD A"/…/*.mp3                        → op/pm-advanced-audio/ADV-CD{A..E}-Track{NN}.mp3
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const OP = path.join(ROOT, 'op');

function copy(src, dst) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); }

/* ---- Intermediate ---- */
{
  const src = path.join(ROOT, 'English Pronunciation in Use Intermediate [2000]', 'work', 'audio');
  const dst = path.join(OP, 'pm-intermediate-audio');
  fs.mkdirSync(dst, { recursive: true });
  const fl = fs.readdirSync(src).filter((n) => /\.mp3$/i.test(n));
  fl.forEach((n) => copy(path.join(src, n), path.join(dst, n)));
  console.log('intermediate ->', fl.length, 'file');
}

/* ---- Advanced ---- */
{
  const adv = path.join(ROOT, 'English Pronunciation in Use Advanced');
  const dst = path.join(OP, 'pm-advanced-audio');
  fs.mkdirSync(dst, { recursive: true });
  let n = 0;
  ['A', 'B', 'C', 'D', 'E'].forEach((cd) => {
    const dir = path.join(adv, 'CD ' + cd);
    if (!fs.existsSync(dir)) return;
    const fl = fs.readdirSync(dir).filter((x) => /\.mp3$/i.test(x)).map((x) => {
      const m = x.match(/(\d+)/);
      return { no: m ? parseInt(m[1], 10) : 0, name: x };
    }).sort((a, b) => a.no - b.no);
    fl.forEach((f) => {
      const out = `ADV-CD${cd}-Track${String(f.no).padStart(2, '0')}.mp3`;
      copy(path.join(dir, f.name), path.join(dst, out));
      n++;
    });
  });
  console.log('advanced ->', n, 'file');
}

/* ---- commit + push (branch master để GitHub Pages phục vụ) ---- */
const G = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  const cur = G(['rev-parse', '--abbrev-ref', 'HEAD'], OP).trim();
  console.log('op branch:', cur);
  if (cur !== 'master') G(['checkout', 'master'], OP);
  G(['add', '--', 'pm-intermediate-audio', 'pm-advanced-audio'], OP);
  const st = G(['status', '--short'], OP).split('\n').filter(Boolean);
  console.log('staged:', st.length, 'file');
  G(['commit', '-m', 'Pronunciation Master: audio CDN (Intermediate 360 track + Advanced 386 track)'], OP);
  console.log(G(['log', '--oneline', '-1'], OP).trim());
  G(['push', 'origin', 'master'], OP);
  console.log('PUSHED master');
} catch (e) {
  console.log('git lỗi:', String(e.stdout || e.message).slice(0, 500));
}
