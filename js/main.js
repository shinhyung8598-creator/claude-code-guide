'use strict';

/* ── 다크 모드 ── */
const THEME_KEY = 'blog-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || getSystemTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* ── 날짜 포맷 ── */
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

/* ── 포스트 목록 (index.html) ── */
async function renderPostList() {
  const container = document.getElementById('post-list');
  if (!container) return;

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('목록을 불러올 수 없습니다.');
    const posts = await res.json();

    const ul = document.createElement('div');
    ul.className = 'post-list';

    posts.forEach(post => {
      const a = document.createElement('a');
      a.className = 'post-card';
      a.href = `post.html?slug=${encodeURIComponent(post.slug)}`;
      a.innerHTML = `
        <div class="post-card-title">${post.title}</div>
        <div class="post-card-date">${formatDate(post.date)}</div>
        ${post.description ? `<div class="post-card-desc">${post.description}</div>` : ''}
      `;
      ul.appendChild(a);
    });

    container.appendChild(ul);
  } catch (e) {
    container.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

/* ── 개별 포스트 (post.html) ── */
async function renderPost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    container.innerHTML = '<p class="error-msg">포스트를 찾을 수 없습니다.</p>';
    return;
  }

  try {
    // 메타데이터에서 제목·날짜 가져오기
    const metaRes = await fetch('posts/index.json');
    const posts = metaRes.ok ? await metaRes.json() : [];
    const meta = posts.find(p => p.slug === slug);

    // 마크다운 파일 로드
    const mdRes = await fetch(`posts/${slug}.md`);
    if (!mdRes.ok) throw new Error('포스트를 불러올 수 없습니다.');
    const mdText = await mdRes.text();

    // marked.js로 렌더링
    const html = marked.parse(mdText);

    // 제목 태그 업데이트
    if (meta) {
      document.title = `${meta.title} — My Blog`;
    }

    container.innerHTML = `
      <a href="index.html" class="back-link">← 목록으로</a>
      ${meta ? `<div class="post-meta">${formatDate(meta.date)}</div>` : ''}
      ${html}
    `;
  } catch (e) {
    container.innerHTML = `<p class="error-msg">${e.message}</p>`;
  }
}

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);

  renderPostList();
  renderPost();
});
