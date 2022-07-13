# Comparaisons

## WMR

[WMR](https://github.com/preactjs/wmr) de l’équipe Preact propose des fonctionnalités similaires, et le support de l’interface pour plugin de Rollup de Vite 2.0 en est inspiré.

WMR est surtout fait pour les projets [Preact](https://preactjs.com/), et propose des fonctionnalités plus intégrées, comme le pré-rendu. En termes de périmètre, il est plus proche d’un meta-framework Preact, avec le même accent sur l’idée de rester compact que Preact lui-même. Si vous utilisez Preact, WMR a de bonnes chances de vous offrir une expérience plus adaptée.

## @web/dev-server

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (autrefois `es-dev-server`) est un bon projet et le serveur basé sur Koa de Vite 1.0 en est inspiré.

`@web/dev-server` est un peu plus bas-niveau en termes de périmètre. Il ne fournit pas d’intégrations officielles pour les frameworks, et requiert de configurer manuellement Rollup pour la compilation de production.

De manière générale, Vite est un outil plus _opinionated_ / haut-niveau et vise à fournir des comportements par défaut qui conviennent la plupart du temps. Ceci étant dit, le projet `@web` contient beaucoup d’autres outils qui sont excellents et qui peuvent aussi être utiles pour les utilisateurs de Vite.

## Snowpack

[Snowpack](https://www.snowpack.dev/) était aussi un serveur de développement no-bundle reposant sur les bundles ES natifs qui est très similaire à Vite en termes de périmètre. Il n’est plus maintenu. L’équipe derrière Snowpack travaille maintenant sur [Astro](https://astro.build/), un constructeur de site statique qui repose sur Vite. L’équipe d’Astro contribue désormais à l’amélioration de Vite.

En dehors des détails d’implémentation qui diffèrent, les deux projets avaient beaucoup en commun en termes d’avantages techniques par rapport au tooling traditionnel. Le pré-bundling des dépendances de Vite est aussi inspiré de Snowpack v1 (qui est devenu [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)). Certaines des plus grosses différences entre les deux projets sont listées sur [la page comparaisons de la v2](https://v2.vitejs.dev/guide/comparisons).
