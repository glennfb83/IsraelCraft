(() => {
  const container = document.getElementById('map-container');
  if (!container) return;

  const style = document.createElement('style');
  style.textContent = `
    #map-container .waypoint-marker {
      width: 38px;
      height: 38px;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      box-shadow: 2px 2px 0 #111, 0 0 0 2px #1118;
      font-size: 16px;
      transition: filter .15s ease, box-shadow .15s ease;
    }
    #map-container .waypoint-marker:hover,
    #map-container .waypoint-marker:focus-visible {
      filter: brightness(1.18);
      box-shadow: 2px 2px 0 #111, 0 0 0 3px #fff;
      outline: none;
    }
    #map-container .waypoint-marker span { text-shadow: 1px 1px 0 #111; }
    #map-container .waypoint-marker {
      transform: translate(-50%, -100%) rotate(-45deg) scale(var(--waypoint-inverse-scale, 1)) !important;
    }
    #waypoint-toggle[aria-pressed="true"] {
      background: var(--blue2, #356fba);
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  const image = document.getElementById('map-image');
  const waypointLayer = container.querySelector('.waypoint-layer');
  const button = document.getElementById('waypoint-toggle');
  if (!image || !waypointLayer || !button) return;

  function syncMarkerScale() {
    const transform = getComputedStyle(image).transform;
    let scale = 1;
    if (transform && transform !== 'none') {
      const match = transform.match(/^matrix3d\\((.+)\\)$/);
      if (match) scale = Number(match[1].split(',')[0]) || 1;
      else {
        const matrix = transform.match(/^matrix\\((.+)\\)$/);
        if (matrix) scale = Number(matrix[1].split(',')[0]) || 1;
      }
    }
    waypointLayer.style.setProperty('--waypoint-inverse-scale', String(1 / scale));
  }

  // The map viewer updates the image transform while panning and zooming.
  // Keep waypoint pins readable without changing their map coordinates.
  const observer = new MutationObserver(syncMarkerScale);
  observer.observe(image, { attributes: true, attributeFilter: ['style'] });
  syncMarkerScale();

  // Keep the placement control visibly and accessibly in its on/off state.
  const buttonObserver = new MutationObserver(() => {
    const active = button.getAttribute('aria-pressed') === 'true';
    button.title = active ? 'Cancel waypoint placement' : 'Place waypoint';
    button.setAttribute('aria-label', active ? 'Cancel waypoint placement' : 'Place a waypoint');
  });
  buttonObserver.observe(button, { attributes: true, attributeFilter: ['aria-pressed'] });
  button.click();
  button.click();
})();
