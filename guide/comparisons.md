# Comparaisons avec d’autres solutions no-bundler

## Snowpack

[Snowpack](https://www.snowpack.dev/) est aussi un serveur de développement no-bundle reposant sur les bundles ES natifs qui est très similaire à Vite en termes de périmètre. En dehors des détails d’implémentation qui diffèrent, les deux projets ont beaucoup en commun en termes d’avantages techniques par rapport au tooling traditionnel. Le pré-bundling des dépendances de Vite est aussi inspiré de Snowpack v1 (qui est devenu [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)). Les plus grosses différences entre les deux projets sont :

**Compilation de production**

La sortie de compilation par défaut de Snowpack n’est pas un bundle : il transforme chaque fichier en plusieurs modules compilatés, qui peuvent ensuite être passés à différents « optimisateurs » (_"optimizers"_) qui s’occupent du bundling. L’intérêt est que vous pouvez choisir entre différents bundlers finaux pour répondre à des besoins spécifiques (par exemple, webpack, Rollup, et même esbuild), et le côté pervers est que l’expérience est relativement fragmentée — par exemple, l’optimisateur esbuild est toujours instable, l’optimisateur Rollup n’est pas maintenu officiellement, et différents optimisateurs ne rendent pas la même chose en sortie et ne sont pas configurés de la même façon.

Vite choisit d’avoir une intégration plus poussée d’un seul bundler (Rollup) afin de fournir une expérience plus structurée. Cela permet aussi à Vite de proposer une [API universelle pour plugin](./api-plugin) qui fonctionne à la fois pour le développement et pour la compilation.

Grâce au process de compilation plus intégré, Vite supporte quelques fonctionnalités qui ne sont pour l’instant pas disponibles avec les optimisateurs de compilation de Snowpack :

- [Support du multi-pages](./build#application-multi-pages)
- [Mode librairie](./build#mode-librairie)
- [Fractionnement (_code splitting_) automatique du CSS](./features#fractionnement-code-splitting-du-css)
- [Optimisation du chargement des morceaux (_chunks_) asynchrones](./features#optimisation-du-chargement-des-morceaux-asynchrones)
- [Plugin legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) officiel qui génère deux bundles (un pour les navigateurs récents et un pour les navigateurs anciens) et livre automatiquement le bon bundle suivant le support navigateur.

**Pré-bundling des dépendances plus rapide**

Vite utilise [esbuild](https://esbuild.github.io/) plutôt que Rollup pour le pré-bundling des dépendances. Cela permet d’importantes améliorations en termes de performance au niveau du démarrage du serveur à froid et du re-bundling des dépendances invalidées.

**Support du monorepo**

Vite est fait pour permettre de manipuler des configurations monorepo et nous avons des utilisateurs qui ont réussi à l’utiliser pour des monorepos basés sur Yarn, Yarn 2 et PNPM.

**Support des préprocesseurs CSS**

Vite fournit un support plus fin de Sass et de Less, avec une meilleure résolution des `@import` (alias et dépendances npm) et la [réécriture automatique des `url()` des fichiers mis inline](./features#mise-inline-et-reecriture-de-la-base-pour-import).

**Support de première classe pour Vue**

Vite a été créé à l’origine pour être la fondation du futur du tooling [Vue.js](https://vuejs.org/). Même si depuis la 2.0 Vite n’est lié à aucun framework en particulier, le plugin officiel Vue fournit toujours un support de première classe aux composants à fichier unique (_Single File Component_) de Vue, et supporte toutes les fonctionnalités avancées comme la résolution des références de ressources, `<script setup>`, `<style module>`, les blocs custom et plus encore. De plus, Vite gère finement le remplacements des modules à la volée (_HMR_) pour les composants à fichier unique. Par exemple, modifier le `<template>` ou le `<style>` d’un composant à fichier unique enclenchera le remplacement à la volée sans remettre son état à zéro.

## WMR

[WMR](https://github.com/preactjs/wmr) de l’équipe Preact propose des fonctionnalités similaires, et le support de l’interface pour plugin de Rollup par Vite en est inspiré.

WMR est surtout fait pour les projets [Preact](https://preactjs.com/), et propose des fonctionnalités plus intégrées, comme le pré-rendu. En termes de périmètre, il est plus proche d’un meta-framework Preact, avec le même accent sur l’idée de rester compact que Preact lui-même. Si vous utilisez Preact, WMR a de bonnes chances de vous offrir une expérience plus adaptée.

## @web/dev-server

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (autrefois `es-dev-server`) est un bon projet et le serveur basé sur Koa de Vite 1.0 en est inspiré.

`@web/dev-server` est un peu plus bas-niveau en termes de périmètre. Il ne fournit pas d’intégrations officielles pour les frameworks, et requiert de configurer manuellement Rollup pour la compilation de production.

De manière générale, Vite est un outil plus _opinionated_ / haut-niveau et vise à fournir des comportements par défaut qui conviennent la plupart du temps. Ceci étant dit, le projet `@web` contient beaucoup d’autres outils qui sont excellents et qui peuvent aussi être utiles pour les utilisateurs de Vite.
