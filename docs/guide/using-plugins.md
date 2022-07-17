# Utiliser des plugins

Vite peut être étendu à l’aide de plugins, qui sont basés sur la très bonne interface pour plugin de Rollup, avec quelques options spécifiques à Vite en plus. Cela signifie que les utilisateurs de Vite peuvent se fier à l’écosystème de plugins de Rollup, qui est mature, tout en profitant d’adaptations pour le serveur de développement ou le rendu côté serveur (_SSR_) si besoin.

## Ajouter un plugin

Pour pouvoir utiliser un plugin, il doit être ajouté aux `devDependencies` du projet et être inclus à l’array `plugins` du fichier de configuration `vite.config.js`. Par exemple, pour permettre le support des navigateurs anciens, le plugin officiel [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) peut être utilisé :

```
$ npm i -D @vitejs/plugin-legacy
```

```js
// vite.config.js
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

`plugins` accepte aussi des préréglages qui incluent plusieurs plugins en un seul élément. C’est utile pour des fonctionnalités complexes (comme l’intégration d’un framework) qui sont implémentées à l’aide de plusieurs plugins. L’array sera aplati en interne.

Les plugins falsy seront ignorés, ce qui peut être utilisé pour activer ou désactiver facilement des plugins.

## Trouver des plugins

:::tip NOTE
Vite tente de supporter les patterns de développement web les plus courants sans qu’il n’y ait besoin de plugins. Avant de partir à la recherche d’un plugin Vite ou Rollup qui soit compatible, faites un tour sur le [guide des fonctionnalités](/guide/features.md). Souvent, les cas où un plugin serait nécessaire pour un projet Rollup sont déjà couverts par Vite.
:::

Allez voir la [page Plugins](../plugins/) pour plus d’informations sur les plugins officiels. Sinon, les plugins de la communauté sont référencés par [Awesome Vite](https://github.com/vitejs/awesome-vite#plugins). [Vite Rollup Plugins](https://vite-rollup-plugins.patak.dev) fournit une liste des plugins officiels Rollup compatibles ainsi que des instructions d’utilisation. Si le plugin qui vous intéresse n’est pas inclus, la [section Compatibilité des plugins Rollup](/guide/api-plugin#compatibilite-des-plugins-rollup) vous indiquera dans les grandes lignes s’il a des chances de fonctionner ou non.

Vous pouvez également trouver les plugins qui suivent les [conventions recommandées](api-plugin.md#conventions) en [recherchant vite-plugin sur npm](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) pour les plugins Vite ou [rollup-plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) pour les plugins Rollup.

## Forcer l’ordre des plugins

Pour assurer la compatibilité avec certains plugins Rollup, il est possible qu’il soit nécessaire de forcer l’ordre d’un plugin ou de seulement l’appliquer pour la compilation. Cela devrait être un détail d’implémentation des plugins Vite. Vous pouvez forcer la position d’un plugin avec le modifieur `enforce` :

- `pre` : invoque le plugin avant les plugins du noyau de Vite
- par défaut : invoque le plugin après les plugins du noyau de Vite
- `post` : invoque le plugin après les plugins de compilation de Vite

```js
// vite.config.js
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre'
    }
  ]
})
```

Allez voir le [Guide de l’API pour plugin](api-plugin.md#ordre-du-plugin) pour de plus amples informations, et soyez attentifs à l’indication `enforce` ainsi qu’aux instructions d’utilisation pour les plugins populaires dans la liste de compatibilité [Vite Rollup Plugins](https://vite-rollup-plugins.patak.dev).

## Application conditionnelle

Par défaut, les plugins sont invoqués à la fois pour le développement et pour la compilation. Dans les cas où un plugin doit être appliqué conditionnellement seulement pour le développement ou pour la compilation, utilisez la propriété `apply` pour l’invoquer seulement durant `'build'` ou `'serve'` :

```js
// vite.config.js
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build'
    }
  ]
})
```

## Écrire des plugins

Allez voir le [Guide de l’API pour plugin](api-plugin.md) pour la documentation de la création de plugins.
