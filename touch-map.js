(() => {
  const container = document.getElementById('map-container');
  if (!container) return;

  // Keep browser scrolling/zooming from competing with one-finger map panning.
  container.style.touchAction = 'none';
  container.style.webkitUserSelect = 'none';
  container.style.userSelect = 'none';

  // The map already uses pointer events. This fallback covers older mobile
  // browsers that expose touch events without reliable pointer capture.
  let touchStart = null;
  let activeTouch = false;

  container.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button')) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
    activeTouch = true;
    event.preventDefault();
  }, { passive: false });

  container.addEventListener('touchmove', event => {
    if (!activeTouch || event.touches.length !== 1) return;
    // Re-dispatch as pointer movement so the existing map pan implementation
    // remains the single source of truth for position limits and rendering.
    const touch = event.touches[0];
    container.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      pointerId: 1,
      pointerType: 'touch',
      clientX: touch.clientX,
      clientY: touch.clientY
    }));
    event.preventDefault();
  }, { passive: false });

  const stopTouch = event => {
    if (!activeTouch) return;
    activeTouch = false;
    touchStart = null;
    event.preventDefault();
  };

  container.addEventListener('touchend', stopTouch, { passive: false });
  container.addEventListener('touchcancel', stopTouch, { passive: false });
})();
