# Portfolio - Tristan Muller

**Voir le site :** https://tristanmuller007.github.io/Portfolio/

## Contexte

Mon **portfolio personnel**, réalisé pendant mon **BUT Informatique** à l'**IUT Lyon 1 - site de Bourg-en-Bresse**.

Il présente mon parcours, mes compétences et mes projets, et sert de support pour ma recherche de **stage** (12 avril - 18 juin 2027) et d'**alternance** (BUT 3, rentrée 2027).

---

## Contenu

- **Accueil** : écran de chargement, portrait en grand et effet au survol qui révèle le visage écrit avec le vrai code de mes projets (WebGL, sans librairie), disponibilité pour le stage, CV en PDF
- **À propos** : parcours et boîte à outils, rangée par domaine avec les logos
- **Projets** : carrousel « squeeze » des 7 projets de BUT, puis la liste complète
- **Études de cas** : une page par projet dans `projects/` (contexte, objectif, démarche, fonctionnalités, ma contribution, captures)
- **Parcours** : formation et langues
- **Expériences** : pellicule photo avec les logos des entreprises
- **Sport** : frise horizontale animée au scroll
- **Contact** : carte de contact sur un écran d'ordinateur (téléphone sur mobile)

Le site est **bilingue français / anglais** : choix mémorisé, forçable avec `?lang=en` ou `?lang=fr`.

---

## Technique

- HTML, CSS et JavaScript, **sans framework**, hébergé sur **GitHub Pages**
- Images en **WebP**, vraies captures des projets, chargement différé, textes alternatifs dans les deux langues
- Responsive, menu mobile, lien actif selon la section affichée
- Code formaté avec **Prettier** (`.prettierrc`), sans style ni script en ligne dans le HTML
- Accueil optimisé pour mobile : rendu WebGL limité à la zone du portrait, animation en pause hors écran
- Accessibilité : lien d'évitement, focus visible, contrastes vérifiés, respect de `prefers-reduced-motion`
- SEO : Open Graph, données structurées, `sitemap.xml`, `robots.txt`, page 404

## Charte graphique

- Couleurs : **bleu pétrole `#03313A`** et **menthe `#8FFFE0`**, en thème sombre
- Typographies : **Space Grotesk** (titres), **Manrope** (texte), **JetBrains Mono** (étiquettes)

## Structure

```
index.html
projects/          une page par projet
css/style.css      tous les styles, rangés par section
js/main.js         navigation, carrousel, pellicule, frise, études de cas
js/intro.js        écran d'accueil : chargement, fond topographique, effet WebGL
js/i18n.js         traduction français / anglais
assets/
  data/            texte de code utilisé par l'effet de l'accueil
  cv/              CV en PDF (FR et EN)
  icons/           logos des outils et favicons
  img/             portrait, projets, expériences, image de partage
```

---

**Tristan Muller** - BUT Informatique, IUT Lyon 1 (Bourg-en-Bresse)
[GitHub](https://github.com/tristanmuller007) · [LinkedIn](https://www.linkedin.com/in/tristan-muller-info/)
