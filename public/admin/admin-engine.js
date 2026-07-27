/**
 * BINGO Telescope — Admin Panel Engine v9
 * - Auto-save when "Publicado" toggle is changed
 * - Login button customization
 * - Image path fixer
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
   *  TOAST
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
  window._bingoToast = bingoToast;

  /* ═══════════════════════════════════════════════════════════
   *  FIND THE "PUBLICADO" TOGGLE
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
      }
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
    var st = container.querySelector('[class*="Toggle"], [class*="toggle"]');
    if (st) return st.querySelector('input') || st;
    return container.querySelector('[aria-checked]');
  }

  function getToggleState(toggle) {
    if (!toggle) return true;
    if (toggle.type === 'checkbox') return toggle.checked;
    var ac = toggle.getAttribute('aria-checked');
    if (ac !== null) return ac === 'true';
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
   *  AUTO-SAVE: trigger Ctrl+S after toggle change
   * ═══════════════════════════════════════════════════════════ */
  function triggerSave() {
    try {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's', code: 'KeyS', keyCode: 83, which: 83,
        ctrlKey: true, bubbles: true, cancelable: true
      }));
    } catch (e) {}
    // Fallback: click save button
    setTimeout(function () {
      try {
        var root = document.getElementById('nc-root') || document.body;
        var btns = root.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').trim().toLowerCase();
          if (text === 'publish' || text === 'save' || text === 'publish now'
            || text === 'publicar' || text === 'salvar') {
            btns[i].click();
            return;
          }
        }
      } catch (e) {}
    }, 800);
  }

  /* ═══════════════════════════════════════════════════════════
   *  WATCH TOGGLE — detect clicks and auto-save
   * ═══════════════════════════════════════════════════════════ */
  var lastKnownState = null;
  var watchedToggle = null;

  function watchToggle() {
    if (!isEditorView()) {
      lastKnownState = null;
      watchedToggle = null;
      return;
    }

    var toggle = findPublishedToggle();
    if (!toggle) return;

    var currentState = getToggleState(toggle);

    // First time seeing this toggle — just record state
    if (watchedToggle !== toggle) {
      watchedToggle = toggle;
      lastKnownState = currentState;
      return;
    }

    // State changed! User clicked the toggle in the form
    if (lastKnownState !== null && currentState !== lastKnownState) {
      lastKnownState = currentState;

      bingoToast(
        currentState
          ? '🚀 Publicando... salvando automaticamente.'
          : '🔒 Rascunho... salvando automaticamente.',
        'info'
      );

      // Auto-save after a brief delay for React to process
      setTimeout(function () {
        triggerSave();
        setTimeout(function () {
          bingoToast(
            currentState ? '🚀 Publicado com sucesso!' : '🔒 Salvo como rascunho!',
            'success'
          );
        }, 1500);
      }, 400);
    }

    lastKnownState = currentState;
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
          if (src && src.indexOf('/images/') === 0 && src.indexOf(basePath) !== 0)
            img.setAttribute('src', basePath + src);
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
   *  INIT
   * ═══════════════════════════════════════════════════════════ */
  function init() {
    console.log('[BINGO] Admin engine v9 loaded');
    try { if (window.CMS) CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    setTimeout(function () { try { if (window.CMS) CMS.registerPreviewStyle('./preview.css'); } catch (e) {} }, 3000);

    try {
      new MutationObserver(checkLoginPage).observe(document.body, { childList: true, subtree: true });
      checkLoginPage();
    } catch (e) {}

    startImageFixer();

    // Watch the toggle for changes (debounced)
    try {
      var pending = false;
      new MutationObserver(function () {
        if (!pending) {
          pending = true;
          requestAnimationFrame(function () { watchToggle(); pending = false; });
        }
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-checked', 'class'] });
      setInterval(watchToggle, 400);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
