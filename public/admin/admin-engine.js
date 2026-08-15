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
    
    try {
      if (window.CMS && window.CMS.createClass && window.CMS.h) {
        var h = window.CMS.h;
        var femaleRoles = {
          'Coordenador Geral': 'Coordenadora Geral',
          'Pesquisador Sênior': 'Pesquisadora Sênior',
          'Professor Titular': 'Professora Titular',
          'Professor Associado': 'Professora Associada',
          'Professor Doutor': 'Professora Doutora',
          'Doutorando': 'Doutoranda',
          'Mestrando': 'Mestranda',
          'Engenheiro': 'Engenheira',
          'Colaborador Externo': 'Colaboradora Externa',
          'Assessor/Assistente': 'Assessora/Assistente'
        };

        var TeamPreview = window.CMS.createClass({
          render: function() {
            var entry = this.props.entry;
            var data = entry.get('data') ? entry.get('data').toJS() : {};
            
            var name = data.name || 'Nome do Membro';
            var gender = data.gender || 'Masculino';
            var role = data.role || 'Pesquisador';
            if (gender === 'Feminino' && femaleRoles[role]) {
              role = femaleRoles[role];
            }
            var photo = data.photo || '';
            var institution = data.institution || 'Instituição';
            var stage = data.stage || [];
            var area = data.area || '';
            var city = data.city || '';
            var bio = data.bio || '';
            var links = data.links || {};
            
            var getStageClass = function(s) {
              if (s === 'Coordenação') return 'tp-stage-coord';
              if (s.indexOf('0') !== -1) return 'tp-stage-0';
              if (s.indexOf('I') === -1) return 'tp-stage-0';
              if (s === 'Estágio V') return 'tp-stage-5';
              if (s === 'Estágio IV') return 'tp-stage-4';
              if (s === 'Estágio III') return 'tp-stage-3';
              if (s === 'Estágio II') return 'tp-stage-2';
              if (s === 'Estágio I') return 'tp-stage-1';
              return 'tp-stage-0';
            };
            
            var renderBadges = function() {
              var badges = [];
              if (stage && stage.length > 0) {
                stage.forEach(function(s) {
                  badges.push(h('span', { className: 'tp-stage ' + getStageClass(s), key: s }, s));
                });
              }
              if (area) {
                badges.push(h('span', { className: 'tp-area-badge', key: 'area' }, area));
              }
              if (city) {
                badges.push(h('span', { className: 'tp-city-badge', key: 'city' }, '📍 ' + city));
              }
              return badges;
            };

            var renderLinks = function() {
              var linkEls = [];
              var types = ['email', 'lattes', 'orcid', 'linkedin', 'researchgate'];
              types.forEach(function(type) {
                if (links[type]) {
                  linkEls.push(h('a', { className: 'tp-link-btn', href: links[type], target: '_blank', key: type }, type.charAt(0).toUpperCase() + type.slice(1)));
                }
              });
              return linkEls;
            };
            
            var renderTrajetoria = function() {
              if (!data.interest_origin && !data.motivation && !data.years_researching && !data.research_lines && !data.memorable_experience) return null;
              return h('div', { className: 'tp-glass-card' }, 
                h('h3', { className: 'tp-section-title' }, 'Trajetória Acadêmica'),
                data.interest_origin && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Origem do Interesse'), h('p', { className: 'tp-text' }, data.interest_origin)),
                data.motivation && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Motivação'), h('p', { className: 'tp-text' }, data.motivation)),
                data.years_researching && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Anos em Pesquisa'), h('p', { className: 'tp-text' }, data.years_researching + ' anos')),
                data.research_lines && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Linhas de Pesquisa'), h('p', { className: 'tp-text' }, data.research_lines)),
                data.memorable_experience && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Experiência Memorável'), h('p', { className: 'tp-text' }, data.memorable_experience))
              );
            };

            var renderPesquisa = function() {
              if (!data.project_title && !data.project_description && !data.project_problem && !data.project_importance && !data.project_methods && !data.project_results && !data.project_challenges) return null;
              return h('div', { className: 'tp-glass-card' }, 
                h('h3', { className: 'tp-section-title' }, 'Pesquisa Atual'),
                data.project_title && h('div', { className: 'tp-project-title' }, data.project_title),
                data.project_description && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Descrição'), h('p', { className: 'tp-text' }, data.project_description)),
                data.project_problem && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'O Problema'), h('p', { className: 'tp-text' }, data.project_problem)),
                data.project_importance && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Importância'), h('p', { className: 'tp-text' }, data.project_importance)),
                data.project_methods && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Métodos'), h('p', { className: 'tp-text' }, data.project_methods)),
                data.project_results && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Resultados/Expectativas'), h('p', { className: 'tp-text' }, data.project_results)),
                data.project_challenges && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Desafios'), h('p', { className: 'tp-text' }, data.project_challenges))
              );
            };

            var renderDivulgacao = function() {
              if (!data.explain_simple && !data.biggest_curiosity && !data.common_myth && !data.impressive_discovery && !data.career_advice) return null;
              return h('div', { className: 'tp-glass-card' }, 
                h('h3', { className: 'tp-section-title tp-title-amber' }, 'Divulgação Científica'),
                data.explain_simple && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle-amber' }, 'Explicação Simples'), h('p', { className: 'tp-text' }, data.explain_simple)),
                data.biggest_curiosity && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle-amber' }, 'Maior Curiosidade'), h('p', { className: 'tp-text' }, data.biggest_curiosity)),
                data.common_myth && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle-amber' }, 'Mito Comum'), h('p', { className: 'tp-text' }, data.common_myth)),
                data.impressive_discovery && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle-amber' }, 'Descoberta Impressionante'), h('p', { className: 'tp-text' }, data.impressive_discovery)),
                data.career_advice && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle-amber' }, 'Conselho de Carreira'), h('p', { className: 'tp-text' }, data.career_advice))
              );
            };

            var renderProducao = function() {
              if (!data.publications && !data.published_articles && !data.books_chapters && !data.groups_labs && !data.future_projects) return null;
              
              var pubsEls = [];
              if (data.publications && data.publications.length > 0) {
                pubsEls = data.publications.map(function(pub, idx) {
                  return h('div', { className: 'tp-pub-item', key: idx },
                    h('div', { className: 'tp-pub-item-title' }, pub.title),
                    h('div', { className: 'tp-pub-item-meta' }, (pub.journal || '') + (pub.year ? ' (' + pub.year + ')' : '')),
                    pub.link && h('a', { className: 'tp-pub-link', href: pub.link, target: '_blank' }, 'Ver publicação ↗')
                  );
                });
              }

              return h('div', { className: 'tp-glass-card' }, 
                h('h3', { className: 'tp-section-title' }, 'Produção Científica'),
                pubsEls.length > 0 && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Principais Publicações'), pubsEls),
                data.published_articles && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Artigos Publicados'), h('p', { className: 'tp-text' }, data.published_articles)),
                data.books_chapters && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Livros/Capítulos'), h('p', { className: 'tp-text' }, data.books_chapters)),
                data.groups_labs && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Grupos e Laboratórios'), h('p', { className: 'tp-text' }, data.groups_labs)),
                data.future_projects && h('div', { className: 'tp-mb-4' }, h('h4', { className: 'tp-section-subtitle' }, 'Projetos Futuros'), h('p', { className: 'tp-text' }, data.future_projects))
              );
            };

            var photoUrl = '';
            if (photo) {
              try { photoUrl = this.props.getAsset(photo).toString(); } catch(e) {}
            }

            return h('div', { className: 'tp-container' },
              h('div', { className: 'tp-hero' },
                photoUrl ? h('img', { className: 'tp-photo', src: photoUrl }) : h('div', { className: 'tp-photo-fallback' }, '👤'),
                h('h1', { className: 'tp-name' }, name),
                h('div', { className: 'tp-role' }, role),
                h('div', { className: 'tp-institution' }, institution),
                h('div', { className: 'tp-badges' }, renderBadges())
              ),
              bio && h('div', { className: 'tp-glass-card tp-mb-6' }, h('p', { className: 'tp-text' }, bio)),
              links && Object.keys(links).length > 0 && h('div', { className: 'tp-links tp-mb-6' }, renderLinks()),
              renderTrajetoria(),
              renderPesquisa(),
              renderDivulgacao(),
              renderProducao()
            );
          }
        });
        window.CMS.registerPreviewTemplate('team', TeamPreview);
        window.__BINGO_TEAM_PREVIEW_REGISTERED = true;
      }
    } catch(e) { console.warn('[BINGO] Team preview registration failed:', e); }

    setTimeout(function () { 
      try { 
        if (window.CMS) CMS.registerPreviewStyle('./preview.css'); 
        if (window.CMS && !window.__BINGO_TEAM_PREVIEW_REGISTERED && window.CMS.createClass) {
          // Backup registration in case it failed earlier
          if (typeof TeamPreview !== 'undefined') window.CMS.registerPreviewTemplate('team', TeamPreview);
        }
      } catch (e) {} 
    }, 3000);

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
