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
  const DRAFT_BTN_ID = 'bingo-draft-toggle-btn';
  const STATUS_BADGE_ID = 'bingo-editor-status-badge';
  const DROPDOWN_ITEM_ID = 'bingo-dropdown-draft-item';

  /* ═══════════════════════════════════════════════════════════
   *  TOAST NOTIFICATIONS
   * ═══════════════════════════════════════════════════════════ */
  function showToast(msg, type) {
    const existing = document.querySelectorAll('.bingo-engine-toast');
    const offsetY = existing.length * 60;
    const toast = document.createElement('div');
    toast.className = 'bingo-engine-toast';
    const colors = { success: '#22c55e', error: '#ef4444', warn: '#eab308', info: '#3b82f6' };
    const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
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
   *  DRAFT / UNPUBLISH FEATURE
   * ═══════════════════════════════════════════════════════════ */

  /**
   * Determine if we are currently inside the entry editor view.
   * Decap CMS uses hash-based routing:
   *   #/collections/<name>/entries/<slug>   (edit existing)
   *   #/collections/<name>/new              (create new)
   */
  function isEditorView() {
    var hash = window.location.hash || '';
    return hash.includes('/entries/') || hash.includes('/new');
  }

  /**
   * Find the "published" boolean toggle in the CMS editor form.
   * Uses multiple strategies for maximum reliability.
   */
  function findPublishedInput() {
    var root = document.getElementById('nc-root') || document.body;
    if (!isEditorView()) return null;

    // ── STRATEGY A: Walk all labels looking for "publicado"/"published" ──
    var labels = root.querySelectorAll('label, span, p');
    for (var i = 0; i < labels.length; i++) {
      var el = labels[i];
      var elText = (el.textContent || '').toLowerCase();

      // Match field labels containing "publicado" or "published"
      // but exclude very long text (to avoid matching preview/content areas)
      if (elText.length > 60) continue;
      if (!elText.includes('publicado') && !elText.includes('published')) continue;
      // Exclude labels from the preview pane (inside iframes)
      if (el.closest('iframe')) continue;
      // Exclude labels that are part of the toolbar dropdown (Published ✓ status)
      // These are typically not inside a form/fieldset
      if (el.closest('[class*="Dropdown"]') || el.closest('[role="menu"]')) continue;

      // Walk up from this label, searching progressively wider for a checkbox
      var container = el.parentElement;
      for (var depth = 0; depth < 10 && container && container !== root; depth++) {
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length === 1) {
          // Perfect: exactly one checkbox in this container
          return checkboxes[0];
        }
        if (checkboxes.length > 1 && depth >= 2) {
          // Multiple checkboxes found — the "published" checkbox is typically
          // adjacent to/below the label. Pick the closest one by DOM position.
          // In BINGO config, "published" is always after "authorized", so use last.
          return checkboxes[checkboxes.length - 1];
        }
        container = container.parentElement;
      }

      // Also check siblings of the label
      var sibling = el.nextElementSibling;
      for (var s = 0; s < 5 && sibling; s++) {
        var cb = sibling.querySelector('input[type="checkbox"]');
        if (cb) return cb;
        // Also check for role="switch" toggles
        var sw = sibling.querySelector('[role="switch"]');
        if (sw) {
          var innerCb = sw.querySelector('input[type="checkbox"]');
          return innerCb || sw;
        }
        sibling = sibling.nextElementSibling;
      }
    }

    // ── STRATEGY B: "Last checkbox" heuristic ──
    // In all BINGO CMS collections, "published" is always the last boolean field.
    // news: only boolean is "published" → 1 checkbox (the only one)
    // team: "authorized" then "published" → 2 checkboxes (published = last)
    // publications: only boolean is "published" → 1 checkbox (the only one)
    var formCheckboxes = root.querySelectorAll('input[type="checkbox"]');
    if (formCheckboxes.length > 0) {
      return formCheckboxes[formCheckboxes.length - 1];
    }

    // ── STRATEGY C: role="switch" fallback ──
    var switches = root.querySelectorAll('[role="switch"]');
    if (switches.length > 0) {
      return switches[switches.length - 1];
    }

    return null;
  }

  /** Read current published state from the input/toggle */
  function getPublishedState(input) {
    if (!input) return true;
    if (input.type === 'checkbox') return input.checked;
    if (input.getAttribute('aria-checked') !== null) {
      return input.getAttribute('aria-checked') === 'true';
    }
    return String(input.value) !== 'false' && String(input.value) !== '0';
  }

  /** Toggle the published field using React-compatible interaction */
  function togglePublishedInput(input) {
    if (!input) return;
    if (input.type === 'checkbox') {
      // Simulate a real click — React listens on this via event delegation
      input.click();
    } else if (input.getAttribute('role') === 'switch') {
      // For custom toggle switches
      input.click();
    } else {
      // For text inputs / hidden inputs
      var newVal = String(!getPublishedState(input));
      var nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      );
      if (nativeSetter && nativeSetter.set) {
        nativeSetter.set.call(input, newVal);
      } else {
        input.value = newVal;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /** Find the Save/Publish button in the CMS toolbar */
  function findSaveButton() {
    var root = document.getElementById('nc-root') || document.body;
    var allBtns = Array.from(root.querySelectorAll('button, [role="button"]'));
    return allBtns.find(function (b) {
      var text = (b.textContent || '').trim().toLowerCase();
      return (text.includes('publish') || text.includes('save')
        || text.includes('publicar') || text.includes('salvar'))
        && !b.id.includes('bingo')
        && !b.closest('#' + DRAFT_BTN_ID);
    });
  }

  /** Perform the draft/publish toggle action */
  function performToggle(pubInput) {
    if (!pubInput) return;
    var wasPublished = getPublishedState(pubInput);
    togglePublishedInput(pubInput);

    showToast(
      wasPublished
        ? 'Convertendo para rascunho... 🔒'
        : 'Publicando entrada... 🚀',
      'info'
    );

    // Auto-save after React processes the toggle
    setTimeout(function () {
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
        }, 1200);
      } else {
        showToast('Alteração feita. Clique em Salvar manualmente.', 'warn');
      }
    }, 400);
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
        if (currentInput) performToggle(currentInput);
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

    // Already injected in this dropdown session?
    var existing = document.getElementById(DROPDOWN_ITEM_ID);
    if (existing) {
      // Just update its label
      var textSpan = existing.querySelector('[data-bingo-label]') || existing;
      textSpan.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
      return;
    }

    // Search for visible dropdown items that contain "Duplicate"
    // Decap CMS v3 renders dropdown items as buttons/divs, text may include icons (e.g. "Duplicate +")
    var allInteractive = document.querySelectorAll('button, a, li, [role="menuitem"], [role="option"]');
    var duplicateBtn = null;

    for (var i = 0; i < allInteractive.length; i++) {
      var el = allInteractive[i];
      var text = (el.textContent || '').trim();
      // Match "Duplicate", "Duplicate +", "Duplicar", "Duplicar +" etc.
      if ((text.includes('Duplicate') || text.includes('Duplicar'))
        && el.offsetParent !== null
        && !el.id.includes('bingo')) {
        duplicateBtn = el;
        break;
      }
    }

    if (!duplicateBtn) return;
    var dropdownParent = duplicateBtn.parentElement;
    if (!dropdownParent) return;

    // Clone the Duplicate button to inherit its styling
    var newItem = duplicateBtn.cloneNode(true);
    newItem.id = DROPDOWN_ITEM_ID;

    // Replace text in the clone
    function replaceText(node, newText) {
      if (node.nodeType === Node.TEXT_NODE) {
        var t = node.textContent.trim();
        if (t.includes('Duplicate') || t.includes('Duplicar') || t === '+') {
          node.textContent = '';
        }
        return;
      }
      if (node.childNodes) {
        for (var c = 0; c < node.childNodes.length; c++) {
          replaceText(node.childNodes[c], newText);
        }
      }
    }
    replaceText(newItem, '');

    // Insert our label as a clean span
    var labelSpan = document.createElement('span');
    labelSpan.setAttribute('data-bingo-label', '1');
    labelSpan.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
    // Clear existing content and put our label
    newItem.innerHTML = '';
    newItem.appendChild(labelSpan);

    // Style
    newItem.style.cursor = 'pointer';
    newItem.style.color = isPublished ? '#eab308' : '#22c55e';

    // Hover effects
    newItem.addEventListener('mouseenter', function () {
      newItem.style.backgroundColor = isPublished
        ? 'rgba(234, 179, 8, 0.1)'
        : 'rgba(34, 197, 94, 0.1)';
    });
    newItem.addEventListener('mouseleave', function () {
      newItem.style.backgroundColor = '';
    });

    // Click handler
    newItem.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // Close the dropdown
      document.body.click();
      // Perform toggle after dropdown closes
      setTimeout(function () {
        var currentInput = findPublishedInput();
        if (currentInput) performToggle(currentInput);
      }, 150);
    });

    // Insert after Duplicate in the dropdown
    if (duplicateBtn.nextSibling) {
      dropdownParent.insertBefore(newItem, duplicateBtn.nextSibling);
    } else {
      dropdownParent.appendChild(newItem);
    }
  }

  /* ── Main Draft Feature Controller ── */
  function setupDraftFeature() {
    if (!isEditorView()) {
      // Not editing — hide everything
      var b = document.getElementById(DRAFT_BTN_ID);
      if (b) b.style.display = 'none';
      updateStatusBadge(false, false);
      return;
    }

    var pubInput = findPublishedInput();

    if (!pubInput) {
      // Editor is open but published input not found yet (form still loading)
      return;
    }

    var isPublished = getPublishedState(pubInput);

    // Update all UI elements
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
    // Register preview CSS
    if (window.CMS) {
      try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    }
    setTimeout(function () {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
      }
    }, 3000);

    // Login page detection
    var loginObs = new MutationObserver(checkLoginPage);
    loginObs.observe(document.body, { childList: true, subtree: true });
    checkLoginPage();

    // Image path fixer
    startImageFixer();

    // Draft/Unpublish feature — debounced MutationObserver + periodic check
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
