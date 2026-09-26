/* =====================================================================
   Portfolio - Tristan Muller
   JavaScript de la page (sans librairie).

   Sommaire
   1. Navigation (bordure au scroll + menu mobile)
   2. Apparition des éléments au scroll
   3. Carrousel des projets
   4. Pellicule des expériences
   5. Frise sportive
   ===================================================================== */

// Indique au CSS que le JavaScript est actif (sinon tout reste visible sans animation)
document.documentElement.classList.add('js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initReveal();
  initCarousel(document.getElementById('carousel'));
  initFilmstrip(document.getElementById('film'));
  initSportTimeline(document.getElementById('sport'));
});


/* =====================================================================
   1. NAVIGATION
   ===================================================================== */
function initNavigation() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('menu');

  // Fine bordure sous la barre dès qu'on a scrollé
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

  // Menu burger (mobile)
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
}


/* =====================================================================
   2. APPARITION AU SCROLL
   Chaque élément .reveal reçoit la classe .in quand il entre à l'écran.
   ===================================================================== */
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
      observer.unobserve(entry.target); // l'animation ne se joue qu'une fois
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms'; // léger décalage entre éléments voisins
    observer.observe(el);
  });
}


/* =====================================================================
   3. CARROUSEL DES PROJETS ("squeeze")

   Principe :
   - Les vignettes sont posées sur une bande horizontale (strip).
   - Chaque vignette occupe une "colonne" : 0 = projet affiché en grand,
     1 à 3 = aperçus de plus en plus étroits, au-delà = fines lamelles.
   - Pour avancer, on ajoute une vignette à la fin, on décale la bande
     d'un cran (animation CSS), puis on retire celle qui est sortie.
     La boucle est donc infinie sans jamais dupliquer tout le contenu.
   ===================================================================== */
function initCarousel(root) {
  if (!root) return;

  const view     = root.querySelector('.carousel__view');
  const strip    = root.querySelector('.carousel__strip');
  const panels   = [...root.querySelectorAll('.carousel__panel')];
  const counter  = root.querySelector('[data-counter]');
  const projects = [...root.querySelectorAll('.carousel__data li')].map((li) => ({
    image: li.dataset.img,
    name:  li.dataset.name,
  }));

  const total      = projects.length;
  const slats      = Math.max(1, Math.min(3, total - 4)); // nombre de lamelles à droite
  const visible    = 4 + slats;                            // vignettes présentes dans le DOM
  const DURATION   = prefersReducedMotion ? 0 : 1000;      // doit correspondre à --duration en CSS

  // Part de l'espace libre donnée à chaque colonne (0 à 3).
  // Au survol, la colonne visée s'élargit et ses voisines se serrent.
  const SHARES           = [-0.06, 0.61, 0.30, 0.15];
  const SHARES_HOVERED   = [ 0.00, 0.71, 0.40, 0.25];
  const SHARES_SQUEEZED  = [-0.12, 0.59, 0.28, 0.13];

  let slides   = [];   // { el, project } dans l'ordre de la bande
  let offset   = 0;    // colonne de la première vignette (négatif pendant une animation)
  let hovered  = -1;   // colonne survolée, -1 si aucune
  let sizes    = {};   // dimensions calculées dans measure()
  let busy     = false;
  let forward  = true;
  let timer    = null;

  const wrap = (i) => ((i % total) + total) % total; // index qui boucle

  /* ---------- Création d'une vignette ---------- */
  function createSlide(project) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'slide';
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-label', projects[project].name);
    el.innerHTML =
      `<img src="${projects[project].image}" alt="" draggable="false" loading="lazy">` +
      `<span class="slide__name">${projects[project].name}</span>`;

    const slide = { el, project };
    const column = () => slides.indexOf(slide) + offset;

    el.addEventListener('click', () => { if (column() > 0) step(column()); });
    el.addEventListener('mousemove', () => {
      if (column() !== hovered) { hovered = column(); paint(); }
    });
    return slide;
  }

  /* ---------- Calcul des dimensions (au chargement et au redimensionnement) ---------- */
  function measure() {
    const width  = view.clientWidth;
    const mobile = width < 640;
    const gap    = mobile ? 10 : 16;
    const slat   = mobile ? 5 : 8;
    const height = mobile ? Math.round(width * 0.66) : Math.round(Math.min(380, Math.max(260, width * 0.3)));

    // La grande vignette fait du 16:9, sans dépasser 60 % (70 % sur mobile) de la largeur
    const hero = Math.min(height * 16 / 9, width * (mobile ? 0.7 : 0.6));
    const room = width - hero - slats * slat * 2 - 3 * gap; // espace restant pour les colonnes 1 à 3

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

  /* ---------- Applique largeurs, marges et décalage de la bande ---------- */
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

  // Exécute fn sans animation (pour les recalages invisibles)
  function instantly(fn) {
    root.classList.add('is-instant');
    fn();
    void strip.offsetWidth; // force le navigateur à appliquer les styles avant de réactiver les transitions
    root.classList.remove('is-instant');
  }

  /* ---------- Affiche le texte du projet actif ---------- */
  function showPanel(index) {
    counter.textContent = String(index + 1).padStart(2, '0');
    panels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', !active);
      panel.querySelectorAll('a').forEach((a) => { a.tabIndex = active ? 0 : -1; });
    });
  }

  /* ---------- Après l'animation : on retire les vignettes sorties ---------- */
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

  /* ---------- Avance (by > 0) ou recule (by < 0) de "by" projets ---------- */
  function step(by) {
    if (total < 2 || by === 0) return;

    // Clic rapide pendant une animation : on termine la précédente tout de suite
    if (busy) { clearTimeout(timer); settle(); }
    busy = true;
    forward = by > 0;

    if (forward) {
      // On ajoute les vignettes suivantes à la fin, puis on fait glisser la bande
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
      // On ajoute les précédentes au début, décalées hors champ, puis on les fait revenir
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

  /* ---------- Premier affichage ---------- */
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

  /* ---------- Événements ---------- */
  root.querySelector('[data-next]').addEventListener('click', () => step(1));
  root.querySelector('[data-prev]').addEventListener('click', () => step(-1));

  strip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
  });

  view.addEventListener('mouseleave', () => { hovered = -1; paint(); });

  // Balayage au doigt
  let touchStartX = null;
  view.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  view.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchStartX = null;
  });

  window.addEventListener('resize', () => { measure(); instantly(paint); });

  measure();
  build();
  showPanel(0);
}


/* =====================================================================
   4. PELLICULE DES EXPÉRIENCES
   Le défilement repose sur le scroll natif + scroll-snap (fluide au doigt).
   La photo la plus proche du centre devient "active" : en couleur,
   avec son texte affiché en dessous.
   ===================================================================== */
function initFilmstrip(root) {
  if (!root) return;

  const track   = root.querySelector('.film__track');
  const frames  = [...root.querySelectorAll('.film__frame')];
  const panels  = [...root.querySelectorAll('.film__panel')];
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const counter = root.querySelector('[data-counter]');

  let active = -1;     // index de la photo active
  let target = null;   // photo visée pendant un défilement lancé par un bouton
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

  // Photo dont le centre est le plus proche du centre de la pellicule
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

  // Centre la photo "index" (et l'active tout de suite, sans attendre la fin du défilement)
  function goTo(index, behavior) {
    index = Math.max(0, Math.min(frames.length - 1, index));
    target = index;
    setActive(index);

    const frame = frames[index];
    const left  = frame.offsetLeft - (track.clientWidth - frame.offsetWidth) / 2;
    track.scrollTo({ left, behavior: behavior || (prefersReducedMotion ? 'auto' : 'smooth') });

    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 700); // sécurité si "scrollend" n'est pas supporté
  }

  // Fin du défilement : la photo au centre devient la référence
  function settle() {
    clearTimeout(settleTimer);
    target = null;
    setActive(nearestToCenter());
  }

  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 100);

    // Défilement au doigt / trackpad : on met à jour la photo active en direct
    if (target === null && !frameRequest) {
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        setActive(nearestToCenter());
      });
    }
  }, { passive: true });

  track.addEventListener('scrollend', settle);

  // Dès que l'utilisateur reprend la main, on oublie la cible des boutons
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


/* =====================================================================
   5. FRISE SPORTIVE

   Ordinateur : la section est rendue plus haute que l'écran ; pendant
   qu'on scrolle dedans, la frise (sticky) glisse vers la gauche et
   chaque étape apparaît en passant la ligne des 72 % de la largeur.

   Mobile : frise verticale ; la ligne se remplit (variable --progress)
   et les étapes apparaissent en passant les 75 % de la hauteur.
   ===================================================================== */
function initSportTimeline(section) {
  if (!section) return;

  const track = section.querySelector('.sport__track');
  const rail  = section.querySelector('.sport__rail');
  const line  = section.querySelector('.sport__line');
  const list  = section.querySelector('.sport__list');
  const steps = [...section.querySelectorAll('.step')];

  // Même condition que le media query mobile dans style.css
  const verticalMode = window.matchMedia('(max-width: 860px), (prefers-reduced-motion: reduce)');

  let distance = 0;     // distance horizontale à parcourir
  let ticking  = false;

  function layout() {
    if (verticalMode.matches) {
      section.style.height = '';
      track.style.transform = '';
    } else {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      // Hauteur de la section = écran + distance à parcourir (x 0,85 pour un défilement un peu plus rapide)
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

    // Avancement dans la section, de 0 (début) à 1 (fin)
    const box = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, -box.top / scrollable));
    track.style.transform = `translateX(${-progress * distance}px)`;

    // La ligne et les étapes suivent la ligne des 72 %
    const threshold = window.innerWidth * 0.72;
    const railBox = rail.getBoundingClientRect();
    line.style.width = Math.min(railBox.width - 10, Math.max(0, threshold - railBox.left)) + 'px';
    steps.forEach((step) => step.classList.toggle('is-visible', step.getBoundingClientRect().left < threshold));
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); } // max une mise à jour par image
  }, { passive: true });
  window.addEventListener('resize', layout);
  verticalMode.addEventListener('change', layout);

  // La largeur de la frise dépend de l'image : on recalcule une fois qu'elle est chargée
  const image = section.querySelector('.sport__img img');
  if (image && !image.complete) image.addEventListener('load', layout);

  layout();
}
