---
sidebar: false
---

# Sortie de Vite 2.0

<p style="text-align:center">
  <img src="/logo.svg" style="height:200px">
</p>

Nous sommes très heureux d’annoncer aujourd’hui la sortie officielle de Vite 2.0 !

Vite (du mot français) est un outil de compilation web front-end d’un nouveau genre. Vous pouvez le voir comme un combo entre un serveur de développement pré-configuré et un bundler, mais en plus léger et plus rapide. Il s’appuie sur le support des [modules ES natifs](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules) de votre navigateur et sur des outils écrits dans des langages compilés comme [esbuild](https://esbuild.github.io/) pour fournir une expérience de développement vive et moderne.

Pour vous faire une idée d’à quel point Vite est rapide, regardez cette [comparaison vidéo](https://twitter.com/amasad/status/1355379680275128321) entre démarrer une application React sur Repl.it en utilisant Vite et en utilisant `create-react-app` (CRA).

Si vous n’aviez jamais entendu parler de Vite jusqu’ici et que vous voudriez en savoir plus, nous avons une page expliquant les [raisons qui motivent le projet](/guide/why.html). Si vous vous demandez en quoi Vite diffère des outils similaires, nous avons aussi une page de [comparaisons](/guide/comparisons.html).

## Les nouveautés de la version 2.0

Puisque nous avons décidé de complètement retravailler la logique interne avant que la 1.0 ne sorte de RC, il s’agit en fait de la première version stable de Vite. Ceci étant dit, Vite 2.0 apporte de nombreuses améliorations par rapport à son incarnation précédente :

### Noyau indépendant du framework

L’idée derrière Vite a démarré par un [prototype un peu bancal servant des composants à fichier unique de Vue à travers les modules ES natifs](https://github.com/vuejs/vue-dev-server). Vite 1 était le prolongement de cette idée et ajoutait le rafraîchissement des modules à la volée.

Vite 2.0 capitalise sur ce que nous avons appris en cours de route et il a été complètement redesigné pour disposer d’une architecture interne plus robuste. Il est désormais entièrement indépendant du framework utilisé, et tout ce qui est spécifique aux frameworks est délégué aux plugins. Il y a maintenant des [templates officiels pour Vue, React, Preact, Lit Element](https://github.com/vitejs/vite/tree/main/packages/create-vite) et la communauté travaille en ce moment même à l’intégration de Svelte.

### Nouveau format de plugins et API

Le nouveau système de plugins, inspiré par [WMR](https://github.com/preactjs/wmr), étend l’interface pour plugins de Rollup et est [compatible avec beaucoup de plugins Rollup](https://vite-rollup-plugins.patak.dev/) sans qu’il n’y ait besoin d’adaptations. Les plugins peuvent utiliser les hooks de Rollup, ainsi que des hooks et des propriétés supplémentaires spécifiques à Vite (par exemple pour différencier entre développement et compilation ou pour gérer différemment le rafraîchissement des modules à la volée).

L’[API programmatique](/guide/api-javascript.html) a également été beaucoup améliorée pour faciliter l’apparition d’outils ou de frameworks de plus haut niveau par-dessus Vite.

### Pré-bundling des dépendances à l’aide d’esbuild

Puisque Vite est un serveur de développement basé sur les modules ES natifs, il pré-bundle les dépendances pour réduire le nombre de requêtes et gérer les conversions de CommonJS en des modules ES. Auparavant, Vite effectuait cette opération à l’aide de Rollup, et pour cette 2.0 il utilise désormais `esbuild`, ce qui permet une diminution entre 10 et 100 fois de la durée de cette phase. À titre d’exemple, démarrer à froid une application de test avec de grosses dépendances comme React Material UI prenait auparavant 28 secondes sur un Macbook Pro à processeur M1, et cela prend désormais environ 1,5 secondes. Attendez-vous à des améliorations de cet ordre-là si votre setup actuel utilise un bundler traditionnel.

### Support privilégié de CSS

Vite réserve un traitement de faveur à CSS et supporte les fonctionnalités suivantes directement :

- **Modification par le résolveur** : les chemins en `@import` ou `url()` dans le CSS sont modifiés à l’aide du résolveur de Vite afin de respecter les alias et les dépendances npm.
- **Réécriture de la base des URLs** : les chemis en `url()` voient leur base automatiquement réécrite, peu importe où se trouve le fichier importé.
- **Fractionnement (_code splitting_) du CSS** : un morceau (_chunk_) en JS émet également le CSS correspondant, qui sera automatiquement chargé en parallèle de ce dernier.

### Support du rendu côté serveur (_SSR_)

Vite 2.0 est livré avec le [support expérimental du rendu côté serveur](/guide/ssr.html). Vite fournit des APIs afin de charger et de mettre à jour efficacement le code source sous forme de modules ES en Node.js pendant le développement (presque comme du rafraîchissement de modules à la volée côté serveur), et externalise automatiquement les dépendances compatibles avec CommonJS pour rendre la compilation plus rapide. Le serveur de production peut être complètement découplé de Vite, et le même setup peut être facilement adapté pour permettre le pré-rendu / la génération statique (_SSG_).

Le rendu côté serveur de Vite est proposé comme une fonctionnalité bas-niveau, et nous nous attendons à ce que des frameworks plus haut-niveau s’appuient dessus.

### Support sélectif des navigateurs plus anciens

Vite ne s’occupe par défaut que des navigateurs proposant le support natif des modules ES, mais vous pouvez également choisir d’activer le support des navigateurs plus anciens à l’aide du plugin officiel [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). Ce plugin génère automatiquement deux bundles (un moderne, un ancien), et choisit celui à fournir d’après la détection de fonctionnalités, ce qui permet d’assurer un code plus efficace dans les navigateurs modernes qui le supportent.

## Essayez par vous-même !

Tout ça fait beaucoup de fonctionnalités, mais commencer un projet à l’aide de Vite est simple ! Vous pouvez démarrer un projet basé sur Vite en littéralement une minute, en commençant par la commande suivante (assurez-vous de disposer de Node ⩾ 12) :

```bash
npm init @vitejs/app
```

Ensuite, vous pouvez suivre [ce guide](/guide/) pour voir ce que Vite a à proposer. Vous pouvez également voir le code source sur [GitHub](https://github.com/vitejs/vite), suivre les mises à jour sur [Twitter](https://twitter.com/vite_js), ou venir discuter avec d’autres utilisateurs de Vite sur le [serveur Discord](http://chat.vitejs.dev/).
