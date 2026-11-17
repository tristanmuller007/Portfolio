(() => {
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CV_SITE = 'https://tristanmuller007.github.io/CV-Tristan-Muller/';
  const altFr = new WeakMap();
  const meta = document.querySelector('meta[name="description"]');
  const store = { title: doc.dataset.titleFr || document.title, desc: meta ? meta.content : '' };

  const setLang = (lang, save) => {
    doc.lang = lang;
    if (save) {
      try { localStorage.setItem('tm-lang', lang); } catch (e) {}
    }
    const en = lang === 'en';
    document.title = en ? doc.dataset.titleEn : store.title;
    if (meta) meta.content = en ? doc.dataset.descEn : store.desc;
    document.querySelectorAll('img[data-alt-en]').forEach((img) => {
      if (!altFr.has(img)) altFr.set(img, img.alt);
      img.alt = en ? img.dataset.altEn : altFr.get(img);
    });
    document.querySelectorAll('[data-set-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
    });
    document.querySelectorAll(`a[href^="${CV_SITE}"]`).forEach((a) => {
      a.href = en ? `${CV_SITE}?lang=en` : `${CV_SITE}?lang=fr`;
    });
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
  };

  setLang(doc.lang === 'en' ? 'en' : 'fr', false);
  document.querySelectorAll('[data-set-lang]').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.setLang, true));
  });

  const nav = document.getElementById('nav');
  const bar = document.querySelector('.progress span');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (burger && nav) {
    const close = () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', close);
  }

  const watch = (links, attr) => {
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute('href').split('#')[1];
      const el = id && document.getElementById(id);
      if (el) map.set(el, a);
    });
    if (!map.size || !('IntersectionObserver' in window)) return;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      let best = null;
      map.forEach((a, el) => {
        if (visible.has(el) && (!best || el.offsetTop > best.offsetTop)) best = el;
      });
      if (!best) return;
      links.forEach((a) => a.removeAttribute(attr));
      map.get(best).setAttribute(attr, 'true');
    }, { rootMargin: '-35% 0px -55% 0px' });
    map.forEach((a, el) => io.observe(el));
  };
  if (document.querySelector('.hero')) watch([...document.querySelectorAll('[data-nav]')], 'aria-current');
  watch([...document.querySelectorAll('.toc a')], 'aria-current');

  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.card[data-cat]');
  const status = document.getElementById('filter-status');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let n = 0;
      cards.forEach((c) => {
        const show = f === 'all' || c.dataset.cat === f;
        c.hidden = !show;
        if (show) {
          n += 1;
          c.classList.add('is-in');
        }
      });
      if (status) status.textContent = doc.lang === 'en' ? `${n} project${n > 1 ? 's' : ''} shown` : `${n} projet${n > 1 ? 's' : ''} affiché${n > 1 ? 's' : ''}`;
    });
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-done');
        setTimeout(() => btn.classList.remove('is-done'), 2000);
      } catch (e) {
        location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });

  document.querySelectorAll('.video').forEach((box) => {
    const play = box.querySelector('.video__play');
    play.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.video}?autoplay=1&rel=0`;
      f.title = doc.lang === 'en' ? 'Connect Four on ESP32 demo video' : 'Vidéo de démonstration du Puissance 4 sur ESP32';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.replaceChildren(f);
    });
  });

  const lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-full]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        lbImg.src = btn.dataset.full;
        lbImg.alt = img ? img.alt : '';
        lb.showModal();
      });
    });
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.closest('[data-close]')) lb.close();
    });
  }
})();
