/**
 * BINGO Telescope — Admin Panel Engine
 * Theme toggle + Live Preview system
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
     ═══════════════════════════════════════════ */
  function initLoginCustomization() {
    const obs = new MutationObserver(() => {
      // Detect login page by looking for the GitHub login button
      const btns = document.querySelectorAll('button');
      let isLoginPage = false;
      btns.forEach(btn => {
        if (btn.textContent.includes('Login with GitHub')) {
          btn.textContent = '🔭 Acessar Painel BINGO';
          btn.classList.add('bingo-login-btn');
          isLoginPage = true;
        }
        // Also catch already-renamed buttons
        if (btn.textContent.includes('Acessar Painel BINGO')) {
          btn.classList.add('bingo-login-btn');
          isLoginPage = true;
        }
      });

      // Toggle body class for login-specific background
      if (isLoginPage) {
        document.body.classList.add('bingo-login');
      } else if (document.querySelector('header') || document.querySelector('aside')) {
        // We're in the CMS dashboard, remove login class
        document.body.classList.remove('bingo-login');
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     3. HIDE VIEW TOGGLE BUTTONS
     ═══════════════════════════════════════════ */
  function initHideViewToggles() {
    const obs = new MutationObserver(() => {
      document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.trim() === '' && btn.querySelector('svg')) {
          if (btn.closest('[class*="CollectionTop"]')) {
            btn.style.display = 'none';
          }
        }
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     4. LIVE PREVIEW ENGINE
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
    const controlPane = document.querySelector('[class*="ControlPaneContainer"], [class*="EditorControlPane"]');
    if (!controlPane) return fields;

    const widgets = controlPane.querySelectorAll('[id]');
    widgets.forEach(w => {
      const input = w.querySelector('input, textarea, select, [data-slate-editor], [contenteditable="true"]');
      if (input) {
        const label = w.querySelector('label');
        const key = label ? label.textContent.trim() : w.id;
        if (input.tagName === 'SELECT') {
          fields[key] = input.options[input.selectedIndex]?.text || input.value;
        } else if (input.hasAttribute('contenteditable') || input.hasAttribute('data-slate-editor')) {
          fields[key] = input.innerText || '';
        } else {
          fields[key] = input.value || '';
        }
      }
    });

    // Fallback: scan all labeled fields
    controlPane.querySelectorAll('label').forEach(label => {
      const text = label.textContent.trim();
      if (fields[text]) return;
      const parent = label.closest('[class*="Widget"]') || label.parentElement?.parentElement;
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
    const previewPane = document.querySelector('[class*="PreviewPaneContainer"]');
    if (!previewPane) return;

    const iframe = previewPane.querySelector('iframe');
    const collection = detectCollection();
    if (!collection) return;

    const fields = getFieldValues();
    if (Object.keys(fields).length === 0) return;

    let html = '';
    if (collection === 'news') html = renderNewsPreview(fields);
    else if (collection === 'team') html = renderTeamPreview(fields);
    else if (collection === 'publications') html = renderPublicationPreview(fields);

    if (!html) return;

    // Write to iframe or create overlay
    if (iframe) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const cssLink = document.querySelector('link[href*="preview.css"]');
        const cssHref = cssLink ? cssLink.href : '/admin/preview.css';
        doc.open();
        doc.write(`<!DOCTYPE html><html><head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="${cssHref}">
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>body{margin:0;padding:20px;font-family:'Outfit',sans-serif;}</style>
        </head><body>${html}</body></html>`);
        doc.close();
      } catch (e) {
        // Cross-origin fallback: inject into pane directly
        injectPreviewOverlay(previewPane, html);
      }
    } else {
      injectPreviewOverlay(previewPane, html);
    }
  }

  function injectPreviewOverlay(container, html) {
    let overlay = container.querySelector('.bingo-preview-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'bingo-preview-overlay';
      overlay.style.cssText = 'position:absolute;inset:0;overflow:auto;padding:24px;z-index:10;background:var(--bg-secondary);';
      container.style.position = 'relative';
      container.appendChild(overlay);
    }
    overlay.innerHTML = html;
  }

  let previewTimer = null;
  function schedulePreviewUpdate() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 300);
  }

  function initLivePreview() {
    // Watch for editor to appear, then attach listeners
    const editorObs = new MutationObserver(() => {
      const editor = document.querySelector('[class*="EditorControlPane"], [class*="ControlPaneContainer"]');
      if (!editor) return;
      if (editor.dataset.bingoWatched) return;
      editor.dataset.bingoWatched = 'true';

      // Listen for input events on form fields
      editor.addEventListener('input', schedulePreviewUpdate, true);
      editor.addEventListener('change', schedulePreviewUpdate, true);

      // MutationObserver for contenteditable / Slate changes
      const slateObs = new MutationObserver(schedulePreviewUpdate);
      slateObs.observe(editor, { childList: true, subtree: true, characterData: true });

      // Initial render
      setTimeout(updatePreview, 500);
    });
    editorObs.observe(document.body, { childList: true, subtree: true });

    // Also listen for hash changes (navigation between entries)
    window.addEventListener('hashchange', () => {
      setTimeout(updatePreview, 600);
    });
  }

  /* ═══════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════ */
  function registerPreviewStyles() {
    // Register preview stylesheet with Decap CMS
    if (window.CMS) {
      try {
        CMS.registerPreviewStyle('./preview.css');
      } catch (e) { /* CMS not ready yet, will retry */ }
    }
  }

  function init() {
    initThemeToggle();
    initLoginCustomization();
    initHideViewToggles();
    initLivePreview();
    registerPreviewStyles();
    // Retry preview style registration after CMS fully loads
    setTimeout(registerPreviewStyles, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
