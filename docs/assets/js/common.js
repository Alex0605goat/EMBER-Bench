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
  fetch(new URL('../../data/site.json', scriptURL))
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
