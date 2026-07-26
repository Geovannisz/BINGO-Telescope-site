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
    const allButtons = Array.from(document.querySelectorAll('button'));
    const deleteBtn = allButtons.find(b => 
      b.textContent.toLowerCase().includes('delete entry') || 
      b.textContent.toLowerCase().includes('excluir entrada') ||
      b.textContent.toLowerCase().includes('deletar')
    );
    const publishBtn = allButtons.find(b => 
      b.textContent.toLowerCase().includes('publish') || 
      b.textContent.toLowerCase().includes('publicar') ||
      b.textContent.toLowerCase().includes('save')
    );

    if (deleteBtn && publishBtn && !document.getElementById('bingo-unpublish-btn')) {
      const unpublishBtn = document.createElement('button');
      unpublishBtn.id = 'bingo-unpublish-btn';
      unpublishBtn.type = 'button';
      unpublishBtn.textContent = '🔒 Despublicar / Rascunho';
      unpublishBtn.style.cssText = `
        background: #eab308;
        color: #0f172a;
        font-weight: 700;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        margin: 0 10px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
      `;
      
      unpublishBtn.addEventListener('mouseenter', () => {
        unpublishBtn.style.background = '#ca8a04';
      });
      unpublishBtn.addEventListener('mouseleave', () => {
        unpublishBtn.style.background = '#eab308';
      });

      unpublishBtn.addEventListener('click', () => {
        // Look for the "Publicado" input toggle / checkbox in the form
        const publishedInputs = Array.from(document.querySelectorAll('input'));
        const pubInput = publishedInputs.find(i => 
          i.id.includes('published') || 
          (i.name && i.name.includes('published')) ||
          (i.closest('label') && i.closest('label').textContent.includes('Publicado'))
        );

        if (pubInput) {
          if (pubInput.type === 'checkbox') {
            if (pubInput.checked) {
              pubInput.click();
            }
          } else {
            pubInput.value = 'false';
            pubInput.dispatchEvent(new Event('input', { bubbles: true }));
            pubInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Trigger publish/save to persist the unpublish state
        setTimeout(() => {
          publishBtn.click();
        }, 150);
      });

      // Insert between Delete entry and Publish button
      publishBtn.parentNode.insertBefore(unpublishBtn, publishBtn);
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

    // Setup custom unpublish button
    setInterval(setupUnpublishButton, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
