/* Conceptual illustration only: no benchmark values are animated. */
(() => {
  'use strict';
  const scene = document.querySelector('[data-memory-scene]');
  if (!scene) return;
  const svg = scene.querySelector('svg');
  const field = scene.querySelector('[data-memory-field]');
  const depth = scene.querySelector('[data-memory-depth]');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = preference.matches;
  const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
  const orbits = Array.from(scene.querySelectorAll('[data-memory-orbit]'));
  const ripples = Array.from(scene.querySelectorAll('[data-memory-ripple]'));
  const nodes = Array.from(scene.querySelectorAll('[data-memory-node]')).map(element => ({
    halo: element.querySelector('[data-node-halo]'),
    x: Number(element.dataset.x), y: Number(element.dataset.y),
    radius: Number(element.querySelector('[data-node-halo]').getAttribute('r')),
    opacity: Number(element.querySelector('[data-node-halo]').getAttribute('opacity'))
  }));
  const pathDetails = Array.from(scene.querySelectorAll('[data-memory-path]')).map(path => {
    const signal = scene.querySelector(`[data-memory-signal="${path.dataset.memoryPath}"]`);
    return { path, length: path.getTotalLength(), signal,
      head: signal.querySelector('[data-signal-head]'), tails: Array.from(signal.querySelectorAll('[data-signal-tail]')) };
  });
  const initialAttributes = new Map();
  const remember = (element, names) => {
    initialAttributes.set(element, Object.fromEntries(names.map(name => [name, element.getAttribute(name)])));
  };
  orbits.forEach(element => remember(element, ['transform']));
  ripples.forEach(element => remember(element, ['r', 'opacity']));
  nodes.forEach(node => remember(node.halo, ['r', 'opacity']));
  pathDetails.forEach(({ signal, head, tails }) => {
    remember(signal, ['opacity']); remember(head, ['cx', 'cy']);
    tails.forEach(tail => remember(tail, ['cx', 'cy']));
  });
  remember(field, ['transform']); remember(depth, ['transform']);
  let visible = false;
  let suspended = false;
  let disposed = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let lastPaint = 0;
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  const cycleDuration = 11;
  const pointAt = (details, progress) => details.path.getPointAtLength(Math.max(0, Math.min(1, progress)) * details.length);
  const place = (element, point) => {
    element.setAttribute('cx', point.x.toFixed(2));
    element.setAttribute('cy', point.y.toFixed(2));
  };
  function reset() {
    initialAttributes.forEach((attributes, element) => Object.entries(attributes).forEach(([name, value]) => {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }));
    pointerX = pointerY = easedX = easedY = 0;
  }
  function paint(seconds) {
    const progress = (seconds % cycleDuration) / cycleDuration;
    orbits.forEach((element, index) => {
      const degrees = seconds * (index ? -1.5 : 1.05);
      element.setAttribute('transform', `rotate(${degrees.toFixed(3)} 310 270)`);
    });
    const points = pathDetails.map((details, index) => {
      const phase = (progress + index * .31) % 1;
      const point = pointAt(details, phase);
      place(details.head, point);
      details.tails.forEach(tail => place(tail, pointAt(details, Math.max(0, phase - Number(tail.dataset.signalTail) * .023))));
      // Gentle fade as a signal enters and leaves its historical interval.
      const fade = Math.min(1, phase * 14, (1 - phase) * 14);
      details.signal.setAttribute('opacity', (fade * (index === 0 ? .9 : index === 1 ? .6 : .36)).toFixed(3));
      return point;
    });
    nodes.forEach(node => {
      let activation = 0;
      points.forEach((point, index) => {
        const distance = Math.hypot(point.x - node.x, point.y - node.y);
        activation = Math.max(activation, Math.exp(-(distance * distance) / 1200) * (index ? .55 : 1));
      });
      node.halo.setAttribute('r', (node.radius + activation * (node.radius > 30 ? 7 : 5)).toFixed(2));
      node.halo.setAttribute('opacity', (node.opacity + activation * .2).toFixed(3));
    });
    ripples.forEach((element, index) => {
      const phase = (seconds / 5.5 + index * .5) % 1;
      element.setAttribute('r', (25 + phase * 45).toFixed(2));
      element.setAttribute('opacity', (.15 * Math.sin(Math.PI * phase) * (1 - phase)).toFixed(3));
    });
    easedX += (pointerX - easedX) * .07;
    easedY += (pointerY - easedY) * .07;
    field.setAttribute('transform', `translate(${easedX.toFixed(2)} ${easedY.toFixed(2)})`);
    depth.setAttribute('transform', `translate(${(-easedX * .32).toFixed(2)} ${(-easedY * .32).toFixed(2)})`);
  }
  function canAnimate() {
    return visible && !reducedMotion && !document.hidden && !suspended && !disposed;
  }
  function tick(now) {
    frame = 0;
    if (!canAnimate()) return;
    if (previous) elapsed += Math.min(now - previous, 80) / 1000;
    previous = now;
    // SVG stays smooth while limiting DOM attribute work to about 30 fps.
    if (!lastPaint || now - lastPaint >= 32) { paint(elapsed); lastPaint = now; }
    frame = window.requestAnimationFrame(tick);
  }
  function synchronize() {
    if (canAnimate()) {
      scene.dataset.memoryMotion = 'running';
      if (!frame) { previous = 0; frame = window.requestAnimationFrame(tick); }
    } else {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; previous = 0;
      scene.dataset.memoryMotion = reducedMotion ? 'reduced' : 'paused';
      if (reducedMotion) reset();
    }
  }
  function pointerMove(event) {
    if (reducedMotion || !pointerPreference.matches) return;
    const bounds = svg.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)) * 5;
    pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)) * 4;
  }
  function pointerLeave() { pointerX = pointerY = 0; }
  function motionChange(event) { reducedMotion = event.matches; synchronize(); }
  function pageHide(event) {
    suspended = true; synchronize();
    if (!event.persisted) {
      disposed = true;
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', synchronize);
      preference.removeEventListener('change', motionChange);
      scene.removeEventListener('pointermove', pointerMove);
      scene.removeEventListener('pointerleave', pointerLeave);
      window.removeEventListener('pageshow', pageShow);
      window.removeEventListener('pagehide', pageHide);
    }
  }
  function pageShow() { suspended = false; synchronize(); }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; synchronize();
  }, { threshold: .05 }) : null;
  if (observer) observer.observe(scene);
  else visible = true;
  document.addEventListener('visibilitychange', synchronize);
  preference.addEventListener('change', motionChange);
  scene.addEventListener('pointermove', pointerMove, { passive: true });
  scene.addEventListener('pointerleave', pointerLeave, { passive: true });
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  synchronize();
})();
