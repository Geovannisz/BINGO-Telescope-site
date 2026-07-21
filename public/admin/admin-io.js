/**
 * BINGO Telescope — Import / Export Engine for Decap CMS
 * Supports JSON bulk import/export for: news, team, publications.
 * Optional fields are handled gracefully (omitted keys = not set).
 */
(function () {
  'use strict';

  /* ── Collection schemas (mirrors config.yml) ── */
  const SCHEMAS = {
    news: {
      label: 'Notícias',
      folder: 'src/content/news',
      slugPattern: (e) => {
        const d = e.date ? new Date(e.date) : new Date();
        const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
        return `${y}-${m}-${day}-${slugify(e.title)}`;
      },
      required: ['title','date','summary'],
      optional: ['author','image'],
      hasBody: true
    },
    team: {
      label: 'Equipe',
      folder: 'src/content/team',
      slugPattern: (e) => slugify(e.name),
      required: ['name','role','institution'],
      optional: [
        'photo','stage','city','area','email','lattes','orcid','linkedin','researchgate',
        'bio','interest_origin','motivation','years_researching','research_lines','memorable_experience',
        'project_title','project_description','project_problem','project_importance','project_methods','project_results','project_challenges',
        'explain_simple','biggest_curiosity','common_myth','impressive_discovery','career_advice',
        'published_articles','books_chapters','groups_labs','future_projects',
        'authorized','credit_name'
      ],
      hasBody: false
    },
    publications: {
      label: 'Publicações',
      folder: 'src/content/publications',
      slugPattern: (e) => {
        const d = e.date ? new Date(e.date) : new Date();
        return `${d.getFullYear()}-${slugify(e.title).substring(0,60)}`;
      },
      required: ['title','authors','date'],
      optional: ['link','summary'],
      hasBody: false
    }
  };

  function slugify(str) {
    return (str||'untitled').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').substring(0,80);
  }

  /* ── Frontmatter parser / serializer ── */
  function parseFrontmatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: text };
    const meta = {};
    let currentKey = null;
    m[1].split(/\r?\n/).forEach(line => {
      const kv = line.match(/^(\w[\w_]*):\s*(.*)$/);
      if (kv) {
        currentKey = kv[1];
        let val = kv[2].trim();
        if (val === '""' || val === "''") val = '';
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (/^\d{4}-\d{2}-\d{2}T/.test(val)) { /* keep as string */ }
        else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1,-1);
        else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1,-1);
        meta[currentKey] = val;
      } else if (currentKey && /^\s+/.test(line)) {
        meta[currentKey] = (meta[currentKey] || '') + ' ' + line.trim();
      }
    });
    return { meta, body: m[2].trim() };
  }

  function toFrontmatter(obj, body) {
    let lines = ['---'];
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === '') continue;
      if (typeof v === 'boolean') { lines.push(`${k}: ${v}`); continue; }
      if (Array.isArray(v)) {
        lines.push(`${k}:`);
        v.forEach(i => lines.push(`  - "${i}"`));
        continue;
      }
      const s = String(v);
      if (s.includes(':') || s.includes('#') || s.includes('"') || s.includes('\n') || /^\d/.test(s) && !(/^\d{4}-\d{2}-\d{2}/.test(s))) {
        lines.push(`${k}: "${s.replace(/"/g,'\\"')}"`);
      } else {
        lines.push(`${k}: ${s}`);
      }
    }
    lines.push('---');
    if (body) lines.push('', body);
    return lines.join('\n') + '\n';
  }

  /* ── Export logic ── */
  async function exportCollection(type) {
    const schema = SCHEMAS[type];
    if (!schema) return;
    // Read files via GitHub API (works when authenticated via Decap)
    const entries = await readCollectionFromDOM(type);
    if (!entries || entries.length === 0) {
      showToast(`Nenhuma entrada encontrada para ${schema.label}.`, 'warn');
      return;
    }
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g,'-').substring(0,19);
    a.download = `bingo-${type}-export-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${entries.length} ${schema.label.toLowerCase()} exportada(s) com sucesso!`, 'success');
  }

  /** Reads .md files from git tree via GitHub API */
  async function readCollectionFromDOM(type) {
    const schema = SCHEMAS[type];
    const repo = 'Geovannisz/BINGO-Telescope-site';
    const branch = 'main';
    const folder = schema.folder;
    try {
      // Try fetching via GitHub API
      const token = getGitHubToken();
      const headers = token ? { Authorization: `token ${token}` } : {};
      const listRes = await fetch(`https://api.github.com/repos/${repo}/contents/${folder}?ref=${branch}`, { headers });
      if (!listRes.ok) throw new Error(`GitHub API ${listRes.status}`);
      const files = await listRes.json();
      const mdFiles = files.filter(f => f.name.endsWith('.md'));
      const entries = [];
      for (const f of mdFiles) {
        const contentRes = await fetch(f.download_url);
        const text = await contentRes.text();
        const { meta, body } = parseFrontmatter(text);
        const entry = { ...meta, _filename: f.name };
        if (schema.hasBody && body) entry._body = body;
        entries.push(entry);
      }
      return entries;
    } catch (e) {
      console.warn('GitHub API failed, trying local fallback:', e);
      return tryLocalExport(type);
    }
  }

  function getGitHubToken() {
    try {
      const raw = localStorage.getItem('netlify-cms-user') || sessionStorage.getItem('netlify-cms-user');
      if (raw) { const u = JSON.parse(raw); return u.token || u.access_token; }
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('token') || k.includes('auth'))) {
          const v = localStorage.getItem(k);
          if (v && v.startsWith('gho_')) return v;
        }
      }
    } catch(e) {}
    return null;
  }

  /** Fallback: read entries from the CMS internal store */
  function tryLocalExport(type) {
    showToast('Exportação via API falhou. Verifique sua autenticação.', 'warn');
    return [];
  }

  /* ── Import logic ── */
  function importCollection(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        let data = JSON.parse(text);
        if (!Array.isArray(data)) data = [data];
        showImportPreview(type, data);
      } catch (e) {
        showToast('Erro ao ler o arquivo JSON: ' + e.message, 'error');
      }
    });
    input.click();
  }

  function importBibTex(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bib,.txt';
    input.addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = parseBibTex(text);
        if (data.length === 0) {
            showToast('Nenhum artigo BibTeX válido encontrado.', 'warn');
            return;
        }
        showImportPreview(type, data);
      } catch (e) {
        showToast('Erro ao ler o arquivo BibTeX: ' + e.message, 'error');
      }
    });
    input.click();
  }

  function parseBibTex(text) {
    const entries = [];
    const entryRegex = /@\w+\s*\{([^,]+),([\s\S]*?)\n\}/g;
    let match;
    while ((match = entryRegex.exec(text)) !== null) {
      const id = match[1].trim();
      const body = match[2];
      const entry = {};
      
      const lines = body.split('\n');
      for (let line of lines) {
         line = line.trim();
         if (!line) continue;
         const eqIdx = line.indexOf('=');
         if (eqIdx === -1) continue;
         const key = line.substring(0, eqIdx).trim().toLowerCase();
         let val = line.substring(eqIdx + 1).trim();
         if (val.endsWith(',')) val = val.substring(0, val.length - 1).trim();
         
         // Remove outer braces or quotes
         if (val.startsWith('{') && val.endsWith('}')) val = val.substring(1, val.length - 1).trim();
         else if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1).trim();
         
         if (key === 'author') {
             val = val.split(' and ').map(a => {
                 let name = a.replace(/[{}]/g, '').trim();
                 if (name.includes(',')) {
                     const parts = name.split(',').map(p => p.trim());
                     name = parts[1] + ' ' + parts[0];
                 }
                 return name.replace(/\s*~\s*/g, ' ').replace(/\s+/g, ' ');
             }).join(', ');
         }
         if (key === 'title') {
             val = val.replace(/[{}]/g, '').trim();
         }
         entry[key] = val;
      }
      
      const pub = {};
      if (entry.title) pub.title = entry.title;
      if (entry.author) pub.authors = entry.author;
      
      let year = entry.year || new Date().getFullYear();
      let monthStr = entry.month || '01';
      const months = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
      let month = months[monthStr.toLowerCase().substring(0,3)] || '01';
      if (!isNaN(parseInt(monthStr)) && parseInt(monthStr) > 0) {
          month = String(parseInt(monthStr)).padStart(2, '0');
      }
      pub.date = `${year}-${month}-01T12:00:00Z`;
      
      if (entry.doi) pub.doi = entry.doi;
      if (entry.adsurl) pub.link = entry.adsurl;
      else if (entry.url) pub.link = entry.url;
      else if (entry.doi) pub.link = `https://doi.org/${entry.doi}`;
      
      if (entry.journal) pub.journal = entry.journal.replace(/\\aap/g, 'Astronomy & Astrophysics').replace(/\\mnras/g, 'Monthly Notices of the Royal Astronomical Society').replace(/\\prd/g, 'Physical Review D').replace(/\\apj/g, 'The Astrophysical Journal').replace(/[{}]/g, '');
      if (entry.volume) pub.volume = entry.volume;
      if (entry.eid) pub.pages = entry.eid;
      else if (entry.pages) pub.pages = entry.pages;
      
      pub.category = 'Série Principal';
      
      if (pub.title && pub.authors) entries.push(pub);
    }
    return entries;
  }

  function showImportPreview(type, entries) {
    const schema = SCHEMAS[type];
    const overlay = document.createElement('div');
    overlay.className = 'bingo-io-overlay';

    // Validate entries
    const results = entries.map((entry, i) => {
      const missing = schema.required.filter(f => !entry[f] && entry[f] !== false && entry[f] !== 0);
      return { entry, index: i, valid: missing.length === 0, missing };
    });
    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.filter(r => !r.valid).length;

    let tableRows = results.map(r => {
      const nameField = type === 'team' ? r.entry.name : r.entry.title;
      const status = r.valid
        ? '<span class="bio-status bio-ok">✓ Válido</span>'
        : `<span class="bio-status bio-err">✗ Faltam: ${r.missing.join(', ')}</span>`;
      return `<tr class="${r.valid ? '' : 'bio-row-invalid'}">
        <td>${r.index + 1}</td>
        <td title="${esc(JSON.stringify(r.entry))}">${esc(nameField || '(sem nome)')}</td>
        <td>${status}</td>
      </tr>`;
    }).join('');

    const filledFields = (entry) => {
      return Object.keys(entry).filter(k => !k.startsWith('_') && entry[k] !== '' && entry[k] !== null && entry[k] !== undefined).length;
    };

    overlay.innerHTML = `
      <div class="bingo-io-modal">
        <div class="bingo-io-modal-header">
          <h2>📥 Importar ${schema.label}</h2>
          <button class="bingo-io-close" title="Fechar">✕</button>
        </div>
        <div class="bingo-io-modal-body">
          <div class="bingo-io-stats">
            <div class="bio-stat"><span class="bio-stat-num">${entries.length}</span><span class="bio-stat-label">Total</span></div>
            <div class="bio-stat bio-stat-ok"><span class="bio-stat-num">${validCount}</span><span class="bio-stat-label">Válidos</span></div>
            <div class="bio-stat bio-stat-err"><span class="bio-stat-num">${invalidCount}</span><span class="bio-stat-label">Inválidos</span></div>
          </div>
          <div class="bingo-io-table-wrap">
            <table class="bingo-io-table">
              <thead><tr><th>#</th><th>${type === 'team' ? 'Nome' : 'Título'}</th><th>Status</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
          ${invalidCount > 0 ? '<p class="bio-warn">⚠ Entradas inválidas serão ignoradas. Campos obrigatórios: <code>' + schema.required.join(', ') + '</code></p>' : ''}
        </div>
        <div class="bingo-io-modal-footer">
          <button class="bingo-io-btn bingo-io-btn-cancel">Cancelar</button>
          <button class="bingo-io-btn bingo-io-btn-confirm" ${validCount === 0 ? 'disabled' : ''}>
            Importar ${validCount} entrada(s)
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector('.bingo-io-close').onclick = () => overlay.remove();
    overlay.querySelector('.bingo-io-btn-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('.bingo-io-btn-confirm').onclick = async () => {
      const validEntries = results.filter(r => r.valid).map(r => r.entry);
      overlay.remove();
      await executeImport(type, validEntries);
    };
  }

  async function executeImport(type, entries) {
    const schema = SCHEMAS[type];
    const repo = 'Geovannisz/BINGO-Telescope-site';
    const branch = 'main';
    const token = getGitHubToken();
    if (!token) {
      showToast('Token GitHub não encontrado. Faça login no CMS primeiro.', 'error');
      return;
    }
    const headers = { Authorization: `token ${token}`, 'Content-Type': 'application/json' };
    let success = 0, fail = 0;
    showToast(`Importando ${entries.length} ${schema.label.toLowerCase()}...`, 'info');

    for (const entry of entries) {
      try {
        const slug = schema.slugPattern(entry);
        const filename = `${slug}.md`;
        const path = `${schema.folder}/${filename}`;

        // Build frontmatter object (only include non-empty fields)
        const fmObj = {};
        const allFields = [...schema.required, ...schema.optional];
        for (const field of allFields) {
          if (entry[field] !== undefined && entry[field] !== null && entry[field] !== '') {
            fmObj[field] = entry[field];
          }
        }
        // Include any extra fields not in schema
        for (const [k, v] of Object.entries(entry)) {
          if (!k.startsWith('_') && !allFields.includes(k) && v !== undefined && v !== null && v !== '') {
            fmObj[k] = v;
          }
        }
        const body = schema.hasBody ? (entry._body || '') : '';
        const content = toFrontmatter(fmObj, body);
        const contentB64 = btoa(unescape(encodeURIComponent(content)));

        // Check if file exists
        let sha;
        try {
          const existing = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, { headers });
          if (existing.ok) { const d = await existing.json(); sha = d.sha; }
        } catch(e) {}

        const payload = {
          message: `[CMS Import] Add ${type}: ${slug}`,
          content: contentB64,
          branch
        };
        if (sha) payload.sha = sha;

        const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
          method: 'PUT', headers, body: JSON.stringify(payload)
        });
        if (res.ok) success++; else { fail++; console.error(`Failed ${filename}:`, await res.text()); }
      } catch (e) {
        fail++;
        console.error('Import error:', e);
      }
    }
    showToast(`Importação concluída: ${success} sucesso(s), ${fail} erro(s).`, fail > 0 ? 'warn' : 'success');
    if (success > 0) {
      setTimeout(() => {
        showToast('Recarregue a página para ver as novas entradas.', 'info');
      }, 2000);
    }
  }

  /* ── UI Helpers ── */
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function showToast(msg, type) {
    const existing = document.querySelectorAll('.bingo-io-toast');
    const offsetY = existing.length * 60;
    const toast = document.createElement('div');
    toast.className = `bingo-io-toast bingo-io-toast-${type || 'info'}`;
    const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'} ${esc(msg)}</span>`;
    toast.style.bottom = (20 + offsetY) + 'px';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('bingo-io-toast-show'));
    setTimeout(() => { toast.classList.remove('bingo-io-toast-show'); setTimeout(() => toast.remove(), 400); }, 4500);
  }

  /* ── Toolbar injection ── */
  function injectToolbar() {
    if (document.getElementById('bingo-io-toolbar')) return;
    const bar = document.createElement('div');
    bar.id = 'bingo-io-toolbar';
    bar.innerHTML = `
      <div class="bingo-io-toolbar-inner">
        <span class="bingo-io-toolbar-title">📦 Importar / Exportar</span>
        <div class="bingo-io-toolbar-actions">
          ${Object.entries(SCHEMAS).map(([k, v]) => `
            <div class="bingo-io-group">
              <span class="bingo-io-group-label">${v.label}</span>
              <button class="bingo-io-btn bingo-io-btn-export" data-type="${k}" title="Exportar ${v.label} (JSON)">⬇ Exportar</button>
              <button class="bingo-io-btn bingo-io-btn-import" data-type="${k}" title="Importar ${v.label} (JSON)">⬆ JSON</button>
              ${k === 'publications' ? `<button class="bingo-io-btn bingo-io-btn-bibtex" data-type="${k}" title="Importar BibTeX">📚 BibTeX</button>` : ''}
            </div>
          `).join('')}
        </div>
        <button class="bingo-io-toolbar-toggle" title="Minimizar">▾</button>
      </div>`;
    document.body.appendChild(bar);

    // Event delegation
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('bingo-io-toolbar-toggle')) {
        bar.classList.toggle('bingo-io-toolbar-collapsed');
        btn.textContent = bar.classList.contains('bingo-io-toolbar-collapsed') ? '▴' : '▾';
        return;
      }
      const type = btn.dataset.type;
      if (!type) return;
      if (btn.classList.contains('bingo-io-btn-export')) exportCollection(type);
      if (btn.classList.contains('bingo-io-btn-import')) importCollection(type);
      if (btn.classList.contains('bingo-io-btn-bibtex')) importBibTex(type);
    });
  }

  /* ── Bootstrap ── */
  function waitForCMS() {
    const check = setInterval(() => {
      const header = document.querySelector('[class*="AppHeader"]') || document.querySelector('header') || document.querySelector('nav');
      if (header || document.querySelector('[id="nc-root"]')) {
        clearInterval(check);
        setTimeout(injectToolbar, 800);
      }
    }, 500);
    // Fallback: inject after 5s regardless
    setTimeout(() => { clearInterval(check); injectToolbar(); }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForCMS);
  } else {
    waitForCMS();
  }
})();
