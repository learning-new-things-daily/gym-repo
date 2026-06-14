/* ===================================================
   IronPeak Gym — workouts.js
   Load and render workout data, tabs, search/filter
   =================================================== */

'use strict';

const WorkoutsManager = (() => {
  const DATA_PATH = 'data/workouts.json';
  let workoutData = null;
  let activeLevel = 'beginner';
  let activeGroup = 'chest';

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

  /* ---- Render Workout Card ---- */
  const createWorkoutCard = (w) => `
    <div class="workout-card reveal" data-name="${escapeHtml(w.name).toLowerCase()}" data-muscles="${(w.muscles || []).join(',').toLowerCase()}">
      <div class="workout-card-header">
        <div class="workout-name">${escapeHtml(w.name)}</div>
        <span class="workout-difficulty difficulty-${escapeHtml(w.difficulty)}">${escapeHtml(w.difficulty)}</span>
      </div>
      <div class="workout-meta">
        <div class="workout-meta-item">
          <div class="workout-meta-value">${escapeHtml(String(w.sets))}</div>
          <div class="workout-meta-label">Sets</div>
        </div>
        <div class="workout-meta-item">
          <div class="workout-meta-value">${escapeHtml(String(w.reps))}</div>
          <div class="workout-meta-label">Reps</div>
        </div>
        <div class="workout-meta-item">
          <div class="workout-meta-value">${escapeHtml(w.rest)}</div>
          <div class="workout-meta-label">Rest</div>
        </div>
      </div>
      ${w.muscles ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.6rem;">
        ${w.muscles.map(m => `<span class="cert-badge">${escapeHtml(m)}</span>`).join('')}
      </div>` : ''}
      ${w.tips ? `<div class="workout-tip">💡 ${escapeHtml(w.tips)}</div>` : ''}
    </div>
  `;

  /* ---- Render Muscle Group ---- */
  const renderMuscleGroup = (groupName, exercises, container) => {
    const section = document.createElement('div');
    section.className = 'workout-group reveal';
    section.innerHTML = `
      <h3 style="font-size:1.1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem;">
        <span style="width:32px;height:32px;background:var(--primary);color:#fff;border-radius:50%;
          display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;">
          ${escapeHtml(groupName.slice(0,1).toUpperCase())}
        </span>
        ${escapeHtml(groupName.charAt(0).toUpperCase() + groupName.slice(1))}
      </h3>
      <div class="grid grid-3" id="group-${groupName}"></div>
    `;
    container.appendChild(section);
    const grid = section.querySelector(`#group-${groupName}`);
    if (exercises && exercises.length) {
      grid.innerHTML = exercises.map(w => createWorkoutCard(w)).join('');
    }
  };

  /* ---- Render Level ---- */
  const renderLevel = (level) => {
    const container = document.getElementById('workoutDisplay');
    if (!container || !workoutData) return;

    container.innerHTML = '';
    const levelData = workoutData[level];
    if (!levelData) {
      container.innerHTML = '<p class="text-center text-muted">No data available.</p>';
      return;
    }

    Object.entries(levelData).forEach(([group, exercises]) => {
      renderMuscleGroup(group, exercises, container);
    });

    // Make cards visible
    setTimeout(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 100);
  };

  /* ---- Render Weekly Plans ---- */
  const renderWeeklyPlans = () => {
    const container = document.getElementById('weeklyPlansContainer');
    if (!container || !workoutData?.weeklyPlans) return;

    container.innerHTML = Object.entries(workoutData.weeklyPlans).map(([key, plan]) => `
      <div class="card reveal">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem;">
          <div>
            <h3 style="margin-bottom:.25rem;">${escapeHtml(plan.name)}</h3>
            <div style="font-size:.85rem;color:var(--text-muted);">
              ${escapeHtml(plan.duration)} • ${escapeHtml(plan.frequency)}
            </div>
          </div>
        </div>
        <table class="plan-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Focus</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${(plan.schedule || []).map(day => `
              <tr>
                <td><strong>${escapeHtml(day.day)}</strong></td>
                <td>${escapeHtml(day.focus)}</td>
                <td>${escapeHtml(day.duration) || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  };

  /* ---- Render Best Practices ---- */
  const renderBestPractices = () => {
    const container = document.getElementById('bestPracticesContainer');
    if (!container || !workoutData?.bestPractices) return;

    const phases = [
      { key: 'beforeWorkout', title: 'Before Workout', icon: '🔥' },
      { key: 'duringWorkout', title: 'During Workout', icon: '💪' },
      { key: 'afterWorkout',  title: 'After Workout',  icon: '🌟' }
    ];

    container.innerHTML = phases.map(phase => {
      const items = workoutData.bestPractices[phase.key] || [];
      return `
        <div class="practice-card reveal">
          <h3>${phase.icon} ${escapeHtml(phase.title)}</h3>
          ${items.map(item => `
            <div class="practice-item">
              <div class="practice-item-icon">✓</div>
              <div>
                <div class="practice-item-title">${escapeHtml(item.title)}</div>
                <div class="practice-item-tip">${escapeHtml(item.tip)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');

    container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  };

  /* ---- Render Nutrition Tips ---- */
  const renderNutrition = () => {
    const container = document.getElementById('nutritionTips');
    if (!container || !workoutData?.nutrition) return;

    const { macros, tips } = workoutData.nutrition;

    container.innerHTML = `
      <div class="grid grid-3" style="margin-bottom:1.5rem;">
        <div class="card text-center">
          <div style="font-size:1.5rem;margin-bottom:.5rem;">🥩</div>
          <div style="font-weight:700;margin-bottom:.25rem;">Protein</div>
          <div style="font-size:.85rem;color:var(--text-muted)">${escapeHtml(macros.protein)}</div>
        </div>
        <div class="card text-center">
          <div style="font-size:1.5rem;margin-bottom:.5rem;">🍚</div>
          <div style="font-weight:700;margin-bottom:.25rem;">Carbohydrates</div>
          <div style="font-size:.85rem;color:var(--text-muted)">${escapeHtml(macros.carbs)}</div>
        </div>
        <div class="card text-center">
          <div style="font-size:1.5rem;margin-bottom:.5rem;">🥑</div>
          <div style="font-weight:700;margin-bottom:.25rem;">Healthy Fats</div>
          <div style="font-size:.85rem;color:var(--text-muted)">${escapeHtml(macros.fats)}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:.6rem;">
        ${tips.map(tip => `
          <div class="nutrition-tip">
            <span class="tip-icon">✔</span>
            <span>${escapeHtml(tip)}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  /* ---- Init Level Tabs ---- */
  const initTabs = () => {
    document.querySelectorAll('.workout-level-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.workout-level-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLevel = btn.dataset.level;
        renderLevel(activeLevel);
      });
    });
  };

  /* ---- Workout Search ---- */
  const initSearch = () => {
    const searchInput = document.getElementById('workoutSearch');
    if (!searchInput || !workoutData) return;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        renderLevel(activeLevel);
        return;
      }

      const container = document.getElementById('workoutDisplay');
      if (!container) return;

      // Search across all levels
      const results = [];
      ['beginner', 'intermediate', 'advanced'].forEach(level => {
        const levelData = workoutData[level];
        if (!levelData) return;
        Object.entries(levelData).forEach(([group, exercises]) => {
          exercises.forEach(ex => {
            if (
              ex.name.toLowerCase().includes(query) ||
              (ex.muscles || []).some(m => m.toLowerCase().includes(query))
            ) {
              results.push({ ...ex, _group: group, _level: level });
            }
          });
        });
      });

      container.innerHTML = '';
      if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-muted" style="padding:2rem 0;">No exercises found matching your search.</p>';
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'grid grid-3';
      grid.innerHTML = results.map(w => createWorkoutCard(w)).join('');
      container.appendChild(grid);

      container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
  };

  /* ---- Load Data ---- */
  const loadData = async () => {
    try {
      workoutData = await window.IronPeak?.DataLoader.load(DATA_PATH);
    } catch (e) {
      console.warn('WorkoutsManager: Failed to load data', e);
      workoutData = null;
    }
  };

  /* ---- Init ---- */
  const init = async () => {
    await loadData();
    if (!workoutData) return;

    initTabs();
    renderLevel(activeLevel);
    renderWeeklyPlans();
    renderBestPractices();
    renderNutrition();
    initSearch();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => WorkoutsManager.init());
