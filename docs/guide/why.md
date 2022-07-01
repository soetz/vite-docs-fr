# Pourquoi utiliser Vite ?

## Les problèmes

Avant que les modules ES ne soient disponibles dans les navigateurs, les développeurs n’avaient aucun moyen d’écrire du JavaScript de façon modulaire. C’est la raison pour laquelle nous sommes désormais tous familiers du concept de « bundling » : utiliser des outils qui parcourent, processent et concatènent nos modules source en des fichiers qui peuvent être exécutés par le navigateur.

Au fil du temps des outils comme [webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org) et [Parcel](https://parceljs.org/) ont été développés, et ils ont grandement amélioré l’expérience de développement des développeurs front-end.

Ceci dit, les applications devenant de plus en plus ambitieuses, la quantité de JavaScript avec laquelle nous devons traiter a elle aussi grandi exponentiellement. Il n’est pas rare pour les projets de grande envergure de contenir des milliers de modules. À tel point que le tooling JavaScript fait désormais face à un problème sur le plan de la performance : rien que pour démarrer un serveur de développement, il faut souvent attendre un bon moment (parfois de l’ordre de plusieurs minutes !), et même avec le rafraîchissement des modules à la volée (_HMR_), les modifications de fichiers peuvent prendre quelques secondes pour être répercutées dans le navigateur. Le fait de devoir attendre pour constater les répercussions d’une modification peut grandement miner la productivité et la bonne volonté des développeurs.

Vite a pour but de régler ces problèmes en s’appuyant sur les dernières avancées de l’écosystème : la possibilité d’utiliser des modules ES natifs dans le navigateur, et l’apparition d’outils JavaScripts écrits à l’aide de langages compilés.

### Démarrage lent du serveur

Lorsque vous démarrez le serveur de développement à froid, si votre configuration de compilation est basée sur un bundler, il doit rapidement crawler puis compiler toute votre application avant qu’elle ne puisse être servie.

Vite raccourcit la durée du démarrage du serveur en divisant d’abord les modules d’une application en deux catégories : les **dépendances** et le **code source**.

- Les **dépendances** consistent le plus souvent en du JavaScript qui ne change pas pendant le développement. Certaines dépendances d’une taille conséquente (par exemple les librairies de composants comportant des centaines de modules) sont aussi relativement coûteuses à traiter. Elles peuvent également être distribuées dans divers formats de modules (par exemple les modules ES ou CommonJS).

  Vite [pré-bundle les dépendances](./dep-pre-bundling) à l’aide d’[esbuild](https://esbuild.github.io/). esbuild est écrit en Go et pré-bundle les dépendances 10 à 100 fois plus vite que les bundlers écrits en JavaScript.

- Le **code source** consiste le plus souvent en du JavaScript reposant sur des librairies qui sera amené à être transformé (par exemple du JSX, du CSS ou des composants Vue/Svelte), et à être édité très souvent. Notons aussi que l’entierté du code source ne devra sûrement pas être chargée au même moment (typiquement en raison du découpage en routes).

  Vite sert le code source à travers les [modules ES natifs](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules). Cela consiste essentiellement à laisser le navigateur prendre en charge une partie du travail d’un bundler : Vite n’a plus qu’à transformer et servir le code source lorsque le navigateur le demande. Le code résultant d’imports dynamiques n’est traité que s’il est effectivement utilisé sur l’écran actuel.

  ![bundler based dev server](/images/bundler.png)

  ![esm based dev server](/images/esm.png)

### Rafraîchissement lent

Quand un fichier est édité dans le contexte d’une configuration de compilation basée sur un bundler, il est inefficace de refaire la compilation de zéro, pour des raisons évidentes : la durée de rafraîchissement va augmenter linéairement en fonction de la taille de l’application.

Certains serveurs de développement de bundlers gardent leurs opérations en mémoire, et peuvent ainsi invalider seulement une certaine partie du graphe des modules lorsqu’un fichier est modifié, mais il y a toujours besoin de reconstruire l’intégralité du bundle et de recharger la page web. Reconstruire le bundle est coûteux, et recharger la page ne permet pas de conserver l’état de l’application. C’est la raison pour laquelle certains bundlers supportent le remplacement de modules à la volée (_hot module replacement_ ou _HMR_) : cela permet de rafraîchir un module « à chaud », sans affecter le reste de la page. Cela améliore grandement l’expérience de développement – cependant, en pratique nous avons remarqué que même la vitesse des mises à jour à la volée se détériore nettement en fonction de la taille de l’application.

Avec Vite, le remplacement des modules à la volée est effectué à travers les modules ES natifs. Quand un fichier est édité, Vite peut invalider seulement précisément le module correspondant ainsi que le code environnant s’il y a lieu, ce qui permet de rendre le rafraîchissement à la volée rapide en toutes circonstances, peu importe la taille de votre application.

Vite se sert également des en-têtes HTTP pour accélérer le rechargement de la page (encore une fois, l’idée est de faire faire la plus grosse partie du travail au navigateur) : les requêtes pour des modules de code source sont rendues conditionnelles à l’aide de `304 Not Modified`, et les requêtes pour des modules de dépendances sont mises en cache à l’aide de `Cache-Control: max-age=31536000,immutable`.

Une fois que vous aurez vu à quel point Vite est rapide, nous doutons fortement que vous voudrez développer avec un bundler classique à nouveau.

## Pourquoi faire un bundle de production ?

Même si les modules ES natifs sont désormais largement supportés, les utiliser en production sans bundling reste inefficace (même avec HTTP/2) à cause des allers-retours causés par les imports imbriqués. Pour obtenir une meilleure performance de chargement en production, il reste plus efficace de bundler votre code en éliminant le code inutile (_tree-shaking_), en usant du chargement opportun (_lazy loading_) et du fractionnement en morceaux (_common chunk splitting_) (qui permet de favoriser la mise en cache).

Il n’est pas simple de concilier le fait de rendre une compilation optimisée et d’assurer que le comportement en développement et en production soit cohérent. C’est la raison pour laquelle Vite fournit une [commande de compilation](./build) qui inclut directement de nombreuses [optimisations de performance](./features#optimisations-de-la-compilation).

## Pourquoi ne pas utiliser esbuild pour le bundle ?

Bien qu’`esbuild` soit très rapide et permette déjà de bundler des librairies, certaines fonctionnalités nécessaires pour bundler des _applications_ sont toujours en cours de développement — en particulier le fractionnement du code et la gestion du CSS. Pour le moment, Rollup est plus mature et flexible à ces égards. Ceci dit, nous n’excluons pas d’utiliser `esbuild` pour la compilation de production une fois que ces sujets seront traités.

## En quoi Vite diffère-t-il de … ?

Vous pouvez vous rendre à la [section Comparaisons](./comparisons) pour plus de détails sur la façon dont Vite diffère des autres outils similaires.
