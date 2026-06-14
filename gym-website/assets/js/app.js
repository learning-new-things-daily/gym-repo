/* ===================================================
   IronPeak Gym — app.js
   Core utilities, theme toggle, navbar, counters,
   scroll reveal, lightbox, BMI calc, floating btns
   =================================================== */

'use strict';

/* ---- Theme Management ---- */
const ThemeManager = (() => {
  const KEY = 'ironpeak-theme';
  const btn = document.getElementById('themeToggle');
  const drawerBtn = document.getElementById('themeToggleDrawer');

  const getTheme = () => localStorage.getItem(KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    const icon = theme === 'dark' ? '☀️' : '🌙';
    if (btn) btn.innerHTML = icon;
    if (drawerBtn) drawerBtn.innerHTML = icon + ' ' + (theme === 'dark' ? 'Light Mode' : 'Dark Mode');
  };

  const toggle = () => applyTheme(getTheme() === 'dark' ? 'light' : 'dark');

  const init = () => {
    applyTheme(getTheme());
    if (btn) btn.addEventListener('click', toggle);
    if (drawerBtn) drawerBtn.addEventListener('click', toggle);
  };

  return { init, getTheme, applyTheme };
})();

/* ---- Navbar ---- */
const NavbarManager = (() => {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('navHamburger');
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('navOverlay');
  const drawerClose = document.getElementById('drawerClose');

  const setScrolled = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  const openDrawer = () => {
    drawer && drawer.classList.add('open');
    overlay && overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer && drawer.classList.remove('open');
    overlay && overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  const setActiveLink = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .drawer-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  };

  const init = () => {
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
    if (hamburger) hamburger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    setActiveLink();

    // Close drawer on link click
    document.querySelectorAll('.drawer-links a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
  };

  return { init };
})();

/* ---- Scroll To Top ---- */
const ScrollTop = (() => {
  const btn = document.getElementById('scrollTopBtn');

  const checkVisibility = () => {
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const init = () => {
    window.addEventListener('scroll', checkVisibility, { passive: true });
    if (btn) btn.addEventListener('click', scrollToTop);
  };

  return { init };
})();

/* ---- Scroll Reveal (Intersection Observer) ---- */
const ScrollReveal = (() => {
  const init = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children')
      .forEach(el => observer.observe(el));
  };

  return { init };
})();

/* ---- Animated Counters ---- */
const Counters = (() => {
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOutQuart(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString();
    };

    requestAnimationFrame(update);
  };

  const init = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
  };

  return { init };
})();

/* ---- Ripple Effect on Buttons ---- */
const RippleEffect = (() => {
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  const init = () => {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', addRipple);
    });
  };

  return { init };
})();

/* ---- Lightbox ---- */
const Lightbox = (() => {
  let currentIndex = 0;
  let images = [];

  const open = (src, alt, index) => {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (!lb) return;
    img.src = src;
    img.alt = alt || '';
    if (cap) cap.textContent = alt || '';
    lb.classList.add('open');
    currentIndex = index || 0;
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };

  const navigate = (dir) => {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    const item = images[currentIndex];
    open(item.src, item.alt, currentIndex);
  };

  const init = () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, i) => {
      const img = item.querySelector('img');
      images.push({ src: img ? img.src : '', alt: img ? img.alt : '' });

      item.addEventListener('click', () => {
        open(images[i].src, images[i].alt, i);
      });

      // Keyboard
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(images[i].src, images[i].alt, i);
        }
      });
    });

    const lb = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
    if (lb) lb.addEventListener('click', e => { if (e.target === lb) close(); });

    document.addEventListener('keydown', e => {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  };

  return { init, open, close };
})();

/* ---- BMI Calculator ---- */
const BMICalc = (() => {
  const getCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#457b9d' };
    if (bmi < 25)   return { label: 'Normal weight', color: '#2a9d8f' };
    if (bmi < 30)   return { label: 'Overweight', color: '#e9c46a' };
    return               { label: 'Obese', color: '#e63946' };
  };

  const calculate = () => {
    const weightEl = document.getElementById('bmiWeight');
    const heightEl = document.getElementById('bmiHeight');
    const resultEl = document.getElementById('bmiResult');
    const valueEl  = document.getElementById('bmiValue');
    const catEl    = document.getElementById('bmiCategory');
    const advEl    = document.getElementById('bmiAdvice');

    if (!weightEl || !heightEl) return;

    const weight = parseFloat(weightEl.value);
    const height = parseFloat(heightEl.value) / 100;

    if (!weight || !height || weight <= 0 || height <= 0) {
      alert('Please enter valid weight and height values.');
      return;
    }

    const bmi = (weight / (height * height)).toFixed(1);
    const cat = getCategory(parseFloat(bmi));

    if (valueEl) { valueEl.textContent = bmi; valueEl.style.color = cat.color; }
    if (catEl)   { catEl.textContent = cat.label; catEl.style.color = cat.color; }

    const advMap = {
      'Underweight': 'Consider a calorie surplus diet with strength training. Consult our nutrition team.',
      'Normal weight': 'Great job! Maintain with balanced nutrition and regular exercise.',
      'Overweight': 'A combination of cardio + strength training and a moderate calorie deficit will help.',
      'Obese': 'We recommend speaking with our certified trainers and nutritionist for a personalized plan.'
    };
    if (advEl) advEl.textContent = advMap[cat.label] || '';

    if (resultEl) {
      resultEl.classList.add('show');
      resultEl.style.background = cat.color + '15';
      resultEl.style.border = `1px solid ${cat.color}40`;
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const init = () => {
    const btn = document.getElementById('bmiCalcBtn');
    if (btn) btn.addEventListener('click', calculate);
    const input = document.querySelectorAll('#bmiWeight, #bmiHeight');
    input.forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
  };

  return { init };
})();

/* ---- Calorie Calculator ---- */
const CalorieCalc = (() => {
  const calculate = () => {
    const age    = parseFloat(document.getElementById('calAge')?.value);
    const weight = parseFloat(document.getElementById('calWeight')?.value);
    const height = parseFloat(document.getElementById('calHeight')?.value);
    const gender = document.getElementById('calGender')?.value;
    const activity = parseFloat(document.getElementById('calActivity')?.value);
    const resultEl = document.getElementById('calorieResult');

    if (!age || !weight || !height || !gender || !activity) return;

    // Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const tdee = Math.round(bmr * activity);

    if (resultEl) {
      resultEl.innerHTML = `
        <div class="calorie-result-grid">
          <div class="cal-item">
            <div class="cal-value">${Math.round(tdee * 0.85)}</div>
            <div class="cal-label">Weight Loss (deficit)</div>
          </div>
          <div class="cal-item highlight">
            <div class="cal-value">${tdee}</div>
            <div class="cal-label">Maintenance</div>
          </div>
          <div class="cal-item">
            <div class="cal-value">${Math.round(tdee * 1.15)}</div>
            <div class="cal-label">Muscle Gain (surplus)</div>
          </div>
        </div>
        <p style="font-size:.82rem;color:var(--text-muted);margin-top:.75rem;text-align:center;">Daily calories per goal. Consult our nutritionist for a personalized plan.</p>
      `;
      resultEl.style.display = 'block';
    }
  };

  const init = () => {
    const btn = document.getElementById('calorieCalcBtn');
    if (btn) btn.addEventListener('click', calculate);
  };

  return { init };
})();

/* ---- Membership Cost Calculator ---- */
const MembershipCalc = (() => {
  const prices = {
    basic:    { monthly: 29, quarterly: 79,  halfYearly: 149, annual: 279 },
    standard: { monthly: 49, quarterly: 129, halfYearly: 239, annual: 449 },
    premium:  { monthly: 79, quarterly: 209, halfYearly: 389, annual: 729 }
  };

  const calculate = () => {
    const plan     = document.getElementById('memberPlan')?.value;
    const duration = document.getElementById('memberDuration')?.value;
    const resultEl = document.getElementById('memberResult');
    if (!plan || !duration || !resultEl) return;

    const price = prices[plan]?.[duration];
    if (!price) return;

    const monthMap = { monthly: 1, quarterly: 3, halfYearly: 6, annual: 12 };
    const months = monthMap[duration];
    const perMonth = (price / months).toFixed(2);
    const durationLabel = duration.replace(/([A-Z])/g, ' $1').toLowerCase();

    resultEl.innerHTML = `
      <div style="text-align:center;padding:1rem;background:rgba(230,57,70,.05);border-radius:var(--radius-md);border:1px solid rgba(230,57,70,.2);">
        <div style="font-size:.85rem;color:var(--text-muted);margin-bottom:.25rem;">${plan.charAt(0).toUpperCase() + plan.slice(1)} — ${durationLabel}</div>
        <div style="font-size:3rem;font-weight:900;color:var(--primary);font-family:var(--font-display);">$${price}</div>
        <div style="font-size:.9rem;color:var(--text-muted);">~$${perMonth}/month</div>
        <a href="contact.html" class="btn btn-primary mt-3">Join Now</a>
      </div>
    `;
    resultEl.style.display = 'block';
  };

  const init = () => {
    const btn = document.getElementById('memberCalcBtn');
    if (btn) btn.addEventListener('click', calculate);
  };

  return { init };
})();

/* ---- Page Loader ---- */
const PageLoader = (() => {
  const init = () => {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 400);
    });
  };
  return { init };
})();

/* ---- Lazy Load Images ---- */
const LazyImages = (() => {
  const init = () => {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  };

  return { init };
})();

/* ---- Smooth Scroll for Anchor Links ---- */
const SmoothScroll = (() => {
  const init = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };
  return { init };
})();

/* ---- Pricing Toggle (Annual/Monthly) ---- */
const PricingToggle = (() => {
  const init = () => {
    const toggle = document.getElementById('pricingToggle');
    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const isAnnual = toggle.checked;
      document.querySelectorAll('.price-monthly').forEach(el => el.style.display = isAnnual ? 'none' : '');
      document.querySelectorAll('.price-annual').forEach(el => el.style.display = isAnnual ? '' : 'none');
    });
  };
  return { init };
})();

/* ---- Toast Notifications ---- */
const Toast = (() => {
  const show = (message, type = 'success') => {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;
    toast.style.cssText = `
      position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);
      background:var(--bg-card);border:1px solid var(--border);
      padding:.85rem 1.5rem;border-radius:var(--radius-full);
      box-shadow:var(--shadow-lg);z-index:3000;
      display:flex;align-items:center;gap:.75rem;
      font-size:.9rem;font-weight:600;color:var(--text);
      animation:fadeInUp .4s ease both;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  return { show };
})();

/* ---- Load JSON Data ---- */
const DataLoader = (() => {
  const cache = {};

  const load = async (path) => {
    if (cache[path]) return cache[path];
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[path] = data;
      return data;
    } catch (err) {
      console.warn(`DataLoader: Failed to load ${path}`, err);
      return null;
    }
  };

  return { load };
})();

/* ---- Init All ---- */
document.addEventListener('DOMContentLoaded', () => {
  PageLoader.init();
  ThemeManager.init();
  NavbarManager.init();
  ScrollTop.init();
  ScrollReveal.init();
  Counters.init();
  RippleEffect.init();
  Lightbox.init();
  BMICalc.init();
  CalorieCalc.init();
  MembershipCalc.init();
  PricingToggle.init();
  LazyImages.init();
  SmoothScroll.init();
});

/* ---- Export for modules ---- */
window.IronPeak = {
  ThemeManager,
  Lightbox,
  Toast,
  DataLoader,
  BMICalc,
  CalorieCalc
};
