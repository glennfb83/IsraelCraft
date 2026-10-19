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
    .citizen-metrics .rank-1{color:#8b6b19;font-weight:900}.citizen-metrics .rank-2{color:#686868;font-weight:800}.citizen-metrics .rank-3{color:#8a5832;font-weight:800}.citizen-metrics .rank-4{color:#4d6d88;font-weight:800}.citizen-metrics .rank-5{color:#4f6c4a;font-weight:800}
    .map-card{position:relative;overflow:hidden}
    #map-container{position:relative;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
    #map-container.is-dragging{cursor:grabbing}
    .map-image,.map-image-night{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;transform-origin:0 0;will-change:transform;transition:opacity .18s ease}
    #map-container .map-image-night{opacity:0;pointer-events:none;z-index:1}
    #map-container.is-night .map-image{opacity:0}
    #map-container.is-night .map-image-night{opacity:1}
    .waypoint-layer{position:absolute;inset:0;z-index:5;pointer-events:none;transform-origin:0 0}.waypoint-marker{position:absolute;width:34px;height:34px;border:3px solid #fff;border-radius:50% 5% 50% 50%;background:var(--blue);color:#fff;font:700 .72rem var(--pixel);display:grid;place-items:center;cursor:pointer;box-shadow:0 0 0 2px rgba(0,0,0,.3)}
    .waypoint-marker:hover{filter:brightness(1.08)}
    .waypoint-modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#16161699;padding:20px}.waypoint-dialog{width:min(390px,100%);background:var(--paper);border:2px solid var(--ink);box-shadow:8px 8px 0 #1b1b1b;padding:20px}.waypoint-dialog h3{margin:0 0 12px}.waypoint-form{display:grid;gap:12px}.waypoint-form input{width:100%;padding:10px 12px;border:2px solid var(--ink);background:#fff;color:var(--ink);font:1rem var(--sans)}.waypoint-actions{display:flex;justify-content:flex-end;gap:10px}.waypoint-button{padding:10px 14px;border:2px solid var(--ink);background:var(--blue);color:#fff;font:700 .75rem var(--pixel);cursor:pointer}.waypoint-button.secondary{background:#e8dfca;color:var(--ink)}
    .waypoint-hidden{display:none}.waypoint-info-modal{position:fixed;right:18px;bottom:18px;max-width:240px;z-index:101;background:#f5efe3;border:2px solid var(--ink);box-shadow:7px 7px 0 #202020;padding:12px 14px}.waypoint-info-modal h4{margin:0 0 8px}.waypoint-info-modal p{margin:0;color:var(--muted);font-size:.76rem}.waypoint-info-modal button{margin-top:10px}
    @media(max-width:900px){.hero-grid{grid-template-columns:1fr!important}.updates-panel{transform:none}}@media(max-width:620px){.citizen-metrics .stats-table{font-size:.72rem}.citizen-metrics .stats-table th,.citizen-metrics .stats-table td{padding:10px 8px}}
  `;
  document.head.appendChild(style);

  function addUpdatesPanel() {
    const heroGrid = document.querySelector('.hero-grid'); if (!heroGrid || document.querySelector('.updates-panel')) return;
    const panel = document.createElement('aside'); panel.className = 'updates-panel'; panel.setAttribute('aria-labelledby', 'updates-title');
    panel.innerHTML = `<div class="eyebrow">Civic bulletin</div><h2 id="updates-title">Official updates.</h2><p class="updates-intro">The latest changes made to the IsraelCraft website, straight from the repo.</p><div id="updates-list" class="updates-list"></div><div class="updates-status" id="updates-status">Loading update log…</div><button class="updates-refresh" id="updates-refresh" type="button">Refresh</button>`;
    heroGrid.appendChild(panel); const list = panel.querySelector('#updates-list'), status = panel.querySelector('#updates-status'), refresh = panel.querySelector('#updates-refresh');
    async function loadUpdates() { status.textContent = 'Loading update log…'; try { const response = await fetch('https://api.github.com/repos/glennfb83/IsraelCraft/commits?per_page=8',{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}); if (!response.ok) throw new Error('Request failed'); const commits = await response.json(); list.innerHTML = commits.map(commit => `<article class="update-item"><strong>${escapeHtml(commit.commit.message.split('\n')[0])}</strong><span class="update-meta">${escapeHtml(new Date(commit.commit.author.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}))} • ${escapeHtml(commit.author?.login || 'Contributor')}</span></article>`).join(''); status.textContent = `${commits.length} recent updates`; } catch (error) { list.innerHTML = '<article class="update-item"><strong>Update log unavailable.</strong><span class="update-meta">Please try again later.</span></article>'; status.textContent = 'Failed to load'; } }
    refresh.addEventListener('click', loadUpdates); loadUpdates();
  }

  function addCitizenMetrics() {
    const people = document.querySelector('#people'); if (!people || document.querySelector('#citizen-metrics')) return;
    people.insertAdjacentHTML('afterend', `<section id="citizen-metrics" class="citizen-metrics"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Civic analytics</div><h2>Citizen metrics</h2></div></div><table class="stats-table"><thead><tr><th>Rank</th><th>Citizen</th><th>Builds</th><th>Nether</th><th>Claims</th></tr></thead><tbody><tr><td class="rank-1">#1</td><td>Big P</td><td>23</td><td>7</td><td>12</td></tr><tr><td class="rank-2">#2</td><td>Glenn</td><td>20</td><td>6</td><td>10</td></tr><tr><td class="rank-3">#3</td><td>Max</td><td>18</td><td>5</td><td>9</td></tr><tr><td class="rank-4">#4</td><td>Leif</td><td>14</td><td>4</td><td>7</td></tr><tr><td class="rank-5">#5</td><td>Community</td><td>12</td><td>3</td><td>6</td></tr></tbody></table></div></section>`);
  }

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[character])); }

  function initMap() {
    const container = document.getElementById('map-container'), image = document.getElementById('map-image'), nightImage = document.getElementById('map-image-night');
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
    image.src = 'images/map.png'; if (nightImage) nightImage.src = 'images/nightmap.png';
    container.style.touchAction = 'none'; container.style.userSelect = 'none'; container.style.webkitUserSelect = 'none';
    const mapImages = [image, nightImage].filter(Boolean); let scale = 1, minScale = 1, x = 0, y = 0, dragStart = null, isNight = false; let keys = {}, zoomFrame = null, pendingDelta = 0, pendingPoint = null;
    const MAX_SCALE = 32, BUTTON_ZOOM_FACTOR = 1.2, WHEEL_SENSITIVITY = 0.0012, clamp = (value,min,max) => Math.max(min,Math.min(value,max));

    const waypointKey = 'israelcraft-map-waypoints'; let waypoints = []; let placingWaypoint = false; let pendingWaypoint = null;
    try { waypoints = JSON.parse(localStorage.getItem(waypointKey) || '[]'); if (!Array.isArray(waypoints)) waypoints = []; } catch (error) { waypoints = []; }
    const waypointLayer = document.createElement('div'); waypointLayer.className = 'waypoint-layer'; container.appendChild(waypointLayer);
    const waypointButton = document.createElement('button'); waypointButton.type = 'button'; waypointButton.id = 'waypoint-toggle'; waypointButton.setAttribute('aria-label','Place a waypoint'); waypointButton.setAttribute('aria-pressed','false'); waypointButton.title = 'Place a waypoint'; waypointButton.textContent = '⚑';
    if (controls && !document.getElementById('waypoint-toggle')) controls.appendChild(waypointButton);
    const modal = document.createElement('div'); modal.className = 'waypoint-modal waypoint-hidden'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.innerHTML = `<div class="waypoint-dialog"><h3>Place waypoint</h3><form class="waypoint-form"><label><span>Waypoint name</span><input id="waypoint-name" name="name" type="text" maxlength="32" placeholder="e.g. Spawn" autocomplete="off" required></label><div class="waypoint-actions"><button type="button" class="waypoint-button secondary" data-waypoint-cancel>Cancel</button><button type="submit" class="waypoint-button">Save waypoint</button></div></form></div>`;
    document.body.appendChild(modal);
    const form = modal.querySelector('form'), nameInput = modal.querySelector('#waypoint-name');
    const saveWaypoints = () => { try { localStorage.setItem(waypointKey, JSON.stringify(waypoints)); } catch (error) {} };
    const closeModal = () => { modal.classList.add('waypoint-hidden'); pendingWaypoint = null; placingWaypoint = false; waypointButton.removeAttribute('aria-pressed'); };
    modal.querySelector('[data-waypoint-cancel]').addEventListener('click', closeModal); modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    form.addEventListener('submit', event => { event.preventDefault(); const name = nameInput.value.trim(); if (!name || !pendingWaypoint) return; waypoints.push({id: Date.now().toString(36) + Math.random().toString(36).slice(2,8), name, x: pendingWaypoint.x, y: pendingWaypoint.y}); saveWaypoints(); renderWaypoints(); closeModal(); nameInput.value = ''; });
    const showWaypoint = waypoint => { const existing = document.querySelector('.waypoint-info-modal'); existing?.remove(); const info = document.createElement('div'); info.className = 'waypoint-info-modal'; info.innerHTML = `<h4>${escapeHtml(waypoint.name)}</h4><p>Waypoint saved at ${Math.round(waypoint.x)}, ${Math.round(waypoint.y)}</p><button class="waypoint-button secondary" type="button">Close</button>`; info.querySelector('button').addEventListener('click', () => info.remove()); document.body.appendChild(info); };
    const renderWaypoints = () => { waypointLayer.innerHTML = ''; waypoints.forEach(waypoint => { const marker = document.createElement('button'); marker.type = 'button'; marker.className = 'waypoint-marker'; marker.title = waypoint.name; marker.textContent = waypoint.name.charAt(0).toUpperCase(); marker.style.left = `${waypoint.x}px`; marker.style.top = `${waypoint.y}px`; marker.addEventListener('click', event => { event.stopPropagation(); showWaypoint(waypoint); }); waypointLayer.appendChild(marker); }); };
    waypointButton.addEventListener('click', () => { placingWaypoint = !placingWaypoint; waypointButton.setAttribute('aria-pressed', String(placingWaypoint)); container.style.cursor = placingWaypoint ? 'crosshair' : ''; if (!placingWaypoint) closeModal(); });

    function limitPosition() { const width = container.clientWidth, height = container.clientHeight, imageWidth = image.naturalWidth * scale, imageHeight = image.naturalHeight * scale; x = clamp(x, Math.min(0, width - imageWidth), Math.max(0, width - imageWidth)); y = clamp(y, Math.min(0, height - imageHeight), Math.max(0, height - imageHeight)); }
    function render() { limitPosition(); const transform = `translate3d(${x}px,${y}px,0) scale(${scale})`; mapImages.forEach(mapImage => { mapImage.style.transform = transform; }); waypointLayer.style.transform = transform; }
    function resetView() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const width = container.clientWidth, height = container.clientHeight, imageW = image.naturalWidth, imageH = image.naturalHeight;
      minScale = Math.min(width/imageW,height/imageH);
      const island = {x0:0.469,y0:0.445,x1:0.738,y1:0.985}, margin = 1.12;
      const islandW = (island.x1-island.x0)*imageW*margin, islandH = (island.y1-island.y0)*imageH*margin;
      scale = clamp(Math.min(width/islandW,height/islandH),minScale,MAX_SCALE);
      x = width/2-((island.x0+island.x1)/2)*imageW*scale;
      y = height/2-((island.y0+island.y1)/2)*imageH*scale;
      render();
    }
    function zoomAt(factor, centerX, centerY) { const nextScale = clamp(scale*factor,minScale,Math.max(minScale,MAX_SCALE)); if (nextScale === scale) return; const ratio = nextScale/scale; x = centerX - (centerX - x) * ratio; y = centerY - (centerY - y) * ratio; scale = nextScale; render(); }
    function applyWheelZoom() { zoomFrame = null; if (!pendingDelta || !pendingPoint) return; const delta = pendingDelta, point = pendingPoint; pendingDelta = 0; pendingPoint = null; zoomAt(Math.exp(-delta * WHEEL_SENSITIVITY), point.x, point.y); }
    container.addEventListener('wheel', event => { event.preventDefault(); const bounds = container.getBoundingClientRect(); pendingDelta = clamp(pendingDelta + (event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY), -140, 140); pendingPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; if (!zoomFrame) zoomFrame = requestAnimationFrame(applyWheelZoom); });
    function startDrag(event) { if (event.target.closest('button') || placingWaypoint) return; const point = event.touches?.[0] || event; container.setPointerCapture?.(event.pointerId || 1); dragStart = { x, y, pointerX: point.clientX, pointerY: point.clientY }; container.classList.add('is-dragging'); }
    container.addEventListener('pointerdown', event => startDrag(event)); container.addEventListener('touchstart', event => { if (event.touches.length !== 1 || placingWaypoint) return; const touch = event.touches[0]; startDrag(touch); }, { passive: true });
    container.addEventListener('click', event => { if (!placingWaypoint || event.target.closest('button')) return; const bounds = container.getBoundingClientRect(); const mapX = (event.clientX-bounds.left - x) / scale; const mapY = (event.clientY-bounds.top - y) / scale; if (mapX < 0 || mapY < 0 || mapX > image.naturalWidth || mapY > image.naturalHeight) return; pendingWaypoint = { x: mapX, y: mapY }; nameInput.value = ''; modal.classList.remove('waypoint-hidden'); nameInput.focus(); });
    container.addEventListener('pointermove', event => { if (!dragStart) return; x = dragStart.x + event.clientX - dragStart.pointerX; y = dragStart.y + event.clientY - dragStart.pointerY; render(); });
    container.addEventListener('pointerup', () => { dragStart = null; container.classList.remove('is-dragging'); });
    container.addEventListener('pointercancel', () => { dragStart = null; container.classList.remove('is-dragging'); });
    document.addEventListener('keydown', event => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); keys[event.key] = true; } });
    document.addEventListener('keyup', event => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) delete keys[event.key]; });
    function tick() { if (keys.ArrowUp) y += 16; if (keys.ArrowDown) y -= 16; if (keys.ArrowLeft) x += 16; if (keys.ArrowRight) x -= 16; if (Object.keys(keys).length) render(); requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAt(BUTTON_ZOOM_FACTOR,container.clientWidth/2,container.clientHeight/2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAt(1/BUTTON_ZOOM_FACTOR,container.clientWidth/2,container.clientHeight/2));
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
    image.addEventListener('load', resetView); if (nightImage) nightImage.addEventListener('load', resetView); window.addEventListener('resize', resetView); if (nightImage) nightImage.addEventListener('error', () => { nightImage.style.display='none'; modeToggle.disabled = true; });
    renderWaypoints(); resetView(); setNightMode(false);
  }
  function start() { addUpdatesPanel(); addCitizenMetrics(); initMap(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

