/* SooRobotics blog helper — no build step, no dependencies.
 * Posts live in /posts/*.md with a small front matter block:
 *   ---
 *   title: 글 제목
 *   date: 2026-10-13
 *   lang: ko            (ko | en)
 *   tags: 드론, 베트남   (comma separated)
 *   summary: 한 줄 요약  (optional)
 *   cover: images/foo.jpg (optional, relative to /posts/)
 *   draft: true         (optional — hidden from the list)
 *   ---
 * The list comes from /posts/index.json (built by GitHub Actions).
 * If that file is missing or stale, we fall back to the GitHub API so a
 * freshly committed post shows up even before the Pages build finishes.
 */
(function (global) {
  const REPO = 'jewonlee72/SooRobotics';
  const BRANCH = 'main';
  const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`;
  const API = `https://api.github.com/repos/${REPO}/contents/posts?ref=${BRANCH}`;

  function parseFrontMatter(text) {
    const meta = {};
    let body = text || '';
    const m = /^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(body);
    if (m) {
      m[1].split(/\r?\n/).forEach((line) => {
        const i = line.indexOf(':');
        if (i < 0) return;
        const key = line.slice(0, i).trim().toLowerCase();
        let val = line.slice(i + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (key) meta[key] = val;
      });
      body = body.slice(m[0].length);
    }
    return { meta, body };
  }

  function splitTags(v) {
    if (!v) return [];
    return String(v).replace(/^\[|\]$/g, '').split(/[,，]/).map((s) => s.trim().replace(/^#/, '')).filter(Boolean);
  }

  function stripMarkdown(md) {
    return (md || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/[*_`>~]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalize(meta, body, file) {
    const slug = file.replace(/\.md$/i, '');
    const dateFromName = /^(\d{4}-\d{2}-\d{2})/.exec(slug);
    let summary = meta.summary || meta.description || '';
    if (!summary && body) summary = stripMarkdown(body).slice(0, 160);
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
  }

  function sortPosts(posts) {
    return posts.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.slug.localeCompare(a.slug));
  }

  async function fetchText(url, opts) {
    const r = await fetch(url, Object.assign({ cache: 'no-cache' }, opts || {}));
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.text();
  }

  // Site first (same origin), then raw GitHub as a fallback.
  async function fetchPostSource(file, root) {
    try {
      return await fetchText(`${root}posts/${file}`);
    } catch (e) {
      return fetchText(`${RAW}posts/${file}`);
    }
  }

  async function loadFromApi(root) {
    const r = await fetch(API, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`GitHub API ${r.status}`);
    const files = (await r.json())
      .filter((f) => f.type === 'file' && /\.md$/i.test(f.name) && !f.name.startsWith('_'));
    const posts = await Promise.all(files.map(async (f) => {
      try {
        const txt = await fetchPostSource(f.name, root);
        const { meta, body } = parseFrontMatter(txt);
        return normalize(meta, body, f.name);
      } catch (e) {
        return null;
      }
    }));
    return sortPosts(posts.filter((p) => p && !p.draft));
  }

  async function loadIndex(root) {
    root = root || '';
    try {
      const txt = await fetchText(`${root}posts/index.json`);
      const data = JSON.parse(txt);
      const posts = Array.isArray(data) ? data : data.posts || [];
      return sortPosts(posts.filter((p) => !p.draft));
    } catch (e) {
      return loadFromApi(root);
    }
  }

  async function loadPost(slug, root) {
    root = root || '';
    const file = `${slug}.md`;
    const txt = await fetchPostSource(file, root);
    const { meta, body } = parseFrontMatter(txt);
    return Object.assign(normalize(meta, body, file), { body });
  }

  function formatDate(iso, lang) {
    if (!iso) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    const [y, mo, d] = [m[1], m[2], m[3]];
    if (lang === 'en') {
      const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${names[parseInt(mo, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
    }
    return `${y}.${mo}.${d}`;
  }

  // Resolve a path written inside a post (relative to /posts/) to a site URL.
  function assetUrl(src, root) {
    root = root || '';
    if (!src) return '';
    if (/^(https?:|data:|\/)/i.test(src)) return src;
    if (/^posts\//.test(src)) return root + src;
    return `${root}posts/${src.replace(/^\.\//, '')}`;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function postUrl(post, root) {
    return `${root || ''}post.html?p=${encodeURIComponent(post.slug)}`;
  }

  function renderCard(post, root, uiLang) {
    const cover = post.cover
      ? `<img src="${esc(assetUrl(post.cover, root))}" alt="" class="w-full h-44 object-cover object-center" loading="lazy">`
      : '';
    const tags = post.tags.map((t) => `<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#${esc(t)}</span>`).join(' ');
    const langBadge = post.lang === 'en'
      ? '<span class="ml-2 text-[9px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-sm">EN</span>'
      : '<span class="ml-2 text-[9px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-sm">KR</span>';
    return `
      <a href="${esc(postUrl(post, root))}" class="post-card block bg-slate-50 rounded-sm border border-slate-100 overflow-hidden hover:border-blue-600 transition">
        ${cover}
        <div class="p-8">
          <span class="text-[10px] font-bold text-blue-600 tracking-widest uppercase">${esc(formatDate(post.date, uiLang))}${langBadge}</span>
          <h3 class="text-xl font-bold mt-3 mb-3 leading-tight text-slate-900">${esc(post.title)}</h3>
          <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${esc(post.summary)}</p>
          ${tags ? `<div class="mt-5 flex flex-wrap gap-x-3 gap-y-1">${tags}</div>` : ''}
        </div>
      </a>`;
  }

  global.SooBlog = { REPO, BRANCH, parseFrontMatter, normalize, loadIndex, loadPost, formatDate, assetUrl, esc, postUrl, renderCard, stripMarkdown };
})(window);
