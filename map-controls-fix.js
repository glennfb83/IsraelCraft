(() => {
  const image = document.getElementById('map-image');
  if (image) image.src = 'images/map.png';
  const nightImage = document.getElementById('map-image-night');
  if (nightImage) nightImage.src = 'images/nightmap.png';

  function setup() {
    const container = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    const controls = document.querySelector('.map-controls');
    if (!container || !mapImage || !controls) return false;

    let button = document.getElementById('waypoint-toggle');
    if (!button) {
      button = document.createElement('button');
      button.id = 'waypoint-toggle';
      button.type = 'button';
      button.textContent = '⚑';
      button.title = 'Place waypoint';
      button.setAttribute('aria-label', 'Place waypoint');
      button.setAttribute('aria-pressed', 'false');
      controls.appendChild(button);
    }
    if (button.dataset.waypointFix === 'true') return true;
    button.dataset.waypointFix = 'true';

    const layer = document.createElement('div');
    layer.className = 'waypoint-layer';
    Object.assign(layer.style, { position:'absolute', inset:'0', zIndex:'5', pointerEvents:'none' });
    container.appendChild(layer);
    const key = 'israelcraft-map-waypoints';
    let points = [];
    try { points = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
    if (!Array.isArray(points)) points = [];
    let placing = false;
    let view = { scale: 1, x: 0, y: 0 };

    const save = () => localStorage.setItem(key, JSON.stringify(points));
    const render = () => {
      layer.innerHTML = '';
      points.forEach(point => {
        const marker = document.createElement('button');
        marker.type = 'button'; marker.className = 'waypoint-marker';
        marker.textContent = point.name.charAt(0).toUpperCase();
        marker.title = point.name;
        marker.style.cssText = `position:absolute;left:${point.x}px;top:${point.y}px;transform:translate(-50%,-100%) rotate(-45deg);width:36px;height:36px;border:3px solid #fff;border-radius:50% 50% 50% 0;background:${point.color};color:#fff;font-weight:900;pointer-events:auto;cursor:pointer;`;
        marker.addEventListener('click', event => {
          event.stopPropagation();
          if (confirm(`Delete waypoint “${point.name}”?`)) { points = points.filter(item => item.id !== point.id); save(); render(); }
        });
        layer.appendChild(marker);
      });
    };
    const setMode = value => {
      placing = value;
      button.setAttribute('aria-pressed', String(placing));
      button.title = placing ? 'Cancel waypoint placement' : 'Place waypoint';
      button.setAttribute('aria-label', button.title);
      container.style.cursor = placing ? 'crosshair' : '';
    };
    button.addEventListener('click', () => setMode(!placing));
    container.addEventListener('click', event => {
      if (!placing || event.target.closest('.waypoint-marker')) return;
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left - view.x) / view.scale;
      const y = (event.clientY - bounds.top - view.y) / view.scale;
      if (x < 0 || y < 0 || x > mapImage.naturalWidth || y > mapImage.naturalHeight) return;
      const name = prompt('Waypoint name:');
      if (!name || !name.trim()) return;
      points.push({ id: `${Date.now()}-${Math.random()}`, name: name.trim(), x, y, color: `hsl(${Math.random()*360} 68% 45%)` });
      save(); render(); setMode(false);
    });
    const observer = new MutationObserver(() => {
      const transform = getComputedStyle(mapImage).transform;
      const match = transform.match(/^matrix\\(([^,]+),/);
      view.scale = match ? Number(match[1]) || 1 : 1;
      const values = transform.match(/^matrix\\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),([^\)]+)\\)$/);
      if (values) { view.x = Number(values[1]) || 0; view.y = Number(values[2]) || 0; }
      layer.style.transform = transform === 'none' ? '' : transform;
    });
    observer.observe(mapImage, { attributes:true, attributeFilter:['style'] });
    render();
    return true;
  }
  const timer = setInterval(() => { if (setup()) clearInterval(timer); }, 25);
  setTimeout(() => clearInterval(timer), 10000);
})();
