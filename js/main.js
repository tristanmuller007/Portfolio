document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initReveal();
  initCarousel(document.getElementById('carousel'));
  initFilmstrip(document.getElementById('film'));
  initSportTimeline(document.getElementById('sport'));
  initActiveLinks();
  initCasePage();
});

function initNavigation() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('menu');
  if (!nav || !burger || !menu) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    if (!open) document.dispatchEvent(new Event('menuclose'));
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });
}

function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 3) * 70 + 'ms';
    observer.observe(el);
  });
}

function initCarousel(root) {
  if (!root) return;

  const view     = root.querySelector('.carousel__view');
  const strip    = root.querySelector('.carousel__strip');
  const panels   = [...root.querySelectorAll('.carousel__panel')];
  const counter  = root.querySelector('[data-counter]');
  const projects = [...root.querySelectorAll('.carousel__data li')].map((li) => ({
    image:  li.dataset.img,
    large:  li.dataset.imgLg,
    nameFr: li.dataset.name,
    nameEn: li.dataset.nameEn || li.dataset.name,
  }));

  const nameOf = (project) =>
    window.i18n && window.i18n.lang === 'en' ? projects[project].nameEn : projects[project].nameFr;

  const total      = projects.length;
  const slats      = Math.max(1, Math.min(3, total - 4));
  const visible    = 4 + slats;
  const DURATION   = prefersReducedMotion ? 0 : 1000;

  const SHARES           = [-0.06, 0.61, 0.30, 0.15];
  const SHARES_HOVERED   = [ 0.00, 0.71, 0.40, 0.25];
  const SHARES_SQUEEZED  = [-0.12, 0.59, 0.28, 0.13];

  let slides   = [];
  let offset   = 0;
  let hovered  = -1;
  let sizes    = {};
  let busy     = false;
  let forward  = true;
  let timer    = null;

  const wrap = (i) => ((i % total) + total) % total;

  function createSlide(project) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'slide';
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-label', nameOf(project));
    el.innerHTML =
      `<img src="${projects[project].image}"` +
      (projects[project].large ? ` srcset="${projects[project].image} 720w, ${projects[project].large} 1440w" sizes="(min-width: 900px) 640px, 90vw"` : '') +
      ` alt="" draggable="false" decoding="async">` +
      `<span class="slide__name">${nameOf(project)}</span>`;

    const slide = { el, project };
    const column = () => slides.indexOf(slide) + offset;

    el.addEventListener('click', () => { if (column() > 0) step(column()); });
    el.addEventListener('mousemove', () => {
      if (column() !== hovered) { hovered = column(); paint(); }
    });
    return slide;
  }

  function measure() {
    const width  = view.clientWidth;
    const mobile = width < 640;
    const gap    = mobile ? 10 : 16;
    const slat   = mobile ? 5 : 8;
    const height = mobile ? Math.round(width * 0.66) : Math.round(Math.min(380, Math.max(260, width * 0.3)));

    const hero = Math.min(height * 16 / 9, width * (mobile ? 0.7 : 0.6));
    const room = width - hero - slats * slat * 2 - 3 * gap;

    sizes = { width, mobile, gap, slat, hero, room };
    root.style.setProperty('--height', height + 'px');
    root.style.setProperty('--image-width', Math.max(hero, height * 16 / 9) + 'px');
  }

  function widthOf(column) {
    if (column < 0 || column > 3) return sizes.slat;
    const hovering = hovered >= 0 && hovered <= 3 && !prefersReducedMotion;
    const shares = hovering ? (hovered === column ? SHARES_HOVERED : SHARES_SQUEEZED) : SHARES;
    return (column === 0 ? sizes.hero : 0) + sizes.room * shares[column];
  }

  function paint() {
    slides.forEach((slide, index) => {
      const column = index + offset;
      const width  = widthOf(column);
      const front  = column === 0;

      slide.el.style.width        = width + 'px';
      slide.el.style.marginLeft   = index === 0 ? '0' : (column < 4 ? sizes.gap : sizes.slat) + 'px';
      slide.el.style.borderRadius = Math.min(sizes.mobile ? 10 : 14, width / 2) + 'px';
      slide.el.classList.toggle('is-front', front);
      slide.el.setAttribute('aria-selected', front);
      slide.el.tabIndex = front ? 0 : -1;
    });
    strip.style.transform = `translateX(${offset * (sizes.slat + sizes.gap)}px)`;
  }

  function instantly(fn) {
    root.classList.add('is-instant');
    fn();
    void strip.offsetWidth;
    root.classList.remove('is-instant');
  }

  function showPanel(index) {
    counter.textContent = String(index + 1).padStart(2, '0');
    panels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', !active);
      panel.querySelectorAll('a').forEach((a) => { a.tabIndex = active ? 0 : -1; });
    });
  }

  function settle() {
    instantly(() => {
      const extra   = slides.length - visible;
      const removed = forward ? slides.splice(0, extra) : slides.splice(visible, extra);
      removed.forEach((slide) => slide.el.remove());
      offset = 0;
      paint();
    });
    busy = false;
  }

  function step(by) {
    if (total < 2 || by === 0) return;

    if (busy) { clearTimeout(timer); settle(); }
    busy = true;
    forward = by > 0;

    if (forward) {
      instantly(() => {
        for (let k = 0; k < by; k++) {
          const next = createSlide(wrap(slides[slides.length - 1].project + 1));
          slides.push(next);
          strip.appendChild(next.el);
        }
        paint();
      });
      offset -= by;
      paint();
      showPanel(slides[-offset].project);
    } else {
      const count = -by;
      instantly(() => {
        for (let k = 0; k < count; k++) {
          const prev = createSlide(wrap(slides[0].project - 1));
          slides.unshift(prev);
          strip.insertBefore(prev.el, strip.firstChild);
        }
        offset = -count;
        paint();
      });
      offset = 0;
      paint();
      showPanel(slides[0].project);
    }

    timer = setTimeout(settle, DURATION + 30);
  }

  function build() {
    strip.innerHTML = '';
    slides = [];
    offset = 0;
    for (let i = 0; i < visible; i++) {
      const slide = createSlide(wrap(i));
      slides.push(slide);
      strip.appendChild(slide.el);
    }
    instantly(paint);
  }

  root.querySelector('[data-next]').addEventListener('click', () => step(1));
  root.querySelector('[data-prev]').addEventListener('click', () => step(-1));

  strip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
  });

  view.addEventListener('mouseleave', () => { hovered = -1; paint(); });

  let touchStartX = null;
  view.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  view.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchStartX = null;
  });

  window.addEventListener('resize', () => { measure(); instantly(paint); });

  document.addEventListener('langchange', () => {
    slides.forEach(({ el, project }) => {
      el.setAttribute('aria-label', nameOf(project));
      el.querySelector('.slide__name').textContent = nameOf(project);
    });
  });

  measure();
  build();
  showPanel(0);
}

function initFilmstrip(root) {
  if (!root) return;

  const track   = root.querySelector('.film__track');
  const frames  = [...root.querySelectorAll('.film__frame')];
  const panels  = [...root.querySelectorAll('.film__panel')];
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const counter = root.querySelector('[data-counter]');

  let active = -1;
  let target = null;
  let settleTimer = 0;
  let frameRequest = 0;

  function setActive(index) {
    if (index === active) return;
    active = index;

    frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
    panels.forEach((panel, i) => {
      const on = i === index;
      panel.classList.toggle('is-active', on);
      panel.setAttribute('aria-hidden', !on);
      panel.querySelectorAll('a').forEach((a) => { a.tabIndex = on ? 0 : -1; });
    });

    counter.textContent = String(index + 1).padStart(2, '0');
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === frames.length - 1;
  }

  function nearestToCenter() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    frames.forEach((frame, i) => {
      const distance = Math.abs(frame.offsetLeft + frame.offsetWidth / 2 - center);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    });
    return best;
  }

  function goTo(index, behavior) {
    index = Math.max(0, Math.min(frames.length - 1, index));
    target = index;
    setActive(index);

    const frame = frames[index];
    const left  = frame.offsetLeft - (track.clientWidth - frame.offsetWidth) / 2;
    track.scrollTo({ left, behavior: behavior || (prefersReducedMotion ? 'auto' : 'smooth') });

    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 700);
  }

  function settle() {
    clearTimeout(settleTimer);
    target = null;
    setActive(nearestToCenter());
  }

  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 100);

    if (target === null && !frameRequest) {
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        setActive(nearestToCenter());
      });
    }
  }, { passive: true });

  track.addEventListener('scrollend', settle);

  ['pointerdown', 'wheel', 'touchstart'].forEach((type) => {
    track.addEventListener(type, () => { target = null; }, { passive: true });
  });

  frames.forEach((frame, i) => {
    frame.querySelector('.film__photo').addEventListener('click', () => {
      if (i !== active) goTo(i);
    });
  });

  const step = (delta) => goTo((target ?? active) + delta);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  track.addEventListener('keydown', (e) => {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    step(delta);
    frames[target ?? active].querySelector('.film__photo').focus({ preventScroll: true });
  });

  window.addEventListener('resize', () => goTo(active, 'auto'));

  setActive(0);
  requestAnimationFrame(() => goTo(0, 'auto'));
}

function initSportTimeline(section) {
  if (!section) return;

  const track = section.querySelector('.sport__track');
  const rail  = section.querySelector('.sport__rail');
  const line  = section.querySelector('.sport__line');
  const list  = section.querySelector('.sport__list');
  const steps = [...section.querySelectorAll('.step')];

  const verticalMode = window.matchMedia('(max-width: 860px), (prefers-reduced-motion: reduce)');

  let distance = 0;
  let ticking  = false;

  function layout() {
    if (verticalMode.matches) {
      section.style.height = '';
      track.style.transform = '';
    } else {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = window.innerHeight + distance * 0.85 + 'px';
    }
    update();
  }

  function update() {
    ticking = false;

    if (verticalMode.matches) {
      const threshold = window.innerHeight * 0.75;
      const box = list.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (threshold - box.top) / box.height));
      list.style.setProperty('--progress', progress.toFixed(3));
      steps.forEach((step) => step.classList.toggle('is-visible', step.getBoundingClientRect().top < threshold));
      return;
    }

    const box = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, -box.top / scrollable));
    track.style.transform = `translateX(${-progress * distance}px)`;

    const threshold = window.innerWidth * 0.72;
    const railBox = rail.getBoundingClientRect();
    line.style.width = Math.min(railBox.width - 10, Math.max(0, threshold - railBox.left)) + 'px';
    steps.forEach((step) => step.classList.toggle('is-visible', step.getBoundingClientRect().left < threshold));
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', layout);
  verticalMode.addEventListener('change', layout);

  const image = section.querySelector('.sport__img img');
  if (image && !image.complete) image.addEventListener('load', layout);

  layout();
}

function initActiveLinks() {
  const links = [...document.querySelectorAll('[data-nav], .case__toc a')];
  const targets = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('href').split('#')[1];
    const el = id && document.getElementById(id);
    if (el) targets.set(el, a);
  });
  if (!targets.size || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    let current = null;
    targets.forEach((a, el) => {
      if (visible.has(el) && (!current || el.offsetTop > current.offsetTop)) current = el;
    });
    links.forEach((a) => a.removeAttribute('aria-current'));
    if (current) targets.get(current).setAttribute('aria-current', 'true');
  }, { rootMargin: '-40% 0px -55% 0px' });
  targets.forEach((a, el) => observer.observe(el));
}

function initCasePage() {
  const box = document.querySelector('.case__video');
  if (box) {
    box.querySelector('.case__play').addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${box.dataset.video}?autoplay=1&rel=0`;
      frame.title = document.documentElement.lang === 'en' ? 'Demo video' : 'Vidéo de démonstration';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      box.replaceChildren(frame);
      box.classList.add('is-playing');
    });
  }

  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const big = dialog.querySelector('img');
  document.querySelectorAll('[data-full]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const small = btn.querySelector('img');
      big.src = btn.dataset.full;
      big.alt = small ? small.alt : '';
      dialog.showModal();
    });
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
}
