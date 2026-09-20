(() => {
  const style = document.createElement('style');
  style.textContent = `
    .hero-grid{grid-template-columns:1.15fr .85fr!important}
    .updates-panel{background:#ded5bd;border:2px solid var(--ink);box-shadow:8px 8px 0 #252525;padding:22px;transform:rotate(1deg);min-width:0}
    .updates-panel h2{margin:4px 0 8px;font-size:clamp(1.8rem,3vw,2.8rem);line-height:.95;letter-spacing:-.05em}
    .updates-intro{margin:0 0 16px;color:#504a3e;font-size:.9rem}
    .updates-list{display:grid;gap:10px;max-height:330px;overflow:auto;padding-right:4px}
    .update-item{background:#f7f2e5;border:1px solid var(--line);padding:12px}
    .update-item strong{display:block;font-size:.9rem;line-height:1.2}
    .update-meta{display:block;margin-top:6px;color:var(--muted);font:700 .65rem var(--pixel);text-transform:uppercase}
    .updates-status{color:var(--muted);font:700 .68rem var(--pixel)}
    .updates-refresh{margin-top:12px;padding:7px 10px;background:var(--blue);color:#fff;border:2px solid var(--ink);font:700 .7rem var(--pixel);cursor:pointer}
    .updates-refresh:hover{background:var(--blue2)}
    .join-box .btn:not(.primary){background:#f1ecdf!important;color:#111!important}
    .classified{font-size:.58rem;line-height:1;white-space:nowrap}
    .citizen-metrics{scroll-margin-top:80px}
    .citizen-metrics .stats-table{width:100%;border-collapse:collapse;background:var(--card);font:0.85rem var(--pixel)}
    .citizen-metrics .stats-table th,.citizen-metrics .stats-table td{border:1px solid var(--line);padding:14px;text-align:center}
    .citizen-metrics .stats-table th{background:#1b1b1b;color:#f4efdf;font-weight:900}
    .citizen-metrics .stats-table td:first-child,.citizen-metrics .stats-table th:first-child{text-align:left}
    .citizen-metrics .rank-1{color:#8b6b19;font-weight:900}
    .citizen-metrics .rank-2{color:#686868;font-weight:800}
    .citizen-metrics .rank-3{color:#8a5832;font-weight:800}
    .citizen-metrics .rank-4{color:#5b5548;font-weight:800}
    #map-container .map-image-night{opacity:0;pointer-events:none}
    #map-container.is-night .map-image{opacity:0}
    #map-container.is-night .map-image-night{opacity:1}
    @media(max-width:900px){.hero-grid{grid-template-columns:1fr!important}.updates-panel{transform:none}}
    @media(max-width:620px){.citizen-metrics .stats-table{font-size:.72rem}.citizen-metrics .stats-table th,.citizen-metrics .stats-table td{padding:10px}}
  `;
  document.head.appendChild(style);

  function addUpdatesPanel() {
    const heroGrid = document.querySelector('.hero-grid');
    if (!heroGrid || document.querySelector('.updates-panel')) return;
    const panel = document.createElement('aside');
    panel.className = 'updates-panel';
    panel.setAttribute('aria-labelledby', 'updates-title');
    panel.innerHTML = `
      <div class="eyebrow">Civic bulletin</div>
      <h2 id="updates-title">Official updates.</h2>
      <p class="updates-intro">The latest changes made to the IsraelCraft website, straight from the repository.</p>
      <div class="updates-status" id="updates-status">Loading update log…</div>
      <div class="updates-list" id="updates-list"></div>
      <button class="updates-refresh" id="updates-refresh" type="button">REFRESH UPDATE LOG</button>
    `;
    heroGrid.appendChild(panel);

    const list = panel.querySelector('#updates-list');
    const status = panel.querySelector('#updates-status');
    const refresh = panel.querySelector('#updates-refresh');
    const endpoint = 'https://api.github.com/repos/glennfb83/IsraelCraft/commits?per_page=8';

    async function loadUpdates() {
      status.textContent = 'Loading update log…';
      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/vnd.github+json' } });
        if (!response.ok) throw new Error('GitHub API returned ' + response.status);
        const commits = await response.json();
        list.innerHTML = commits.map(commit => {
          const message = (commit.commit && commit.commit.message ? commit.commit.message.split('\n')[0] : 'Website update');
          const author = commit.author?.login || commit.commit.author?.name || 'Unknown editor';
          const rawDate = commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString();
          const date = new Date(rawDate).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
          return `<article class="update-item"><strong>${escapeHtml(message)}</strong><span class="update-meta">${escapeHtml(author)} • ${date}</span></article>`;
        }).join('');
        status.textContent = `${commits.length} latest website updates`;
      } catch (error) {
        status.textContent = 'Update log temporarily unavailable.';
        list.innerHTML = '<article class="update-item"><strong>Check the repository history for the latest changes.</strong><span class="update-meta">GitHub connection unavailable</span></article>';
      }
    }

    refresh.addEventListener('click', loadUpdates);
    loadUpdates();
  }

  function addCitizenMetrics() {
    const people = document.querySelector('#people');
    if (!people || document.querySelector('#citizen-metrics')) return;
    people.insertAdjacentHTML('afterend', `
      <section id="citizen-metrics" class="citizen-metrics">
        <div class="wrap">
          <div class="section-head">
            <div><div class="eyebrow">Civic analytics</div><h2>Citizen performance<br>metrics.</h2></div>
            <p>Comparative statistics across all citizens, ranked by category. Rankings are unofficial and disputed by at least one party at any given time.</p>
          </div>
          <table class="stats-table">
            <thead><tr><th>Metric</th><th>1st</th><th>2nd</th><th>3rd</th><th>4th</th></tr></thead>
            <tbody>
              <tr><td><strong>Morality Level</strong></td><td class="rank-1">Leif</td><td class="rank-2">Glenn</td><td class="rank-3">Pierson</td><td class="rank-4">Max</td></tr>
              <tr><td><strong>Wealth Level</strong></td><td class="rank-1">Pierson</td><td class="rank-2">Glenn</td><td class="rank-3">Max</td><td class="rank-4">Leif</td></tr>
              <tr><td><strong>Land Size</strong></td><td class="rank-1">Max</td><td class="rank-2">Glenn</td><td class="rank-3">Pierson</td><td class="rank-4">Leif</td></tr>
              <tr><td><strong>Development Level</strong></td><td class="rank-1">Pierson</td><td class="rank-2">Glenn</td><td class="rank-3">Max</td><td class="rank-4">Leif</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  }

  function initMap() {
    const container = document.getElementById('map-container');
    const image = document.getElementById('map-image');
    const nightImage = document.getElementById('map-image-night');
    const modeToggle = document.getElementById('mode-toggle');
    if (!container || !image || !modeToggle) return;

    // Set both image URLs explicitly so the standalone viewer and homepage use the PNG assets.
    image.src = 'images/map.png';
    if (nightImage) nightImage.src = 'images/nightmap.png';

    container.style.touchAction = 'none';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';

    const mapImages = [image, nightImage].filter(Boolean);
    let scale = 1, minScale = 1, x = 0, y = 0, dragStart = null, isNight = false;
    let keys = {}, zoomFrame = null, pendingDelta = 0, pendingPoint = null;
    const MAX_SCALE = 32, BUTTON_ZOOM_FACTOR = 1.2, WHEEL_SENSITIVITY = 0.0012;
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    function limitPosition() {
      const width = container.clientWidth, height = container.clientHeight;
      const imageWidth = image.naturalWidth * scale, imageHeight = image.naturalHeight * scale;
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
      const width = container.clientWidth, height = container.clientHeight;
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
      zoomFrame = null;
      if (!pendingDelta || !pendingPoint) return;
      const delta = pendingDelta, point = pendingPoint;
      pendingDelta = 0; pendingPoint = null;
      zoomAt(Math.exp(-delta * WHEEL_SENSITIVITY), point.x, point.y);
    }

    container.addEventListener('wheel', event => {
      event.preventDefault();
      const bounds = container.getBoundingClientRect();
      pendingDelta = clamp(pendingDelta + (event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY), -240, 240);
      pendingPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (zoomFrame === null) zoomFrame = requestAnimationFrame(applyWheelZoom);
    }, { passive: false });

    function startDrag(event) {
      if (event.target.closest('button')) return;
      const point = event.touches && event.touches[0] ? event.touches[0] : event;
      container.setPointerCapture?.(event.pointerId || 1);
      dragStart = { pointerX: point.clientX, pointerY: point.clientY, x, y };
      container.classList.add('is-dragging');
    }

    container.addEventListener('pointerdown', event => { startDrag(event); });
    container.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      dragStart = { pointerX: touch.clientX, pointerY: touch.clientY, x, y };
      container.classList.add('is-dragging');
      event.preventDefault();
    }, { passive: false });

    container.addEventListener('pointermove', event => {
      if (!dragStart) return;
      x = dragStart.x + event.clientX - dragStart.pointerX;
      y = dragStart.y + event.clientY - dragStart.pointerY;
      render();
    });
    container.addEventListener('touchmove', event => {
      if (!dragStart || event.touches.length !== 1) return;
      const touch = event.touches[0];
      x = dragStart.x + touch.clientX - dragStart.pointerX;
      y = dragStart.y + touch.clientY - dragStart.pointerY;
      render();
      event.preventDefault();
    }, { passive: false });

    const stopDragging = () => { dragStart = null; container.classList.remove('is-dragging'); };
    container.addEventListener('pointerup', stopDragging);
    container.addEventListener('pointercancel', stopDragging);
    container.addEventListener('touchend', stopDragging, { passive: false });
    container.addEventListener('touchcancel', stopDragging, { passive: false });

    document.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); keys[event.key] = true; }
    });
    document.addEventListener('keyup', event => { if (keys[event.key]) keys[event.key] = false; });
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
    if (nightImage) nightImage.addEventListener('error', () => {
      nightImage.style.display = 'none'; modeToggle.disabled = true; modeToggle.title = 'Night map unavailable';
    });

    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAt(BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAt(1 / BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('reset-view')?.addEventListener('click', resetView);
    modeToggle.addEventListener('click', () => {
      isNight = !isNight;
      container.classList.toggle('is-night', isNight);
      modeToggle.setAttribute('aria-pressed', String(isNight));
      modeToggle.setAttribute('aria-label', isNight ? 'Switch to day map' : 'Switch to night map');
      const label = modeToggle.querySelector('span');
      if (label) label.textContent = isNight ? 'Day' : 'Night';
      if (modeToggle.firstChild) modeToggle.firstChild.textContent = isNight ? '☀ ' : '☾ ';
      if (nightImage) nightImage.setAttribute('aria-hidden', String(!isNight));
    });
    resetView();
  }

  function start() {
    addUpdatesPanel();
    addCitizenMetrics();
    initMap();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
