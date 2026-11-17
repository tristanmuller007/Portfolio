(() => {
  'use strict';

  const STORAGE_KEY = 'tm-lang';
  const LINKED_SITE = 'https://tristanmuller007.github.io/CV-Tristan-Muller/';

  const EN = {

    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.education": "Education",
    "nav.experience": "Experience",
    "nav.contact": "Contact",
    "nav.cv": "My CV",

    "hero.cta": "See my projects",
    "cv.pdf": "assets/cv/CV-Tristan-Muller-EN.pdf",
    "ih.next": "Next step",
    "ih.stage": "Internship",
    "ih.dates": "12 Apr → 18 Jun 2027",
    "ih.area": "Ain · Lyon · Grenoble<br>then BUT year-3 work-study",
    "ih.role": "Computer Science student",
    "ih.hint": "Move your cursor over my face to see the code",

    "about.title": "Curious, thorough <em>and solution-driven.</em>",
    "about.p1": "I spent <strong>15 years in South Africa</strong> before moving to France. After a <strong>high school diploma in engineering and technology</strong>, I started a Bachelor's in Computer Science, where I get hands-on with a bit of everything: web development, software development, object-oriented programming, databases, networking and embedded systems.",
    "about.p2": "What I enjoy most is taking an idea and turning it into <strong>something that actually works</strong>: a website, a web app, a tool people use every day.",
    "tools.label": "My toolkit",
    "tools.intro": "The languages and tools I use in class and on my own projects.",
    "tools.languages": "Languages <span>09</span>",
    "tools.dev": "Development <span>08</span>",
    "tools.network": "Networking <span>03</span>",
    "tools.embedded": "Embedded systems <span>03</span>",
    "tools.design": "Design &amp; planning <span>03</span>",
    "tools.systems": "Operating systems <span>04</span>",

    "projects.title": "Things I've <em>built.</em>",
    "projects.intro": "Projects from my Computer Science degree. The code is on my GitHub.",
    "p1.label": "University project · Year 1 · Real client",
    "p1.text": "Requirements analysis and design of a website for a real restaurant in Cape Town: site structure, visual identity and 11 responsive HTML/CSS pages (menu, specials, bookings, contact).",
    "p1.site": "View site →",
    "p2.label": "University project · Year 1 · Team of 3",
    "p2.title": "Choose-your-own-adventure book editor",
    "p2.text": "Desktop app to write, play and publish an interactive gamebook as a website: rich-text editor, health points and inventory, JSON saves, and HTML export with an interactive map.",
    "p3.label": "University project · Year 1 · Pair project",
    "p3.title": "Connect Four on ESP32",
    "p3.text": "Embedded game running on ESP32 boards with an LED matrix: 3 modes, including wireless two-player over ESP-NOW and a bot. I built the display and the networking.",
    "p3.video": "Video →",
    "p4.label": "University project · Year 1 · Game",
    "p4.text": "Educational memory game (flags, countries, anthems...): 3 difficulty levels, a Hell mode where the cards shuffle, saved leaderboard, two languages and dark mode. Built with object-oriented programming.",
    "p4.oop": "OOP",
    "p5.label": "University project · Year 1 · Team of 4",
    "p5.text": "Full specification for a veterinary clinic management web app: requirements, 8 modules, mock-ups, data dictionary, schedule and quote. I led the team and wrote the specification.",
    "p5.tag1": "Specification",
    "p5.tag2": "Mock-ups",
    "p5.tag3": "Project management",
    "p6.title": "Raspberry Pi web server",
    "p6.text": "Set up a web development environment: Apache server, PHP, MariaDB database, Git and a Bash backup script.",
    "p7.label": "University project · Year 1 · Team project",
    "p7.title": "Student cards for Open Days",
    "p7.text": "Promoting the university at its Open Days: student cards with a QR code linking to each student's personal website. Team design work and an automated Node.js pipeline (QR codes, SVG cards).",
    "p1.part": "Requirements, site structure, visual identity, HTML/CSS build.",
    "p2.part": "Built by three of us on one Git repository, from the object model to the web export.",
    "p3.part": "The LED matrix display and the ESP-NOW wireless link.",
    "p4.part": "Requirements, game logic and interface, testing and the final presentation.",
    "p5.part": "Coordinating the team and writing the specification.",
    "p6.part": "Installing and configuring the server, as a pair.",
    "p7.part": "Card design, as a team, and preparing the final presentation. The Node.js tool was written by another team member.",
    "idx1.c": "Website",
    "idx2.c": "Desktop app",
    "idx2.t": "Interactive Book Editor",
    "idx3.c": "Embedded system",
    "idx3.t": "Connect Four on ESP32",
    "idx4.c": "Game",
    "idx4.s": "Java · Processing · OOP",
    "idx5.c": "Specification",
    "idx5.s": "Specification · Mock-ups · Project management",
    "idx6.c": "Systems & networking",
    "idx6.t": "Raspberry Pi Web Server",
    "idx7.c": "Communication",
    "idx7.t": "Student Cards for Open Days",
    "projects.part": "My part",
    "projects.case": "Case study →",
    "projects.index": "All projects",
    "p6.label": "University project · Year 1 · Pair project",
    "projects.all": "All my GitHub repositories →",

    "edu.title": "How I <em>got here.</em>",
    "edu.but.text": "IUT Lyon 1, Bourg-en-Bresse campus · planning to specialise in web development. Web, Java, C++, databases, OOP, project management.",
    "edu.but": "Bachelor's in Computer Science (BUT)",
    "edu.current": "In progress",
    "edu.bac": "Baccalauréat STI2D - French high-school diploma (engineering &amp; technology)",
    "edu.bac.text": "Lycée de la Plaine de l'Ain, Ambérieu-en-Bugey, France",
    "edu.done": "Completed",
    "edu.lang": "Languages",
    "edu.lang.title": "English · French",
    "edu.lang.text": "English is my first language, after 15 years in South Africa.",
    "edu.bilingual": "Bilingual",

    "exp.title": "Where I've <em>worked.</em>",
    "exp.intro": "Jobs in France and South Africa that taught me to be thorough, work independently and deal with customers.",
    "e1.when": "July 2026 · Ain, France",
    "e1.title": "Production Operator (temp) <em>· Caps Packaging</em>",
    "e1.l1": "Plastic bottle manufacturing in an industrial plant",
    "e1.l2": "Ran 4 blow-moulding machines on my own and sorted the output",
    "e1.l3": "Quality checks every 2 to 4 hours and production tracking",
    "tag.autonomy": "Independence",
    "tag.multitask": "Multitasking",
    "tag.rigour": "Attention to detail",
    "tag.procedures": "Following procedures",
    "e1.link": "Visit Caps Packaging →",
    "e2.when": "Summer 2025 · Domaine du Grand Kohlberg, Alsace, France",
    "e2.title": "Farm Hand <em>· D. Gutzwiller Group</em>",
    "e2.l1": "Looked after more than 60 hectares on my own",
    "e2.l2": "Drove tractors and carried out preventive maintenance on machinery",
    "tag.organisation": "Organisation",
    "tag.maintenance": "Preventive maintenance",
    "e2.link": "Visit D. Gutzwiller Group →",
    "e3.when": "Summer 2023 · Vieux-Ferrette, Alsace, France",
    "e3.title": "Cheese Ageing Operator <em>· Fromagerie Antony</em>",
    "e3.l1": "Quality control to strict standards",
    "e3.l2": "Picking, packing and shipping customer orders",
    "tag.quality": "Quality control",
    "tag.standards": "Working to standards",
    "tag.logistics": "Logistics",
    "e3.link": "Visit Fromagerie Antony →",
    "e4.when": "Summers 2020 and 2021 · Cape Town, South Africa",
    "e4.title": "Waiter <em>· Sótano Seafood &amp; Sushi</em>",
    "e4.l1": "Greeting and serving guests",
    "e4.l2": "Taking and managing orders",
    "e4.l3": "Cleaning and setting up",
    "tag.service": "Customer service",
    "tag.stress": "Working under pressure",
    "tag.english": "English",
    "e4.link": "Visit Sótano Seafood &amp; Sushi →",
    "e5.when": "2016 - 2018 · Cape Town, South Africa",
    "e5.title": "Tennis Coach <em>· MTG Tennis</em>",
    "e5.l1": "Coached 30 young players per season",
    "e5.l2": "Planned and ran weekly training sessions",
    "tag.teaching": "Teaching",
    "tag.group": "Leading groups",
    "e5.link": "Visit MTG Tennis →",

    "sport.label": "Beyond the code",
    "sport.title": "10 years of <em>competition.</em>",
    "sport.intro": "Karate and tennis in South Africa: that's where I learnt discipline and how to keep going when it gets tough.",
    "sport.both": "Tennis · Karate",
    "sport.karate": "Karate",
    "s1.title": "Getting started",
    "s1.text": "Took up tennis and karate in South Africa.",
    "s.sa": "South African Champion",
    "s2.text": "First national title, under-11 category.",
    "s3.text": "National title, under-12 category.",
    "s.africa": "African Champion",
    "s4.text": "Continental title, won in Egypt.",
    "s5.text": "Continental title, under-18 category.",
    "s6.title": "World Championships",
    "s6.text": "Competed at the World Championships in Sweden.",
    "s7.title": "World Championships selection",
    "s7.text": "Selected for the World Championships held in South Africa.",
    "s8.title": "Competitive team",
    "s8.text": "Club handball in Ambérieu-en-Bugey, regional level.",

    "contact.role": "Computer Science student · IUT Lyon 1, France",
    "contact.status": "<i></i>Available · 12 April - 18 June 2027",
    "contact.cvpdf": "CV as PDF",
    "contact.download": "Download",
    "contact.cvweb": "Online CV",
    "contact.phone": "Phone",
    "contact.cv": "View the page",
    "footer.top": "Back to top ↑",

    "a11y.top": "Back to top",
    "a11y.skip": "Skip to content",
    "a11y.toc": "On this page",
    "a11y.more": "Other projects",
    "a11y.zoom": "Enlarged screenshot",
    "a11y.close": "Close",
    "a11y.nav": "Main navigation",
    "a11y.menu": "Open the menu",
    "a11y.photo": "Photo of Tristan Muller",
    "a11y.projects": "My projects",
    "a11y.carousel": "carousel",
    "a11y.prevProject": "Previous project",
    "a11y.nextProject": "Next project",
    "a11y.projectList": "Projects",
    "a11y.experience": "My work experience",
    "a11y.see.caps": "Show: Caps Packaging",
    "a11y.img.caps": "Caps Packaging logo over a production line",
    "a11y.see.gutzwiller": "Show: D. Gutzwiller Group",
    "a11y.img.gutzwiller": "Gutzwiller Group logo over an Alsace vineyard",
    "a11y.see.antony": "Show: Fromagerie Antony",
    "a11y.img.antony": "Fromagerie Antony logo over cheeses being aged",
    "a11y.see.sotano": "Show: Sótano Seafood & Sushi",
    "a11y.img.sotano": "Sótano restaurant logo over sushi being prepared",
    "a11y.see.mtg": "Show: MTG Tennis",
    "a11y.img.mtg": "MTG Tennis logo over a tennis court",
    "a11y.prevExp": "Previous job",
    "a11y.nextExp": "Next job",
    "a11y.sport": "Sporting background",
    "a11y.img.sport": "Karate and tennis"
  };

  const META = {
    fr: {
      title:       document.title,
      description: document.querySelector('meta[name="description"]').content,
    },
    en: {
      title:       document.documentElement.dataset.titleEn || 'Tristan Muller - Computer Science student',
      description: document.documentElement.dataset.descEn || 'Portfolio of Tristan Muller, Computer Science student at IUT Lyon 1, France. ' +
                   'Projects, work experience and contact details. Available for an internship from 12 April to 18 June 2027.',
    },
  };

  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const altNodes = [...document.querySelectorAll('img[data-alt-en]')];
  altNodes.forEach((img) => { img.dataset.altFr = img.alt; });
  const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')];

  textNodes.forEach((el) => { el.dataset.fr = el.innerHTML; });
  const pairs = (el) => el.dataset.i18nAttr.split(';').map((pair) => pair.split(':'));
  const frAttrs = new Map(attrNodes.map((el) => [
    el, Object.fromEntries(pairs(el).map(([attr]) => [attr, el.getAttribute(attr)])),
  ]));

  function initialLanguage() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl === 'fr' || fromUrl === 'en') return fromUrl;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') return saved;
    } catch (e) {}

    return (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  function setLanguage(lang, save) {
    const en = lang === 'en';

    textNodes.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = en && EN[key] !== undefined ? EN[key] : el.dataset.fr;
    });

    attrNodes.forEach((el) => {
      pairs(el).forEach(([attr, key]) => {
        el.setAttribute(attr, en && EN[key] !== undefined ? EN[key] : frAttrs.get(el)[attr]);
      });
    });

    altNodes.forEach((img) => { img.alt = en ? img.dataset.altEn : img.dataset.altFr; });
    document.documentElement.lang = lang;
    document.title = META[lang].title;
    document.querySelector('meta[name="description"]').content = META[lang].description;

    document.querySelectorAll(`a[href^="${LINKED_SITE}"]`).forEach((a) => {
      a.href = en ? `${LINKED_SITE}?lang=en` : LINKED_SITE;
    });

    document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
    });

    if (save) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    }

    window.i18n.lang = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    window.dispatchEvent(new Event('resize'));
  }

  window.i18n = { lang: 'fr' };

  document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang, true));
  });

  const start = initialLanguage();
  if (start !== 'fr') setLanguage(start, false);
})();
