/**
 * BINGO Telescope — Admin Panel Engine v5
 * Robust draft/unpublish with extensive error handling.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
   *  TOAST
   * ═══════════════════════════════════════════════════════════ */
  function showToast(msg, type) {
    try {
      var existing = document.querySelectorAll('.bingo-toast');
      var offsetY = existing.length * 60;
      var toast = document.createElement('div');
      toast.className = 'bingo-toast';
      var bg = { success: '#16a34a', error: '#dc2626', warn: '#ca8a04', info: '#2563eb' };
      Object.assign(toast.style, {
        position: 'fixed', bottom: (20 + offsetY) + 'px', right: '20px', zIndex: '99999',
        padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
        fontFamily: "'Outfit', sans-serif", color: '#fff', maxWidth: '400px',
        backgroundColor: bg[type] || bg.info,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        transform: 'translateY(20px)', opacity: '0',
        transition: 'all 0.3s ease',
      });
      toast.textContent = msg;
      document.body.appendChild(toast);
      requestAnimationFrame(function () {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      });
      setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 300);
      }, 4000);
    } catch (e) { console.warn('Toast error:', e); }
  }

  /* ═══════════════════════════════════════════════════════════
   *  LOGIN CUSTOMIZATION
   * ═══════════════════════════════════════════════════════════ */
  function checkLoginPage() {
    try {
      document.querySelectorAll('button').forEach(function (btn) {
        if (btn.textContent.includes('Login with GitHub')) {
          btn.textContent = '🔭 Acessar Painel BINGO';
          btn.classList.add('bingo-login-btn');
        }
      });
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  EDITOR VIEW DETECTION
   * ═══════════════════════════════════════════════════════════ */
  function isEditorView() {
    var hash = window.location.hash || '';
    return hash.indexOf('/entries/') !== -1 || hash.indexOf('/new') !== -1;
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIND THE "PUBLICADO" CHECKBOX
   * ═══════════════════════════════════════════════════════════ */
  function findPublishedCheckbox() {
    try {
      var root = document.getElementById('nc-root') || document.body;

      // Get ALL checkboxes in the CMS
      var checkboxes = root.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length === 0) {
        console.log('[BINGO] No checkboxes found in #nc-root');
        return null;
      }

      console.log('[BINGO] Found ' + checkboxes.length + ' checkbox(es)');

      // Strategy A: find checkbox near "Publicado" label text
      for (var c = 0; c < checkboxes.length; c++) {
        var cb = checkboxes[c];
        // Walk up from checkbox looking for "publicado" text
        var el = cb.parentElement;
        for (var d = 0; d < 8 && el; d++) {
          var txt = (el.textContent || '').toLowerCase();
          // Container text should mention "publicado" but be short enough
          // to be a field wrapper, not the entire form
          if (txt.length < 80 && txt.indexOf('publicado') !== -1) {
            console.log('[BINGO] Found "publicado" checkbox via parent text at depth ' + d);
            return cb;
          }
          el = el.parentElement;
        }
      }

      // Strategy B: Last checkbox = "published" (works for all BINGO collections)
      console.log('[BINGO] Using last-checkbox fallback');
      return checkboxes[checkboxes.length - 1];

    } catch (e) {
      console.error('[BINGO] findPublishedCheckbox error:', e);
      return null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
   *  TOGGLE THE CHECKBOX (multi-method)
   * ═══════════════════════════════════════════════════════════ */
  function toggleCheckbox(checkbox) {
    if (!checkbox) return false;

    console.log('[BINGO] Toggling checkbox, current checked=' + checkbox.checked);

    // METHOD 1: React __reactProps$ onChange
    try {
      var propKeys = Object.getOwnPropertyNames(checkbox);
      for (var i = 0; i < propKeys.length; i++) {
        if (propKeys[i].indexOf('__reactProps') === 0) {
          var rProps = checkbox[propKeys[i]];
          if (rProps && typeof rProps.onChange === 'function') {
            console.log('[BINGO] Method 1: calling __reactProps$.onChange');
            rProps.onChange({ target: { checked: !checkbox.checked, type: 'checkbox' } });
            return true;
          }
        }
      }
    } catch (e) { console.warn('[BINGO] Method 1 failed:', e); }

    // METHOD 2: React fiber tree walk
    try {
      var fiberKey = null;
      var allKeys = Object.getOwnPropertyNames(checkbox);
      for (var j = 0; j < allKeys.length; j++) {
        if (allKeys[j].indexOf('__reactFiber') === 0 || allKeys[j].indexOf('__reactInternal') === 0) {
          fiberKey = allKeys[j];
          break;
        }
      }
      if (fiberKey) {
        var fiber = checkbox[fiberKey];
        var cur = fiber;
        for (var depth = 0; depth < 25 && cur; depth++) {
          var fp = cur.memoizedProps || cur.pendingProps;
          if (fp && typeof fp.onChange === 'function') {
            console.log('[BINGO] Method 2: calling fiber onChange at depth ' + depth);
            fp.onChange({ target: { checked: !checkbox.checked, type: 'checkbox' } });
            return true;
          }
          cur = cur['return'];
        }
      }
    } catch (e) { console.warn('[BINGO] Method 2 failed:', e); }

    // METHOD 3: Click the parent <label> (triggers native checkbox toggle + React event)
    try {
      var label = checkbox.closest('label');
      if (label) {
        console.log('[BINGO] Method 3: clicking parent <label>');
        label.click();
        return true;
      }
    } catch (e) { console.warn('[BINGO] Method 3 failed:', e); }

    // METHOD 4: Click the checkbox's parent element (for non-label wrappers)
    try {
      var parent = checkbox.parentElement;
      if (parent) {
        console.log('[BINGO] Method 4: clicking parent element');
        parent.click();
        return true;
      }
    } catch (e) { console.warn('[BINGO] Method 4 failed:', e); }

    // METHOD 5: Native setter + events
    try {
      console.log('[BINGO] Method 5: native setter + events');
      var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set;
      setter.call(checkbox, !checkbox.checked);
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    } catch (e) { console.warn('[BINGO] Method 5 failed:', e); }

    // METHOD 6: Simple click
    try {
      console.log('[BINGO] Method 6: simple click()');
      checkbox.click();
      return true;
    } catch (e) { console.warn('[BINGO] Method 6 failed:', e); }

    return false;
  }

  /* ═══════════════════════════════════════════════════════════
   *  FIND SAVE BUTTON
   * ═══════════════════════════════════════════════════════════ */
  function findSaveButton() {
    try {
      var root = document.getElementById('nc-root') || document.body;
      var btns = root.querySelectorAll('button');
      var best = null;

      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var text = (b.textContent || '').trim();
        var lower = text.toLowerCase();

        // Skip our buttons
        if (b.id && b.id.indexOf('bingo') !== -1) continue;
        // Skip status indicators with checkmarks
        if (text.indexOf('✓') !== -1 || text.indexOf('✔') !== -1) continue;
        // Skip delete
        if (lower.indexOf('delete') !== -1 || lower.indexOf('exclu') !== -1) continue;
        // Skip duplicate
        if (lower.indexOf('duplic') !== -1) continue;

        // Match publish/save
        if (lower.indexOf('publish') !== -1 || lower.indexOf('save') !== -1
          || lower.indexOf('publicar') !== -1 || lower.indexOf('salvar') !== -1) {
          if (!best || text.length < (best.textContent || '').trim().length) {
            best = b;
          }
        }
      }
      return best;
    } catch (e) {
      console.warn('[BINGO] findSaveButton error:', e);
      return null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
   *  PERFORM THE TOGGLE + SAVE
   * ═══════════════════════════════════════════════════════════ */
  function performDraftToggle() {
    var checkbox = findPublishedCheckbox();
    if (!checkbox) {
      showToast('❌ Campo "Publicado" não encontrado. Abra o console (F12) para diagnóstico.', 'error');
      return;
    }

    var wasPublished = checkbox.checked;
    var toggled = toggleCheckbox(checkbox);

    if (!toggled) {
      showToast('❌ Não foi possível alterar o toggle. Altere manualmente no formulário.', 'error');
      return;
    }

    showToast(wasPublished ? '🔒 Convertendo para rascunho...' : '🚀 Publicando...', 'info');

    // Wait and retry to find & click Save button
    var attempts = 0;
    function trySave() {
      attempts++;
      var saveBtn = findSaveButton();
      if (saveBtn) {
        console.log('[BINGO] Save button found: "' + saveBtn.textContent.trim() + '"');
        saveBtn.click();
        setTimeout(function () {
          showToast(wasPublished ? '🔒 Salvo como rascunho!' : '🚀 Publicado com sucesso!', 'success');
          refreshUI();
        }, 1500);
      } else if (attempts < 8) {
        setTimeout(trySave, 500);
      } else {
        showToast('⚠️ Campo alterado. Clique em Save/Publish manualmente para salvar.', 'warn');
      }
    }
    setTimeout(trySave, 500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI: STATUS BADGE
   * ═══════════════════════════════════════════════════════════ */
  function updateBadge(isPublished) {
    try {
      var badge = document.getElementById('bingo-status-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'bingo-status-badge';
        Object.assign(badge.style, {
          position: 'fixed', top: '12px', left: '220px', zIndex: '9999',
          padding: '5px 12px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px',
        });
        document.body.appendChild(badge);
      }
      badge.style.display = 'flex';
      if (isPublished) {
        badge.innerHTML = '<span style="color:#22c55e;">●</span> PUBLICADO';
        badge.style.backgroundColor = '#0f172a';
        badge.style.color = '#e2e8f0';
        badge.style.border = '1px solid rgba(34,197,94,0.3)';
      } else {
        badge.innerHTML = '<span style="color:#eab308;">●</span> RASCUNHO';
        badge.style.backgroundColor = '#0f172a';
        badge.style.color = '#e2e8f0';
        badge.style.border = '1px solid rgba(234,179,8,0.3)';
      }
    } catch (e) {}
  }

  function hideBadge() {
    try {
      var badge = document.getElementById('bingo-status-badge');
      if (badge) badge.style.display = 'none';
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI: FLOATING ACTION BUTTON
   * ═══════════════════════════════════════════════════════════ */
  var floatingBtn = null;

  function createFloatingButton() {
    if (floatingBtn) return floatingBtn;
    floatingBtn = document.createElement('button');
    floatingBtn.id = 'bingo-draft-btn';
    floatingBtn.type = 'button';
    Object.assign(floatingBtn.style, {
      position: 'fixed', bottom: '24px', left: '24px', zIndex: '9998',
      display: 'none', alignItems: 'center', gap: '8px',
      padding: '12px 20px', borderRadius: '14px',
      fontSize: '13px', fontWeight: '700',
      fontFamily: "'Outfit', sans-serif",
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease',
      background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)',
    });
    floatingBtn.addEventListener('mouseenter', function () {
      floatingBtn.style.transform = 'translateY(-2px) scale(1.02)';
    });
    floatingBtn.addEventListener('mouseleave', function () {
      floatingBtn.style.transform = '';
    });
    floatingBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      performDraftToggle();
    });
    document.body.appendChild(floatingBtn);
    return floatingBtn;
  }

  function showFloatingButton(isPublished) {
    var btn = createFloatingButton();
    btn.style.display = 'flex';
    if (isPublished) {
      btn.innerHTML = '🔒 Despublicar (Rascunho)';
      btn.title = 'Converter para rascunho e salvar';
      btn.style.color = '#eab308';
      btn.style.borderColor = 'rgba(234,179,8,0.3)';
    } else {
      btn.innerHTML = '🚀 Publicar';
      btn.title = 'Publicar e salvar';
      btn.style.color = '#22c55e';
      btn.style.borderColor = 'rgba(34,197,94,0.3)';
    }
  }

  function hideFloatingButton() {
    if (floatingBtn) floatingBtn.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI: DROPDOWN INJECTION
   * ═══════════════════════════════════════════════════════════ */
  function tryInjectDropdown(isPublished) {
    try {
      if (document.getElementById('bingo-dropdown-item')) return;

      var allEls = document.querySelectorAll('button, li, a, div[role="menuitem"]');
      var duplicateEl = null;
      for (var i = 0; i < allEls.length; i++) {
        var t = (allEls[i].textContent || '').trim();
        if ((t.indexOf('Duplicate') !== -1 || t.indexOf('Duplicar') !== -1)
          && allEls[i].offsetParent !== null) {
          duplicateEl = allEls[i];
          break;
        }
      }
      if (!duplicateEl || !duplicateEl.parentElement) return;

      var item = duplicateEl.cloneNode(true);
      item.id = 'bingo-dropdown-item';
      item.innerHTML = '';
      item.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
      item.style.cursor = 'pointer';
      item.style.color = isPublished ? '#eab308' : '#22c55e';

      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.body.click();
        setTimeout(performDraftToggle, 200);
      });

      duplicateEl.parentElement.insertBefore(item, duplicateEl.nextSibling);
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN REFRESH LOOP
   * ═══════════════════════════════════════════════════════════ */
  function refreshUI() {
    try {
      if (!isEditorView()) {
        hideFloatingButton();
        hideBadge();
        return;
      }

      var checkbox = findPublishedCheckbox();
      if (checkbox) {
        var isPublished = checkbox.checked;
        showFloatingButton(isPublished);
        updateBadge(isPublished);
        tryInjectDropdown(isPublished);
      } else {
        // Still show button with generic state - checkbox might load later
        showFloatingButton(true);
        hideBadge();
      }
    } catch (e) {
      console.warn('[BINGO] refreshUI error:', e);
    }
  }

  /* ═══════════════════════════════════════════════════════════
   *  IMAGE FIXER
   * ═══════════════════════════════════════════════════════════ */
  function startImageFixer() {
    try {
      var adminIdx = window.location.pathname.indexOf('/admin');
      if (adminIdx <= 0) return;
      var basePath = window.location.pathname.substring(0, adminIdx);

      function fixImages(root) {
        root.querySelectorAll('img').forEach(function (img) {
          var src = img.getAttribute('src');
          if (src && src.indexOf('/images/') === 0 && src.indexOf(basePath) !== 0) {
            img.setAttribute('src', basePath + src);
          }
        });
      }

      function scan() {
        fixImages(document);
        document.querySelectorAll('iframe').forEach(function (f) {
          try {
            var d = f.contentDocument || (f.contentWindow && f.contentWindow.document);
            if (d) fixImages(d);
          } catch (e) {}
        });
      }

      scan();
      setInterval(scan, 500);
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  INIT
   * ═══════════════════════════════════════════════════════════ */
  function init() {
    console.log('[BINGO] Admin engine v5 loaded');

    try {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
      }
      setTimeout(function () {
        if (window.CMS) {
          try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
        }
      }, 3000);
    } catch (e) {}

    // Login
    try {
      new MutationObserver(checkLoginPage).observe(document.body, { childList: true, subtree: true });
      checkLoginPage();
    } catch (e) {}

    // Images
    startImageFixer();

    // Draft feature
    try {
      var pending = false;
      new MutationObserver(function () {
        if (!pending) {
          pending = true;
          requestAnimationFrame(function () {
            refreshUI();
            pending = false;
          });
        }
      }).observe(document.body, { childList: true, subtree: true });
      setInterval(refreshUI, 600);
    } catch (e) {
      console.error('[BINGO] Draft feature init error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
