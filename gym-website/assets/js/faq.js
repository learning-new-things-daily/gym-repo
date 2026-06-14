/* ===================================================
   IronPeak Gym — faq.js
   Load FAQ from faq.json, accordion behavior,
   searchable FAQ
   =================================================== */

'use strict';

const FAQManager = (() => {
  const DATA_PATH = 'data/faq.json';
  let faqData = [];
  let openItem = null;

  /* ---- Build Accordion Item HTML ---- */
  const createFaqItem = (item) => `
    <div class="faq-item" data-id="${item.id}" data-question="${escapeAttr(item.question)}">
      <div class="faq-question" role="button" tabindex="0"
           aria-expanded="false" aria-controls="faq-answer-${item.id}">
        <h3>${escapeHtml(item.question)}</h3>
        <span class="faq-icon" aria-hidden="true">▾</span>
      </div>
      <div class="faq-answer" id="faq-answer-${item.id}" role="region">
        <p>${escapeHtml(item.answer)}</p>
      </div>
    </div>
  `;

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const escapeAttr = (str) => escapeHtml(str);

  /* ---- Toggle Accordion ---- */
  const toggleItem = (item) => {
    const answer = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');
    const isOpen = item.classList.contains('open');

    // Close previously open item
    if (openItem && openItem !== item) {
      openItem.classList.remove('open');
      const prevAnswer = openItem.querySelector('.faq-answer');
      const prevQuestion = openItem.querySelector('.faq-question');
      if (prevAnswer) prevAnswer.classList.remove('open');
      if (prevQuestion) prevQuestion.setAttribute('aria-expanded', 'false');
    }

    if (isOpen) {
      item.classList.remove('open');
      if (answer) answer.classList.remove('open');
      question.setAttribute('aria-expanded', 'false');
      openItem = null;
    } else {
      item.classList.add('open');
      if (answer) answer.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
      openItem = item;
    }
  };

  /* ---- Attach events to items ---- */
  const attachEvents = (container) => {
    container.querySelectorAll('.faq-item').forEach(item => {
      const question = item.querySelector('.faq-question');

      question.addEventListener('click', () => toggleItem(item));
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(item);
        }
      });
    });
  };

  /* ---- Render FAQ List ---- */
  const renderFaq = (data, container) => {
    if (data.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="padding:2rem 0;">No questions found matching your search.</p>';
      return;
    }
    container.innerHTML = data.map(item => createFaqItem(item)).join('');
    attachEvents(container);
  };

  /* ---- Search FAQ ---- */
  const initSearch = (container) => {
    const searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      openItem = null;

      if (!query) {
        renderFaq(faqData, container);
        return;
      }

      const filtered = faqData.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
      renderFaq(filtered, container);

      // Auto-open if only one result
      if (filtered.length === 1) {
        const item = container.querySelector('.faq-item');
        if (item) toggleItem(item);
      }
    });
  };

  /* ---- Load FAQ ---- */
  const loadFaq = async () => {
    const container = document.getElementById('faqList');
    if (!container) return;

    // Skeleton
    container.innerHTML = Array(4).fill(`
      <div class="faq-item" style="pointer-events:none">
        <div class="faq-question" style="background:var(--bg-card)">
          <div class="skeleton" style="height:20px;width:80%;"></div>
          <div class="skeleton" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;"></div>
        </div>
      </div>
    `).join('');

    try {
      const data = await window.IronPeak?.DataLoader.load(DATA_PATH);
      faqData = data || [];
    } catch (e) {
      faqData = [];
    }

    renderFaq(faqData, container);
    initSearch(container);
  };

  /* ---- Init ---- */
  const init = () => {
    loadFaq();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => FAQManager.init());
