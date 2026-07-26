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
    if (document.getElementById('bingo-unpublish-btn')) return;

    const allButtons = Array.from(document.querySelectorAll('button'));
    
    // Find Delete entry button (or any delete/excluir button)
    const deleteBtn = allButtons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return text.includes('delete') || text.includes('excluir') || text.includes('deletar');
    });

    // Find Publish / Save button
    const publishBtn = allButtons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return text.includes('publish') || text.includes('publicar') || text.includes('save') || text.includes('salvar');
    });

    // If both exist or if there's any action header container
    const targetParent = publishBtn?.parentNode || deleteBtn?.parentNode;

    if (targetParent) {
      const unpublishBtn = document.createElement('button');
      unpublishBtn.id = 'bingo-unpublish-btn';
      unpublishBtn.type = 'button';
      unpublishBtn.textContent = '🔒 Despublicar (Salvar Rascunho)';
      unpublishBtn.style.cssText = `
        background: linear-gradient(135deg, #eab308, #ca8a04);
        color: #0f172a;
        font-weight: 700;
        border: 1px solid rgba(250, 204, 21, 0.4);
        border-radius: 6px;
        padding: 8px 16px;
        margin: 0 8px;
        cursor: pointer;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
        z-index: 999;
      `;
      
      unpublishBtn.addEventListener('mouseenter', () => {
        unpublishBtn.style.transform = 'translateY(-1px)';
        unpublishBtn.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.4)';
      });
      unpublishBtn.addEventListener('mouseleave', () => {
        unpublishBtn.style.transform = 'none';
        unpublishBtn.style.boxShadow = '0 2px 8px rgba(234, 179, 8, 0.3)';
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
          if (publishBtn) {
            publishBtn.click();
          }
        }, 150);
      });

      if (publishBtn) {
        publishBtn.parentNode.insertBefore(unpublishBtn, publishBtn);
      } else {
        targetParent.appendChild(unpublishBtn);
      }
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
