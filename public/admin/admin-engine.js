/**
 * BINGO Telescope — Admin Panel Engine v8
 * - Draft/Publish button injected into CMS header toolbar
 * - Auto-save via Ctrl+S simulation
 * - No floating/fixed badge or button — clean integration
 */
(function () {
  'use strict';

  function isEditorView() {
    var hash = window.location.hash || '';
    return hash.indexOf('/entries/') !== -1 || hash.indexOf('/new') !== -1;
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
   *  FIND THE TOGGLE
   * ═══════════════════════════════════════════════════════════ */
  function findPublishedToggle() {
    try {
      var root = document.getElementById('nc-root') || document.body;
      var allEls = root.querySelectorAll('label, span, p, div, h3, h4, h5');
      for (var i = 0; i < allEls.length; i++) {
        var el = allEls[i];
        var text = (el.textContent || '').trim().toLowerCase();
        if (text.length > 60) continue;
        if (text.indexOf('publicado') === -1 && text.indexOf('published') === -1) continue;
        if (el.closest('iframe')) continue;
        var container = el.parentElement;
        for (var depth = 0; depth < 10 && container && container !== root; depth++) {
          var toggle = findToggleInContainer(container);
          if (toggle) return toggle;
          container = container.parentElement;
        }
        var sib = el.nextElementSibling;
        for (var s = 0; s < 5 && sib; s++) {
          var t = findToggleInContainer(sib);
          if (t) return t;
          sib = sib.nextElementSibling;
        }
      }
      // Fallback: last role=switch
      var sws = root.querySelectorAll('[role="switch"]');
      if (sws.length > 0) return sws[sws.length - 1];
      return null;
    } catch (e) { return null; }
  }

  function findToggleInContainer(container) {
    if (!container) return null;
    var cb = container.querySelector('input[type="checkbox"]');
    if (cb) return cb;
    var sw = container.querySelector('[role="switch"], [role="checkbox"]');
    if (sw) return sw;
    var rt = container.querySelector('.react-toggle, [class*="react-toggle"]');
    if (rt) return rt.querySelector('input') || rt;
    var st = container.querySelector('[class*="Toggle"], [class*="toggle"], [class*="Switch"]');
    if (st) return st.querySelector('input') || st;
    return container.querySelector('[aria-checked]');
  }

  function getToggleState(toggle) {
    if (!toggle) return true;
    if (toggle.type === 'checkbox') return toggle.checked;
    var ac = toggle.getAttribute('aria-checked');
    if (ac !== null) return ac === 'true';
    if (toggle.className && toggle.className.indexOf('--checked') !== -1) return true;
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
   *  PERFORM TOGGLE
   * ═══════════════════════════════════════════════════════════ */
  function performToggle(toggle) {
    if (!toggle) return false;
    // Prevent accidental form submission (Decap renders toggle as type=submit button)
    if (toggle.type === 'submit') toggle.type = 'button';

    // Method 1: React props onChange
    try {
      var keys = Object.getOwnPropertyNames(toggle);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('__reactProps') === 0) {
          var props = toggle[keys[i]];
          if (props && typeof props.onChange === 'function') {
            var newState = !getToggleState(toggle);
            props.onChange({ target: { checked: newState, type: 'checkbox', value: newState } });
            return true;
          }
          if (props && typeof props.onClick === 'function') {
            props.onClick({ preventDefault: function(){}, stopPropagation: function(){} });
            return true;
          }
        }
      }
    } catch (e) {}

    // Method 2: native click
    try { toggle.click(); return true; } catch (e) {}
    return false;
  }

  /* ═══════════════════════════════════════════════════════════
   *  AUTO-SAVE via Ctrl+S simulation
   * ═══════════════════════════════════════════════════════════ */
  function triggerSave() {
    // Method 1: Ctrl+S keyboard shortcut (Decap CMS listens for this)
    try {
      var event = new KeyboardEvent('keydown', {
        key: 's', code: 'KeyS', keyCode: 83, which: 83,
        ctrlKey: true, bubbles: true, cancelable: true
      });
      document.dispatchEvent(event);
      console.log('[BINGO] Dispatched Ctrl+S');
    } catch (e) {}

    // Method 2: Also try to find & click a save button as fallback
    setTimeout(function () {
      try {
        var root = document.getElementById('nc-root') || document.body;
        var btns = root.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').trim().toLowerCase();
          if (btns[i].id && btns[i].id.indexOf('bingo') !== -1) continue;
          if (text.indexOf('✓') !== -1 || text.indexOf('✔') !== -1) continue;
          if (text.indexOf('delete') !== -1 || text.indexOf('duplic') !== -1) continue;
          if (text === 'publish' || text === 'save' || text === 'publish now'
            || text === 'publicar' || text === 'salvar' || text === 'publicar agora') {
            console.log('[BINGO] Clicking save button: "' + text + '"');
            btns[i].click();
            return;
          }
        }
      } catch (e) {}
    }, 800);
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN ACTION
   * ═══════════════════════════════════════════════════════════ */
  function doDraftToggle() {
    var toggle = findPublishedToggle();
    if (!toggle) {
      window._bingoToast('❌ Campo "Publicado" não encontrado.', 'error');
      return;
    }

    var wasPublished = getToggleState(toggle);
    var toggled = performToggle(toggle);

    if (!toggled) {
      window._bingoToast('❌ Não foi possível alterar o toggle.', 'error');
      return;
    }

    window._bingoToast(wasPublished ? '🔒 Salvando como rascunho...' : '🚀 Publicando...', 'info');

    // Auto-save after React processes the change
    setTimeout(function () {
      triggerSave();
      setTimeout(function () {
        window._bingoToast(wasPublished ? '🔒 Rascunho salvo!' : '🚀 Publicado com sucesso!', 'success');
        refreshUI();
      }, 2000);
    }, 300);
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI: BUTTON INJECTED INTO CMS HEADER
   * ═══════════════════════════════════════════════════════════ */
  var headerBtn = null;

  function injectHeaderButton() {
    if (headerBtn && headerBtn.parentElement) return headerBtn;

    // Find the CMS toolbar area — look for "Delete entry" button's container
    var btns = document.querySelectorAll('button');
    var toolbarContainer = null;
    for (var i = 0; i < btns.length; i++) {
      var text = (btns[i].textContent || '').trim().toLowerCase();
      if (text.indexOf('delete') !== -1 && text.indexOf('entry') !== -1) {
        toolbarContainer = btns[i].parentElement;
        break;
      }
    }

    if (!toolbarContainer) return null;

    // Create button if not exists
    if (!headerBtn) {
      headerBtn = document.createElement('button');
      headerBtn.id = 'bingo-draft-btn';
      headerBtn.type = 'button';
      headerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        doDraftToggle();
      });
    }

    // Only insert if not already in the toolbar
    if (headerBtn.parentElement !== toolbarContainer) {
      toolbarContainer.appendChild(headerBtn);
    }

    return headerBtn;
  }

  function updateHeaderButton(isPublished) {
    var btn = injectHeaderButton();
    if (!btn) return;
    btn.className = 'bingo-header-draft-btn';
    if (isPublished) {
      btn.innerHTML = '<span class="bingo-btn-icon">🔒</span> Despublicar';
      btn.setAttribute('data-state', 'published');
    } else {
      btn.innerHTML = '<span class="bingo-btn-icon">🚀</span> Publicar';
      btn.setAttribute('data-state', 'draft');
    }
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN REFRESH
   * ═══════════════════════════════════════════════════════════ */
  function refreshUI() {
    try {
      if (!isEditorView()) {
        if (headerBtn) headerBtn.style.display = 'none';
        return;
      }

      var toggle = findPublishedToggle();
      if (toggle) {
        var isPublished = getToggleState(toggle);
        updateHeaderButton(isPublished);
        if (headerBtn) headerBtn.style.display = '';
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
      scan(); setInterval(scan, 500);
    } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════
   *  SHARED TOAST (used by both admin-engine and admin-io)
   * ═══════════════════════════════════════════════════════════ */
  function bingoToast(msg, type) {
    try {
      var existing = document.querySelectorAll('.bingo-toast');
      var offsetY = existing.length * 56;
      var toast = document.createElement('div');
      toast.className = 'bingo-toast bingo-toast--' + (type || 'info');
      toast.textContent = msg;
      toast.style.bottom = (20 + offsetY) + 'px';
      document.body.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add('bingo-toast--show'); });
      setTimeout(function () {
        toast.classList.remove('bingo-toast--show');
        setTimeout(function () { toast.remove(); }, 400);
      }, 4000);
    } catch (e) {}
  }
  // Expose globally
  window._bingoToast = bingoToast;

  /* ═══════════════════════════════════════════════════════════
   *  INIT
   * ═══════════════════════════════════════════════════════════ */
  function init() {
    console.log('[BINGO] Admin engine v8 loaded');
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
