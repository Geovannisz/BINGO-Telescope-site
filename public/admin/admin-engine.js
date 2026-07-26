/**
 * BINGO Telescope — Admin Panel Engine
 * Features:
 * - Custom login button styling
 * - Draft/Unpublish toggle with floating action button + dropdown injection
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
   *  TOAST NOTIFICATIONS (self-contained, no dependency on admin-io)
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
      border: `1px solid ${colors[type] || colors.info}40`,
      boxShadow: `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${colors[type] || colors.info}20`,
      transform: 'translateY(20px)', opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
    });
    toast.innerHTML = `${icons[type] || 'ℹ️'} ${msg}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  LOGIN PAGE CUSTOMIZATION
   * ═══════════════════════════════════════════════════════════ */
  function checkLoginPage() {
    document.querySelectorAll('button').forEach(btn => {
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
   * Find the "published" boolean toggle in the CMS editor form.
   * Uses multiple strategies for reliability across Decap CMS versions.
   */
  function findPublishedInput() {
    // Strategy 1: Find by traversing labels
    const labels = document.querySelectorAll('#nc-root label');
    for (const label of labels) {
      const text = (label.textContent || '').toLowerCase();
      if (text.includes('publicado') || text === 'published') {
        const checkbox = label.querySelector('input[type="checkbox"]')
          || label.parentElement?.querySelector('input[type="checkbox"]');
        if (checkbox) return checkbox;
      }
    }

    // Strategy 2: Find toggle containers with nearby text
    const toggles = document.querySelectorAll('#nc-root input[type="checkbox"]');
    for (const toggle of toggles) {
      // Walk up to find nearby label text
      let el = toggle;
      for (let i = 0; i < 5 && el; i++) {
        el = el.parentElement;
        if (!el) break;
        const text = (el.textContent || '').toLowerCase();
        // Must contain 'publicado'/'published' but NOT 'autoriza' (to exclude the "authorized" field)
        if ((text.includes('publicado') || text.includes('published'))
            && !text.includes('autoriza') && !text.includes('authorized')) {
          // Confirm this is the right checkbox by checking it's the last one in the form
          // (published is typically at the bottom of the config)
          return toggle;
        }
      }
    }

    // Strategy 3: Direct attribute search
    const byId = document.querySelector('#nc-root input[id*="published"], #nc-root input[name*="published"]');
    if (byId) return byId;

    return null;
  }

  /** Read current published state from the input */
  function getPublishedState(input) {
    if (!input) return true;
    if (input.type === 'checkbox') return input.checked;
    return String(input.value) !== 'false' && String(input.value) !== '0';
  }

  /** Toggle the published field using React-compatible interaction */
  function togglePublishedInput(input) {
    if (!input) return;
    if (input.type === 'checkbox') {
      // Simulate a real click — React listens to this
      input.click();
    } else {
      const newVal = String(!getPublishedState(input));
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(input, newVal);
      } else {
        input.value = newVal;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /** Find the Save/Publish button in the CMS header */
  function findSaveButton() {
    // Look in the header area first
    const header = document.querySelector('[class*="AppHeader"], header, nav');
    const searchIn = header || document.querySelector('#nc-root');
    if (!searchIn) return null;

    const btns = Array.from(searchIn.querySelectorAll('button, [role="button"]'));
    return btns.find(b => {
      const text = (b.textContent || '').trim().toLowerCase();
      return (text.includes('publish') || text.includes('save')
        || text.includes('publicar') || text.includes('salvar'))
        && !b.id?.includes('bingo'); // Exclude our own buttons
    });
  }

  /** Perform the draft/publish toggle action */
  function performToggle(pubInput) {
    const wasPublished = getPublishedState(pubInput);
    togglePublishedInput(pubInput);

    showToast(
      wasPublished
        ? 'Convertendo para rascunho... 🔒'
        : 'Publicando entrada... 🚀',
      'info'
    );

    // Auto-save after React processes the toggle
    setTimeout(() => {
      const saveBtn = findSaveButton();
      if (saveBtn) {
        saveBtn.click();
        setTimeout(() => {
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
    let badge = document.getElementById(STATUS_BADGE_ID);

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

  /* ── Floating Action Button (always visible, reliable) ── */
  function updateFloatingButton(pubInput, isPublished) {
    let btn = document.getElementById(DRAFT_BTN_ID);

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
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px) scale(1.03)';
        btn.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)';
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentInput = findPublishedInput();
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

  /* ── Dropdown Injection (bonus: adds item to the CMS dropdown when it opens) ── */
  function tryInjectDropdown(pubInput, isPublished) {
    if (!pubInput) return;

    // Already injected?
    if (document.getElementById(DROPDOWN_ITEM_ID)) {
      // Just update its text
      const existing = document.getElementById(DROPDOWN_ITEM_ID);
      const textEl = existing.querySelector('span, div') || existing;
      if (textEl.childNodes.length > 0) {
        // Find the text node
        for (const node of textEl.childNodes) {
          if (node.nodeType === Node.TEXT_NODE || node.tagName) {
            const el = node.nodeType === Node.TEXT_NODE ? textEl : node;
            if (el.textContent?.includes('Despublicar') || el.textContent?.includes('Publicar')
                || el.textContent?.includes('Rascunho')) {
              el.textContent = isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)';
              break;
            }
          }
        }
      }
      return;
    }

    // Search for the dropdown that contains "Duplicate" / "Delete" / "Duplicar" / "Excluir"
    // These are leaf-text nodes inside buttons/links in dropdown menus
    const candidates = document.querySelectorAll(
      '#nc-root button, #nc-root a, #nc-root li, #nc-root [role="menuitem"], '
      + 'body > div button, body > div a, body > div li, body > div [role="menuitem"]'
    );

    let duplicateBtn = null;
    for (const el of candidates) {
      const text = (el.textContent || '').trim();
      if ((text === 'Duplicate' || text === 'Duplicar')
        && el.offsetParent !== null /* visible */
        && !el.querySelector('button, a, li') /* leaf-ish */) {
        duplicateBtn = el;
        break;
      }
    }

    if (!duplicateBtn) return;

    const dropdownParent = duplicateBtn.parentElement;
    if (!dropdownParent) return;

    // Clone the duplicate button to match styling
    const newItem = duplicateBtn.cloneNode(true);
    newItem.id = DROPDOWN_ITEM_ID;

    // Replace all text content
    function setDeepText(el, text) {
      if (el.children.length === 0) {
        el.textContent = text;
        return;
      }
      for (const child of el.children) {
        const childText = child.textContent?.trim();
        if (childText === 'Duplicate' || childText === 'Duplicar') {
          child.textContent = text;
          return;
        }
      }
      // Fallback: set on the first text-bearing child
      const textChild = Array.from(el.querySelectorAll('*')).find(c => c.children.length === 0);
      if (textChild) textChild.textContent = text;
      else el.textContent = text;
    }

    setDeepText(newItem, isPublished ? '🔒 Despublicar (Rascunho)' : '🚀 Publicar (Ativar)');

    // Style it
    newItem.style.color = isPublished ? '#eab308' : '#22c55e';
    newItem.style.cursor = 'pointer';

    // Click handler
    newItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Close the dropdown by clicking outside
      document.body.click();

      // Perform toggle
      setTimeout(() => {
        const currentInput = findPublishedInput();
        if (currentInput) performToggle(currentInput);
      }, 100);
    });

    // Insert after the duplicate button
    duplicateBtn.after(newItem);
  }

  /* ── Main Draft Feature Controller ── */
  let lastKnownState = null;

  function setupDraftFeature() {
    const pubInput = findPublishedInput();

    if (!pubInput) {
      // Not in editor view or collection doesn't have "published" field
      updateFloatingButton(null);
      updateStatusBadge(false, false);
      // Clean up dropdown items from closed menus
      const old = document.getElementById(DROPDOWN_ITEM_ID);
      if (old) old.remove();
      lastKnownState = null;
      return;
    }

    const isPublished = getPublishedState(pubInput);

    // Update all UI elements
    updateStatusBadge(isPublished, true);
    updateFloatingButton(pubInput, isPublished);
    tryInjectDropdown(pubInput, isPublished);

    lastKnownState = isPublished;
  }

  /* ═══════════════════════════════════════════════════════════
   *  IMAGE PATH FIXER (for subpath hosting)
   * ═══════════════════════════════════════════════════════════ */
  function startImageFixer() {
    const adminIdx = window.location.pathname.indexOf('/admin');
    if (adminIdx <= 0) return;
    const basePath = window.location.pathname.substring(0, adminIdx);

    function fixImages(root) {
      root.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/images/') && !src.startsWith(basePath)) {
          img.setAttribute('src', basePath + src);
        }
      });
    }

    function scanAndFix() {
      fixImages(document);
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) fixImages(doc);
        } catch (_) {}
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
      try { CMS.registerPreviewStyle('./preview.css'); } catch (_) {}
    }
    setTimeout(() => {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (_) {}
      }
    }, 3000);

    // Login page detection
    const loginObs = new MutationObserver(checkLoginPage);
    loginObs.observe(document.body, { childList: true, subtree: true });
    checkLoginPage();

    // Image path fixer
    startImageFixer();

    // Draft/Unpublish feature — runs on DOM mutations and on a timer
    const draftObs = new MutationObserver(() => {
      // Debounce: only run if not already scheduled
      if (!draftObs._pending) {
        draftObs._pending = true;
        requestAnimationFrame(() => {
          setupDraftFeature();
          draftObs._pending = false;
        });
      }
    });
    draftObs.observe(document.body, { childList: true, subtree: true });

    // Periodic check as safety net (every 500ms is less aggressive than 300ms)
    setInterval(setupDraftFeature, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
