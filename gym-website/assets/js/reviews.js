/* ===================================================
   IronPeak Gym — reviews.js
   Load and render reviews from reviews.json
   Handle review submission form
   =================================================== */

'use strict';

const ReviewsManager = (() => {
  const DATA_PATH = 'data/reviews.json';
  let reviews = [];
  let localReviews = JSON.parse(localStorage.getItem('ironpeak-reviews') || '[]');

  /* ---- Render Stars ---- */
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < rating ? '#e9c46a' : '#dee2e6'}">★</span>`
    ).join('');
  };

  /* ---- Create Review Card HTML ---- */
  const createReviewCard = (review) => `
    <div class="testimonial-card reveal" data-tag="${(review.tag || '').toLowerCase()}">
      <div class="testimonial-stars">${renderStars(review.rating)}</div>
      <p class="testimonial-text">"${escapeHtml(review.text)}"</p>
      <div class="testimonial-author">
        <img class="testimonial-avatar"
          src="${escapeHtml(review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=e63946&color=fff`)}"
          alt="${escapeHtml(review.name)}"
          width="48" height="48"
          loading="lazy">
        <div>
          <div class="testimonial-name">${escapeHtml(review.name)}</div>
          ${review.tag ? `<div class="testimonial-tag">${escapeHtml(review.tag)}</div>` : ''}
          ${review.date ? `<div style="font-size:.75rem;color:var(--text-muted)">${formatDate(review.date)}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  /* ---- Escape HTML ---- */
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* ---- Format Date ---- */
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  /* ---- Load & Render Reviews ---- */
  const loadReviews = async () => {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    // Show skeleton
    container.innerHTML = Array(4).fill(`
      <div class="testimonial-card">
        <div class="skeleton" style="height:20px;width:100px;margin-bottom:.75rem;"></div>
        <div class="skeleton" style="height:80px;margin-bottom:1rem;"></div>
        <div style="display:flex;gap:.75rem;align-items:center">
          <div class="skeleton" style="width:48px;height:48px;border-radius:50%;flex-shrink:0;"></div>
          <div style="flex:1">
            <div class="skeleton" style="height:16px;width:120px;margin-bottom:.35rem;"></div>
            <div class="skeleton" style="height:12px;width:80px;"></div>
          </div>
        </div>
      </div>
    `).join('');

    try {
      const data = await window.IronPeak?.DataLoader.load(DATA_PATH);
      reviews = data || [];
    } catch (e) {
      reviews = [];
    }

    // Combine with local reviews
    const allReviews = [...localReviews, ...reviews];

    if (allReviews.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No reviews yet. Be the first!</p>';
      return;
    }

    renderReviews(allReviews, container);
    updateStats(allReviews);
    initFilters(allReviews);

    // Re-init scroll reveal for new cards
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  };

  /* ---- Render to DOM ---- */
  const renderReviews = (data, container) => {
    container.innerHTML = data.map(r => createReviewCard(r)).join('');
  };

  /* ---- Update Stats ---- */
  const updateStats = (data) => {
    const avg = (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1);
    const totalEl = document.getElementById('totalReviews');
    const avgEl   = document.getElementById('avgRating');
    const starsEl = document.getElementById('avgStars');

    if (totalEl) totalEl.textContent = data.length;
    if (avgEl)   avgEl.textContent = avg;
    if (starsEl) starsEl.innerHTML = renderStars(Math.round(parseFloat(avg)));

    // Distribution bars
    [5, 4, 3, 2, 1].forEach(star => {
      const count = data.filter(r => r.rating === star).length;
      const pct   = data.length ? Math.round((count / data.length) * 100) : 0;
      const bar   = document.getElementById(`bar${star}`);
      const cnt   = document.getElementById(`count${star}`);
      if (bar) { setTimeout(() => bar.style.width = pct + '%', 300); }
      if (cnt) cnt.textContent = count;
    });
  };

  /* ---- Filter Buttons ---- */
  const initFilters = (data) => {
    const container = document.getElementById('reviewsContainer');
    document.querySelectorAll('.reviews-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reviews-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const filtered = filter === 'all' ? data : data.filter(r => r.rating === parseInt(filter));
        renderReviews(filtered, container);
      });
    });
  };

  /* ---- Review Submission Form ---- */
  const initForm = () => {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name   = form.querySelector('[name="reviewName"]')?.value.trim();
      const text   = form.querySelector('[name="reviewText"]')?.value.trim();
      const rating = parseInt(form.querySelector('[name="rating"]:checked')?.value || 0);
      const action = form.querySelector('[name="submitAction"]')?.value || 'local';

      if (!name || !text || !rating) {
        window.IronPeak?.Toast.show('Please fill in all fields and select a rating.', 'error');
        return;
      }

      if (action === 'google') {
        // Redirect to Google Review page
        const googleUrl = 'https://g.page/r/REPLACE_WITH_GOOGLE_BUSINESS_ID/review';
        window.open(googleUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Store locally
      const review = {
        id: Date.now(),
        name,
        text,
        rating,
        date: new Date().toISOString().slice(0, 10),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e63946&color=fff`,
        tag: 'Member Review'
      };

      localReviews.unshift(review);
      if (localReviews.length > 50) localReviews = localReviews.slice(0, 50);
      localStorage.setItem('ironpeak-reviews', JSON.stringify(localReviews));

      form.reset();
      window.IronPeak?.Toast.show('Thank you for your review!');

      // Reload reviews
      loadReviews();
    });
  };

  /* ---- Home Page Preview (top 3) ---- */
  const loadPreview = async () => {
    const container = document.getElementById('testimonialsPreview');
    if (!container) return;

    try {
      const data = await window.IronPeak?.DataLoader.load(DATA_PATH);
      reviews = data || [];
    } catch (e) { reviews = []; }

    const top = reviews.slice(0, 3);
    container.innerHTML = top.map(r => createReviewCard(r)).join('');

    document.querySelectorAll('#testimonialsPreview .reveal').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 100);
    });
  };

  const init = () => {
    loadReviews();
    loadPreview();
    initForm();
  };

  return { init, loadReviews, loadPreview };
})();

document.addEventListener('DOMContentLoaded', () => ReviewsManager.init());
