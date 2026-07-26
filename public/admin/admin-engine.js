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

  function setupUnpublishButton() {
    // 1. Check current publication status from the "published" form control
    let isCurrentlyPublished = true;
    const publishedInputs = Array.from(document.querySelectorAll('#nc-root input'));
    const pubInput = publishedInputs.find(i => {
      const id = (i.id || '').toLowerCase();
      const name = (i.name || '').toLowerCase();
      const labelText = (i.closest('label')?.textContent || '').toLowerCase();
      return id.includes('published') || name.includes('published') || labelText.includes('publicad') || labelText.includes('publish');
    });

    const btnId = 'bingo-unpublish-action';
    let unpublishBtn = document.getElementById(btnId);

    if (!pubInput) {
      // Not inside editor view - hide button if exists
      if (unpublishBtn) unpublishBtn.style.display = 'none';
      return;
    }

    if (pubInput.type === 'checkbox') {
      isCurrentlyPublished = pubInput.checked;
    } else if (pubInput.value !== undefined) {
      isCurrentlyPublished = String(pubInput.value) !== 'false' && String(pubInput.value) !== '0';
    }

    // 2. Get or Create Custom Unpublish / Save Draft Button as a Global Floating Action Button
    if (!unpublishBtn) {
      unpublishBtn = document.createElement('button');
      unpublishBtn.id = btnId;
      unpublishBtn.type = 'button';
      
      // Fixed positioning to guarantee visibility regardless of Decap CMS React nodes
      unpublishBtn.style.position = 'fixed';
      unpublishBtn.style.top = '12px';
      unpublishBtn.style.left = '50%';
      unpublishBtn.style.transform = 'translateX(-50%)';
      unpublishBtn.style.zIndex = '999999';
      unpublishBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

      unpublishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 3. Update the toggle value directly
        if (pubInput.type === 'checkbox') {
          if (pubInput.checked) pubInput.click();
        } else {
          pubInput.value = 'false';
          pubInput.dispatchEvent(new Event('input', { bubbles: true }));
          pubInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 4. Try to click native Save/Publish automatically
        setTimeout(() => {
          const allButtons = Array.from(document.querySelectorAll('#nc-root button, #nc-root div[role="button"]'));
          const nativeActionBtn = allButtons.find(b => {
            const text = (b.textContent || '').trim().toLowerCase();
            return (text.includes('publi') || text.includes('sav') || text.includes('salv'));
          });
          if (nativeActionBtn) {
            nativeActionBtn.click();
          }
        }, 150);
      });
      document.body.appendChild(unpublishBtn);
    }

    unpublishBtn.style.display = 'inline-flex';

    // 4. Update button text, title and visual class based on state
    if (isCurrentlyPublished) {
      unpublishBtn.textContent = '🔒 Unpublish (Save Draft)';
      unpublishBtn.title = 'Unpublish this entry and save as draft';
      unpublishBtn.className = 'is-published';
    } else {
      unpublishBtn.textContent = '📝 Save Draft';
      unpublishBtn.title = 'Save changes to draft';
      unpublishBtn.className = 'is-draft';
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

    // Setup custom unpublish button with mutation observer for instant reaction on view switch
    const unpublishObserver = new MutationObserver(setupUnpublishButton);
    unpublishObserver.observe(document.body, { childList: true, subtree: true });
    setInterval(setupUnpublishButton, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
