# Pré-bundler des dépendances

Lors du premier lancement de `vite`, vous aurez peut-être remarqué ce message :

```
Optimizable dependencies detected:
react, react-dom
Pre-bundling them to speed up dev server page load...
(this will be run only when your dependencies have changed)
```

> Dépendances optimisables détectées : react, react-dom. Nous sommes en train de les pré-bundler pour accélérer le chargement des pages du serveur de développement… (cela ne sera effectué que lorsque vos dépendances changent)

## Pourquoi

À ce moment-là, Vite effectue ce qu’on appelle le « pré-bundling des dépendances ». Cela a deux intérêts :

1. **La compatibilité avec CommonJS et UMD :** Pendant le développement, le serveur de développement de Vite sert tout le code en tant que modules ES natifs. Ainsi, Vite doit d’abord convertir les dépendances qui sont livrées en CommonJS ou en UMD en modules ES.

   Lors de la conversion de dépendances CommonJS, Vite effectue une analyse des imports afin que les imports nommés vers des modules CommonJS fonctionnent comme prévu même si les exports sont assignés dynamiquement (comme c’est le cas avec React)

   ```js
   // fonctionne comme prévu
   import React, { useState } from 'react'
   ```

2. **La performance :** Vite convertit les dépendances ESM ayant beaucoup de modules internes en un module unique pour améliorer la performance de chargement.

   Certains packages fournissent leurs modules compilés sous format ES en plein de fichiers différents qui s’importent les uns les autres. Par exemple, [`lodash-es` a plus de 600 modules internes](https://unpkg.com/browse/lodash-es/) ! Lorsque l’on écrit `import { debounce } from 'lodash-es'`, le navigateur doit effectuer plus de 600 requêtes HTTP en même temps ! Même si le serveur peut les supporter, le grand nombre de requêtes crée un embouteillage du côté du navigateur, ce qui rend le chargement de la page nettement plus lent.

   En pré-bundlant `lodash-es` en un unique module, il n’y a plus besoin que d’une requête HTTP !

## Découverte automatique des dépendances

Si aucun cache existant n’est trouvé, Vite crawlera votre code source et essaiera de découvrir automatiquement les imports de dépendances (autrement dit les « imports bruts », ceux qui sont résolus depuis `node_modules`) et les utilisera comme points d’entrée du pré-bundle. Le pré-bundling est fait à l’aide d’`esbuild` alors il est normalement très rapide.

Après que le serveur ait démarré, si un nouvel import de dépendance est rencontré et qu’il n’est pas déjà dans le cache, Vite refera le pré-bundling et rechargera la page.

## Monorepos et dépendances liées

Dans une configuration monorepo, une dépendance peut être un package lié du même dépôt. Vite détecte automatiquement les dépendances qui ne sont pas résolues depuis `node_modules` et les traite comme du code source. Il n’essaiera pas de bundler la dépendance liée, et analysera sa liste de dépendances à la place.

::: warning Note
Les dépendances liées peuvent ne pas fonctionner correctement dans la compilation final à cause de différences dans la façon de résoudre les dépendances.
Utilisez plutôt `npm package` pour toutes les dépendances locales pour éviter d’avoir des problèmes dans la compilation finale.
:::

## Modifier le comportement

Les heuristiques de découverte de dépendance ne sont pas toujours souhaitables. Dans les cas où vous voudriez inclure ou exclure explicitement des dépendances de la liste, utilisez l’[option de configuration `optimizeDeps`](/config/#options-d%E2%80%99optimisation-des-dependances).

Un cas d’usage typique d’`optimizeDeps.include` et/ou de `optimizeDeps.exclude` est quand vous avez un import qui n’est pas directement découvrable dans le code source. Par exemple, l’import peut être créé suite à une transformation d’un plugin. Cela signifie que Vite ne pourra pas découvrir l’import lors de son scan initial — il ne peut le découvrir qu’une fois le fichier requêté par le navigateur et transformé. Dans ce cas, le serveur re-bundlera immédiatement après son démarrage.

`include` et `exclude` peuvent tous les deux être utilisés dans ce genre de situation. Si la dépendances est grosse (avec beaucoup de modules internes) ou est en CommonJS, alors vous devriez l’inclure ; si elle est petite et qu’elle est déjà sous la forme d’un module ES natif, vous pouvez l’exclure et laisser le navigateur la charger directement.

## Mise en cache

### Cache du système de fichiers

Vite met en cache les dépendances pré-bundlées dans `node_modules/.vite`. Il détermine s’il doit refaire le pré-bundling selon les sources suivantes :

- La liste `dependencies` de votre `package.json`.
- Les lockfiles du gestionnaire de paquets, par exemple `package-lock.json`, `yarn.lock`, ou `pnpm-lock.yaml`.
- Certains champs de votre `vite.config.js`, s’ils sont présents.

Le pré-bundling n’a besoin d’être refait que lorsque l’un de ces éléments a changé.

Si pour une raison quelconque vous voulez forcer Vite à re-bundler les dépendances, vous pouvez soit démarrer le serveur de développement avec le signal de ligne de commande `--force`, soit supprimer manuellement le dossier de cache `node_modules/.vite`.

### Cache navigateur

Les requêtes vers des dépendances résolues sont fortement mises en cache à l’aide des en-têtes HTTP `max-age=31536000,immutable` afin d’améliorer la performance du rechargement de la page en développement. Une fois mises en cache, ces requêtes n’iront plus jamais au serveur de développement. Elles sont automatiquement invalidées par la version suffixée si une version différente est installée (tout comme dans le lockfile du gestionnaire de paquets). Si vous souhaitez débugger vos dépendances et faire des modifications en local, vous pouvez :

1. Désactiver temporairement le cache dans l’onglet Network des devtools de votre navigateur ;
2. Redémarrer le serveur de développement avec le signal `--force` pour re-bundler les dépendances ;
3. Recharger la page.
