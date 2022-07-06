# Compilation en production

Lorsqu’il est temps de déployer votre application en production, lancez simplement la commande `vite build`. Par défaut, elle utilise `<racine>/index.html` comme point d’entrée pour la compilation, et produit un bundle d’application qu’il est possible de servir avec un service d’hébergement statique. Vous pouvez retrouver des guides pour les services les plus populaires sur la page [Déployer un site statique](./static-deploy).

## Compatibilité navigateur

Ce bundle de production part du principe que le JavaScript moderne est supporté. Par défaut, Vite cible les navigateurs qui supportent les [modules ES natifs](https://caniuse.com/es6-module), les [imports dynamiques de modules ES natifs](https://caniuse.com/es6-module-dynamic-import) et [`import.meta`](https://caniuse.com/mdn-javascript_statements_import_meta) :

- Chrome ⩾ 87
- Firefox ⩾ 78
- Safari ⩾ 13
- Edge ⩾ 88

Vous pouvez spécifier des cibles personnalisées à l’aide de l’[option de configuration `build.target`](/config/#build-target), sachant que la cible minimum est `es2015`.

Notez que par défaut, Vite ne s’occupe que des transformations de syntaxe et **n’insère pas de polyfill**. Regardez du côté de [Polyfill.io](https://polyfill.io/v3/) qui est un service qui génère automatiquement des bundles de polyfills en se basant sur la chaîne de caractères de l’agent utilisateur.

Les navigateurs plus anciens peuvent être supportés à l’aide de [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), qui va générer automatiquement des morceaux (_chunks_) pour navigateurs plus anciens et les polyfills de fonctionnalités du langage ES qui correspondent. Les morceaux pour navigateurs plus anciens sont chargés conditionnellement seulement dans les navigateurs qui ne supportent pas les modules ES natifs.

## Chemin public de base

- Voir aussi : [Gestion des ressources statiques](./assets)

Si vous déployez votre projet sous un chemin public imbriqué, spécifiez l’[option de configuration `base`](/config/#base) et tous les chemins de ressources seront réécris en conséquence. Cette option peut aussi être spécifiée via l’interface en ligne de commande, par exemple `vite build --base=/mon/chemin/public/`.

Les URLs de ressources importées par le JavaScript, les références `url()` dans le CSS, et les références à des ressources dans vos fichiers `.html` sont toutes ajustées automatiquement pour respecter cette option pendant la compilation.

La seule exception est quand vous devez concaténer dynamiquement des URLs à la volée. Dans ce cas, utilisez la variable injectée globalement `import.meta.env.BASE_URL` qui contiendra le chemin public de base. Notez que cette variable est remplacée statiquement pendant la compilation alors elle doit apparaître telle quelle (par exemple `import.meta.env['BASE_URL']` ne fonctionnera pas).

## Customiser la compilation

La compilation peut être personnalisée à l’aide de ses diverses [options de configuration](/config/#options-de-compilation). Plus spécifiquement, vous pouvez ajuster les [options du Rollup](https://rollupjs.org/guide/en/#big-list-of-options) sous-jacent avec `build.rollupOptions` :

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    }
  }
})
```

Par exemple, vous pouvez spécifier plusieurs sorties Rollup à l’aide de plugins qui ne sont appliqués que pour la compilation.

## Stratégie de découpage en morceaux (_chunks_)

Vous pouvez configurer la façon dont sont découpés les morceaux à l’aide de `build.rollupOptions.output.manualChunks` (voir la [documentation de Rollup](https://rollupjs.org/guide/en/#outputmanualchunks)). Jusqu’à Vite 2.8, la stratégie de découpage des morceaux par défaut séparait les morceaux entre `index` et `vendor`. C’est une bonne stratégie la plupart du temps pour les applications monopages (_SPAs_), mais il est difficile de fournir une solution appropriée à chaque cas d’usage de Vite. À partir de Vite 2.9, `manualChunks` n’est plus modifiée par défaut. Vous pouvez toujours utiliser l’ancienne stratégie en ajoutant le `splitVendorChunkPlugin` dans votre fichier de configuration :

```js
// vite.config.js
import { splitVendorChunkPlugin } from 'vite'
module.exports = defineConfig({
  plugins: [splitVendorChunkPlugin()]
})
```

Cette stratégie est aussi fournie sous la forme d’une fonction fabrique (_factory_) `splitVendorChunk({ cache: SplitVendorChunkCache })`, au cas où il soit requis d’inclure de la logique propre. `cache.reset()` doit être appelée lors du `buildStart` pour que la recompilation lorsque les fichiers sont modifiés fonctionne.

## Refaire la compilation lorsque les fichiers sont modifiés

Vous pouvez activer le watcher Rollup avec `vite build --watch`. Ou alors vous pouvez directement ajuster les [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options) dans `build.watch` :

```js
// vite.config.js
module.exports = defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    }
  }
})
```

Avec le signal `--watch`, les changements faits à `vite.config.js` ou à n’importe quel fichier bundlé donnera lieu à une recompilation.

## Application multi-pages

Supposons que votre code source a la structure suivante :

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Pendant la développement, naviguez à `/nested/` — cela fonctionne comme attendu, du moins dans le contexte d’un serveur de fichiers statiques.

Pour la compilation, tout ce que vous aurez à faire est de spécifier plusieurs fichiers `.html` comme points d’entrée :

```js
// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```

Si vous spécifiez une racine différente, souvenez-vous que `__dirname` sera toujours le dossier où se trouve votre fichier vite.config.js lorsque les chemins sont résolus. Ainsi, vous devrez ajouter la racine de votre entrée aux arguments de `resolve`.

## Mode librairie

Lorsque vous développerez une librairie à destination du navigateur, vous passerez sûrement une bonne partie de votre temps sur une page de démo ou de test qui importe votre librairie. Avec Vite, vous pouvez utiliser le `index.html` pour cela, et profiter d’une meilleure expérience de développement.

Lorsqu’il est temps de faire le bundle de votre librairie pour commencer à la distribuer, utilisez l’[option de configuration `build.lib`](/config/#build-lib). Assurez vous d’externaliser les dépendances que vous ne souhaitez pas retrouver dans votre bundle de librairie, comme `vue` ou `react` par exemple :


```js
// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // les extensions nécessaires seront ajoutées
      fileName: 'my-lib'
    },
    rollupOptions: {
      // externalisez les dépendances que vous ne souhaitez pas inclure
      // au bundle de votre librairie
      external: ['vue'],
      output: {
        // assurez-vous de fournir les variables globales à utiliser
        // pour la compilation UMD des dépendances externalisées
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

Le fichier d’entrée doit contenir les exports qui seront importés par les utilisateurs de votre package :

```js
// lib/main.js
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Lancer `vite build` avec cette configuration exploite un preset de Rollup qui est fait pour livrer des librairies et qui produit des bundles sous deux formats : `es` et `umd` (configurables avec `build.lib`) :

```
$ vite build
building for production...
[write] my-lib.es.js 0.08kb, brotli: 0.07kb
[write] my-lib.umd.js 0.30kb, brotli: 0.16kb
```

Le `package.json` recommandé pour votre librairie :

```json
{
  "name": "my-lib",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.js",
  "module": "./dist/my-lib.mjs",
  "exports": {
    ".": {
      "import": "./dist/my-lib.mjs",
      "require": "./dist/my-lib.umd.js"
    }
  }
}
```

## Options avancées du chemin de base

::: warning Expérimental
Cette fonctionnalité est expérimentale ; l’API pourra très bien changer dans une future version mineure sans suivre le SemVer. Fixez la version mineure de Vite si vous l’utilisez.
:::

Pour les cas d’usage avancés, les ressources déployées et les fichiers publics pourraient se trouver sous des chemins différents, par exemple pour utiliser différentes stratégies de cache :

- Les fichiers HTML d’entrée générés (qui peuvent aussi être traités par le rendu côté serveur)
- Les ressources hachées générées (JS, CSS, et les autres types de fichier comme les images)
- Les [fichiers publics](assets.md#le-repertoire-public) copiés

Un seul [chemin de base](#chemin-public-de-base) ne suffit pas dans ces cas. Vite fournit un support expérimental pour des options avancées lors de la compilation, avec `experimental.renderBuiltUrl`.

```js
experimental: {
  renderBuiltUrl: (filename: string, { hostType: 'js' | 'css' | 'html' }) => {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  }
}
```

Si les ressources hachées et les fichiers publics ne sont pas déployés ensemble, des options pour chaque groupe peuvent être définies différement à l’aide du paramètre `type` du second argument passé à la fonction.

```js
  experimental: {
    renderBuiltUrl(filename: string, { hostType: 'js' | 'css' | 'html', type: 'public' | 'asset' }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      }
      else if (path.extname(importer) === '.js') {
        return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
      }
      else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    }
  }
```
