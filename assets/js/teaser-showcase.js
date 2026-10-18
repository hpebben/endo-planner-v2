(function () {
  'use strict';
  const initialise = (teaser) => {
    if (teaser.dataset.showcaseReady) return;
    const tabs = [...teaser.querySelectorAll('[role="tab"][data-stage]')];
    const slides = [...teaser.querySelectorAll('[data-slide]')];
    const dots = [...teaser.querySelectorAll('[data-dot]')];
    const play = teaser.querySelector('.endoplanner-showcase-play');
    if (!tabs.length || tabs.length !== slides.length || !play) return;
    teaser.dataset.showcaseReady = 'true';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, timer = null, paused = motion.matches, hovered = false;
    const clear = () => { window.clearTimeout(timer); timer = null; };
    const schedule = () => {
      clear();
      const focused = document.activeElement;
      const keyboardFocus = focused && focused !== play && teaser.contains(focused) && focused.matches(':focus-visible');
      if (!paused && !hovered && !document.hidden && !keyboardFocus) timer = window.setTimeout(() => show((active + 1) % slides.length), 5000);
    };
    const updatePlay = () => {
      play.textContent = paused ? 'Play' : 'Pause';
      play.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      play.setAttribute('aria-pressed', String(paused));
    };
    const show = (index, focus) => {
      active = (index + slides.length) % slides.length;
      tabs.forEach((tab, i) => {
        tab.classList.toggle('is-active', i === active);
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        slides[i].hidden = i !== active;
        dots[i].classList.toggle('is-active', i === active);
        dots[i].setAttribute('aria-pressed', String(i === active));
      });
      if (focus) tabs[active].focus({ preventScroll: true });
      schedule();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') show(index); });
      tab.addEventListener('click', () => show(index));
      tab.addEventListener('focus', () => show(index));
      tab.addEventListener('keydown', (event) => {
        const next = event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); show(next, true);
      });
      dots[index].addEventListener('click', () => show(index));
    });
    teaser.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { hovered = true; clear(); } });
    teaser.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') { hovered = false; schedule(); } });
    teaser.addEventListener('focusin', schedule);
    teaser.addEventListener('focusout', () => window.requestAnimationFrame(schedule));
    play.addEventListener('click', () => { paused = !paused; updatePlay(); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', () => { if (motion.matches) paused = true; updatePlay(); schedule(); });
    updatePlay(); show(0);
  };
  const scan = (root) => {
    if (root.matches && root.matches('.endoplanner-teaser')) initialise(root);
    root.querySelectorAll('.endoplanner-teaser').forEach(initialise);
  };
  const boot = () => {
    scan(document);
    new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => { if (node.nodeType === 1) scan(node); }))).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
