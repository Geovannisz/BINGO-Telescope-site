/**
 * BINGO Telescope — Admin Panel Engine v7
 * Button in header, robust toggle detection.
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

  function isEditorView() {
    var hash = window.location.hash || '';
    return hash.indexOf('/entries/') !== -1 || hash.indexOf('/new') !== -1;
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
          var sibToggle = findToggleInContainer(sib);
          if (sibToggle) return sibToggle;
          sib = sib.nextElementSibling;
        }
      }
      return findLastToggle(root);
    } catch (e) { return null; }
  }

  function findToggleInContainer(container) {
    if (!container) return null;
    var cb = container.querySelector('input[type="checkbox"]');
    if (cb) return cb;
    var sw = container.querySelector('[role="switch"], [role="checkbox"]');
    if (sw) return sw;
    var reactToggle = container.querySelector('.react-toggle, [class*="react-toggle"]');
    if (reactToggle) return reactToggle.querySelector('input') || reactToggle;
    var styledToggle = container.querySelector('[class*="Toggle"], [class*="toggle"], [class*="Switch"], [class*="switch"]');
    if (styledToggle) return styledToggle.querySelector('input') || styledToggle;
    return container.querySelector('[aria-checked]');
  }

  function findLastToggle(root) {
    var sws = root.querySelectorAll('[role="switch"], [role="checkbox"]');
    if (sws.length > 0) return sws[sws.length - 1];
    var cbs = root.querySelectorAll('input[type="checkbox"]');
    if (cbs.length > 0) return cbs[cbs.length - 1];
    return null;
  }

  function getToggleState(toggle) {
    if (!toggle) return true;
    if (toggle.type === 'checkbox') return toggle.checked;
    var ariaChecked = toggle.getAttribute('aria-checked');
    if (ariaChecked !== null) return ariaChecked === 'true';
    if (toggle.className && toggle.className.indexOf('checked') !== -1) return true;
    if (toggle.className && toggle.className.indexOf('checked') === -1) return false;
    if (toggle.value !== undefined && toggle.value !== '') return toggle.value !== 'false' && toggle.value !== '0';
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
   *  PERFORM TOGGLE
   * ═══════════════════════════════════════════════════════════ */
  function performToggle(toggle) {
    if (!toggle) return false;
    var currentState = getToggleState(toggle);
    console.log('[BINGO] Toggling state. Was: ' + currentState);

    // Prevent form submission if it's a submit button
    if (toggle.type === 'submit') toggle.type = 'button';

    // Method 1: React Props
    try {
      var keys = Object.getOwnPropertyNames(toggle);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('__reactProps') === 0) {
          var props = toggle[keys[i]];
          if (props && typeof props.onChange === 'function') {
            props.onChange({ target: { checked: !currentState, type: 'checkbox', value: !currentState } });
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
    try {
      toggle.click();
      return true;
    } catch (e) {}

    return false;
  }

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
        if (lower.indexOf('publish') !== -1 || lower.indexOf('save') !== -1 || lower.indexOf('publicar') !== -1 || lower.indexOf('salvar') !== -1) {
          if (!best || text.length < (best.textContent || '').trim().length) best = b;
        }
      }
      return best;
    } catch (e) { return null; }
  }

  function doDraftToggle() {
    var toggle = findPublishedToggle();
    if (!toggle) {
      showToast('❌ Toggle "Publicado" não encontrado.', 'error');
      return;
    }

    var wasPublished = getToggleState(toggle);
    var toggled = performToggle(toggle);

    if (!toggled) {
      showToast('❌ Não foi possível alterar o toggle.', 'error');
      return;
    }

    showToast(wasPublished ? '🔒 Convertendo para rascunho...' : '🚀 Publicando...', 'info');

    var attempts = 0;
    function trySave() {
      attempts++;
      var saveBtn = findSaveButton();
      if (saveBtn) {
        saveBtn.click();
        setTimeout(function () {
          showToast(wasPublished ? '🔒 Rascunho salvo!' : '🚀 Publicado!', 'success');
          refreshUI();
        }, 1500);
      } else if (attempts < 8) {
        setTimeout(trySave, 500);
      } else {
        showToast('⚠️ Alterado. Clique em Save/Publish manualmente.', 'warn');
      }
    }
    setTimeout(trySave, 500);
  }

  /* ═══════════════════════════════════════════════════════════
   *  UI ELEMENTS
   * ═══════════════════════════════════════════════════════════ */
  var customBtn = null;

  function createCustomButton() {
    if (customBtn) return customBtn;
    customBtn = document.createElement('button');
    customBtn.id = 'bingo-draft-btn';
    customBtn.type = 'button';
    Object.assign(customBtn.style, {
      display: 'none', alignItems: 'center', gap: '8px',
      padding: '8px 16px', borderRadius: '5px',
      fontSize: '14px', fontWeight: '500',
      fontFamily: "'Outfit', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)',
      marginLeft: '12px'
    });
    customBtn.addEventListener('mouseenter', function () { customBtn.style.transform = 'translateY(-1px)'; });
    customBtn.addEventListener('mouseleave', function () { customBtn.style.transform = ''; });
    customBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      doDraftToggle();
    });
    return customBtn;
  }

  function positionButton(btn) {
    try {
      var btns = document.querySelectorAll('button');
      var deleteBtn = null;
      for (var i = 0; i < btns.length; i++) {
        var text = (btns[i].textContent || '').toLowerCase();
        if (text.indexOf('delete') !== -1 || text.indexOf('exclu') !== -1) {
          deleteBtn = btns[i];
          break;
        }
      }
      
      if (deleteBtn && deleteBtn.parentElement) {
        // Place next to delete button in header
        if (btn.parentElement !== deleteBtn.parentElement) {
          // Sometimes the delete button is wrapped in a flex container, insert after it
          deleteBtn.parentElement.insertBefore(btn, deleteBtn.nextSibling);
        }
      } else {
        // Fallback to floating bottom-left if delete button not found
        Object.assign(btn.style, {
          position: 'fixed', bottom: '24px', left: '24px', zIndex: '9998',
          padding: '12px 20px', borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          marginLeft: '0'
        });
        if (btn.parentElement !== document.body) document.body.appendChild(btn);
      }
    } catch (e) {
      if (btn.parentElement !== document.body) document.body.appendChild(btn);
    }
  }

  function showButton(isPublished) {
    var btn = createCustomButton();
    btn.style.display = 'inline-flex';
    if (isPublished) {
      btn.innerHTML = '🔒 Despublicar (Rascunho)';
      btn.style.color = '#eab308';
      btn.style.borderColor = 'rgba(234,179,8,0.3)';
    } else {
      btn.innerHTML = '🚀 Publicar';
      btn.style.color = '#22c55e';
      btn.style.borderColor = 'rgba(34,197,94,0.3)';
    }
    positionButton(btn);
  }

  function hideButton() {
    if (customBtn) customBtn.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════════════════
   *  MAIN REFRESH
   * ═══════════════════════════════════════════════════════════ */
  function refreshUI() {
    try {
      if (!isEditorView()) {
        hideButton();
        return;
      }
      var toggle = findPublishedToggle();
      if (toggle) {
        var isPublished = getToggleState(toggle);
        showButton(isPublished);
      } else {
        showButton(true);
      }
    } catch (e) {}
  }

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

  function init() {
    console.log('[BINGO] Admin engine v7 loaded');
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
