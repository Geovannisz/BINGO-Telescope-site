/**
 * BINGO Telescope — Admin Panel Engine
 * Minimal: login customization only.
 */
(function () {
  'use strict';

  function checkLoginPage() {
    const btns = document.querySelectorAll('button');
    btns.forEach(btn => {
      if (btn.textContent.includes('Login with GitHub')) {
        btn.textContent = '🔭 Acessar Painel BINGO';
        btn.classList.add('bingo-login-btn');
      }
    });
  }

  function findSaveButton() {
    const header = document.querySelector('header, [class*="AppHeader"], nav');
    if (header) {
      const btns = Array.from(header.querySelectorAll('button, [role="button"]'));
      const saveBtn = btns.find(b => {
        const text = (b.textContent || '').trim().toLowerCase();
        return text.includes('publish') || text.includes('save') || text.includes('publicar') || text.includes('salvar');
      });
      if (saveBtn) return saveBtn;
    }
    const allButtons = Array.from(document.querySelectorAll('#nc-root button, #nc-root div[role="button"]'));
    return allButtons.find(b => {
      const text = (b.textContent || '').trim().toLowerCase();
      return text.includes('publish') || text.includes('save') || text.includes('publicar') || text.includes('salvar');
    });
  }

  function updateStatusBadge(isPublished, hasPubInput) {
    const badgeId = 'bingo-editor-status-badge';
    let badge = document.getElementById(badgeId);
    
    if (!hasPubInput) {
      if (badge) badge.style.display = 'none';
      return;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.id = badgeId;
      badge.style.position = 'fixed';
      badge.style.top = '12px';
      badge.style.left = '220px';
      badge.style.zIndex = '9999';
      badge.style.padding = '6px 12px';
      badge.style.borderRadius = '20px';
      badge.style.fontSize = '12px';
      badge.style.fontWeight = '700';
      badge.style.fontFamily = "'Outfit', sans-serif";
      badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      badge.style.pointerEvents = 'none';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.gap = '6px';
      badge.style.transition = 'all 0.3s ease';
      document.body.appendChild(badge);
    }
    
    badge.style.display = 'flex';
    if (isPublished) {
      badge.innerHTML = '<span style="color: #22c55e;">●</span> PUBLICADO';
      badge.style.backgroundColor = '#0f172a';
      badge.style.color = '#f8fafc';
      badge.style.border = '1px solid rgba(34, 197, 94, 0.4)';
    } else {
      badge.innerHTML = '<span style="color: #eab308;">●</span> RASCUNHO';
      badge.style.backgroundColor = '#0f172a';
      badge.style.color = '#f8fafc';
      badge.style.border = '1px solid rgba(234, 179, 8, 0.4)';
    }
  }

  function setupUnpublishDropdown() {
    // 1. Check current publication status from the "published" form control
    let isCurrentlyPublished = true;
    const publishedInputs = Array.from(document.querySelectorAll('#nc-root input'));
    const pubInput = publishedInputs.find(i => {
      const id = (i.id || '').toLowerCase();
      const name = (i.name || '').toLowerCase();
      const labelText = (i.closest('label')?.textContent || '').toLowerCase();
      return id.includes('published') || name.includes('published') || labelText.includes('publicad') || labelText.includes('publish');
    });

    const badgeId = 'bingo-editor-status-badge';
    const unpublishId = 'bingo-unpublish-dropdown-item';

    // Remove legacy floating button if it exists
    const oldBtn = document.getElementById('bingo-unpublish-action');
    if (oldBtn) oldBtn.remove();

    if (!pubInput) {
      // Not inside editor view - hide badge if exists
      const badge = document.getElementById(badgeId);
      if (badge) badge.style.display = 'none';
      return;
    }

    if (pubInput.type === 'checkbox') {
      isCurrentlyPublished = pubInput.checked;
    } else if (pubInput.value !== undefined) {
      isCurrentlyPublished = String(pubInput.value) !== 'false' && String(pubInput.value) !== '0';
    }

    // Update status badge
    updateStatusBadge(isCurrentlyPublished, true);

    // 2. Scan if the CMS dropdown menu containing "Duplicate"/"Duplicar" is currently visible in DOM
    const duplicateLeaves = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = (el.textContent || '').trim();
      return (text === 'Duplicate' || text === 'Duplicar') && el.children.length === 0;
    });

    const duplicateLeaf = duplicateLeaves[0];
    if (!duplicateLeaf) {
      return; // Dropdown is not open
    }

    const duplicateContainer = duplicateLeaf.closest('button, li, a, div[role="button"]') || duplicateLeaf;
    const dropdownParent = duplicateContainer.parentNode;
    if (!dropdownParent) return;

    // Check if our own button is already injected in this dropdown session
    let unpublishItem = dropdownParent.querySelector(`#${unpublishId}`);
    if (!unpublishItem) {
      unpublishItem = duplicateContainer.cloneNode(true);
      unpublishItem.id = unpublishId;
      unpublishItem.classList.add('bingo-unpublish-dropdown-item');
      
      // Inject next to duplicate
      duplicateContainer.after(unpublishItem);
      
      // Define click behavior
      unpublishItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close dropdown
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.dispatchEvent(clickEvent);

        // Toggle published state
        const targetState = !isCurrentlyPublished;
        if (pubInput.type === 'checkbox') {
          if (pubInput.checked !== targetState) {
            pubInput.click();
          }
        } else {
          pubInput.value = String(targetState);
          pubInput.dispatchEvent(new Event('input', { bubbles: true }));
          pubInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Show toast
        if (window.showToast) {
          window.showToast(
            targetState ? 'Alterando para Publicado... Salvando. 🚀' : 'Alterando para Rascunho... Salvando. 🔒', 
            'info'
          );
        }

        // Click Save button
        setTimeout(() => {
          const saveBtn = findSaveButton();
          if (saveBtn) {
            saveBtn.click();
            setTimeout(() => {
              if (window.showToast) {
                window.showToast(
                  targetState ? 'Item publicado e salvo com sucesso! 🚀' : 'Rascunho atualizado e salvo! 🔒',
                  'success'
                );
              }
            }, 1000);
          } else {
            if (window.showToast) {
              window.showToast('Alteração efetuada. Por favor, clique em Salvar manual.', 'warn');
            }
          }
        }, 300);
      });
    }

    // 3. Update the label and styling matching current state
    const itemTextEl = Array.from(unpublishItem.querySelectorAll('*')).concat([unpublishItem]).find(el => {
      const text = (el.textContent || '').trim();
      return (text === 'Duplicate' || text === 'Duplicar' || text.includes('Despublicar') || text.includes('Rascunho') || text.includes('Publicar')) && el.children.length === 0;
    });

    if (itemTextEl) {
      itemTextEl.textContent = isCurrentlyPublished ? '🔒 Despublicar (Salvar Rascunho)' : '🚀 Publicar (Salvar Ativo)';
    }
  }

  function startImageFixer() {
    // Detect dynamically if the CMS is running under a subpath
    const adminIdx = window.location.pathname.indexOf('/admin');
    if (adminIdx <= 0) return; // If 0 or -1, we are at the domain root (e.g. localhost), no fix needed
    const basePath = window.location.pathname.substring(0, adminIdx);

    function fixImages(root) {
      const imgs = root.querySelectorAll('img');
      imgs.forEach(img => {
        const src = img.getAttribute('src');
        // If image points to the site's local image directory (/images/)
        // and doesn't already start with the subpath, prepend it
        if (src && src.startsWith('/images/') && !src.startsWith(basePath)) {
          img.setAttribute('src', basePath + src);
        }
      });
    }

    function scanAndFix() {
      // Fix images in the main document (forms, widget thumbnails)
      fixImages(document);

      // Fix images in the preview panels inside iframes (live preview)
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) {
            fixImages(iframeDoc);
          }
        } catch (e) {
          // Ignore potential cross-origin security errors with external iframes
        }
      });
    }

    // Run initial scan
    scanAndFix();

    // Safeguard interval to catch reactive updates from React/Decap
    setInterval(scanAndFix, 300);

    // Mutation observer for instantaneous responsiveness when form fields update
    const observer = new MutationObserver(scanAndFix);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    // Register preview CSS with Decap CMS
    if (window.CMS) {
      try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
    }
    setTimeout(() => {
      if (window.CMS) {
        try { CMS.registerPreviewStyle('./preview.css'); } catch (e) {}
      }
    }, 3000);

    // Login page detection
    const obs = new MutationObserver(checkLoginPage);
    obs.observe(document.body, { childList: true, subtree: true });
    checkLoginPage();

    // Fix image previews
    startImageFixer();

    // Setup custom unpublish dropdown item and status badge
    const unpublishObserver = new MutationObserver(setupUnpublishDropdown);
    unpublishObserver.observe(document.body, { childList: true, subtree: true });
    setInterval(setupUnpublishDropdown, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
