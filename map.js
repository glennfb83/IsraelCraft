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
    .citizen-metrics .rank-1{color:#8b6b19;font-weight:900}.citizen-metrics .rank-2{color:#686868;font-weight:800}.citizen-metrics .rank-3{color:#8a5832;font-weight:800}.citizen-metrics .rank-4{color:#5a7f6b;font-weight:800}
    #map-container .map-image-night{opacity:0;pointer-events:none}#map-container.is-night .map-image{opacity:0}#map-container.is-night .map-image-night{opacity:1}
    .waypoint-layer{position:absolute;inset:0;z-index:5;pointer-events:none;transform-origin:0 0}
    .waypoint-marker{
      position:absolute;width:34px;height:34px;border:3px solid #fff;border-radius:50% 50% 50% 0;background:#3c7dd1;color:#fff;
      font-weight:900;pointer-events:auto;cursor:pointer;display:grid;place-items:center;box-shadow:2px 2px 0 rgba(17,17,17,.9),0 0 0 2px rgba(17,17,17,.4);
      transform:translate(-50%,-100%) rotate(-45deg);transform-origin:50% 100%;user-select:none;line-height:1
    }
    .waypoint-marker > span{display:block;transform:rotate(45deg);font-size:12px;line-height:1;text-shadow:1px 1px 0 #111}
    .waypoint-marker:focus-visible{outline:2px solid #fff;outline-offset:2px}
    .waypoint-modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:#16161699;padding:20px}.waypoint-dialog{width:min(390px,100%);background:var(--paper);border:2px solid var(--ink);box-shadow:8px 8px 0 #111;padding:18px 18px 14px}.waypoint-dialog h3{margin:0 0 10px;font-size:1.4rem}.waypoint-fields{display:grid;gap:10px}.waypoint-fields input{width:100%;padding:10px 12px;border:2px solid var(--ink);font:inherit;background:#fff}.waypoint-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.waypoint-actions button{padding:9px 12px;border:2px solid var(--ink);background:#f0ebdf;cursor:pointer;font:700 .7rem var(--pixel);text-transform:uppercase}.waypoint-actions .primary{background:var(--blue);color:#fff}.waypoint-hidden{display:none}
    @media(max-width:900px){.hero-grid{grid-template-columns:1fr!important}.updates-panel{transform:none}}@media(max-width:620px){.citizen-metrics .stats-table{font-size:.72rem}.citizen-metrics .stats-table th,.citizen-metrics .stats-table td{padding:10px 8px}.waypoint-dialog{padding:16px}}`;
  document.head.appendChild(style);

  function addUpdatesPanel() {
    const heroGrid = document.querySelector('.hero-grid'); if (!heroGrid || document.querySelector('.updates-panel')) return;
    const panel = document.createElement('aside'); panel.className = 'updates-panel'; panel.setAttribute('aria-labelledby', 'updates-title');
    panel.innerHTML = `<div class="eyebrow">Civic bulletin</div><h2 id="updates-title">Official updates.</h2><p class="updates-intro">The latest changes made to the IsraelCraft website, straight from the repository.</p><div id="updates-list" class="updates-list" aria-live="polite"></div><div class="updates-status" id="updates-status">Loading update log…</div><button type="button" class="updates-refresh" id="updates-refresh">Refresh</button>`;
    heroGrid.appendChild(panel); const list = panel.querySelector('#updates-list'), status = panel.querySelector('#updates-status'), refresh = panel.querySelector('#updates-refresh');
    async function loadUpdates() { status.textContent = 'Loading update log…'; try { const response = await fetch('https://api.github.com/repos/glennfb83/IsraelCraft/commits?per_page=8',{headers:{'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}); if (!response.ok) throw new Error('Failed to load updates'); const commits = await response.json(); list.innerHTML = commits.map(commit => `<article class="update-item"><strong>${escapeHtml(commit.commit.message.split('\n')[0])}</strong><span class="update-meta">${escapeHtml(new Date(commit.commit.author.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))}</span></article>`).join(''); status.textContent = `${commits.length} recent updates`; } catch (error) { status.textContent = 'Update log unavailable'; list.innerHTML = '<article class="update-item"><strong>Unable to load the latest civic bulletin.</strong></article>'; } }
    refresh.addEventListener('click', loadUpdates); loadUpdates();
  }

  function addCitizenMetrics() {
    const people = document.querySelector('#people'); if (!people || document.querySelector('#citizen-metrics')) return;
    people.insertAdjacentHTML('afterend', `<section id="citizen-metrics" class="citizen-metrics"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Civic analytics</div><h2>Citizen metrics.</h2></div></div><table class="stats-table"><thead><tr><th>Citizen</th><th>Builds</th><th>Farm output</th><th>Nether rail</th><th>Public service</th></tr></thead><tbody><tr><td>Big P</td><td>17</td><td>94%</td><td>✓</td><td>High</td></tr><tr><td>Glenn</td><td>14</td><td>91%</td><td>✓</td><td>High</td></tr><tr><td>Max</td><td>13</td><td>88%</td><td>✓</td><td>Medium</td></tr><tr><td>Leif</td><td>9</td><td>81%</td><td>✓</td><td>Medium</td></tr><tr><td>Gabe</td><td>6</td><td>74%</td><td>△</td><td>Low</td></tr></tbody></table></div></section>`);
  }

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }

  function initMap() {
    const container = document.getElementById('map-container'), image = document.getElementById('map-image'), nightImage = document.getElementById('map-image-night'), modeToggle = document.getElementById('mode-toggle');
    if (!container || !image || !modeToggle) return;
    image.src = 'images/map.png'; if (nightImage) nightImage.src = 'images/nightmap.png';
    container.style.touchAction = 'none'; container.style.userSelect = 'none'; container.style.webkitUserSelect = 'none';
    const mapImages = [image, nightImage].filter(Boolean); let scale = 1, minScale = 1, x = 0, y = 0, dragStart = null, isNight = false; let keys = {}, zoomFrame = null, pendingDelta = 0, pendingPoint = null;
    const MAX_SCALE = 32, BUTTON_ZOOM_FACTOR = 1.2, WHEEL_SENSITIVITY = 0.0012, clamp = (value,min,max) => Math.max(min,Math.min(value,max));

    const waypointKey = 'israelcraft-map-waypoints'; let waypoints = []; let placingWaypoint = false; let pendingWaypoint = null;
    try { waypoints = JSON.parse(localStorage.getItem(waypointKey) || '[]'); if (!Array.isArray(waypoints)) waypoints = []; } catch (error) { waypoints = []; }
    const waypointLayer = document.createElement('div'); waypointLayer.className = 'waypoint-layer'; container.appendChild(waypointLayer);
    const controls = modeToggle.closest('.map-controls');
    const waypointButton = document.createElement('button'); waypointButton.type = 'button'; waypointButton.id = 'waypoint-toggle'; waypointButton.setAttribute('aria-label','Place a waypoint'); waypointButton.setAttribute('aria-pressed','false'); waypointButton.title = 'Place waypoint'; waypointButton.textContent = '⚑'; controls.appendChild(waypointButton);
    const modal = document.createElement('div'); modal.className = 'waypoint-modal waypoint-hidden'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.innerHTML = `<div class="waypoint-dialog"><h3>Add waypoint</h3><form id="waypoint-form"><div class="waypoint-fields"><input id="waypoint-name" name="waypoint-name" maxlength="24" placeholder="Waypoint name" required></div><div class="waypoint-actions"><button type="button" data-waypoint-cancel>Cancel</button><button type="submit" class="primary">Save waypoint</button></div></form></div>`;
    document.body.appendChild(modal);
    const form = modal.querySelector('form'), nameInput = modal.querySelector('#waypoint-name');
    const saveWaypoints = () => { try { localStorage.setItem(waypointKey, JSON.stringify(waypoints)); } catch (error) {} };
    const closeModal = () => { modal.classList.add('waypoint-hidden'); pendingWaypoint = null; placingWaypoint = false; waypointButton.setAttribute('aria-pressed', 'false'); waypointButton.title = 'Place waypoint'; waypointButton.setAttribute('aria-label', 'Place a waypoint'); container.style.cursor = ''; };
    modal.querySelector('[data-waypoint-cancel]').addEventListener('click', closeModal); modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name || !pendingWaypoint) return;
      waypoints.push({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name, x: pendingWaypoint.x, y: pendingWaypoint.y, color: `hsl(${Math.random()*360} 68% 45%)` });
      saveWaypoints();
      renderWaypoints();
      closeModal();
    });

    const renderWaypoints = () => {
      waypointLayer.innerHTML = '';
      waypoints.forEach(waypoint => {
        const marker = document.createElement('button');
        marker.type = 'button'; marker.className = 'waypoint-marker';
        marker.title = waypoint.name;
        marker.style.left = `${waypoint.x}px`;
        marker.style.top = `${waypoint.y}px`;
        marker.style.background = waypoint.color;
        const label = document.createElement('span');
        label.textContent = waypoint.name.charAt(0).toUpperCase();
        marker.appendChild(label);
        marker.addEventListener('click', event => {
          event.stopPropagation();
          if (confirm(`Delete waypoint “${waypoint.name}”?`)) {
            waypoints = waypoints.filter(item => item.id !== waypoint.id);
            saveWaypoints();
            renderWaypoints();
          }
        });
        waypointLayer.appendChild(marker);
      });
    };
    waypointButton.addEventListener('click', () => {
      placingWaypoint = !placingWaypoint;
      waypointButton.setAttribute('aria-pressed', String(placingWaypoint));
      waypointButton.title = placingWaypoint ? 'Cancel waypoint placement' : 'Place waypoint';
      waypointButton.setAttribute('aria-label', placingWaypoint ? 'Cancel waypoint placement' : 'Place a waypoint');
      container.style.cursor = placingWaypoint ? 'crosshair' : '';
      if (!placingWaypoint) {
        closeModal();
      }
    });

    function limitPosition() {
      const width = container.clientWidth, height = container.clientHeight, imageWidth = image.naturalWidth * scale, imageHeight = image.naturalHeight * scale;
      const maxX = Math.max(0, width - imageWidth);
      const maxY = Math.max(0, height - imageHeight);
      x = clamp(x, Math.min(0, maxX), Math.max(0, maxX));
      y = clamp(y, Math.min(0, maxY), Math.max(0, maxY));
    }
    function render() {
      limitPosition();
      const transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      mapImages.forEach(mapImage => { mapImage.style.transform = transform; });
      waypointLayer.style.transform = transform;
      waypointLayer.style.transformOrigin = '0 0';
    }
    function resetView() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const width = container.clientWidth, height = container.clientHeight;
      minScale = Math.min(width / image.naturalWidth, height / image.naturalHeight, 1);
      scale = minScale;
      x = (width - image.naturalWidth * scale) / 2;
      y = (height - image.naturalHeight * scale) / 2;
      render();
    }
    function zoomAt(factor, centerX, centerY) {
      const nextScale = clamp(scale * factor, minScale, MAX_SCALE);
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
      pendingDelta = clamp(pendingDelta + (event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY), -200, 200);
      pendingPoint = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (!zoomFrame) zoomFrame = requestAnimationFrame(applyWheelZoom);
    }, { passive: false });

    function startDrag(event) {
      if (event.target.closest('button') || placingWaypoint) return;
      const point = event.touches?.[0] || event;
      container.setPointerCapture?.(event.pointerId || 1);
      dragStart = { x, y, pointerX: point.clientX, pointerY: point.clientY };
      container.classList.add('is-dragging');
    }
    container.addEventListener('pointerdown', event => startDrag(event));
    container.addEventListener('touchstart', event => {
      if (event.touches.length !== 1 || placingWaypoint) return;
      const touch = event.touches[0];
      startDrag({ pointerId: 1, target: event.target, touches: [touch], clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });
    container.addEventListener('click', event => {
      if (!placingWaypoint || event.target.closest('button')) return;
      const bounds = container.getBoundingClientRect();
      const mapX = (event.clientX - bounds.left - x) / scale;
      const mapY = (event.clientY - bounds.top - y) / scale;
      if (mapX < 0 || mapY < 0 || mapX > image.naturalWidth || mapY > image.naturalHeight) return;
      pendingWaypoint = { x: mapX, y: mapY };
      nameInput.value = '';
      modal.classList.remove('waypoint-hidden');
      nameInput.focus();
    });
    container.addEventListener('pointermove', event => {
      if (!dragStart) return;
      x = dragStart.x + event.clientX - dragStart.pointerX;
      y = dragStart.y + event.clientY - dragStart.pointerY;
      render();
    });
    container.addEventListener('pointerup', () => { dragStart = null; container.classList.remove('is-dragging'); });
    container.addEventListener('pointercancel', () => { dragStart = null; container.classList.remove('is-dragging'); });
    document.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        keys[event.key] = true;
      }
    });
    document.addEventListener('keyup', event => { if (Object.prototype.hasOwnProperty.call(keys, event.key)) delete keys[event.key]; });
    function tick() {
      const step = 18 / scale;
      if (keys.ArrowUp) y += step;
      if (keys.ArrowDown) y -= step;
      if (keys.ArrowLeft) x += step;
      if (keys.ArrowRight) x -= step;
      if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) render();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    document.getElementById('zoom-in')?.addEventListener('click', () => zoomAt(BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('zoom-out')?.addEventListener('click', () => zoomAt(1 / BUTTON_ZOOM_FACTOR, container.clientWidth / 2, container.clientHeight / 2));
    document.getElementById('reset-view')?.addEventListener('click', resetView);
    modeToggle.addEventListener('click', () => {
      isNight = !isNight;
      container.classList.toggle('is-night', isNight);
      modeToggle.setAttribute('aria-pressed', String(isNight));
      modeToggle.setAttribute('aria-label', isNight ? 'Switch to daytime map' : 'Switch to night map');
      modeToggle.innerHTML = isNight ? '☀ <span>Day</span>' : '☾ <span>Night</span>';
    });
    image.addEventListener('load', resetView); window.addEventListener('resize', resetView); if (nightImage) nightImage.addEventListener('error', () => { nightImage.style.display='none'; modeToggle.disabled = true; modeToggle.setAttribute('aria-disabled','true'); });
    renderWaypoints(); resetView();
  }
  function start() { addUpdatesPanel(); addCitizenMetrics(); initMap(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
