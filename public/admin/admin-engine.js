/**
 * BINGO Telescope — Admin Panel Engine
 * Features:
 * - Custom login button styling
 * - Draft/Unpublish toggle (floating action button + dropdown injection)
 * - Status badge for published/draft state
 * - Image path fixer for subpath hosting
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
   *  CONSTANTS
   * ═══════════════════════════════════════════════════════════ */
  var DRAFT_BTN_ID = 'bingo-draft-toggle-btn';
  var STATUS_BADGE_ID = 'bingo-editor-status-badge';
  var DROPDOWN_ITEM_ID = 'bingo-dropdown-draft-item';

  /* ═══════════════════════════════════════════════════════════
   *  TOAST NOTIFICATIONS
   * ═══════════════════════════════════════════════════════════ */
  function showToast(msg, type) {
    var existing = document.querySelectorAll('.bingo-engine-toast');
    var offsetY = existing.length * 60;
    var toast = document.createElement('div');
    toast.className = 'bingo-engine-toast';
    var colors = { success: '#22c55e', error: '#ef4444', warn: '#eab308', info: '#3b82f6' };
    var icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
    Object.assign(toast.style, {
      position: 'fixed', bottom: (20 + offsetY) + 'px', right: '20px', zIndex: '99999',
      padding: '14px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
      fontFamily: "'Outfit', sans-serif", color: '#fff', maxWidth: '420px',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      border: '1px solid ' + (colors[type] || colors.info) + '40',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ' + (colors[type] || colors.info) + '20',
      transform: 'translateY(20px)', opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
    });
    toast.innerHTML = (icons[type] || 'ℹ️') + ' ' + msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(function () {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  LOGIN PAGE CUSTOMIZATION
   * ═══════════════════════════════════════════════════════════ */
  function checkLoginPage() {
    document.querySelectorAll('button').forEach(function (btn) {
      if (btn.textContent.includes('Login with GitHub')) {
        btn.textContent = '🔭 Acessar Painel BINGO';
        btn.classList.add('bingo-login-btn');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
   *  REACT INTERNALS HELPER
   *
   *  Decap CMS v3 uses React + Redux. Directly setting checkbox
   *  properties or calling .click() does NOT update the Redux store.
   *  We must call onChange through React's internal props or fiber.
   * ═══════════════════════════════════════════════════════════ */

  /**
   * Find React internal properties on a DOM element.
   * React attaches __reactProps$xxx, __reactFiber$xxx, etc.
   */
  function getReactProps(element) {
    var keys = Object.keys(element);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('__reactProps$')) {
        return element[keys[i]];
      }
    }
    return null;
  }

  function getReactFiber(element) {
    var keys = Object.keys(element);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('__reactFiber$') || keys[i].startsWith('__reactInternalInstance$')) {
        return element[keys[i]];
      }
    }
    return null;
  }

  /**
   * Walk up the React fiber tree to find the nearest onChange handler.
   * Returns { handler, fiber } or null.
   */
  function findOnChangeInFiber(element) {
    var fiber = getReactFiber(element);
    if (!fiber) return null;

    var current = fiber;
    for (var depth = 0; depth < 20 && current; depth++) {
      var props = current.memoizedProps || current.pendingProps;
      if (props && typeof props.onChange === 'function') {
        return { handler: props.onChange, props: props };
      }
      current = current['return'];
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
   *  DRAFT / UNPUBLISH FEATURE
   * ═══════════════════════════════════════════════════════════ */

  /** Detect editor view via URL hash */
  function isEditorView() {
    var hash = window.location.hash || '';
    return hash.includes('/entries/') || hash.includes('/new');
  }

  /**
   * Find the "published" boolean toggle in the CMS editor form.
   */
  function findPublishedInput() {
    var root = document.getElementById('nc-root') || document.body;
    if (!isEditorView()) return null;

    // ── STRATEGY A: Walk labels for "publicado"/"published" ──
    var labels = root.querySelectorAll('label, span, p');
    for (var i = 0; i < labels.length; i++) {
      var el = labels[i];
      var elText = (el.textContent || '').toLowerCase();
      if (elText.length > 60) continue;
      if (!elText.includes('publicado') && !elText.includes('published')) continue;
      if (el.closest('iframe')) continue;
      if (el.closest('[class*="Dropdown"]') || el.closest('[role="menu"]')) continue;

      // Walk up searching for a checkbox
      var container = el.parentElement;
      for (var depth = 0; depth < 10 && container && container !== root; depth++) {
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length === 1) return checkboxes[0];
        if (checkboxes.length > 1 && depth >= 2) {
          return checkboxes[checkboxes.length - 1];
        }
        container = container.parentElement;
      }

      // Check siblings
      var sibling = el.nextElementSibling;
      for (var s = 0; s < 5 && sibling; s++) {
        var cb = sibling.querySelector('input[type="checkbox"]');
        if (cb) return cb;
        sibling = sibling.nextElementSibling;
      }
    }

    // ── STRATEGY B: Last checkbox heuristic ──
    var formCheckboxes = root.querySelectorAll('input[type="checkbox"]');
    if (formCheckboxes.length > 0) {
      return formCheckboxes[formCheckboxes.length - 1];
    }

    return null;
  }

  /** Read current published state */
  function getPublishedState(input) {
    if (!input) return true;
    if (input.type === 'checkbox') return input.checked;
    if (input.getAttribute('aria-checked') !== null) {
      return input.getAttribute('aria-checked') === 'true';
    }
    return String(input.value) !== 'false' && String(input.value) !== '0';
  }

  /**
   * Toggle the published field through React's event system.
   * Tries 4 methods in order of reliability.
   */
  function togglePublishedInput(input) {
    if (!input) return false;
    var newChecked = !input.checked;

    // ── METHOD 1: Call onChange from __reactProps$ ──
    var reactProps = getReactProps(input);
    if (reactProps && typeof reactProps.onChange === 'function') {
      reactProps.onChange({ target: { checked: newChecked, type: 'checkbox' } });
      return true;
    }

    // ── METHOD 2: Walk React fiber tree for onChange ──
    var fiberResult = findOnChangeInFiber(input);
    if (fiberResult && typeof fiberResult.handler === 'function') {
      fiberResult.handler({ target: { checked: newChecked, type: 'checkbox' } });
      return true;
    }

    // ── METHOD 3: Click the visual toggle label/container ──
    // In Decap CMS, the toggle switch is typically a <label> wrapping the checkbox.
    // Clicking the label triggers the browser's native checkbox toggle + React's
    // event delegation captures it properly.
    var toggleLabel = input.closest('label');
    if (!toggleLabel) {
      // The checkbox might be a sibling of the visual toggle, not a child
      var parent = input.parentElement;
      if (parent) {
        toggleLabel = parent.closest('label') || parent;
      }
    }
    if (toggleLabel && toggleLabel !== input) {
      // Dispatch a full mouse event sequence on the visual toggle
      var evtInit = { bubbles: true, cancelable: true, view: window };
      toggleLabel.dispatchEvent(new MouseEvent('mousedown', evtInit));
      toggleLabel.dispatchEvent(new MouseEvent('mouseup', evtInit));
      toggleLabel.dispatchEvent(new MouseEvent('click', evtInit));
      return true;
    }

    // ── METHOD 4: Native property setter + event dispatch ──
    var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, newChecked);
    } else {
      input.checked = newChecked;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    // ── METHOD 5: Absolute last resort — simple .click() ──
    try { input.click(); } catch (e) {}

    return true;
  }

  /**
   * Find the Save/Publish button in the CMS toolbar.
   * Carefully excludes status indicators ("Published ✓") and our own buttons.
   */
  function findSaveButton() {
    var root = document.getElementById('nc-root') || document.body;
    var allBtns = Array.from(root.querySelectorAll('button'));
    var best = null;

    for (var i = 0; i < allBtns.length; i++) {
      var b = allBtns[i];
      var text = (b.textContent || '').trim();
      var lower = text.toLowerCase();

      // Skip our own buttons
      if (b.id && b.id.includes('bingo')) continue;
      // Skip hidden/invisible buttons
      if (b.offsetParent === null && !b.closest('[style*="position: fixed"]')) continue;
      // Skip status indicators that have ✓ or ✔ (e.g., "Published ✓")
      if (text.includes('✓') || text.includes('✔')) continue;
      // Skip dropdown items with + (e.g., "Duplicate +")
      if (text.includes('+') && lower.includes('duplic')) continue;
      // Skip delete buttons
      if (lower.includes('delete') || lower.includes('excluir') || lower.includes('apagar')) continue;

      // Match save-related text
      if (lower.includes('publish') || lower.includes('save')
        || lower.includes('publicar') || lower.includes('salvar')) {
        // Prefer shorter text (more specific button, not a container)
        if (!best || text.length < best.textContent.trim().length) {
          best = b;
        }
      }
    }

    return best;
  }

  /** Perform the draft/publish toggle action with retry for save button */
  function performToggle(pubInput) {
    if (!pubInput) return;
    var wasPublished = getPublishedState(pubInput);
    var toggled = togglePublishedInput(pubInput);

    if (!toggled) {
      showToast('Erro: não foi possível alterar o campo. Altere manualmente.', 'error');
      return;
    }

    showToast(
      wasPublished
        ? 'Convertendo para rascunho... 🔒'
        : 'Publicando entrada... 🚀',
      'info'
    );

    // Try to find and click the save button, with retries
    // (the button may take a moment to appear after the field change)
    var attempts = 0;
    var maxAttempts = 6;
    var retryDelay = 500;

    function trySave() {
      attempts++;
      var saveBtn = findSaveButton();
      if (saveBtn) {
        saveBtn.click();
        setTimeout(function () {
          showToast(
            wasPublished
              ? 'Salvo como rascunho com sucesso! 🔒'
              : 'Publicado com sucesso! 🚀',
            'success'
          );
          // Refresh the floating button state
          setupDraftFeature();
        }, 1200);
      } else if (attempts < maxAttempts) {
        // Save button not visible yet, retry
        setTimeout(trySave, retryDelay);
      } else {
        showToast('Campo alterado. Clique em Salvar/Publish manualmente.', 'warn');
      }
    }

    setTimeout(trySave, 400);
  }

  /* ── Status Badge ── */
  function updateStatusBadge(isPublished, show) {
    var badge = document.getElementById(STATUS_BADGE_ID);
    if (!show) {
      if (badge) badge.style.display = 'none';
      return;
    }
    if (!badge) {
      badge = document.createElement('div');
      badge.id = STATUS_BADGE_ID;
      Object.assign(badge.style, {
        position: 'fixed', top: '12px', left: '220px', zIndex: '9999',
        padding: '6px 14px', borderRadius: '20px',
        fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em',
        fontFamily: "'Outfit', sans-serif",
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.3s ease',
      });
      document.body.appendChild(badge);
    }
    badge.style.display = 'flex';
    if (isPublished) {
      badge.innerHTML = '<span style="font-size:8px;color:#22c55e;">●</span> PUBLICADO';
      badge.style.backgroundColor = '#0f172a';
      badge.style.color = '#e2e8f0';
      badge.style.border = '1px solid rgba(34, 197, 94, 0.35)';
    } else {
      badge.innerHTML = '<span style="font-size:8px;color:#eab308;">●</span> RASCUNHO';
      badge.style.backgroundColor = '#0f172a';
      badge.style.color = '#e2e8f0';
      badge.style.border = '1px solid rgba(234, 179, 8, 0.35)';
    }
  }

  /* ── Floating Action Button ── */
  function updateFloatingButton(pubInput, isPublished) {
    var btn = document.getElementById(DRAFT_BTN_ID);
    if (!pubInput) {
      if (btn) btn.style.display = 'none';
      return;
    }
    if (!btn) {
      btn = document.createElement('button');
      btn.id = DRAFT_BTN_ID;
      btn.type = 'button';
      Object.assign(btn.style, {
        position: 'fixed', bottom: '24px', left: '24px', zIndex: '9998',
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 20px', borderRadius: '14px',
        fontSize: '13px', fontWeight: '700',
        fontFamily: "'Outfit', sans-serif",
        cursor: 'pointer', border: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      });
      btn.addEventListener('mouseenter', function () {
        btn.style.transform = 'translateY(-3px) scale(1.03)';
        btn.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)';
      });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var currentInput = findPublishedInput();
        if (currentInput) {
          performToggle(currentInput);
        } else {
          showToast('Erro: campo "Publicado" não encontrado no formulário.', 'error');
        }
      });
      document.body.appendChild(btn);
    }
    btn.style.display = 'flex';
    if (isPublished) {
      btn.innerHTML = '🔒 Despublicar (Rascunho)';
      btn.title = 'Converter para rascunho e salvar';
      btn.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      btn.style.color = '#eab308';
      btn.style.border = '1px solid rgba(234, 179, 8, 0.25)';
    } else {
      btn.innerHTML = '🚀 Publicar';
      btn.title = 'Publicar esta entrada e salvar';
      btn.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      btn.style.color = '#22c55e';
      btn.style.border = '1px solid rgba(34, 197, 94, 0.25)';
    }
  }

  /* ── Dropdown Injection ── */
  function tryInjectDropdown(pubInput, isPublished) {
    if (!pubInput) return;
    var existing = document.getElementById(DROPDOWN_ITEM_ID);
    if (existing) {
      var lbl = existing.querySelector('[data-bingo-label]') || existing;
      lbl.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
      return;
    }

    var allInteractive = document.querySelectorAll('button, a, li, [role="menuitem"], [role="option"]');
    var duplicateBtn = null;
    for (var i = 0; i < allInteractive.length; i++) {
      var el = allInteractive[i];
      var text = (el.textContent || '').trim();
      if ((text.includes('Duplicate') || text.includes('Duplicar'))
        && el.offsetParent !== null
        && !(el.id && el.id.includes('bingo'))) {
        duplicateBtn = el;
        break;
      }
    }
    if (!duplicateBtn) return;

    var dropdownParent = duplicateBtn.parentElement;
    if (!dropdownParent) return;

    var newItem = duplicateBtn.cloneNode(true);
    newItem.id = DROPDOWN_ITEM_ID;
    newItem.innerHTML = '';

    var labelSpan = document.createElement('span');
    labelSpan.setAttribute('data-bingo-label', '1');
    labelSpan.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
    newItem.appendChild(labelSpan);

    newItem.style.cursor = 'pointer';
    newItem.style.color = isPublished ? '#eab308' : '#22c55e';

    newItem.addEventListener('mouseenter', function () {
      newItem.style.backgroundColor = isPublished
        ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    });
    newItem.addEventListener('mouseleave', function () {
      newItem.style.backgroundColor = '';
    });

    newItem.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      document.body.click();
      setTimeout(function () {
        var currentInput = findPublishedInput();
        if (currentInput) performToggle(currentInput);
      }, 150);
    });

    if (duplicateBtn.nextSibling) {
      dropdownParent.insertBefore(newItem, duplicateBtn.nextSibling);
    } else {
      dropdownParent.appendChild(newItem);
    }
  }

  /* ── Main Controller ── */
  function setupDraftFeature() {
    if (!isEditorView()) {
      var b = document.getElementById(DRAFT_BTN_ID);
      if (b) b.style.display = 'none';
      updateStatusBadge(false, false);
      return;
    }
    var pubInput = findPublishedInput();
    if (!pubInput) return;

    var isPublished = getPublishedState(pubInput);
    updateStatusBadge(isPublished, true);
    updateFloatingButton(pubInput, isPublished);
    tryInjectDropdown(pubInput, isPublished);
  }

  /* ═══════════════════════════════════════════════════════════
   *  IMAGE PATH FIXER
   * ═══════════════════════════════════════════════════════════ */
  function startImageFixer() {
    var adminIdx = window.location.pathname.indexOf('/admin');
    if (adminIdx <= 0) return;
    var basePath = window.location.pathname.substring(0, adminIdx);

    function fixImages(root) {
      root.querySelectorAll('img').forEach(function (img) {
        var src = img.getAttribute('src');
        if (src && src.startsWith('/images/') && !src.startsWith(basePath)) {
          img.setAttribute('src', basePath + src);
        }
      });
    }

    function scanAndFix() {
      fixImages(document);
      document.querySelectorAll('iframe').forEach(function (iframe) {
        try {
          var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (doc) fixImages(doc);
        } catch (e) {}
      });
    }

    scanAndFix();
    setInterval(scanAndFix, 300);
    new MutationObserver(scanAndFix).observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════════
   *  BOOTSTRAP
   * ═══════════════════════════════════════════════════════════ */
  function init() {
    if (window.CMS) {
      try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    }
    setTimeout(function () {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
      }
    }, 3000);

    var loginObs = new MutationObserver(checkLoginPage);
    loginObs.observe(document.body, { childList: true, subtree: true });
    checkLoginPage();

    startImageFixer();

    var draftPending = false;
    var draftObs = new MutationObserver(function () {
      if (!draftPending) {
        draftPending = true;
        requestAnimationFrame(function () {
          setupDraftFeature();
          draftPending = false;
        });
      }
    });
    draftObs.observe(document.body, { childList: true, subtree: true });
    setInterval(setupDraftFeature, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
