(() => {
  function initMap() {
    const container = document.getElementById('map-container');
    const image = document.getElementById('map-image');
    const nightImage = document.getElementById('map-image-night');
    const modeToggle = document.getElementById('mode-toggle');
    if (!container || !image) return;

    container.style.touchAction = 'none';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';

    const mapImages = [image, nightImage].filter(Boolean);
    let scale = 1;
    let minScale = 1;
    let x = 0;
    let y = 0;
    let dragStart = null;
    let isNight = false;
    let wheelFrame = null;
    let wheelDelta = 0;
    let wheelPoint = null;
    const keys = {};
    const MAX_SCALE = 32;
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    function limitPosition() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const imageWidth = image.naturalWidth * scale;
      const imageHeight = image.naturalHeight * scale;
      x = clamp(x, Math.min(0, width - imageWidth), Math.max(0, width - imageWidth));
      y = clamp(y, Math.min(0, height - imageHeight), Math.max(0, height - imageHeight));
    }

    function render() {
      limitPosition();
      const transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      mapImages.forEach(mapImage => { mapImage.style.transform = transform; });
    }

    function resetView() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      minScale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      scale = minScale;
      x = (width - image.naturalWidth * scale) / 2;
      y = (height - image.naturalHeight * scale) / 2;
      render();
    }

    function zoomAt(factor, centerX, centerY) {
      const nextScale = clamp(scale * factor, minScale, Math.max(minScale, MAX_SCALE));
      if (nextScale === scale) return;
      const ratio = nextScale / scale;
      x = centerX - (centerX - x) * ratio;
      y = centerY - (centerY - y) * ratio;
      scale = nextScale;
      render();
    }

    function applyWheelZoom() {
      wheelFrame = null;
      if (!wheelDelta || !wheelPoint) return;
      const delta = wheelDelta;
      const point = wheelPoint;
      wheelDelta = 0;
      wheelPoint = null;
      zoomAt(Math.exp(-delta * 0.0012), point.x, point.y);
    }

    container.addEventListener('wheel', event => {
      event.preventDefault();
      const bounds = container.getBoundingClientRect();
      wheelDelta = clamp(wheelDelta + (event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY), -240, 240);
      wheelPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (wheelFrame === null) wheelFrame = requestAnimationFrame(applyWheelZoom);
    }, { passive: false });

    function startDrag(event) {
      if (event.target.closest('button')) return;
      dragStart = { pointerX: event.clientX, pointerY: event.clientY, x, y };
      container.classList.add('is-dragging');
      if (event.pointerId !== undefined) container.setPointerCapture?.(event.pointerId);
    }

    function moveDrag(event) {
      if (!dragStart) return;
      x = dragStart.x + event.clientX - dragStart.pointerX;
      y = dragStart.y + event.clientY - dragStart.pointerY;
      render();
    }

    function stopDrag() {
      dragStart = null;
      container.classList.remove('is-dragging');
    }

    container.addEventListener('pointerdown', startDrag);
    container.addEventListener('pointermove', moveDrag);
    container.addEventListener('pointerup', stopDrag);
    container.addEventListener('pointercancel', stopDrag);
    container.addEventListener('pointerleave', event => { if (event.buttons === 0) stopDrag(); });

    document.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      keys[event.key] = true;
    });
    document.addEventListener('keyup', event => { keys[event.key] = false; });
    setInterval(() => {
      const speed = 30;
      if (keys.ArrowUp) y += speed;
      if (keys.ArrowDown) y -= speed;
      if (keys.ArrowLeft) x += speed;
      if (keys.ArrowRight) x -= speed;
      if (Object.values(keys).some(Boolean)) render();
    }, 16);

    image.addEventListener('load', resetView);
    window.addEventListener('resize', resetView);
    if (image.complete) resetView();

    if (nightImage) {
      nightImage.addEventListener('error', () => {
        nightImage.style.display = 'none';
        if (modeToggle) {
          modeToggle.disabled = true;
          modeToggle.title = 'Night map unavailable';
        }
      });
    }

    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAt(1.2, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAt(1 / 1.2, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('reset-view')?.addEventListener('click', resetView);
    modeToggle?.addEventListener('click', () => {
      isNight = !isNight;
      container.classList.toggle('is-night', isNight);
      modeToggle.setAttribute('aria-pressed', String(isNight));
      modeToggle.setAttribute('aria-label', isNight ? 'Switch to day map' : 'Switch to night map');
      const label = modeToggle.querySelector('span');
      if (label) label.textContent = isNight ? 'Day' : 'Night';
      if (nightImage) nightImage.setAttribute('aria-hidden', String(!isNight));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMap);
  else initMap();
})();
