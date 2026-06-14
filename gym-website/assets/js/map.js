/* ===================================================
   IronPeak Gym — map.js
   Google Maps embed, directions, location info
   =================================================== */

'use strict';

const MapManager = (() => {
  const GYM_ADDRESS = '123 Fitness Boulevard, Muscle City, CA 90210';
  const GYM_MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(GYM_ADDRESS)}`;
  const GYM_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(GYM_ADDRESS)}&output=embed&z=15`;

  /* ---- Embed Map ---- */
  const embedMap = () => {
    const container = document.getElementById('mapContainer');
    if (!container) return;

    // Show placeholder with load button to respect privacy
    container.innerHTML = `
      <div class="map-placeholder" style="
        height:100%;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:1rem;
        background:var(--surface);border-radius:var(--radius-lg);
        padding:2rem;text-align:center;
      ">
        <div style="font-size:4rem;">📍</div>
        <h3 style="font-size:1.25rem;margin-bottom:.25rem;">IronPeak Gym</h3>
        <p style="font-size:.9rem;color:var(--text-muted);max-width:300px;">${GYM_ADDRESS}</p>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;margin-top:.5rem;">
          <button class="btn btn-primary" id="loadMapBtn">
            🗺️ Show Map
          </button>
          <a href="${GYM_MAPS_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
            ↗ Open in Google Maps
          </a>
          <a href="https://maps.google.com/maps?daddr=${encodeURIComponent(GYM_ADDRESS)}" 
             target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
            🧭 Get Directions
          </a>
        </div>
      </div>
    `;

    const loadBtn = document.getElementById('loadMapBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => loadActualMap(container));
    }
  };

  /* ---- Load Actual Iframe Map ---- */
  const loadActualMap = (container) => {
    container.innerHTML = `
      <iframe
        src="${GYM_EMBED_URL}"
        width="100%"
        height="100%"
        style="border:0;border-radius:var(--radius-lg);"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="IronPeak Gym Location Map"
      ></iframe>
    `;
  };

  /* ---- Update Direction Links ---- */
  const updateLinks = () => {
    document.querySelectorAll('[data-maps-link]').forEach(el => {
      el.href = GYM_MAPS_URL;
    });
    document.querySelectorAll('[data-directions-link]').forEach(el => {
      el.href = `https://maps.google.com/maps?daddr=${encodeURIComponent(GYM_ADDRESS)}`;
    });
  };

  const init = () => {
    embedMap();
    updateLinks();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => MapManager.init());
