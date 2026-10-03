(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const menuButton = document.querySelector('.mobile-nav-toggle');
  const menu = document.getElementById('main-navigation');
  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav')) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 560) closeMenu();
    });
  }

  // On the overview page, the section link follows the section being read.
  // The stable #benchmark anchor remains compatible with existing deep links.
  const designSection = document.getElementById('benchmark');
  const designLink = menu && menu.querySelector('.home-benchmark');
  const overviewLink = menu && menu.querySelector('a[href="index.html"]');
  if (designSection && designLink && overviewLink) {
    const header = document.querySelector('.site-header');
    let frame = 0;
    let pendingJump = false;
    let jumpTimer = 0;
    let disposed = false;
    function setActive(designActive) {
      if (designActive) {
        designLink.setAttribute('aria-current', 'location');
        overviewLink.removeAttribute('aria-current');
      } else {
        designLink.removeAttribute('aria-current');
        overviewLink.setAttribute('aria-current', 'page');
      }
    }
    function activationOffset() {
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      return Math.max(headerBottom, padding) + 2;
    }
    function clearJump() {
      pendingJump = false;
      window.clearTimeout(jumpTimer);
      jumpTimer = 0;
    }
    function updateActive() {
      frame = 0;
      if (disposed) return;
      const bounds = designSection.getBoundingClientRect();
      const offset = activationOffset();
      const inDesign = bounds.top <= offset && bounds.bottom > offset;
      // Hold the requested destination during native smooth scrolling so that
      // intermediate sections cannot immediately overwrite the click state.
      if (pendingJump && inDesign) clearJump();
      setActive(pendingJump || inDesign);
    }
    function scheduleUpdate() {
      if (!frame && !disposed) frame = window.requestAnimationFrame(updateActive);
    }
    function armJump() {
      clearJump();
      pendingJump = true;
      setActive(true);
      jumpTimer = window.setTimeout(() => { clearJump(); scheduleUpdate(); }, 1800);
      scheduleUpdate();
    }
    function hashChange() {
      if (window.location.hash === '#benchmark') armJump();
      else { clearJump(); scheduleUpdate(); }
    }
    function designClick(event) {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      armJump(); // Let the anchor preserve native URL/history behavior.
    }
    function interruptJump() {
      if (pendingJump) { clearJump(); scheduleUpdate(); }
    }
    function keyNavigation(event) {
      if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) interruptJump();
    }
    function pageShow() { scheduleUpdate(); }
    function pageHide(event) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      clearJump();
      if (event.persisted) return;
      disposed = true;
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', hashChange);
      window.removeEventListener('popstate', hashChange);
      window.removeEventListener('pageshow', pageShow);
      window.removeEventListener('pagehide', pageHide);
      window.removeEventListener('wheel', interruptJump);
      window.removeEventListener('touchstart', interruptJump);
      document.removeEventListener('keydown', keyNavigation);
      designLink.removeEventListener('click', designClick);
    }
    designLink.addEventListener('click', designClick);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('hashchange', hashChange);
    window.addEventListener('popstate', hashChange);
    window.addEventListener('pageshow', pageShow);
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('wheel', interruptJump, { passive: true });
    window.addEventListener('touchstart', interruptJump, { passive: true });
    document.addEventListener('keydown', keyNavigation);
    if (window.location.hash === '#benchmark') armJump();
    else scheduleUpdate();
  }
  fetch(new URL('../../data/site.json', scriptURL), { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Site configuration unavailable');
      return response.json();
    })
    .then(config => {
      const repository = new URL(config.repository);
      if (repository.protocol !== 'https:' || repository.hostname !== 'github.com') return;
      const base = repository.href.replace(/\/$/, '');
      document.querySelectorAll('[data-repo-path]').forEach(link => {
        const path = link.dataset.repoPath.replace(/^\/+/, '');
        link.href = base + (path ? '/' + path : '');
      });
    })
    .catch(() => { /* The static href values remain usable without configuration fetch. */ });
})();
