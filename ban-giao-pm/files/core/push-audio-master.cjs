#!/usr/bin/env node
/* Đẩy audio lên nhánh master (nhánh GitHub Pages) mà không cần checkout —
   dùng commit-tree như đã làm với audio EPI. */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const OP = path.join(ROOT, 'op');
const TMPIDX = 'C:/Users/kcm.lfs/AppData/Local/Temp/opencode/idx-pm-audio';

const G = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

try { fs.unlinkSync(TMPIDX); } catch (e) {}

const env = Object.assign({}, process.env, { GIT_INDEX_FILE: TMPIDX });
const g2 = (args) => execFileSync('git', args, { cwd: OP, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env });

g2(['read-tree', 'master']);
g2(['add', '--', 'pm-intermediate-audio', 'pm-advanced-audio']);
const st = g2(['status', '--short']).split('\n').filter(Boolean);
console.log('staged:', st.length, 'file');
const tree = g2(['write-tree']).trim();
const parent = g2(['rev-parse', 'master']).trim();
const msg = 'Pronunciation Master: audio CDN (Intermediate 360 track + Advanced 386 track)';
const commit = g2(['commit-tree', tree, '-p', parent, '-m', msg]).trim();
g2(['update-ref', 'refs/heads/master', commit]);
console.log('commit', commit);
g2(['push', 'origin', 'master']);
console.log('PUSHED master');
