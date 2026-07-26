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
    
    // Find Delete entry button
    const deleteBtn = allButtons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return text.includes('delete') || text.includes('excluir') || text.includes('deletar');
    });

    // Find Publish / Save button
    const publishBtn = allButtons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return text.includes('publish') || text.includes('publicar') || text.includes('save') || text.includes('salvar');
    });

    // Locate the "published" toggle in the form to determine status
    const publishedInputs = Array.from(document.querySelectorAll('input'));
    const pubInput = publishedInputs.find(i => 
      i.id.includes('published') || 
      (i.name && i.name.includes('published')) ||
      (i.closest('label') && i.closest('label').textContent.toLowerCase().includes('publicad')) ||
      (i.closest('label') && i.closest('label').textContent.toLowerCase().includes('publish'))
    );

    // Check if the current entry is published (default to true if input not found or checked)
    const isCurrentlyPublished = pubInput ? (pubInput.type === 'checkbox' ? pubInput.checked : pubInput.value !== 'false') : true;

    const btnId = 'bingo-unpublish-btn';
    let unpublishBtn = document.getElementById(btnId);

    const targetParent = publishBtn?.parentNode || deleteBtn?.parentNode;
    if (!targetParent) return;

    // Ensure container uses flex inline alignment side-by-side
    if (targetParent.style.display !== 'flex') {
      targetParent.style.display = 'inline-flex';
      targetParent.style.alignItems = 'center';
      targetParent.style.gap = '8px';
    }

    if (!unpublishBtn) {
      unpublishBtn = document.createElement('button');
      unpublishBtn.id = btnId;
      unpublishBtn.type = 'button';
      unpublishBtn.style.cssText = `
        font-weight: 600;
        border-radius: 4px;
        padding: 6px 14px;
        margin: 0 4px;
        cursor: pointer;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        line-height: 1.4;
        white-space: nowrap;
        vertical-align: middle;
      `;
      
      unpublishBtn.addEventListener('click', () => {
        const currentPubInput = Array.from(document.querySelectorAll('input')).find(i => 
          i.id.includes('published') || 
          (i.name && i.name.includes('published')) ||
          (i.closest('label') && i.closest('label').textContent.toLowerCase().includes('publicad')) ||
          (i.closest('label') && i.closest('label').textContent.toLowerCase().includes('publish'))
        );

        if (currentPubInput) {
          if (currentPubInput.type === 'checkbox') {
            if (currentPubInput.checked) {
              currentPubInput.click();
            }
          } else {
            currentPubInput.value = 'false';
            currentPubInput.dispatchEvent(new Event('input', { bubbles: true }));
            currentPubInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Trigger publish/save to persist the unpublish / draft state
        setTimeout(() => {
          const currentPublishBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const text = b.textContent.trim().toLowerCase();
            return text.includes('publish') || text.includes('publicar') || text.includes('save') || text.includes('salvar');
          });
          if (currentPublishBtn) {
            currentPublishBtn.click();
          }
        }, 150);
      });

      if (publishBtn) {
        publishBtn.parentNode.insertBefore(unpublishBtn, publishBtn);
      } else {
        targetParent.appendChild(unpublishBtn);
      }
    }

    // Dynamic state update (Text, Icons, Styling and Visibility based on publication state)
    if (isCurrentlyPublished) {
      // Entry is Published -> Show "Unpublish / Save as Draft" button in yellow/amber
      unpublishBtn.textContent = '🔒 Unpublish (Draft)';
      unpublishBtn.title = 'Unpublish this entry and keep it as a draft';
      unpublishBtn.style.background = '#eab308';
      unpublishBtn.style.color = '#0f172a';
      unpublishBtn.style.border = '1px solid #ca8a04';
      unpublishBtn.style.boxShadow = '0 2px 6px rgba(234, 179, 8, 0.35)';
      unpublishBtn.style.display = 'inline-flex';
    } else {
      // Entry is Draft / Unpublished -> Show "Save Draft" in subtle grey or keep option clear
      unpublishBtn.textContent = '📝 Save Draft';
      unpublishBtn.title = 'Save current changes as draft without publishing';
      unpublishBtn.style.background = '#475569';
      unpublishBtn.style.color = '#ffffff';
      unpublishBtn.style.border = '1px solid #334155';
      unpublishBtn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
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

    // Setup custom unpublish button
    setInterval(setupUnpublishButton, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
