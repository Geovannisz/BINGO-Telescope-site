/**
 * BINGO Telescope — Admin Panel Engine
 * Theme toggle + Login customization + Live Preview
 *
 * IMPORTANT: This script must NOT interfere with the Decap CMS
 * internal DOM. All DOM manipulation is carefully scoped.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     1. THEME TOGGLE
     ═══════════════════════════════════════════ */
  function initThemeToggle() {
    const btn = document.createElement('button');
    btn.id = 'bingo-theme-toggle';
    btn.title = 'Alternar tema claro/escuro';
    btn.innerHTML = '☀️';
    document.body.appendChild(btn);

    const saved = localStorage.getItem('bingo-admin-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.innerHTML = '🌙';
    }

    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('bingo-admin-theme', 'light');
        btn.innerHTML = '☀️';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('bingo-admin-theme', 'dark');
        btn.innerHTML = '🌙';
      }
    });
  }

  /* ═══════════════════════════════════════════
     2. LOGIN PAGE DETECTION & CUSTOMIZATION
     Uses a single MutationObserver (shared below).
     ═══════════════════════════════════════════ */
  function checkLoginPage() {
    const loginBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent.includes('Login with GitHub')
    );

    if (loginBtn) {
      loginBtn.textContent = '🔭 Acessar Painel BINGO';
      loginBtn.classList.add('bingo-login-btn');
      document.body.classList.add('bingo-login');
      return;
    }

    // If already renamed
    const renamedBtn = Array.from(document.querySelectorAll('.bingo-login-btn'));
    if (renamedBtn.length > 0) {
      document.body.classList.add('bingo-login');
      return;
    }

    // If we see CMS chrome (header/aside), we're past login
    if (document.querySelector('header') || document.querySelector('aside')) {
      document.body.classList.remove('bingo-login');
    }
  }

  /* ═══════════════════════════════════════════
     3. LIVE PREVIEW ENGINE
     ═══════════════════════════════════════════ */

  function detectCollection() {
    const url = window.location.hash || window.location.pathname;
    if (url.includes('/news/')) return 'news';
    if (url.includes('/team/')) return 'team';
    if (url.includes('/publications/')) return 'publications';
    // Also check sidebar active link
    const activeLink = document.querySelector('aside a[class*="active"], aside a[aria-current="page"]');
    if (activeLink) {
      const text = activeLink.textContent.toLowerCase();
      if (text.includes('notícia') || text.includes('news')) return 'news';
      if (text.includes('equipe') || text.includes('team')) return 'team';
      if (text.includes('publicaç') || text.includes('publication')) return 'publications';
    }
    return null;
  }

  function getFieldValues() {
    const fields = {};
    const root = document.getElementById('nc-root');
    if (!root) return fields;

    // Scan all labels in the CMS to find form fields
    root.querySelectorAll('label').forEach(label => {
      const text = label.textContent.trim();
      if (!text || fields[text]) return;
      // Walk up to find the widget container
      const parent = label.closest('[id]') || label.parentElement?.parentElement;
      if (!parent) return;

      const input = parent.querySelector('input, textarea, select');
      if (input) {
        if (input.tagName === 'SELECT') {
          fields[text] = input.options[input.selectedIndex]?.text || input.value;
        } else {
          fields[text] = input.value || '';
        }
      }
      const slate = parent.querySelector('[data-slate-editor], [contenteditable="true"]');
      if (slate) fields[text] = slate.innerText || '';
    });

    return fields;
  }

  function renderNewsPreview(f) {
    const title = f['Título'] || f['title'] || 'Título da Notícia';
    const date = f['Data'] || f['date'] || new Date().toLocaleDateString('pt-BR');
    const author = f['Autor'] || f['author'] || 'BINGO Team';
    const summary = f['Resumo Curto (1 a 2 linhas)'] || f['summary'] || '';
    const body = f['Corpo da Notícia'] || f['body'] || '';

    return `
      <div class="bingo-preview-badge">● Preview ao vivo</div>
      <div class="preview-news">
        <article class="preview-article">
          <time class="preview-date">${date}</time>
          <h1 class="preview-title">${title}</h1>
          <div class="preview-author">Por <strong>${author}</strong></div>
          ${summary ? `<p class="preview-summary">${summary}</p>` : ''}
          <div class="preview-divider"></div>
          <div class="preview-body">${body.replace(/\n/g, '<br>')}</div>
        </article>
        <div class="preview-card-section">
          <h3 class="preview-section-label">Card na listagem</h3>
          <div class="preview-news-card">
            <div class="preview-card-img">📰</div>
            <div class="preview-card-content">
              <time>${date}</time>
              <h4>${title}</h4>
              <p>${summary}</p>
              <span class="preview-read-more">Ler mais →</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderTeamPreview(f) {
    const name = f['Nome Completo'] || f['name'] || 'Nome do Pesquisador';
    const role = f['Cargo/Função'] || f['role'] || 'Cargo';
    const inst = f['Instituição'] || f['institution'] || 'Instituição';
    const stage = f['Grupo de Trabalho (Stage)'] || f['stage'] || '';
    const bio = f['Bio Curta'] || f['bio'] || '';
    const area = f['Área de Atuação'] || f['area'] || '';
    const city = f['Cidade / Estado / País'] || f['city'] || '';
    const email = f['E-mail para Contato'] || f['email'] || '';

    const stageColors = {
      'Stage 0': '#f43f5e', 'Stage I': '#f97316', 'Stage II': '#f59e0b',
      'Stage III': '#10b981', 'Stage IV': '#3b82f6', 'Stage V': '#a855f7',
      'Coordenação': '#22d3ee'
    };
    const stageColor = stageColors[stage] || '#94a3b8';

    return `
      <div class="bingo-preview-badge">● Preview ao vivo</div>
      <div class="preview-team">
        <div class="preview-team-hero">
          <div class="preview-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 class="preview-name">${name}</h1>
          <p class="preview-role">${role}</p>
          <p class="preview-inst">${inst}</p>
          <div class="preview-badges">
            ${stage ? `<span class="preview-stage" style="border-color:${stageColor};color:${stageColor}">${stage}</span>` : ''}
            ${area ? `<span class="preview-area">${area}</span>` : ''}
            ${city ? `<span class="preview-city">📍 ${city}</span>` : ''}
          </div>
        </div>
        ${bio ? `<div class="preview-bio-card"><p>${bio}</p></div>` : ''}
        ${email ? `<div class="preview-contact"><span>📧 ${email}</span></div>` : ''}
        <div class="preview-card-section">
          <h3 class="preview-section-label">Card na listagem da equipe</h3>
          <div class="preview-team-card">
            <div class="preview-card-avatar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h4>${name}</h4>
            <p class="card-role">${role}</p>
            <p class="card-inst">${inst}</p>
            ${stage ? `<span class="card-stage" style="border-color:${stageColor};color:${stageColor}">${stage}</span>` : ''}
          </div>
        </div>
      </div>`;
  }

  function renderPublicationPreview(f) {
    const title = f['Título'] || f['title'] || 'Título da Publicação';
    const authors = f['Autores'] || f['authors'] || 'Autores';
    const date = f['Data'] || f['date'] || '';
    const link = f['Link Externo (DOI/PDF)'] || f['link'] || '';
    const summary = f['Resumo'] || f['summary'] || '';

    return `
      <div class="bingo-preview-badge">● Preview ao vivo</div>
      <div class="preview-publication">
        <div class="preview-pub-card">
          <h2 class="preview-pub-title">${title}</h2>
          <p class="preview-pub-authors">${authors}</p>
          ${date ? `<time class="preview-pub-date">${date}</time>` : ''}
          ${summary ? `<p class="preview-pub-summary">${summary}</p>` : ''}
          ${link ? `<a class="preview-pub-link" href="#">📄 Acessar publicação →</a>` : ''}
        </div>
      </div>`;
  }

  function updatePreview() {
    // Find the preview iframe — search broadly since class names are hashed
    const iframe = document.querySelector('#nc-root iframe');
    if (!iframe) return;

    const collection = detectCollection();
    if (!collection) return;

    const fields = getFieldValues();
    if (Object.keys(fields).length === 0) return;

    let html = '';
    if (collection === 'news') html = renderNewsPreview(fields);
    else if (collection === 'team') html = renderTeamPreview(fields);
    else if (collection === 'publications') html = renderPublicationPreview(fields);

    if (!html) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="./preview.css">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>body{margin:0;padding:20px;font-family:'Outfit',sans-serif;}</style>
      </head><body>${html}</body></html>`);
      doc.close();
    } catch (e) {
      // Cross-origin or no iframe access — fail silently
    }
  }

  let previewTimer = null;
  function schedulePreviewUpdate() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 400);
  }

  function initLivePreview() {
    // Attach input/change listeners to the entire #nc-root
    // This is simpler and more robust than trying to find specific editor containers
    const ncRoot = document.getElementById('nc-root');
    if (!ncRoot) return;

    ncRoot.addEventListener('input', schedulePreviewUpdate, true);
    ncRoot.addEventListener('change', schedulePreviewUpdate, true);

    window.addEventListener('hashchange', () => {
      setTimeout(updatePreview, 600);
    });
  }

  /* ═══════════════════════════════════════════
     4. REGISTER PREVIEW STYLE WITH CMS
     ═══════════════════════════════════════════ */
  function registerPreviewStyles() {
    if (window.CMS) {
      try {
        CMS.registerPreviewStyle('./preview.css');
      } catch (e) { /* CMS not ready yet */ }
    }
  }

  /* ═══════════════════════════════════════════
     INIT — single observer for login detection
     ═══════════════════════════════════════════ */
  function init() {
    initThemeToggle();
    initLivePreview();
    registerPreviewStyles();
    setTimeout(registerPreviewStyles, 3000);

    // Single lightweight observer for login page detection
    const mainObs = new MutationObserver(() => {
      checkLoginPage();
    });
    mainObs.observe(document.body, { childList: true, subtree: true });

    // Initial check
    checkLoginPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
