# Portfolio - Tristan Muller

**Voir le site :** https://tristanmuller007.github.io/Portfolio/

## Contexte

Mon **portfolio personnel**, réalisé pendant mon **BUT Informatique** à l'**IUT Lyon 1 - site de Bourg-en-Bresse**.

Il présente mon parcours, mes compétences et mes projets réalisés en BUT, et sert de support pour ma **recherche de stage** (avril - juin 2027).

---

## Objectifs

- Présenter clairement **qui je suis** et **ce que je cherche**
- Mettre en avant mes **projets** avec des liens vers le code
- Avoir un site **rapide, lisible et responsive**, sans framework
- Soigner la **direction artistique** (couleurs, typographies, mise en page)

---

## Sections du site

- **Accueil** : présentation et disponibilité pour un stage
- **À propos** : parcours et boîte à outils (langages, développement, réseau, systèmes embarqués, conception, systèmes) avec logos
- **Projets** : carrousel des projets réalisés en BUT (HQ Steakhouse & Bar, éditeur de livre interactif en Qt, Puissance 4 sur ESP32, Memorizz, VetClinic, serveur web sur Raspberry Pi, cartes étudiantes pour les JPO)
- **Parcours** : formation et langues
- **Expériences** : galerie façon pellicule photo avec les logos des entreprises
- **Sport** : frise horizontale animée au scroll (karaté, tennis, handball)
- **Contact** : carte de contact affichée sur un écran d'ordinateur

---

## Charte graphique

- Couleurs : **bleu pétrole `#03313A`** et **menthe `#8FFFE0`**, en thème sombre
- Typographies : **Space Grotesk** (titres), **Manrope** (texte), **JetBrains Mono** (étiquettes)

---

## Structure du projet

```
Portfolio/
├── index.html          # contenu de la page, une section par partie du site
├── css/
│   └── style.css       # styles, organisés dans l'ordre de la page (sommaire en haut du fichier)
├── js/
│   └── main.js         # interactions : menu, apparitions, carrousel, pellicule, frise
└── assets/
    ├── img/            # photos des projets et des expériences, MacBook
    └── icons/          # logos des langages et outils (SVG)
```

---

## Implémentation

- **HTML, CSS et JavaScript natifs**, sans framework ni librairie
- **CSS Grid / Flexbox**, variables CSS, design **responsive** (menu burger sur mobile)
- Nommage des classes proche de **BEM** (`.carousel__panel`, `.btn--solid`, `.is-active`)
- **Carrousel "squeeze"** des projets : largeurs calculées en JS, animations en CSS, boucle infinie
- **Pellicule** des expériences : défilement natif avec `scroll-snap`, effet négatif avec les filtres CSS
- **Frise sportive** horizontale pilotée par le scroll (section `sticky`), verticale sur mobile
- **Carte de contact** dans un MacBook, dimensionnée avec les unités de conteneur (`cqw`) ; elle devient un téléphone sur mobile
- Logos affichés en **masque CSS** : un seul fichier SVG par logo, couleur modifiable au survol
- Animations d'apparition avec **IntersectionObserver**, désactivées si l'utilisateur préfère moins d'animations
- Logos des outils : [Simple Icons](https://simpleicons.org/) · Photos : [Unsplash](https://unsplash.com/)
- Hébergé avec **GitHub Pages**

---

## Suite du projet

- version anglaise (bouton FR / EN)
- pages de détail pour chaque projet
- ajout des nouveaux projets

---

## Auteur

**Tristan Muller** - BUT Informatique, IUT Lyon 1 (Bourg-en-Bresse)
[GitHub](https://github.com/tristanmuller007) · tristan@familymuller.me
