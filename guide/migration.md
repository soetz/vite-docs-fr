# Migration depuis la v1

## Changements d’options de configuration

- Les options suivantes ont été retirées et doivent désormais être implémentées à l’aide de [plugins](./api-plugin) :

  - `resolvers`
  - `transforms`
  - `indexHtmlTransforms`

- `jsx` et `enableEsbuild` ont été retirées ; utilisez plutôt la nouvelle [option `esbuild`](/config/#esbuild).

- Les [options en lien avec le CSS](/config/#css-modules) sont désormais regroupées sous `css`.

- Toutes les [options spécifiques au build](/config/#options-du-build) sont désormais regroupées sous `build`.

  - `rollupInputOptions` et `rollupOutputOptions` sont remplacées par [`build.rollupOptions`](/config/#build-rollupoptions).
  - `esbuildTarget` est désormais [`build.target`](/config/#build-target).
  - `emitManifest` est désormais [`build.manifest`](/config/#build-manifest).
  - Les options suivantes ont été retirées puisqu’elles peuvent être configurées à l’aide des hooks de plugins ou d’autres options :
    - `entry`
    - `rollupDedupe`
    - `emitAssets`
    - `emitIndex`
    - `shouldPreload`
    - `configureBuild`

- Toutes les [options spécifiques au serveur](/config/#options-du-serveur) sont désormais regroupées sous `server`.

  - `hostname` est désormais [`server.host`](/config/#server-host).
  - `httpsOptions` a été retirée. [`server.https`](/config/#server-https) prend directement l’objet d’options.
  - `chokidarWatchOptions` est désormais [`server.watch`](/config/#server-watch).

- [`assetsInclude`](/config/#assetsinclude) prend désormais un `string | RegExp | (string | RegExp)[]` plutôt qu’une fonction.

- Toutes les options spécifiques à Vue sont retirées ; passez-les au plugin Vue à la place.

## Changement du comportement d’alias

[`alias`](/config/#resolve-alias) est désormais passé à `@rollup/plugin-alias` et ne requiert plus de slash au début et à la fin. Son comportement consiste maintenant en un remplacement direct, alors vous devrez retirer le slash de fin des alias de répertoires au format 1.0 :

```diff
- alias: { '/@foo/': path.resolve(__dirname, 'some-special-dir') }
+ alias: { '/@foo': path.resolve(__dirname, 'some-special-dir') }
```

Autrement, vous pouvez utiliser le format d’option `[{ find: RegExp, replacement: string }]` pour un contrôle plus précis.

## Support de Vue

Vite 2.0 core n’est plus lié à aucun framework en particulier. Le support de Vue est désormais assuré par [`@vitejs/plugin-vue`](https://github.com/vitejs/vite/tree/main/packages/plugin-vue). Installez-le et ajoutez-le à la configuration Vite :

```js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

### Transformation des blocs custom

Un plugin spécifique peut être utilisé pour assurer la transformation des blocs custom de Vue, comme celui ci-dessous :

```ts
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const vueI18nPlugin = {
  name: 'vue-i18n',
  transform(code, id) {
    if (!/vue&type=i18n/.test(id)) {
      return
    }
    if (/\.ya?ml$/.test(id)) {
      code = JSON.stringify(require('js-yaml').load(code.trim()))
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`
  }
}

export default defineConfig({
  plugins: [vue(), vueI18nPlugin]
})
```

## Support de React

Le support de React Fast Refresh est désormais assuré par [`@vitejs/plugin-react`](https://github.com/vitejs/vite/tree/main/packages/plugin-react).

## Changement de l’API de rafraîchissement des modules à la volée (_HMR_)

`import.meta.hot.acceptDeps()` est désormais déprécié. [`import.meta.hot.accept()`](./api-hmr#hot-accept-deps-cb) accepte désormais une ou plusieurs dépendances.

## Changements du format du manifeste

Le manifeste du build utilise désormais le format suivant :

```json
{
  "index.js": {
    "file": "assets/index.acaf2b48.js",
    "imports": [...]
  },
  "index.css": {
    "file": "assets/index.7b7dbd85.css"
  }
  "asset.png": {
    "file": "assets/asset.0ab0f9cd.png"
  }
}
```

Pour les morceaux (_chunks_) d’entrée JS, il liste aussi les morceaux importés qui peuvent être utilisés pour rendre des directives de pré-chargement (_preload directives_).

## Pour les auteurs de plugins

Vite 2 utilise une toute nouvelle interface pour plugin qui étend les plugins Rollup. Vous pouvez lire le nouveau [guide du développement de plugin](./api-plugin).

Quelques principes généraux pour migrer un plugin v1 vers la v2 :

- `resolvers` → utilisez le [hook `resolveId`](https://rollupjs.org/guide/en/#resolveid).
- `transforms` → utilisez le [hook `transform`](https://rollupjs.org/guide/en/#transform).
- `indexHtmlTransforms` → utilisez le [hook `transformIndexHtml`](./api-plugin#transformindexhtml).
- Pour servir des fichiers virtuels → utilisez les hooks [`resolveId`](https://rollupjs.org/guide/en/#resolveid) et [`load`](https://rollupjs.org/guide/en/#load).
- Pour manipuler les options `alias`, `define` ou autres → utilisez le [hook `config`](./api-plugin#config).

Puisque la plupart de la logique devrait être gérée à l’aide des hooks de plugins plutôt que des middlewares, l’utilité des middlewares est grandement réduite. Le serveur interne est désormais une instance de [connect](https://github.com/senchalabs/connect) à la place de Koa.
