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
    .citizen-metrics{scroll-margin-top:80px;padding-top:20px}
    .citizen-metrics .stats-table{width:100%;border-collapse:collapse;background:var(--card);font:0.85rem var(--pixel)}
    .citizen-metrics .stats-table th,.citizen-metrics .stats-table td{border:1px solid var(--line);padding:14px;text-align:center}
    .citizen-metrics .stats-table th{background:#1b1b1b;color:#f4efdf;font-weight:900}
    .citizen-metrics .stats-table td:first-child,.citizen-metrics .stats-table th:first-child{text-align:left}
    .citizen-metrics .rank-1{color:#8b6b19;font-weight:900}.citizen-metrics .rank-2{color:#686868;font-weight:800}.citizen-metrics .rank-3{color:#8a5832;font-weight:800}.citizen-metrics .rank-4{color:#5f694d;font-weight:700}
    .map-card{position:relative;overflow:hidden}
    #map-container{position:relative;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
    #map-container.is-dragging{cursor:grabbing}
    .map-image,.map-image-night{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;transform-origin:0 0;will-change:transform;transition:opacity .18s ease}
    #map-container .map-image-night{opacity:0;pointer-events:none;z-index:1}
    #map-container.is-night .map-image{opacity:0}
    #map-container.is-night .map-image-night{opacity:1}
    .waypoint-layer{position:absolute;inset:0;z-index:5;pointer-events:none;transform-origin:0 0}.waypoint-marker{position:absolute;width:34px;height:34px;border:3px solid #fff;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font:900 .72rem var(--pixel);box-shadow:0 0 0 2px rgba(0,0,0,.35);transform:translate(-50%,-100%) rotate(-45deg);cursor:pointer;transition:filter .12s ease}.waypoint-marker:hover{filter:brightness(1.08)}
    .waypoint-modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#16161699;padding:20px}.waypoint-dialog{width:min(390px,100%);background:var(--paper);border:2px solid var(--ink);box-shadow:8px 8px 0 #161616;padding:20px}.waypoint-dialog h3{margin:0 0 12px;font-size:1.25rem}.waypoint-dialog textarea{width:100%;height:110px;resize:vertical;padding:10px;border:2px solid var(--line);background:#fff8ea}.waypoint-dialog .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}.waypoint-dialog button{padding:9px 12px;border:2px solid var(--ink);font:700 .7rem var(--pixel);cursor:pointer}.waypoint-dialog .primary{background:var(--blue);color:#fff}.waypoint-dialog .secondary{background:#efe8d6}
    @media(max-width:900px){.hero-grid{grid-template-columns:1fr!important}.updates-panel{transform:none}}@media(max-width:620px){.citizen-metrics .stats-table{font-size:.72rem}.citizen-metrics .stats-table th,.citizen-metrics .stats-table td{padding:10px 8px}}
  `;
  document.head.appendChild(style);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'
    }[character]));
  }

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

    async function loadUpdates() {
      status.textContent = 'Loading update log…';
      try {
        const response = await fetch('https://api.github.com/repos/glennfb83/IsraelCraft/commits?per_page=8', {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (!response.ok) throw new Error();
        const commits = await response.json();
        list.innerHTML = commits.map(commit => {
          const message = commit.commit?.message?.split('\n')[0] || 'Website update';
          const author = commit.author?.login || commit.commit.author?.name || 'Unknown editor';
          const rawDate = commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString();
          const date = new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          return `
            <article class="update-item">
              <strong>${escapeHtml(message)}</strong>
              <span class="update-meta">${escapeHtml(author)} • ${date}</span>
            </article>
          `;
        }).join('');
        status.textContent = `${commits.length} latest website updates`;
      } catch (error) {
        status.textContent = 'Update log temporarily unavailable.';
        list.innerHTML = `
          <article class="update-item">
            <strong>Check the repository history for the latest changes.</strong>
            <span class="update-meta">GitHub connection unavailable</span>
          </article>
        `;
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
            <div>
              <div class="eyebrow">Civic analytics</div>
              <h2>Citizen metrics.</h2>
            </div>
            <p>Historical player standings restored to the last known civic ledger.</p>
          </div>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Morality</th>
                <th>Wealth</th>
                <th>Development</th>
                <th>Land Size</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="rank-1">Glenn 1st</td>
                <td class="rank-1">Pierson 1st</td>
                <td class="rank-1">Pierson 1st</td>
                <td class="rank-1">Pierson 1st</td>
              </tr>
              <tr>
                <td class="rank-2">Pierson 2nd</td>
                <td class="rank-2">Max 2nd</td>
                <td class="rank-2">Glenn 2nd</td>
                <td class="rank-2">Max 2nd</td>
              </tr>
              <tr>
                <td class="rank-3">Max 3rd</td>
                <td class="rank-3">Glenn 3rd</td>
                <td class="rank-3">Max 3rd</td>
                <td class="rank-3">Glenn 3rd</td>
              </tr>
              <tr>
                <td class="rank-4">Leif 4th</td>
                <td class="rank-4">Leif 4th</td>
                <td class="rank-4">Leif 4th</td>
                <td class="rank-4">Leif 4th</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `);
  }

  function initMap() {
    const container = document.getElementById('map-container');
    const image = document.getElementById('map-image');
    const nightImage = document.getElementById('map-image-night');
    if (!container || !image) return;

    const controls = document.querySelector('.map-controls');
    let modeToggle = document.getElementById('mode-toggle');
    if (!modeToggle && controls) {
      modeToggle = document.createElement('button');
      modeToggle.type = 'button';
      modeToggle.id = 'mode-toggle';
      modeToggle.className = 'mode-toggle';
      modeToggle.setAttribute('aria-label', 'Enable nighttime map');
      modeToggle.setAttribute('aria-pressed', 'false');
      modeToggle.title = 'Enable nighttime map';
      modeToggle.textContent = '🌙 Night';
      controls.appendChild(modeToggle);
    }
    if (!modeToggle) return;

    image.src = 'images/map.png';
    if (nightImage) nightImage.src = 'images/nightmap.png';

    container.style.touchAction = 'none';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';

    const mapImages = [image, nightImage].filter(Boolean);
    let scale = 1, minScale = 1, x = 0, y = 0, dragStart = null, isNight = false;
    let keys = {}, zoomFrame = null, pendingDelta = 0, pendingPoint = null;
    const MAX_SCALE = 128, BUTTON_ZOOM_FACTOR = 1.2, WHEEL_SENSITIVITY = 0.0012;
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
      mapImages.forEach(mapImage => {
        mapImage.style.transform = transform;
      });
    }

    function resetView() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const imageW = image.naturalWidth;
      const imageH = image.naturalHeight;
      const fitScale = Math.min(width / imageW, height / imageH);
      minScale = Math.max(fitScale, 0.35);
      scale = clamp(Math.max(fitScale * 2.1, 1.35), minScale, MAX_SCALE);
      x = width / 2 - (imageW * scale) / 2;
      y = height / 2 - (imageH * scale) / 2;
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
      const delta = pendingDelta;
      const point = pendingPoint;
      pendingDelta = 0;
      pendingPoint = null;
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
      const point = event.touches?.[0] || event;
      container.setPointerCapture?.(event.pointerId || 1);
      dragStart = { x, y, pointerX: point.clientX, pointerY: point.clientY };
      container.classList.add('is-dragging');
    }

    container.addEventListener('pointerdown', event => startDrag(event));
    container.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      startDrag({ touches: [touch], target: event.target, pointerId: 1 });
    });

    container.addEventListener('pointermove', event => {
      if (!dragStart) return;
      x = dragStart.x + event.clientX - dragStart.pointerX;
      y = dragStart.y + event.clientY - dragStart.pointerY;
      render();
    });

    container.addEventListener('pointerup', () => {
      dragStart = null;
      container.classList.remove('is-dragging');
    });
    container.addEventListener('pointercancel', () => {
      dragStart = null;
      container.classList.remove('is-dragging');
    });

    document.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        keys[event.key] = true;
      }
    });
    document.addEventListener('keyup', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) delete keys[event.key];
    });

    function tick() {
      if (keys.ArrowUp) y += 16;
      if (keys.ArrowDown) y -= 16;
      if (keys.ArrowLeft) x += 16;
      if (keys.ArrowRight) x -= 16;
      if (Object.keys(keys).length) render();
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAt(BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAt(1 / BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('reset-view')?.addEventListener('click', resetView);

    const setNightMode = value => {
      isNight = Boolean(value);
      container.classList.toggle('is-night', isNight);
      if (nightImage) {
        nightImage.style.opacity = isNight ? '1' : '0';
        nightImage.style.pointerEvents = isNight ? 'auto' : 'none';
      }
      if (modeToggle) {
        modeToggle.classList.toggle('is-night', isNight);
        modeToggle.setAttribute('aria-pressed', String(isNight));
        const label = isNight ? 'Switch to daytime map' : 'Switch to nighttime map';
        modeToggle.setAttribute('aria-label', label);
        modeToggle.title = label;
      }
    };

    modeToggle.addEventListener('click', () => setNightMode(!isNight));
    image.addEventListener('load', resetView);
    if (nightImage) nightImage.addEventListener('load', resetView);
    window.addEventListener('resize', resetView);
    render();
    resetView();
    setNightMode(false);
  }

  function start() {
    addUpdatesPanel();
    addCitizenMetrics();
    initMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
