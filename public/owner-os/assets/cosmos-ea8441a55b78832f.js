/* Owner OS visual atmosphere. No profile, storage, network or bridge dependencies. */
(function () {
  'use strict';
  const W = 920, H = 700, FRAME = 1000 / 18;
  // One backing scale per document: cached scene layers and remounted canvases must agree.
  const BACKING_DPR = Math.min(window.devicePixelRatio || 1, 1.25);
  const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let scene = null, sceneFailed = false, active = null, requestedMotion = true;
  let raf = 0, last = 0, time = 1.3;
  const cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };

  function getScene() {
    if (scene || sceneFailed) return scene;
    try {
      scene = window.OwnerStarCore?.createCore({
        w: W, h: H, dpr: BACKING_DPR,
        params: {grains: 2400, seed: 8, spin: .24},
        // Fixed decorative rings: they encode no personal data or progress score.
        bands: [
          {id: 'outer-light', label: 'Light', n: 1, color: '#d6b77b', density: .56, rip: 17},
          {id: 'mid-light', label: 'Light', n: 1, color: '#b6a2e0', density: .46, rip: 23},
          {id: 'inner-light', label: 'Light', n: 1, color: '#91bec1', density: .42, rip: 13}
        ]
      });
    } catch (error) {
      sceneFailed = true;
      console.warn('Decorative star core unavailable; CSS atmosphere retained.', error);
    }
    return scene;
  }

  function paint() {
    if (!active?.canvas?.isConnected) return;
    const model = getScene(), ctx = active.canvas.getContext('2d');
    if (!model || !ctx) return;
    model.render(ctx, time);
  }

  function animate(now) {
    raf = 0;
    if (!active || document.hidden || !active.visible || !requestedMotion || reduced?.matches) return;
    if (!last || now - last >= FRAME) {
      time += Math.min(now - (last || now - FRAME), 150) / 1000 * .32;
      last = now;
      paint();
    }
    raf = requestAnimationFrame(animate);
  }

  function sync() {
    cancel();
    if (!active || document.hidden || !active.visible) return;
    paint();
    if (requestedMotion && !reduced?.matches) raf = requestAnimationFrame(animate);
  }

  function destroy() {
    cancel();
    active?.observer?.disconnect();
    active = null;
  }

  function mount(container, options = {}) {
    destroy();
    const canvas = container?.querySelector('[data-star-core]');
    if (!canvas || typeof canvas.getContext !== 'function') return () => {};
    requestedMotion = options.motion !== false;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.pointerEvents = 'none';
    canvas.width = Math.round(W * BACKING_DPR);
    canvas.height = Math.round(H * BACKING_DPR);
    active = {canvas, observer: null, visible: true};
    if (typeof IntersectionObserver === 'function') {
      active.observer = new IntersectionObserver(entries => {
        if (!active || active.canvas !== canvas) return;
        active.visible = entries.some(e => e.isIntersecting);
        sync();
      }, {threshold: .015});
      active.observer.observe(canvas);
    }
    sync();
    return () => { if (active?.canvas === canvas) destroy(); };
  }

  function setMotion(value) { requestedMotion = !!value; sync(); }
  document.addEventListener('visibilitychange', sync);
  reduced?.addEventListener?.('change', sync);
  window.addEventListener('pagehide', destroy);
  window.OwnerCosmos = {mount, setMotion, destroy};
})();
