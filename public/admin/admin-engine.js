/**
 * BINGO Telescope — Admin Engine (Simplified)
 * Login customization + Live Preview only.
 */
(function () {
  'use strict';

  /* ═══ LOGIN CUSTOMIZATION ═══ */
  function checkLoginPage() {
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent.includes('Login with GitHub')
    );
    if (btn) {
      btn.textContent = '🔭 Acessar Painel BINGO';
      btn.classList.add('bingo-login-btn');
    }
  }

  /* ═══ LIVE PREVIEW ═══ */
  function detectCollection() {
    const url = window.location.hash || window.location.pathname;
    if (url.includes('/news/')) return 'news';
    if (url.includes('/team/')) return 'team';
    if (url.includes('/publications/')) return 'publications';
    return null;
  }

  function getFieldValues() {
    const fields = {};
    const root = document.getElementById('nc-root');
    if (!root) return fields;
    root.querySelectorAll('label').forEach(label => {
      const text = label.textContent.trim();
      if (!text || fields[text]) return;
      const parent = label.closest('[id]') || label.parentElement?.parentElement;
      if (!parent) return;
      const input = parent.querySelector('input, textarea, select');
      if (input) {
        fields[text] = input.tagName === 'SELECT'
          ? (input.options[input.selectedIndex]?.text || input.value)
          : (input.value || '');
      }
      const slate = parent.querySelector('[data-slate-editor], [contenteditable="true"]');
      if (slate) fields[text] = slate.innerText || '';
    });
    return fields;
  }

  function renderPreview(collection, f) {
    if (collection === 'news') {
      const title = f['Título'] || f['title'] || 'Título';
      const date = f['Data'] || f['date'] || '';
      const author = f['Autor'] || f['author'] || 'BINGO Team';
      const summary = f['Resumo Curto (1 a 2 linhas)'] || f['summary'] || '';
      const body = f['Corpo da Notícia'] || f['body'] || '';
      return `<div class="bingo-preview-badge">Preview ao vivo</div>
        <h1 style="margin:0 0 8px;font-size:1.5rem">${title}</h1>
        <p style="color:#94a3b8;margin:0 0 4px">${date}</p>
        <p style="color:#94a3b8;margin:0 0 16px">Por <strong>${author}</strong></p>
        ${summary ? `<p style="color:#cbd5e1;margin:0 0 12px;font-style:italic">${summary}</p>` : ''}
        <hr style="border-color:#334155;margin:12px 0">
        <div style="line-height:1.7">${body.replace(/\n/g, '<br>')}</div>`;
    }
    if (collection === 'team') {
      const name = f['Nome Completo'] || f['name'] || 'Nome';
      const role = f['Cargo/Função'] || f['role'] || '';
      const inst = f['Instituição'] || f['institution'] || '';
      const stage = f['Grupo de Trabalho (Stage)'] || f['stage'] || '';
      const bio = f['Bio Curta'] || f['bio'] || '';
      return `<div class="bingo-preview-badge">Preview ao vivo</div>
        <h1 style="margin:0 0 4px;font-size:1.5rem">${name}</h1>
        <p style="color:#22d3ee;margin:0 0 4px">${role}</p>
        <p style="color:#94a3b8;margin:0 0 8px">${inst}</p>
        ${stage ? `<span style="display:inline-block;padding:3px 10px;border:1px solid #22d3ee;border-radius:12px;color:#22d3ee;font-size:12px;margin-bottom:12px">${stage}</span>` : ''}
        ${bio ? `<p style="color:#cbd5e1;margin-top:12px;line-height:1.6">${bio}</p>` : ''}`;
    }
    if (collection === 'publications') {
      const title = f['Título'] || f['title'] || 'Título';
      const authors = f['Autores'] || f['authors'] || '';
      const date = f['Data'] || f['date'] || '';
      const summary = f['Resumo'] || f['summary'] || '';
      return `<div class="bingo-preview-badge">Preview ao vivo</div>
        <h2 style="margin:0 0 8px;font-size:1.3rem">${title}</h2>
        <p style="color:#94a3b8;margin:0 0 4px">${authors}</p>
        ${date ? `<p style="color:#64748b;margin:0 0 12px;font-size:13px">${date}</p>` : ''}
        ${summary ? `<p style="color:#cbd5e1;line-height:1.6">${summary}</p>` : ''}`;
    }
    return '';
  }

  function updatePreview() {
    const iframe = document.querySelector('#nc-root iframe');
    if (!iframe) return;
    const collection = detectCollection();
    if (!collection) return;
    const fields = getFieldValues();
    if (Object.keys(fields).length === 0) return;
    const html = renderPreview(collection, fields);
    if (!html) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { margin:0; padding:20px; font-family:'Outfit',sans-serif;
                 background:#0f172a; color:#e2e8f0; }
        </style>
      </head><body>${html}</body></html>`);
      doc.close();
    } catch (e) { /* fail silently */ }
  }

  let timer = null;
  function scheduleUpdate() {
    clearTimeout(timer);
    timer = setTimeout(updatePreview, 400);
  }

  /* ═══ INIT ═══ */
  function init() {
    // Login customization
    const obs = new MutationObserver(checkLoginPage);
    obs.observe(document.body, { childList: true, subtree: true });
    checkLoginPage();

    // Live preview
    const ncRoot = document.getElementById('nc-root');
    if (ncRoot) {
      ncRoot.addEventListener('input', scheduleUpdate, true);
      ncRoot.addEventListener('change', scheduleUpdate, true);
    }
    window.addEventListener('hashchange', () => setTimeout(updatePreview, 600));

    // Register preview style with CMS
    if (window.CMS) {
      try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    }
    setTimeout(() => {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
