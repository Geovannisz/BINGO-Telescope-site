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
    // Find all buttons in the document
    const allButtons = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]'));

    // Locate the Publish or Save button
    const publishBtn = allButtons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text === 'publish' || text === 'publicar' || text === 'save' || text === 'salvar' || text.includes('publish') || text.includes('publicar'));
    });

    if (!publishBtn) return; // Exit if not inside editor view yet

    const toolbar = publishBtn.parentElement;
    if (!toolbar) return;

    // Check publication status by finding the "published" input field in the form
    let isCurrentlyPublished = true;
    const publishedInputs = Array.from(document.querySelectorAll('input, [id*="published"]'));
    const pubInput = publishedInputs.find(i => 
      (i.id && i.id.includes('published')) || 
      (i.name && i.name.includes('published')) ||
      (i.closest && i.closest('label') && (i.closest('label').textContent.toLowerCase().includes('publicad') || i.closest('label').textContent.toLowerCase().includes('publish')))
    );

    if (pubInput) {
      if (pubInput.type === 'checkbox') {
        isCurrentlyPublished = pubInput.checked;
      } else if (pubInput.value !== undefined) {
        isCurrentlyPublished = pubInput.value !== 'false' && pubInput.value !== '0';
      }
    }

    const btnId = 'bingo-unpublish-action';
    let unpublishBtn = document.getElementById(btnId);

    // If button doesn't exist or was removed by React re-render
    if (!unpublishBtn || !toolbar.contains(unpublishBtn)) {
      if (unpublishBtn) unpublishBtn.remove();

      unpublishBtn = document.createElement('button');
      unpublishBtn.id = btnId;
      unpublishBtn.className = publishBtn.className || '';
      unpublishBtn.type = 'button';
      
      unpublishBtn.style.cssText = `
        font-weight: 600 !important;
        border-radius: 4px !important;
        padding: 6px 14px !important;
        margin-right: 8px !important;
        cursor: pointer !important;
        font-size: 13px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        transition: all 0.2s ease !important;
        border: 1px solid transparent !important;
        white-space: nowrap !important;
        line-height: 1.4 !important;
        vertical-align: middle !important;
        z-index: 100 !important;
      `;
      
      unpublishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentPubInput = Array.from(document.querySelectorAll('input, [id*="published"]')).find(i => 
          (i.id && i.id.includes('published')) || 
          (i.name && i.name.includes('published')) ||
          (i.closest && i.closest('label') && (i.closest('label').textContent.toLowerCase().includes('publicad') || i.closest('label').textContent.toLowerCase().includes('publish')))
        );

        if (currentPubInput) {
          if (currentPubInput.type === 'checkbox') {
            if (currentPubInput.checked) {
              currentPubInput.click(); // Uncheck to set to false
            }
          } else {
            currentPubInput.value = 'false';
            currentPubInput.dispatchEvent(new Event('input', { bubbles: true }));
            currentPubInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Trigger native publish action to save changes
        setTimeout(() => {
          const currentPublishBtn = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]')).find(b => {
            const text = b.textContent.trim().toLowerCase();
            return (text === 'publish' || text === 'publicar' || text === 'save' || text === 'salvar' || text.includes('publish') || text.includes('publicar'));
          });
          if (currentPublishBtn) {
            currentPublishBtn.click();
          }
        }, 150);
      });

      // Align side by side with existing buttons
      toolbar.style.display = 'flex';
      toolbar.style.alignItems = 'center';
      toolbar.insertBefore(unpublishBtn, publishBtn);
    }

    // Dynamic state update
    if (isCurrentlyPublished) {
      unpublishBtn.textContent = '🔒 Unpublish (Save Draft)';
      unpublishBtn.title = 'Unpublish this content and revert to draft';
      unpublishBtn.style.backgroundColor = '#eab308';
      unpublishBtn.style.color = '#0f172a';
      unpublishBtn.style.borderColor = '#ca8a04';
      unpublishBtn.style.display = 'inline-flex';
    } else {
      unpublishBtn.textContent = '📝 Save Draft';
      unpublishBtn.title = 'Save changes as draft';
      unpublishBtn.style.backgroundColor = '#475569';
      unpublishBtn.style.color = '#ffffff';
      unpublishBtn.style.borderColor = '#334155';
      unpublishBtn.style.display = 'inline-flex';
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
