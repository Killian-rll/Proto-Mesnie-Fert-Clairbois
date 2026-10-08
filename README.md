# Site web — Les Féodales de Clairbois / La Mesnie de la Ferté-Clairbois

Site de l'association, construit autour des Féodales de Clairbois : dates, infos pratiques, artisans, troupes, actualités, galerie, adhésion, contact, pages légales.

Site **statique** (HTML / CSS / JavaScript), sans framework ni dépendance : rapide, gratuit à héberger, simple à maintenir.

## Arborescence

```
src/
  layout.html          ← en-tête, menu, pied de page (communs à toutes les pages)
  partials/            ← blocs réutilisés (logos partenaires, icônes)
  pages/*.html         ← le contenu de chaque page
assets/
  css/style.css        ← toute la mise en forme
  js/config.js         ← ★ MOIS, HORAIRES ET TARIF DES FÉODALES (à modifier facilement)
  js/main.js           ← comportements (menu, compte à rebours, galerie, formulaires…)
  img/                 ← photos (img/mini = versions légères pour les vignettes)
  img/_sources/        ← photos d'origine (non publiées)
  img/partenaires/     ← logos des partenaires (bandeau défilant)
build.mjs              ← assemble les pages dans dist/
serve.mjs              ← petit serveur local pour prévisualiser
dist/                  ← LE SITE FINAL, à mettre en ligne
```

## Utilisation

Prérequis : [Node.js](https://nodejs.org) (version 18 ou plus).

```bash
node build.mjs           # génère le site dans dist/
node build.mjs --serve   # génère + ouvre un aperçu sur http://localhost:4321
```

Après chaque modification dans `src/` ou `assets/`, relancer `node build.mjs`.

## Modifier les Féodales

Ouvrir `assets/js/config.js` :

- Les dates sont **calculées automatiquement** : 2ᵉ week-end de chaque mois listé dans `mois` (actuellement avril à août). Le site passe tout seul à la saison suivante après la dernière date.
- Décaler une date : `exceptions: { "2027-05": "2027-05-15" }` (date du samedi).
- Annuler une date : `annulations: ["2027-08"]`.
- Horaires et tarif : `horaires`, `tarif` (penser aussi aux textes des pages `index.html` et `feodales.html`).

## Ajouter un partenaire

Déposer son logo dans `assets/img/partenaires/` puis l'ajouter dans `src/partials/partenaires.html` (dans les **deux** groupes, pour que le défilement soit continu).

## Ajouter une actualité

Dans `src/pages/actualites.html`, copier un bloc `<article class="actu">…</article>` et le modifier. Mettre à jour aussi les 3 dernières actualités dans `src/pages/index.html`.

## Ajouter des photos à la galerie

1. Déposer la photo dans `assets/img/` (largeur conseillée : 1600 px) et une version réduite (720 px) dans `assets/img/mini/`.
2. Dans `src/pages/galerie.html`, copier un bloc `<figure class="galerie__item">` et changer le nom du fichier, la légende et la catégorie (`feodales` ou `domaine`).

## Formulaires

Sans configuration, les formulaires ouvrent la messagerie du visiteur avec le message pré-rempli.
Pour un envoi direct (recommandé), créer un formulaire gratuit sur [Formspree](https://formspree.io) ou [Web3Forms](https://web3forms.com) et coller l'adresse obtenue dans l'attribut `action=""` des formulaires (`contact.html`, `nous-rejoindre.html`, `layout.html` pour la lettre d'information du pied de page).

## Mise en ligne

Envoyer **le contenu du dossier `dist/`** chez l'hébergeur :

- **Netlify** / **Cloudflare Pages** (gratuit) : glisser-déposer le dossier `dist/`.
- **OVH / o2switch** : transférer `dist/` par FTP dans le dossier `www/`.

Penser à mettre à jour l'adresse du site dans `build.mjs` (`SITE.url`) pour le référencement.

