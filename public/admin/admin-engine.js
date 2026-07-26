/**
 * BINGO Telescope — Admin Panel Engine v6
 * Now detects any toggle type (not just checkboxes)
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
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  LOGIN
   * ═══════════════════════════════════════════════════════════ */
  function checkLoginPage() {
    try {
      document.querySelectorAll('button').forEach(function (btn) {
        if (btn.textContent.indexOf('Login with GitHub') !== -1) {
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
   *  FIND THE "PUBLICADO" TOGGLE (any type)
   *
   *  Decap CMS 3.15 does NOT use <input type="checkbox"> for
   *  boolean widgets. It uses styled React components.
   *  We search for the toggle via the "Publicado" label text.
   * ═══════════════════════════════════════════════════════════ */
  var diagDone = false;

  function findPublishedToggle() {
    try {
      var root = document.getElementById('nc-root') || document.body;

      // ONE-TIME diagnostic dump to console
      if (!diagDone && isEditorView()) {
        diagDone = true;
        var allInputs = root.querySelectorAll('input');
        console.log('[BINGO] Diagnostic: ' + allInputs.length + ' <input> elements in #nc-root');
        for (var d = 0; d < allInputs.length; d++) {
          console.log('[BINGO]   input #' + d + ': type=' + allInputs[d].type
            + ' class=' + allInputs[d].className + ' id=' + allInputs[d].id);
        }
        var roleEls = root.querySelectorAll('[role]');
        console.log('[BINGO] Diagnostic: ' + roleEls.length + ' elements with [role] attribute');
        for (var r = 0; r < Math.min(roleEls.length, 20); r++) {
          console.log('[BINGO]   role=' + roleEls[r].getAttribute('role')
            + ' tag=' + roleEls[r].tagName + ' class=' + roleEls[r].className.substring(0, 60));
        }
      }

      // ── Find all elements that contain "Publicado" or "Published" text ──
      // Then find the nearest interactive toggle element
      var allEls = root.querySelectorAll('label, span, p, div, h3, h4, h5');

      for (var i = 0; i < allEls.length; i++) {
        var el = allEls[i];
        var text = (el.textContent || '').trim().toLowerCase();

        // Match field labels: short text containing "publicado"
        if (text.length > 60) continue;
        if (text.indexOf('publicado') === -1 && text.indexOf('published') === -1) continue;

        // Skip elements inside iframe (preview pane)
        if (el.closest('iframe')) continue;

        // Found a "Publicado" label! Now search for the toggle nearby.
        // Walk up to find a field container, then search for any interactive element.
        var container = el.parentElement;
        for (var depth = 0; depth < 10 && container && container !== root; depth++) {
          // Search for any kind of toggle/switch/checkbox inside this container
          var toggle = findToggleInContainer(container);
          if (toggle) {
            console.log('[BINGO] Found toggle near "Publicado" at depth ' + depth
              + ': tag=' + toggle.tagName + ' role=' + toggle.getAttribute('role')
              + ' type=' + (toggle.type || 'none') + ' class=' + (toggle.className || '').substring(0, 60));
            return toggle;
          }
          container = container.parentElement;
        }

        // Also check next siblings
        var sib = el.nextElementSibling;
        for (var s = 0; s < 5 && sib; s++) {
          var sibToggle = findToggleInContainer(sib);
          if (sibToggle) {
            console.log('[BINGO] Found toggle in sibling of "Publicado"');
            return sibToggle;
          }
          sib = sib.nextElementSibling;
        }
      }

      // ── Fallback: find last toggle-like element in the form ──
      var lastToggle = findLastToggle(root);
      if (lastToggle) {
        console.log('[BINGO] Using last-toggle fallback: tag=' + lastToggle.tagName);
        return lastToggle;
      }

      return null;
    } catch (e) {
      console.error('[BINGO] findPublishedToggle error:', e);
      return null;
    }
  }

  /**
   * Search for any kind of toggle element inside a container.
   * Covers: <input type="checkbox">, [role="switch"], [role="checkbox"],
   * react-toggle, and any element with toggle/switch class names.
   */
  function findToggleInContainer(container) {
    if (!container) return null;

    // 1. Standard checkbox
    var cb = container.querySelector('input[type="checkbox"]');
    if (cb) return cb;

    // 2. ARIA roles
    var sw = container.querySelector('[role="switch"], [role="checkbox"]');
    if (sw) return sw;

    // 3. React-toggle component (class names)
    var reactToggle = container.querySelector('.react-toggle, [class*="react-toggle"]');
    if (reactToggle) {
      // The clickable target in react-toggle
      var innerCb = reactToggle.querySelector('input');
      return innerCb || reactToggle;
    }

    // 4. Generic toggle/switch class names (styled-components may have hashed names
    //    but often include "Toggle" or "Switch" in the component name)
    var styledToggle = container.querySelector(
      '[class*="Toggle"], [class*="toggle"], [class*="Switch"], [class*="switch"]'
    );
    if (styledToggle) {
      var innerInput = styledToggle.querySelector('input');
      return innerInput || styledToggle;
    }

    // 5. Any clickable div/span that looks like a toggle (has aria-checked)
    var ariaToggle = container.querySelector('[aria-checked]');
    if (ariaToggle) return ariaToggle;

    return null;
  }

  /**
   * Find the last toggle-like element in the root (heuristic fallback).
   */
  function findLastToggle(root) {
    // Try checkboxes first
    var cbs = root.querySelectorAll('input[type="checkbox"]');
    if (cbs.length > 0) return cbs[cbs.length - 1];

    // Then role switches
    var sws = root.querySelectorAll('[role="switch"], [role="checkbox"]');
    if (sws.length > 0) return sws[sws.length - 1];

    // Then aria-checked elements
    var acs = root.querySelectorAll('[aria-checked]');
    if (acs.length > 0) return acs[acs.length - 1];

    // Then react-toggle
    var rts = root.querySelectorAll('.react-toggle, [class*="react-toggle"]');
    if (rts.length > 0) return rts[rts.length - 1];

    // Then generic toggles
    var gts = root.querySelectorAll('[class*="Toggle"], [class*="Switch"]');
    if (gts.length > 0) return gts[gts.length - 1];

    return null;
  }

  /* ═══════════════════════════════════════════════════════════
   *  READ TOGGLE STATE
   * ═══════════════════════════════════════════════════════════ */
  function getToggleState(toggle) {
    if (!toggle) return true;
    // Checkbox
    if (toggle.type === 'checkbox') return toggle.checked;
    // aria-checked
    var ariaChecked = toggle.getAttribute('aria-checked');
    if (ariaChecked !== null) return ariaChecked === 'true';
    // React-toggle container (check for "checked" class)
    if (toggle.className && toggle.className.indexOf('checked') !== -1) return true;
    if (toggle.className && toggle.className.indexOf('checked') === -1) return false;
    // Input value
    if (toggle.value !== undefined && toggle.value !== '') {
      return toggle.value !== 'false' && toggle.value !== '0';
    }
    return true; // default assume published
  }

  /* ═══════════════════════════════════════════════════════════
   *  TOGGLE THE ELEMENT (multi-method)
   * ═══════════════════════════════════════════════════════════ */
  function performToggle(toggle) {
    if (!toggle) return false;

    var currentState = getToggleState(toggle);
    console.log('[BINGO] Performing toggle. Current state: ' + (currentState ? 'published' : 'draft'));

    // METHOD 1: React props onChange (direct)
    try {
      var propKeys = Object.getOwnPropertyNames(toggle);
      for (var i = 0; i < propKeys.length; i++) {
        if (propKeys[i].indexOf('__reactProps') === 0) {
          var rProps = toggle[propKeys[i]];
          if (rProps) {
            if (typeof rProps.onChange === 'function') {
              console.log('[BINGO] Method 1a: __reactProps$.onChange');
              // For checkboxes: event.target.checked
              rProps.onChange({ target: { checked: !currentState, type: 'checkbox', value: !currentState } });
              return true;
            }
            if (typeof rProps.onClick === 'function') {
              console.log('[BINGO] Method 1b: __reactProps$.onClick');
              rProps.onClick({ preventDefault: function(){}, stopPropagation: function(){} });
              return true;
            }
          }
        }
      }
    } catch (e) { console.warn('[BINGO] Method 1 failed:', e); }

    // METHOD 2: React fiber tree walk
    try {
      var fiberKey = null;
      var allKeys = Object.getOwnPropertyNames(toggle);
      for (var j = 0; j < allKeys.length; j++) {
        if (allKeys[j].indexOf('__reactFiber') === 0 || allKeys[j].indexOf('__reactInternal') === 0) {
          fiberKey = allKeys[j];
          break;
        }
      }
      if (fiberKey) {
        var fiber = toggle[fiberKey];
        var cur = fiber;
        for (var depth = 0; depth < 30 && cur; depth++) {
          var fp = cur.memoizedProps || cur.pendingProps;
          if (fp && typeof fp.onChange === 'function') {
            console.log('[BINGO] Method 2: fiber onChange at depth ' + depth);
            fp.onChange({ target: { checked: !currentState, type: 'checkbox', value: !currentState } });
            return true;
          }
          cur = cur['return'];
        }
      }
    } catch (e) { console.warn('[BINGO] Method 2 failed:', e); }

    // METHOD 3: Click the element directly
    try {
      console.log('[BINGO] Method 3: direct click');
      toggle.click();
      return true;
    } catch (e) { console.warn('[BINGO] Method 3 failed:', e); }

    // METHOD 4: Click the parent (for wrapped toggles)
    try {
      if (toggle.parentElement) {
        console.log('[BINGO] Method 4: click parent');
        toggle.parentElement.click();
        return true;
      }
    } catch (e) { console.warn('[BINGO] Method 4 failed:', e); }

    // METHOD 5: Dispatch full mouse event sequence
    try {
      console.log('[BINGO] Method 5: mouse event sequence');
      var evtInit = { bubbles: true, cancelable: true, view: window };
      toggle.dispatchEvent(new MouseEvent('mousedown', evtInit));
      toggle.dispatchEvent(new MouseEvent('mouseup', evtInit));
      toggle.dispatchEvent(new MouseEvent('click', evtInit));
      return true;
    } catch (e) { console.warn('[BINGO] Method 5 failed:', e); }

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
        if (b.id && b.id.indexOf('bingo') !== -1) continue;
        if (text.indexOf('✓') !== -1 || text.indexOf('✔') !== -1) continue;
        if (lower.indexOf('delete') !== -1 || lower.indexOf('exclu') !== -1) continue;
        if (lower.indexOf('duplic') !== -1) continue;
        if (lower.indexOf('publish') !== -1 || lower.indexOf('save') !== -1
          || lower.indexOf('publicar') !== -1 || lower.indexOf('salvar') !== -1) {
          if (!best || text.length < (best.textContent || '').trim().length) {
            best = b;
          }
        }
      }
      return best;
    } catch (e) { return null; }
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN ACTION: TOGGLE + SAVE
   * ═══════════════════════════════════════════════════════════ */
  function doDraftToggle() {
    var toggle = findPublishedToggle();
    if (!toggle) {
      showToast('❌ Toggle "Publicado" não encontrado. Veja o console (F12).', 'error');
      return;
    }

    var wasPublished = getToggleState(toggle);
    var toggled = performToggle(toggle);

    if (!toggled) {
      showToast('❌ Não foi possível alterar. Altere manualmente.', 'error');
      return;
    }

    showToast(wasPublished ? '🔒 Convertendo para rascunho...' : '🚀 Publicando...', 'info');

    var attempts = 0;
    function trySave() {
      attempts++;
      var saveBtn = findSaveButton();
      if (saveBtn) {
        console.log('[BINGO] Clicking save button: "' + saveBtn.textContent.trim() + '"');
        saveBtn.click();
        setTimeout(function () {
          showToast(wasPublished ? '🔒 Rascunho salvo!' : '🚀 Publicado!', 'success');
          refreshUI();
        }, 1500);
      } else if (attempts < 8) {
        setTimeout(trySave, 500);
      } else {
        showToast('⚠️ Clique em Save/Publish manualmente.', 'warn');
      }
    }
    setTimeout(trySave, 500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI ELEMENTS
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
      doDraftToggle();
    });
    document.body.appendChild(floatingBtn);
    return floatingBtn;
  }

  function showButton(isPublished) {
    var btn = createFloatingButton();
    btn.style.display = 'flex';
    if (isPublished) {
      btn.innerHTML = '🔒 Despublicar (Rascunho)';
      btn.style.color = '#eab308';
      btn.style.borderColor = 'rgba(234,179,8,0.3)';
    } else {
      btn.innerHTML = '🚀 Publicar';
      btn.style.color = '#22c55e';
      btn.style.borderColor = 'rgba(34,197,94,0.3)';
    }
  }

  function hideButton() {
    if (floatingBtn) floatingBtn.style.display = 'none';
  }

  function updateBadge(isPublished, show) {
    try {
      var badge = document.getElementById('bingo-status-badge');
      if (!show) { if (badge) badge.style.display = 'none'; return; }
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'bingo-status-badge';
        Object.assign(badge.style, {
          position: 'fixed', top: '12px', left: '220px', zIndex: '9999',
          padding: '5px 12px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#0f172a', color: '#e2e8f0',
        });
        document.body.appendChild(badge);
      }
      badge.style.display = 'flex';
      if (isPublished) {
        badge.innerHTML = '<span style="color:#22c55e;">●</span> PUBLICADO';
        badge.style.border = '1px solid rgba(34,197,94,0.3)';
      } else {
        badge.innerHTML = '<span style="color:#eab308;">●</span> RASCUNHO';
        badge.style.border = '1px solid rgba(234,179,8,0.3)';
      }
    } catch (e) {}
  }

  function tryInjectDropdown(isPublished) {
    try {
      if (document.getElementById('bingo-dropdown-item')) return;
      var allEls = document.querySelectorAll('button, li, a, div[role="menuitem"]');
      var dup = null;
      for (var i = 0; i < allEls.length; i++) {
        var t = (allEls[i].textContent || '').trim();
        if ((t.indexOf('Duplicate') !== -1 || t.indexOf('Duplicar') !== -1) && allEls[i].offsetParent !== null) {
          dup = allEls[i]; break;
        }
      }
      if (!dup || !dup.parentElement) return;
      var item = dup.cloneNode(true);
      item.id = 'bingo-dropdown-item';
      item.innerHTML = '';
      item.textContent = isPublished ? '🔒 Despublicar' : '🚀 Publicar';
      item.style.cursor = 'pointer';
      item.style.color = isPublished ? '#eab308' : '#22c55e';
      item.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        document.body.click();
        setTimeout(doDraftToggle, 200);
      });
      dup.parentElement.insertBefore(item, dup.nextSibling);
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN REFRESH
   * ═══════════════════════════════════════════════════════════ */
  function refreshUI() {
    try {
      if (!isEditorView()) {
        hideButton();
        updateBadge(false, false);
        diagDone = false; // reset diagnostic for next editor visit
        return;
      }

      var toggle = findPublishedToggle();
      if (toggle) {
        var isPublished = getToggleState(toggle);
        showButton(isPublished);
        updateBadge(isPublished, true);
        tryInjectDropdown(isPublished);
      } else {
        // Show button anyway (assume published)
        showButton(true);
        updateBadge(true, false);
      }
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  IMAGE FIXER
   * ═══════════════════════════════════════════════════════════ */
  function startImageFixer() {
    try {
      var adminIdx = window.location.pathname.indexOf('/admin');
      if (adminIdx <= 0) return;
      var basePath = window.location.pathname.substring(0, adminIdx);
      function fix(root) {
        root.querySelectorAll('img').forEach(function (img) {
          var src = img.getAttribute('src');
          if (src && src.indexOf('/images/') === 0 && src.indexOf(basePath) !== 0) {
            img.setAttribute('src', basePath + src);
          }
        });
      }
      function scan() {
        fix(document);
        document.querySelectorAll('iframe').forEach(function (f) {
          try { var d = f.contentDocument || (f.contentWindow && f.contentWindow.document); if (d) fix(d); } catch (e) {}
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
    console.log('[BINGO] Admin engine v6 loaded');

    try { if (window.CMS) CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    setTimeout(function () { try { if (window.CMS) CMS.registerPreviewStyle('./preview.css'); } catch (e) {} }, 3000);

    try {
      new MutationObserver(checkLoginPage).observe(document.body, { childList: true, subtree: true });
      checkLoginPage();
    } catch (e) {}

    startImageFixer();

    try {
      var pending = false;
      new MutationObserver(function () {
        if (!pending) {
          pending = true;
          requestAnimationFrame(function () { refreshUI(); pending = false; });
        }
      }).observe(document.body, { childList: true, subtree: true });
      setInterval(refreshUI, 600);
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
