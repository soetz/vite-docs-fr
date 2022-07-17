# Migration depuis la v2

## Support de Node

Vite ne supporte plus Node v12, qui est arrivé à la fin de sa vie. Node ⩾ 14.18 est désormais requis.

## Changement de la définition de navigateur moderne

Le bundle de production part du principe que le JavaScript moderne est supporté. Par défaut, Vite cible les navigateurs qui supportent les [modules ES natifs](https://caniuse.com/es6-module), l'[import dynamique de modules ES natif](https://caniuse.com/es6-module-dynamic-import) et [`import.meta`](https://caniuse.com/mdn-javascript_statements_import_meta) :

- Chrome ⩾ 87
- Firefox ⩾ 78
- Safari ⩾ 13
- Edge ⩾ 88

Une petite partie des utilisateurs devra maintenant utiliser [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), qui génèrera automatiquement des morceaux (_chunks_) pour navigateurs plus anciens et injectera les polyfills de fonctionnalités ES correspondants.

## Modifications d’options de configuration

Les options suivantes qui étaient déjà dépréciées en v2 ont été retirées :

- `alias` (qui est devenue [`resolve.alias`](../config/#resolve-alias))
- `dedupe` (qui est devenue [`resolve.dedupe`](../config/#resolve-dedupe))
- `build.base` (qui est devenue [`base`](../config/#base))
- `build.brotliSize` (qui est devenue [`build.reportCompressedSize`](../config/#build-reportcompressedsize))
- `build.cleanCssOptions` (Vite utilise maintenant esbuild pour la minification du CSS)
- `build.polyfillDynamicImport` (utilisez [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) pour les navigateurs sans support de l’import dynamique)
- `optimizeDeps.keepNames` (qui est devenue [`optimizeDeps.esbuildOptions.keepNames`](../config/#optimizedeps-esbuildoptions))

## Changements d’architecture et options de support

Cette section décrit les plus gros changements d’architecture de Vite v3. Pour permettre aux projets de migrer depuis la v2 en cas de problème de compatibilité, des options de support ont été ajoutées pour permettre de revenir à la stratégie utilisée par la v2.

### Changements du serveur de développement

Le port par défaut du serveur de développement de Vite est maintenant 5173. Vous pouvez utiliser [`server.port`](../config/#server-port) pour le remettre à 3000.

L’hôte par défaut du serveur de développement est maintenant `localhost`. Vous pouvez utiliser [`server.host`](../config/#server-host) pour le remettre à `127.0.0.1`.

### Changements du rendu côté serveur

Vite v3 utilise les modules ES par défaut pour le build de rendu côté serveur. Lorsque vous utilisez les modules ES, les [heuristiques d’externalisation du rendu côté serveur](https://vitejs.dev/guide/ssr.html#externalisation) ne sont plus requises. Par défaut, toutes les dépendances sont externalisées. Vous pouvez utiliser [`ssr.noExternal`](../config/#ssr-noexternal) pour contrôler quelles dépendances inclure dans le build de rendu côté serveur.

Si utiliser les modules ES pour le rendu côté serveur n’est pas possible pour votre projet, vous pouvez définir `legacy.buildSsrCjsExternalHeuristics` afin de générer un bundle CommonJS qui utilise la même stratégie d’externalisation que Vite v2.

Notez également que la valeur par défaut de [`build.rollupOptions.output.inlineDynamicImports`](https://rollupjs.org/guide/en/#outputinlinedynamicimports) est maintenant `false` lorsque `ssr.target` est `node`. `inlineDynamicImports` modifie l’ordre d’exécution et regrouper tout le build en un seul fichier n’est pas requis pour les builds Node.

## Changements généraux

- Les extensions de fichiers JS dans les modes rendu côté serveur et librairie utilisent désormais une extension valide (`js`, `mjs`, ou `cjs`) pour la sortie des entrées JS et des morceaux (_chunks_) selon leur format et leur type de package.
- Terser est désormais une dépendance optionnelle. Si vous utilisez `build.minify: 'terser'`, vous devrez l’installer.
```shell
npm add -D terser
```

### `import.meta.glob`

- L’[`import.meta.glob` au format chaîne de caractères](features.md#format-d’import) est passé de `{ assert: { type: 'raw'}}` à `{ as: 'raw' }`
- Les clés de `import.meta.glob` sont désormais relatives au module actuel.

  ```diff
  // fichier : /foo/index.js
  const modules = import.meta.glob('../foo/*.js')

  // transformé :
  const modules = {
  -  '../foo/bar.js': () => {}
  +  './bar.js': () => {}
  }
  ```

- Lorsque vous utilisez un alias avec `import.meta.glob`, les clés sont toujours absolues.
- `import.meta.globEager` est désormais déprécié. Utilisez `import.meta.glob('*', { eager: true })` à la place.

### Support de WebAssembly

La syntaxe `import init from 'example.wasm'` a été abandonnée afin d’empêcher les futures collisions avec l’[intégration Wasm en modules ES](https://github.com/WebAssembly/esm-integration).
Vous pouvez utiliser `?init` qui propose un comportement similaire au précédent.

```diff
-import init from 'example.wasm'
+import init from 'example.wasm?init'

-init().then((exports) => {
+init().then(({ exports }) => {
  exports.test()
})
```

### Génération automatique de certificats HTTPS

Un certificat valide est nécessaire lorsque vous utilisez HTTPS. Avec Vite v2, si aucun certificat n’était configuré, un certificat auto-signé était automatiquement créé et mis en cache.
Depuis Vite v3, nous recommandons de créer manuellement vos certificats. Si vous voulez toujours utiliser la génération automatique de la v2, elle peut être activée en ajoutant [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) aux plugins du projet.

```js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()]
}
```

## Expérimental

### Utiliser l’optimisation des dépendances d’esbuild pour la compilation

Depuis la v3, Vite permet d’utiliser esbuild pour optimiser les dépendances à la compilation. Si cette option est activée, elle retire une des plus grosses différences entre développement et production qui était présente dans la v2. [`@rollupjs/plugin-commonjs`](https://github.com/rollup/plugins/tree/master/packages/commonjs) n’est plus requis dans ce cas puisqu’esbuild convertit les dépendances qui ne proposent que du CommonJS en modules ES.

Si vous voulez essayer cette stratégie de compilation, vous pouvez utiliser `optimizeDeps.disabled: false` (la valeur par défaut en v3 est `disabled: 'build'`). `@rollup/plugin-commonjs` peut être retiré en passant `build.commonjsOptions: { include: [] }`.

## Avancé

Certains changements n’affectent que les créateurs de plugins ou d’outils.

- [[#5868] refactor: remove deprecated api for 3.0](https://github.com/vitejs/vite/pull/5868)
  - `printHttpServerUrls` est retirée
  - `server.app` et `server.transformWithEsbuild` sont retirées
  - `import.meta.hot.acceptDeps` est retirée
- [[#6901] fix: sequential injection of tags in transformIndexHtml](https://github.com/vitejs/vite/pull/6901)
  - `transformIndexHtml` reçoit désormais le bon contenu modifié par les plugins précédents, donc l’ordre des tags injectés est désormais celui qui est attendu.
- [[#7995] chore: do not fixStacktrace](https://github.com/vitejs/vite/pull/7995)
  - L’option `fixStacktrace` de `ssrLoadModule` est désormais `false` par défaut
- [[#8178] feat!: migrate to ESM](https://github.com/vitejs/vite/pull/8178)
  - `formatPostcssSourceMap` est désormais asynchrone
  - `resolvePackageEntry` et `resolvePackageData` ne sont plus disponibles depuis le build CommonJS (l’import dynamique est nécessaire pour les utiliser en CommonJS)
- [[#8626] refactor: type client maps](https://github.com/vitejs/vite/pull/8626)
  - Le type du callback de `import.meta.hot.accept` est maintenant plus strict. Sa nouvelle valeur est `(mod: (Record<string, any> & { [Symbol.toStringTag]: 'Module' }) | undefined) => void` (l’ancienne valeur était `(mod: any) => void`).

  Il y a aussi quelques changements non-rétrocompatibles mais qui affecteront peu d’utilisateurs.

- [[#5018] feat: enable `generatedCode: 'es2015'` for rollup build](https://github.com/vitejs/vite/pull/5018)
  - La transpilatino en ES5 est désormais nécessaire même si le code utilisateur ne comprend que de l’ES5.
- [[#7877] fix: vite client types](https://github.com/vitejs/vite/pull/7877)
  - `/// <reference lib="dom" />` est retiré de `vite/client.d.ts`. `{ "lib": ["dom"] }` ou `{ "lib": ["webworker"] }` sont nécessaires dans `tsconfig.json`.
- [[#8090] feat: preserve process env vars in lib build](https://github.com/vitejs/vite/pull/8090)
  - `process.env.*` est maintenant préservé en mode librairie
- [[#8280] feat: non-blocking esbuild optimization at build time](https://github.com/vitejs/vite/pull/8280)
  - L’option `server.force` et remplacée par `optimizeDeps.force`.
- [[#8550] fix: dont handle sigterm in middleware mode](https://github.com/vitejs/vite/pull/8550)
  - Lorqu’il est en mode middleware, Vite ne termine plus les processus sur `SIGTERM`.
- [[#8647] feat: print resolved address for localhost](https://github.com/vitejs/vite/pull/8647)
  - `server.printUrls` et `previewServer.printUrls` sont désormais asynchrones

## Migration depuis la v1

Allez d’abord voir la page de [migration depuis la v1](https://v2.vitejs.dev/guide/migration.html) de la documentation de Vite v2 (en anglais) pour voir quels changements sont nécessaires pour porter votre application vers Vite v2, puis traitez les modifications de cette page.
