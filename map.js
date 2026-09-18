(() => {
  const root = document.documentElement;
  const oldColors = {
    '--ink': '#161616', '--paper': '#f2ecd9', '--blue': '#1d4e89',
    '--blue2': '#356fba', '--red': '#b53c35', '--muted': '#6f6859',
    '--line': '#bdb39a', '--card': '#f7f2e5'
  };
  Object.entries(oldColors).forEach(([name, value]) => root.style.setProperty(name, value));

  function restoreHomepage() {
    document.querySelectorAll('.updates-panel, #updates-panel, [data-updates-panel]').forEach(node => node.remove());
    document.querySelectorAll('a[href="map.html"], a[href="./map.html"]').forEach(link => {
      if (/open map/i.test(link.textContent || '')) link.remove();
    });

    const heroGrid = document.querySelector('.hero-grid');
    if (heroGrid) {
      heroGrid.style.display = 'grid';
      heroGrid.style.gridTemplateColumns = '1fr';
      heroGrid.style.gap = '34px';
    }

    const ticker = document.querySelector('.ticker-track');
    if (ticker) {
      ticker.style.display = 'inline-block';
      ticker.style.whiteSpace = 'nowrap';
      ticker.style.animation = 'israelcraft-news-scroll 34s linear infinite';
    }

    if (!document.getElementById('israelcraft-repair-style')) {
      const style = document.createElement('style');
      style.id = 'israelcraft-repair-style';
      style.textContent = `
        @keyframes israelcraft-news-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker { overflow:hidden; white-space:nowrap; }
        .ticker-track { display:inline-block; animation:israelcraft-news-scroll 34s linear infinite; }
        .map-card { padding:22px; background:#11151d; border:2px solid var(--ink); box-shadow:8px 8px 0 rgba(29,78,137,.35); }
        .map-card-header { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:18px; flex-wrap:wrap; }
        .map-card h2 { margin:5px 0 0; color:#f4efdf; font-size:clamp(1.7rem,4vw,3rem); }
        .map-controls { display:flex; gap:7px; flex-wrap:wrap; }
        .map-controls button { min-width:42px; height:42px; border:2px solid #e8dcc2; background:var(--blue); color:#fff; font:bold 1.35rem var(--pixel); cursor:pointer; }
        #map-container { position:relative; width:100%; height:min(70vh,680px); min-height:360px; overflow:hidden; background:#070b12; border:2px solid rgba(255,255,255,.3); cursor:grab; touch-action:none; }
        #map-container.is-dragging { cursor:grabbing; }
        .map-image { position:absolute; top:0; left:0; display:block; max-width:none; transform-origin:0 0; pointer-events:none; user-select:none; }
        .map-image-night { opacity:0; }
        #map-container.is-night .map-image { opacity:0; }
        #map-container.is-night .map-image-night { opacity:1; }
        .map-help { margin:12px 0 0; color:#d5cab0; font:.73rem var(--pixel); }
        @media(max-width:900px) { .hero-grid { grid-template-columns:1fr !important; } }
      `;
      document.head.appendChild(style);
    }
  }

  function initMap() {
    const container = document.getElementById('map-container');
    const image = document.getElementById('map-image');
    const nightImage = document.getElementById('map-image-night');
    if (!container || !image) return;

    const images = [image, nightImage].filter(Boolean);
    let scale = 1, minScale = 1, x = 0, y = 0, drag = null, night = false;
    const keys = {};
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function render() {
      const width = container.clientWidth, height = container.clientHeight;
      const imageWidth = image.naturalWidth * scale, imageHeight = image.naturalHeight * scale;
      x = clamp(x, Math.min(0, width - imageWidth), Math.max(0, width - imageWidth));
      y = clamp(y, Math.min(0, height - imageHeight), Math.max(0, height - imageHeight));
      const transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      images.forEach(item => { item.style.transform = transform; });
    }

    function reset() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const width = container.clientWidth, height = container.clientHeight;
      minScale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      scale = minScale;
      x = (width - image.naturalWidth * scale) / 2;
      y = (height - image.naturalHeight * scale) / 2;
      render();
    }

    function zoom(factor, cx, cy) {
      const next = clamp(scale * factor, minScale, Math.max(minScale, 32));
      if (next === scale) return;
      const ratio = next / scale;
      x = cx - (cx - x) * ratio;
      y = cy - (cy - y) * ratio;
      scale = next;
      render();
    }

    container.addEventListener('wheel', event => {
      event.preventDefault();
      const bounds = container.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * .0012), event.clientX - bounds.left, event.clientY - bounds.top);
    }, { passive:false });
    container.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      drag = { x:event.clientX, y:event.clientY, left:x, top:y };
      container.classList.add('is-dragging');
      container.setPointerCapture?.(event.pointerId);
    });
    container.addEventListener('pointermove', event => {
      if (!drag) return;
      x = drag.left + event.clientX - drag.x;
      y = drag.top + event.clientY - drag.y;
      render();
    });
    ['pointerup','pointercancel','pointerleave'].forEach(type => container.addEventListener(type, () => {
      if (type !== 'pointerleave' || !drag) { drag = null; container.classList.remove('is-dragging'); }
    }));

    document.addEventListener('keydown', event => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); keys[event.key] = true; }
    });
    document.addEventListener('keyup', event => { keys[event.key] = false; });
    setInterval(() => {
      if (keys.ArrowUp) y += 30;
      if (keys.ArrowDown) y -= 30;
      if (keys.ArrowLeft) x += 30;
      if (keys.ArrowRight) x -= 30;
      if (Object.values(keys).some(Boolean)) render();
    }, 16);

    image.addEventListener('load', reset);
    window.addEventListener('resize', reset);
    if (image.complete) reset();
    document.getElementById('zoom-in')?.addEventListener('click', () => zoom(1.2, container.clientWidth/2, container.clientHeight/2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoom(1/1.2, container.clientWidth/2, container.clientHeight/2));
    document.getElementById('reset-view')?.addEventListener('click', reset);
    document.getElementById('mode-toggle')?.addEventListener('click', event => {
      night = !night;
      container.classList.toggle('is-night', night);
      event.currentTarget.setAttribute('aria-pressed', String(night));
      const label = event.currentTarget.querySelector('span');
      if (label) label.textContent = night ? 'Day' : 'Night';
      if (nightImage) nightImage.setAttribute('aria-hidden', String(!night));
    });
  }

  function start() {
    restoreHomepage();
    initMap();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
