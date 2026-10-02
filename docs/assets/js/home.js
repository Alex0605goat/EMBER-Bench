(() => {
  'use strict';
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        selectTab(target);
        target.focus();
      }
    });
  });

  // Content and real scores remain visible without JS or under reduced motion.
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = Array.from(document.querySelectorAll('.section-heading, .intro-grid, .scenario, .resource, .finding, .original-figure'));
  const scoreTargets = Array.from(document.querySelectorAll('.score-bar'));
  const scoreGroups = Array.from(document.querySelectorAll('.score-comparison'));
  scoreGroups.forEach(group => Array.from(group.querySelectorAll('.score-bar')).forEach((bar, index) => {
    bar.style.setProperty('--score-delay', `${index * .18}s`);
  }));
  let observer = null;
  let scoreObserver = null;
  function showAll() {
    revealTargets.forEach(element => element.classList.add('is-visible'));
    scoreTargets.forEach(element => element.classList.add('score-visible'));
  }
  function updateMotion() {
    if (observer) observer.disconnect();
    if (scoreObserver) scoreObserver.disconnect();
    observer = scoreObserver = null;
    document.documentElement.classList.toggle('js-motion', !preference.matches);
    if (preference.matches || !('IntersectionObserver' in window)) { showAll(); return; }
    revealTargets.forEach(element => element.classList.add('reveal'));
    scoreTargets.forEach(element => element.classList.add('score-reveal'));
    observer = new IntersectionObserver((entries, actualObserver) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); actualObserver.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px 28px 0px' });
    scoreObserver = new IntersectionObserver((entries, actualObserver) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.score-bar').forEach(bar => bar.classList.add('score-visible'));
        actualObserver.unobserve(entry.target);
      }
    }), { threshold: .3 });
    revealTargets.forEach(element => {
      if (!element.classList.contains('is-visible')) observer.observe(element);
    });
    scoreGroups.forEach(element => {
      if (Array.from(element.querySelectorAll('.score-bar')).some(bar => !bar.classList.contains('score-visible'))) scoreObserver.observe(element);
    });
  }
  preference.addEventListener('change', updateMotion);
  updateMotion();
  function pageHide(event) {
    if (event.persisted) return;
    if (observer) observer.disconnect();
    if (scoreObserver) scoreObserver.disconnect();
    preference.removeEventListener('change', updateMotion);
    window.removeEventListener('pagehide', pageHide);
  }
  window.addEventListener('pagehide', pageHide);
})();
