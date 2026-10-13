// Builds posts/index.json from posts/*.md. Run by GitHub Actions on every push
// that touches posts/. No dependencies: `node scripts/build-posts.mjs`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'posts');

function parseFrontMatter(text) {
  const meta = {};
  let body = text;
  const m = /^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(body);
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const key = line.slice(0, i).trim().toLowerCase();
      let val = line.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (key) meta[key] = val;
    }
    body = body.slice(m[0].length);
  }
  return { meta, body };
}

const splitTags = (v) => !v ? [] : String(v).replace(/^\[|\]$/g, '').split(/[,，]/).map((s) => s.trim().replace(/^#/, '')).filter(Boolean);

const stripMarkdown = (md) => (md || '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/^#+\s*/gm, '')
  .replace(/[*_`>~]/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const posts = readdirSync(POSTS)
  .filter((f) => /\.md$/i.test(f) && !f.startsWith('_'))
  .map((file) => {
    const { meta, body } = parseFrontMatter(readFileSync(join(POSTS, file), 'utf8'));
    const slug = file.replace(/\.md$/i, '');
    const dateFromName = /^(\d{4}-\d{2}-\d{2})/.exec(slug);
    let summary = meta.summary || meta.description || '';
    if (!summary) summary = stripMarkdown(body).slice(0, 160);
    return {
      slug,
      file,
      title: meta.title || slug,
      date: meta.date || (dateFromName ? dateFromName[1] : ''),
      lang: (meta.lang || 'ko').toLowerCase(),
      tags: splitTags(meta.tags),
      summary,
      cover: meta.cover || '',
      draft: /^(true|yes|1)$/i.test(meta.draft || ''),
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.slug.localeCompare(a.slug));

const out = { generatedAt: new Date().toISOString(), count: posts.length, posts };
writeFileSync(join(POSTS, 'index.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`posts/index.json: ${posts.length} post(s)`);
for (const p of posts) console.log(`  ${p.date}  [${p.lang}]  ${p.title}`);
