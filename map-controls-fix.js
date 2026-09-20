(() => {
  const container = document.getElementById('map-container');
  const image = document.getElementById('map-image');
  if (!container || !image) return;

  const pending = new WeakMap();
  const controls = ['zoom-in', 'zoom-out', 'reset-view']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function replay(button) {
    const count = pending.get(button) || 0;
    if (!count) return;
    pending.delete(button);
    for (let i = 0; i < count; i += 1) button.click();
  }

  controls.forEach(button => {
    button.addEventListener('click', event => {
      if (image.complete && image.naturalWidth && image.naturalHeight) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      pending.set(button, (pending.get(button) || 0) + 1);
    }, true);
  });

  image.addEventListener('load', () => {
    controls.forEach(replay);
  });

  // The map script assigns the PNG source after initialization. If it has
  // already completed by the time this file runs, replay immediately.
  if (image.complete && image.naturalWidth && image.naturalHeight) {
    controls.forEach(replay);
  }
})();
