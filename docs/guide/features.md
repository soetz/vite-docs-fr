# Fonctionnalités

Si l’on schématise, développer avec Vite n’est pas si différent de développer en utilisant un serveur de fichier statique. Cependant, Vite propose des améliorations via les imports de modules ES natifs pour supporter diverses fonctionnalités que l’on retrouve d’ordinaire plutôt dans des configurations reposant sur un bundler.

## Résolution et pré-bundling des dépendances NPM

Les imports ES natifs ne supportent pas le fait d’importer directement depuis le module, comme ceci :

```js
import { someMethod } from 'my-dep'
```

Le code ci-dessus provoquerait une erreur dans le navigateur. Vite va détecter ce genre d’imports directs dans tous les fichiers source servis et effectuera les opérations suivantes :

1. Les [pré-bundler](./dep-pre-bundling) pour améliorer la vitesse de chargement de la page, et convertir les modules CommonJS ou UMD en modules ES. Le pré-bundling est effectué à l’aide d’[esbuild](http://esbuild.github.io/) et rend le démarrage à froid de Vite plus rapide que celui de n’importe quel bundler basé sur JavaScript.

2. Réécrire les imports en des URLs valides telles que `/node_modules/.vite/my-dep.js?v=f3sf2ebd` pour que le navigateur puisse les importer correctement.

**Les dépendances sont fortement mises en cache**

Vite met les dépendances en cache à l’aide d’en-têtes HTTP, alors si vous souhaitez éditer ou débugger une dépendance localement, suivez [ces instructions](./dep-pre-bundling#cache-navigateur).

## Rafraîchissement des modules à la volée (_HMR_)

Vite fournit une [API de rafraîchissement à la volée](./api-hmr) à travers les modules ES natifs. Les frameworks supportant le rafraîchissement de modules à la volée peuvent s’appuyer sur cette API pour permettre des remplacements de modules rapides et précis sans qu’il n’y ait besoin de recharger la page ou de perdre l’état de l’application. Vite fournit des intégrations de première classe du rafraîchissement à la volée pour les [composants à fichier unique de Vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue) et pour [React Fast Refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react). Il existe aussi des intégrations officielles pour Preact via [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Notez que vous n’aurez normalement pas besoin de les configurer manuellement — quand vous [créez une application à l’aide de `create-vite`](./), le template sélectionné l’aura déjà fait pour vous.

## TypeScript

Vite supporte l’import de fichiers `.ts` par défaut.

Vite ne fait que transpiler les fichiers `.ts` et n’effectue **AUCUNE** vérification des types (_type checking_). Il part du principe que ce sont votre IDE et votre process de compilation qui prennent en charge la vérification des types (vous pouvez lancer `tsc --noEmit` dans le script de compilation ou installer `vue-tsc` et lancer `vue-tsc --noEmit` pour effectuer la vérification des types de vos fichiers `*.vue`).

Vite utilise [esbuild](https://github.com/evanw/esbuild) pour transpiler le TypeScript en JavaScript, ce qui est environ 20 à 30 fois plus rapide qu’avec `tsc`, et les remplacements de modules peuvent être faits en moins de 50 ms.

Utilisez la syntaxe d’[imports et d’export des types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) pour éviter d’éventuels problèmes comme les imports de types qui seraient mal bundlés. Par exemple :

```ts
import type { T } from 'only/types'
export type { T }
```

### Options du compilateur TypeScript

Certains champs de configuration de `compilerOptions` dans `tsconfig.json` doivent être traités avec une attention particulière.

#### `isolatedModules`

Doit être à `true`.

Puisqu’`esbuild` ne transpile que sans les informations de types, il ne supporte pas certaines fonctionnalités comme les const enum ou les imports de types implicites.

Vous devez définir `"isolatedModules": true` dans votre `tsconfig.json` sous `compilerOptions`, afin que TS vous prévienne lorsque vous utilisez des fonctionnalités qui ne fonctionnent pas avec la transpilation isolée.

Ceci dit, certaines librairies (comme [vue](https://github.com/vuejs/core/issues/1228)) fonctionnent mal avec `"isolatedModules": true`. Vous pouvez utiliser `"skipLibCheck": true` pour mettre temporairement les erreurs en sourdine le temps qu’elles soient résolues par les auteurs de la librairie.

#### `useDefineForClassFields`

À partir de Vite 2.5.0, la valeur par défaut sera `true` si la cible TypeScript est `ESNext`. Cela correspond au [comportement de `tsc` en v4.3.2 et suivantes](https://github.com/microsoft/TypeScript/pull/42663). C’est aussi le comportement standard du runtime ECMAScript.

Ceci dit, cela peut être contre-intuitif pour ceux qui viennent d’autres langages de programmation ou de versions plus anciennes de TypeScript.
Vous pouvez en apprendre plus sur la transition dans les [notes de version de TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

Si vous utilisez une librairie qui repose fortement sur les champs de classe, soyez prudent·e vis-à-vis de l’intention derrière l’usage qui en est fait.

La plupart des librairies présument que `"useDefineForClassFields": true`, comme [MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties) par exemple, ou [Vue Class Components 8.x](https://github.com/vuejs/vue-class-component/issues/465).

Mais certaines d’entre elles n’ont pas encore fait la transition, comme [`lit-element`](https://github.com/lit/lit-element/issues/1030). Définissez explicitement `useDefineForClassFields` à `false` dans ces cas-là.

#### Autres options du compilateur qui affectent le résultat de la compilation

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

Si migrer votre base de code vers `"isolatedModules": true` est un effort insurmontable, vous pouvez peut-être vous en sortir avec un plugin externe comme [rollup-plugin-friendly-type-imports](https://www.npmjs.com/package/rollup-plugin-friendly-type-imports). Ceci dit, cette approche n’est pas supportée officiellement par Vite.

### Types du client

Les types par défaut de Vite sont ceux de l’API Node.js. Pour utiliser du code client dans Vite, vous devrez ajouter un fichier de déclaration `d.ts` :

```typescript
/// <reference types="vite/client" />
```

Vous pouvez également ajouter `vite/client` au `compilerOptions.types` de votre `tsconfig` :

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

Cela permettra de fournir les remplacements de types suivants :

- Les imports d’assets (par exemple lors de l’import d’un fichier `.svg`)
- Les [variables d’environnement](./env-and-mode#variables-d%E2%80%99environnement) injectées par Vite dans `import.meta.env`
- L’[API de rafraîchissement des modules](./api-hmr) dans `import.meta.hot`

## Vue

Vite fournit un support de première classe pour Vue :

- Support des composants à fichier unique (_SFC_) de Vue 3 à l’aide de [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)
- Support du JSX pour Vue 3 à l’aide de [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)
- Support de Vue 2 à l’aide de [underfin/vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

## JSX

Les fichiers `.jsx` et `.tsx` sont également supportés. La transpilation du JSX est prise en charge par [esbuild](https://esbuild.github.io), et correspond par défaut à React 16. Vous pouvez suivre l’avancement du support du JSX React 17 par esbuild [ici](https://github.com/evanw/esbuild/issues/334).

Les utilisateurs de Vue doivent utiliser le plugin officiel [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx), qui fournit des fonctionnalités spécifiques à Vue 3, y compris le rafraîchissement des modules à la volée, la résolution des composants globaux, les directives et les slots.

Si vous n’utilisez pas JSX avec React ou Vue, vous pouvez configurer un `jsxFactory` et un `jsxFragment` spécifiques à l’aide de l’[option `esbuild`](/config/#esbuild). Par exemple pour Preact :

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
```

Plus de détails dans la [documentation d’esbuild](https://esbuild.github.io/content-types/#jsx).

Vous pouvez injecter les helpers JSX avec `jsxInject` (qui est une option spécifique à Vite) pour éviter de devoir faire des imports manuels :

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
```

## CSS

Importer des fichiers `.css` injectera leur contenu dans la page via une balise `<style>` supportant le remplacement des modules à la volée (_HMR_). Vous pouvez également récupérer le CSS traité sous la forme d’une chaîne de caractères en tant qu’export par défaut du module.

### Mise inline et réécriture de la base pour `@import`

Vite est préconfiguré pour supporter la mise inline des `@import` CSS à l’aide de `postcss-import`. Les alias de Vite sont aussi respectés pour les `@import` CSS. Ajoutons que les bases de toutes les `url()` CSS sont réécrites, afin d’assurer qu’elles soient toujours valides.

Les alias pour `@import` et la réécriture des bases d’URLs sont aussi supportés pour les fichiers Sass et Less (voir [préprocesseurs CSS](#preprocesseurs-css)).

### PostCSS

Si le projet contient une configuration PostCSS valide (les formats supportés sont ceux qui le sont par [postcss-load-config](https://github.com/postcss/postcss-load-config), par exemple `postcss.config.js`), elle sera automatiquement appliquée à tout le CSS importé.

### Modules CSS

Tout fichier CSS dont le nom finit par `.module.css` est considéré comme étant un [fichier de module CSS](https://github.com/css-modules/css-modules). Importer l’un de ces fichiers retournera l’objet de module correspondant :

```css
/* example.module.css */
.red {
  color: red;
}
```

```js
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Le comportement des modules CSS peut être configuré à l’aide de l’[option `css.modules`](/config/#css-modules).

Si `css.modules.localsConvention` est configuré pour activer les noms en camelCase (par exemple avec `localsConvention: 'camelCaseOnly'`), vous pourrez aussi utiliser des imports nommés :

```js
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### Préprocesseurs CSS

Puisque Vite ne cible que des navigateurs modernes, il est recommandé d’utiliser les variables CSS natives avec des plugins PostCSS qui implémentent les ébauches du CSSWG (par exemple [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)) afin d’écrire du CSS pur et conforme aux futurs standards.

Ceci étant dit, Vite fournit le support pour les fichiers `.scss`, `.sass`, `.less`, `.styl` et `.stylus`. Il n’y a pas besoin de plugin pour cela, mais le préprocesseur correspondant doit être installé :

```bash
# .scss et .sass
npm add -D sass

# .less
npm add -D less

# .styl et .stylus
npm add -D stylus
```

Si vous utilisez les composants à fichier unique de Vue, cela permet aussi d’utiliser `<style lang="sass">` et les autres.

Vite améliore la résolution des `@import` pour Sass et Less afin que les alias de Vite soient respectés. Les références à des `url()` relatives dans des fichiers Sass ou Less importés qui se trouvent des des dossiers différents de la racine voient aussi leur base automatiquement réécrite, afin d’assurer qu’elles soient toujours valides.

Les alias d’`@import` et la réécritures des bases d’URLs ne sont pas supportés pour Stylus en raisons de contraintes de son API.

Vous pouvez également utiliser des modules CSS en combinaison avec des préprocesseurs en préfixant l’extension de fichier avec `.module`, par exemple `style.module.scss`.

### Désactiver l’injection du CSS sur la page

L’injection automatique du CSS peut être désactivée à l’aide du paramètre de requête `?inline`. Dans ce cas, le CSS traité est retourné en tant qu’export par défaut du module comme d’habitude, mais les styles ne sont pas injectés sur la page.

```js
import styles from './foo.css' // sera injecté sur la page
import otherStyles from './bar.css?inline' // ne le sera pas
```

## Ressources statiques

Importer une ressource statique retournera son URL publique résolue :

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Des requêtes spéciales peuvent modifier la façon dont les ressources sont chargées :

```js
// charge la ressource comme URL explicitement
import assetAsURL from './asset.js?url'
```

```js
// charge la ressource comme chaîne de caractères
import assetAsString from './shader.glsl?raw'
```

```js
// charge un web worker
import Worker from './worker.js?worker'
```

```js
// charge un web worker qui est mis inline en chaîne de caractères base64
// au moment de la compilation
import InlineWorker from './worker.js?worker&inline'
```

Plus de détails sur la page [Gestion des ressources statiques](./assets).

## JSON

Les fichiers JSON peuvent être importés directement — les imports nommés sont aussi supportés :

```js
// importe l’objet entier
import json from './example.json'
// importe un champ à la racine du fichier en tant qu’export nommé - cela
// aide à éliminer le code inutilisé (tree-shaking) !
import { field } from './example.json'
```

## Imports glob

Vite supporte le fait d’importer plusieurs modules depuis le système de fichiers grâce à la fonction spéciale `import.meta.glob` :

```js
const modules = import.meta.glob('./dir/*.js')
```

Le code ci-dessus sera transformé en ce qui suit :

```js
// code produit par Vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
```

Vous pouvez itérer sur les clés de l’objet `modules` pour accéder aux modules correspondants :

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Les fichiers correspondants sont chargés de manière opportune (_lazy loaded_) à l’aide de l’import dynamique et seront séparés en différents morceaux (_chunks_) durant la compilation. Si vous préférez importer tous les modules directement (par exemple si vous avez besoin que des effets secondaires (_side-effects_) de ces modules soient d’abord appliqués), vous pouvez passer un second argument `{ eager: true }` :

```js
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Le code ci-dessus sera transformé en ce qui suit :

```js
// code produit par Vite
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

### Format d’import

`import.meta.glob` supporte également le fait d’importer des fichiers sous la forme de chaînes de caractères (à la manière de l’[import d’une ressource en tant que chaîne de caractères](/guide/assets.html#importer-une-ressource-en-tant-que-chaine-de-caracteres)) à l’aide de la syntaxe de [réflexion d’import (_Import Reflection_)](https://github.com/tc39/proposal-import-reflection).

```js
const modules = import.meta.glob('./dir/*.js', { as: 'raw' })
```

Le code ci-dessus sera transformé en ce qui suit :

```js
// code produit par Vite
const modules = {
  './dir/foo.js': 'export default "foo"\n',
  './dir/bar.js': 'export default "bar"\n'
}
```

`{ as: 'url' }` est aussi supporté pour charger des ressources comme URLs.

### Patterns multiples

Le premier argument peut aussi être un array de globs, par exemple

```js
const modules = import.meta.glob(['./dir/*.js', './autre/*.js'])
```

### Patterns négatifs

Les patterns négatifs sont également supportés (avec `!` comme préfixe). Pour ignorer certains fichiers, vous pouvez ajouter des patterns glob d’exclusion au premier argument :

```js
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// code produit par Vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js')
}
```

#### Imports nommés

Il est possible de n’importer que certaines parties d’un module grâce à l’option import.

```ts
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// code produit par Vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup)
}
```

En combinaison avec `eager`, il est même possible de profiter de l’élimination du code inutile (_tree-shaking_).

```ts
const modules = import.meta.glob('./dir/*.js', { import: 'setup', eager: true })
```

```ts
// code produit par Vite:
import { setup as __glob__0_0 } from './dir/foo.js'
import { setup as __glob__0_1 } from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

Définissez `import` à `default` pour importer l’export par défaut du module.

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true
})
```

```ts
// code produit par Vite:
import __glob__0_0 from './dir/foo.js'
import __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

#### Requêtes personnalisées

Vous pouvez aussi utiliser l’option `query` pour fournir des requêtes personnalisées pouvant être utilisées par d’autres plugins.

```ts
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true }
})
```

```ts
// code produit par Vite:
const modules = {
  './dir/foo.js': () =>
    import('./dir/foo.js?foo=bar&bar=true').then((m) => m.setup),
  './dir/bar.js': () =>
    import('./dir/bar.js?foo=bar&bar=true').then((m) => m.setup)
}
```

### Inconvénients des imports glob

Notez bien que :

- Ceci est une fonctionnalité spécifique à Vite et ne fait partie d’aucun standard ES ou web.
- Les patterns glob sont traités comme des spécifications d’imports : ils doivent être relatifs (ils commencent par `./`), absolus (ils commencent par `/`, ce qui est résolu comme étant relatif à la racine projet), ou un chemin d’alias (voir [l’option `resolve.alias`](/config/#resolve-alias)).
- La correspondance glob est faite à l’aide de [`fast-glob`](https://github.com/mrmlnc/fast-glob) — vous pouvez retrouver sa documentation des [patterns glob supportés](https://github.com/mrmlnc/fast-glob#pattern-syntax).
- Vous devez être conscient·e du fait que tous les arguments de `import.meta.glob` doivent être **passés en tant que littéraux**. Vous ne pouvez PAS utiliser de variables ou d’expressions.

## Import dynamique

Un peu comme les [imports glob](#imports-glob), Vite supporte l’import dynamique avec des variables.

```ts
const module = await import(`./dir/${file}.js`)
```

Notez qu’une variable ne peut représenter qu’un seul niveau de dossier. Par exemple, si vous assignez `foo/bar` à `file`, l’import ne fonctionnera pas. Si vous avez besoin de quelque chose de plus complet, penchez-vous sur la fonctionnalité d’[import glob](#imports-glob).

## WebAssembly

Les fichiers `.wasm` pré-compilés peuvent être importés avec le paramètre de requête `?init` — l’export par défaut sera une fonction d’initialisation qui retourne une promesse (_Promise_) de l’instance wasm :

```js
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

La fonction init peut aussi prendre un objet `imports` qui est passé à `WebAssembly.instantiate` comme second argument :

```js
init({
  imports: {
    someFunc: () => {
      /* ... */
    }
  }
}).then(() => {
  /* ... */
})
```

Dans la compilation de production, les fichiers `.wasm` qui sont plus petits que `assetInlineLimit` seront mis inline en tant que chaînes de caractères base64. Sinon, ils seront copiés dans le dossier dist comme des ressources et seront récupérés à la demande.

::: warning
[La proposition d’intégration des modules ES dans WebAssembly](https://github.com/WebAssembly/esm-integration) n’est pas encore supportée.
Utilisez [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) ou un autre plugin de la communauté si vous en avez besoin.
:::

## Web workers

### Import avec constructeur

Un script de web worker peut être importé à l’aide de [`new Worker()`](https://developer.mozilla.org/fr/docs/Web/API/Worker/Worker) et [`new SharedWorker()`](https://developer.mozilla.org/fr/docs/Web/API/SharedWorker/SharedWorker). Comparée aux suffixes spécifiques pour les workers, cette syntaxe est plus proche des standards et est la façon **recommandée** de créer des workers.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Le constructeur du worker peut aussi prendre des options qui peuvent être utilisées pour créer des workers « modules » :

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
})
```

### Import avec un suffixe de requête

Un script web worker peut être importé directement en suffixant `?worker` ou `?sharedworker` à la requête d’import. L’export par défaut sera un constructeur de worker :

```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Le script de worker peut aussi utiliser `import` plutôt qu’`importScripts()` — notez que durant le développement cela repose sur le support natif et ne fonctionne actuellement qu’avec Chrome, mais en production ce comportement est compilé.

Par défaut, le script du worker sera émis dans un morceau (_chunk_) différent dans la compilation de production. Si vous souhaitez mettre le worker inline dans des chaînes de caractères base64, ajoutez l’instruction `inline` :

```js
import MyWorker from './worker?worker&inline'
```

Si vous voulez récupérer le worker en tant qu’URL, ajoutez la requête `url` :

```js
import MyWorker from './worker?worker&url'
```

Vous pouvez aller voir les [Options des workers](/config/#options-du-worker) pour plus de détails sur la configuration du bundling des workers.

## Optimisations de la compilation

> Les fonctionnalités ci-dessous sont appliquées automatiquement lors du process de compilation et il n’y a pas besoin de les configurer explicitement, à moins que vous ne vouliez les désactiver.

### Fractionnement (_code splitting_) du CSS

Vite extrait automatiquement le CSS utilisé par les modules dans un morceau (_chunk_) asynchrone et génère un fichier séparé. Le fichier CSS est automatiquement chargé via une balise `<link>` quand le morceau asynchrone associé est chargé, et le morceau asynchrone n’est évalué qu’après le chargement du CSS pour éviter les [FOUCs](https://fr.wikipedia.org/wiki/FOUC).

Si vous préférez que tout le CSS soit extrait dans un même fichier, vous pouvez désactiver le fractionnement du CSS en définissant [`build.cssCodeSplit`](/config/#build-csscodesplit) à `false`.

### Génération des directives de pré-chargement (_preload directives_)

Vite génère automatiquement des directives `<link rel="modulepreload">` pour les morceaux d’entrée et leurs imports directs dans le HTML.

### Optimisation du chargement des morceaux (_chunks_) asynchrones

Dans les applications réelles, Rollup génère souvent des morceaux « communs » — pour le code qui est partagé par deux morceaux ou plus. Si l’on combine ça avec des imports dynamiques, il est courant d’avoir le scénario suivant :

![graph](/images/graph.png)

Dans un scénario non-optimisé, quand le morceau asynchrone `A` est importé, le navigateur devra faire la requête pour `A` et le lire avant de pouvoir comprendre qu’il a aussi besoin du morceau commun `C`. Cela résulte en un aller-retour supplémentaire sur le réseau :

```
Entrée ---> A ---> C
```

Vite réécrit automatiquement les imports dynamiques fractionnés avec une phase de pré-chargement afin que quand la requête pour `A` est faite, `C` soit chargé **en parallèle** :

```
Entrée ---> (A + C)
```

Il est possible que `C` ait à son tour d’autres imports, ce qui résulte en encore plus d’allers-retours dans le scénario non-optimisé. L’optimisation de Vite va retracer tous les imports directs pour éliminer complètement les allers-retours, peu importe le niveau de profondeur des imports.
