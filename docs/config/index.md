---
title: Configurer Vite
---

# Configurer Vite

## Fichier de configuration

### Résolution du fichier de configuration

Lorsque vous lancez `vite` depuis l’interface en ligne de commande, Vite cherchera automatiquement un fichier de configuration nommé `vite.config.js` à la [racine du projet](/docs/guide/#index-html-et-racine-du-projet).

Le fichier de configuration le plus basique ressemble à ça :

```js
// vite.config.js
export default {
  // options de configuration
}
```

Notez que Vite supporte le fait d’utiliser la syntaxe des modules ES dans le fichier de configuration même si le projet ne les utilise pas via `type: "module"`. Dans ce cas-là, le fichier de configuration est préprocessé automatiquement avant le chargement.

Vous pouvez également spécifier explicitement l’emplacement de votre fichier de configuration grâce l’option `--config` de l’interface en ligne de commandes (résolue par rapport à `cwd`) :

```bash
vite --config my-config.js
```

Notez que Vite remplacera `__filename`, `__dirname`, et `import.meta.url`. Les utiliser comme noms pour des variables provoquera une erreur :

```js
const __filename = "value"
// sera transformé en
const "path/vite.config.js" = "value"
```

### Configuration d’IntelliSense

Puisque des typages TypeScript sont fournis avec Vite, vous pouvez profiter de l’IntelliSense de votre IDE à l’aide des indices de types (_type hints_) JSDoc :

```js
/**
 * @type {import('vite').UserConfig}
 */
const config = {
  // ...
}

export default config
```

Autrement, vous pouvez utiliser le helper `defineConfig` qui devrait permettre de profiter de l’IntelliSense sans les annotations JSDoc :

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite supporte aussi les fichiers de configuration en TypeScript. Pour ce faire vous pouvez utiliser le helper `defineConfig` dans un fichier `vite.config.ts`.

### Configuration conditionnelle

Si la configuration doit déterminer certaines options selon la commande (`dev`/`serve` ou `build`) ou le [mode](/docs/guide/env-and-mode) utilisé, elle devrait plutôt exporter une fonction :

```js
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // configuration spécifique au mode développement
    }
  } else {
    // command === 'build'
    return {
      // configuration spécifique au mode compilation
    }
  }
})
```

Il est important de noter qu’avec l’API de Vite, la valeur de `command` est `serve` pour le développement (dans l’interface en ligne de commande, `vite`, `vite dev` et `vite serve` sont tous des alias pour la même commande), et `build` pour la production (`vite build`).

### Configuration asynchrone

Si la configuration doit faire des appels asynchrones, elle peut très bien exporter une fonction asynchrone :

```js
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // configuration
  }
})
```

## Options communes

### root

- **Type :** `string`
- **Valeur par défaut :** `process.cwd()`

  Dossier racine du projet (où se trouve `index.html`). Cela peut être un chemin absolu, ou un chemin relatif à la position du fichier de configuration.

  Voir [`index.html` et racine du projet](/docs/guide/#index-html-et-racine-du-projet) pour plus de détails.

### base

- **Type :** `string`
- **Valeur par défaut :** `/`

  Chemin public de base en développement ou production. Les valeurs acceptées sont :

  - des chemins d’URL absolus, comme `/foo/`
  - l’URL complète, comme `https://foo.com/`
  - une chaîne vide ou `./` (pour le déploiement intégré)

  Voir [Chemin public de base](/docs/guide/build#chemin-public-de-base) pour plus de détails.

### mode

- **Type :** `string`
- **Valeur par défaut :** `'development'` pour `serve`, `'production'` pour `build`

  Spécifier cette option dans la configuration remplacera le mode par défaut **à la fois pour `serve` et `build`**. Elle peut aussi être spécifiée grâce à l’option de ligne de commande `--mode`.

  Voir [Variables d’environnement et modes](/docs/guide/env-and-mode) pour plus de détails.

### define

- **Type :** `Record<string, string>`

  Définit des constantes globales. Les valeurs saisies seront définies comme des variables globales en développement et remplacées statiquement pendant la compilation.

  - Depuis la version `2.0.0-beta.70`, les chaînes de caractères sont utilisées comme des expressions brutes, donc si vous définissez une chaîne de caractères constante, elle doit être explicitement mise entre guillemets (avec `JSON.stringify` par exemple).

  - Les remplacements sont faits seulement lorsque la correspondance est entourée par des délimiteurs de mots (`\b`).

  Puisqu’elle est implémentée à l’aide de simples remplacements textuels sans analyse de syntaxe, nous recommandons d’utiliser `define` uniquement pour des CONSTANTES.

  Par exemple, `process.env.FOO` et `__APP_VERSION__` conviennent bien. Mais `process` ou `global` ne devraient pas être mis dans cette option. Les variables devraient plutôt être remplacées par un shim ou un polyfill.

  ::: tip NOTE
  Utilisateurs de TypeScript, assurez-vous d’ajouter les déclarations de types dans le fichier `env.d.ts` ou `vite-env.d.ts` pour profiter des vérifications de type et d’IntelliSense.

  Par exemple :

  ```ts
  // vite-env.d.ts
  declare const __APP_VERSION__: string
  ```

  :::

### plugins

- **Type :** `(Plugin | Plugin[])[]`

  Liste des plugins à utiliser. Les plugins falsy sont ignorés et les listes de plugins sont aplaties. Voir [API pour plugin](/docs/guide/api-plugin) pour plus de détails sur les plugins Vite.

### publicDir

- **Type :** `string | false`
- **Valeur par défaut :** `"public"`

  Répertoire d’où servir les ressources statiques. Les fichiers de ce répertoires sont servis à `/` pendant le développement et copiés à la racine de `outDir` pendant la compilation, et ils sont toujours servis ou copiés tels quels sans aucune transformation. La valeur peut être soit un chemin absolu sur tout le système de fichiers, soit un chemin relatif à la racine du projet. La valeur par défaut est `.vite` quand aucun package.json n’est détecté.

  Définir `publicDir` à `false` désactive cette fonctionnalité.

  Voir [Le répertoire `public`](/docs/guide/assets#le-repertoire-public) pour plus de détails.

### cacheDir

- **Type :** `string`
- **Valeur par défaut :** `"node_modules/.vite"`

  Répertoire où garder les fichiers de cache. Les fichiers dans ce répertoire sont des dépendances pré-bundlées ou d’autres fichiers de cache générés par Vite, qui permettent d’améliorer les performances. Vous pouvez utiliser le signal `--force` ou supprimer manuellement le répertoire pour régénérer les fichiers de cache. La valeur peut être soit un chemin absolu sur tout le système de fichiers, soit un chemin relatif à la racine du projet.

### resolve.alias

- **Type :** `Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

  Sera passé à `@rollup/plugin-alias` via son [option `entries`](https://github.com/rollup/plugins/tree/master/packages/alias#entries). Cela peut être soit un objet, soit un array de paires `{ trouve, remplace, résolveurCustom }`.

  Utilisez toujours des chemins absolus lorsque vous définissez des alias de chemin vers le système de fichiers. Les alias relatifs seront utilisés tel quels et ne seront pas résolus en tant que chemins du système de fichiers.

  Une résolution plus fine peut être faite avec des [plugins](/docs/guide/api-plugin).

### resolve.dedupe

- **Type :** `string[]`

  Si vous avez des duplications d’une même dépendance dans votre app (probablement à cause du hoisting ou de packages liés dans les monorepos), utilisez cette option pour forcer Vite à toujours résoudre les dépendances à la même copie (celle à la racine du projet).

  :::warning SSR + ESM
  Pour les compilations SSR, la déduplication ne fonctionne pas pour la compilation en ESM configurée via `build.rollupOptions.output`. Vous pouvez contourner cette limitation en utilisant une compilation CJS en attendant qu’ESM propose un meilleur support des plugins pour le chargement de modules.
  :::

### resolve.conditions

- **Type :** `string[]`

  Conditions supplémentaires pour la résolution des [exports conditionnels](https://nodejs.org/api/packages.html#packages_conditional_exports)  d’un package.

  Le champ `exports` (dans `package.json`) d’un package avec des exports conditionnels peut ressembler à ceci :

  ```json
  {
    "exports": {
      ".": {
        "import": "./index.esm.js",
        "require": "./index.cjs.js"
      }
    }
  }
  ```

  Ici, `import` et `require` sont des « conditions ». Les conditions peuvent être imbriquées et doivent être spécifiées du plus spécifique au moins spécifique.

  Vite accepte une certaine liste de conditions, et choisira la première condition qui se trouve dans cette liste. La liste par défaut est : `import`, `module`, `browser`, `default`, et `production`/`development` selon le mode actuel. `resolve.conditions` permet de spécifier des conditions supplémentaires à accepter.

### resolve.mainFields

- **Type :** `string[]`
- **Valeur par défaut :** `['module', 'jsnext:main', 'jsnext']`

  Liste des champs de `package.json` à tester lors de la résolution du point d’entrée d’un package. Notez que les exports conditionnels résolus via le champ `exports` sont prioritaires : si la résolution d’un point d’entrée depuis `exports` réussit, le champ principal (_main field_) sera ignoré.

### resolve.extensions

- **Type :** `string[]`
- **Valeur par défaut :** `['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']`

  Liste des extensions de fichiers à tester pour les imports qui ne mentionnent pas l’extension. Notez qu’il n’est **PAS** recommandé d’omettre les extensions pour les imports de types spéciaux (par exemple `.vue`) car cela peut interférer avec la façon dont l’IDE et les autres systèmes d’aide au développement les interprètent.

### resolve.preserveSymlinks

- **Type :** `boolean`
- **Valeur par défaut :** `false`

  Activer cette option fera que Vite détermine l’identité d’un fichier uniquement sur la base du chemin qui lui est fourni (donc sans suivre les liens symboliques) plutôt que de l’interpréter pour en déduire son chemin réel (en suivant les liens symboliques).

- **Voir aussi :** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

### css.modules

- **Type :**

  ```ts
  interface CSSModulesOptions {
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * par défaut : null
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | null
  }
  ```

  Configure le comportement des modules CSS. Les options sont passées à [postcss-modules](https://github.com/css-modules/postcss-modules).

### css.postcss

- **Type :** `string | (postcss.ProcessOptions & { plugins?: postcss.Plugin[] })`

  Configuration PostCSS inline (le format attendu est le même que celui de `postcss.config.js`), ou bien un chemin spécifique où chercher la configuration PostCSS (par défaut à la racine du projet). La recherche est faite à l’aide de [postcss-load-config](https://github.com/postcss/postcss-load-config).

  Notez que si une configuration inline est passée, Vite n’ira chercher aucune autre source de configuration PostCSS.

### css.preprocessorOptions

- **Type :** `Record<string, object>`

  Specifie les options à passer aux préprocesseurs CSS. Par exemple :

  ```js
  export default defineConfig({
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$injectedColor: orange;`
        }
      }
    }
  })
  ```

### json.namedExports

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Définit si les imports nommés dans les fichiers `.json` doivent être supportés.

### json.stringify

- **Type :** `boolean`
- **Valeur par défaut :** `false`

  Si cette option est définie à `true`, le JSON importé sera transformé en `export default JSON.parse("…")` ce qui est largement plus performant que les littéraux d’objets (_Object literals_), surtout lorsque le fichier JSON est gros.

  Activer cette option empêche d’utiliser les imports nommés.

### esbuild

- **Type :** `ESBuildOptions | false`

  `ESBuildOptions` étend les [options de transformation d’esbuild](https://esbuild.github.io/api/#transform-api). Le cas d’usage le plus courant est la customisation du JSX :

  ```js
  export default defineConfig({
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  })
  ```

  Par défaut, esbuild s’applique aux fichiers `ts`, `jsx` et `tsx`. Vous pouvez changer ce comportement avec `esbuild.include` et `esbuild.exclude`, qui acceptent tous les deux les types `string | RegExp | (string | RegExp)[]`.

  En plus de ça, vous pouvez utiliser `esbuild.jsxInject` pour injecter automatiquement les imports d’helpers JSX à chaque fichier transformé par esbuild :

  ```js
  export default defineConfig({
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  })
  ```

  Définissez cette option à `false` pour désactiver les transformations esbuild.

### assetsInclude

- **Type :** `string | RegExp | (string | RegExp)[]`
- **Voir aussi :** [Gestion des ressources statiques](/docs/guide/assets)

  Spécifie des [patterns picomatch](https://github.com/micromatch/picomatch) supplémentaires à traiter comme des ressources statiques afin :

  - Qu’elles soient exclues de la pipeline de transformation des plugins lorsqu’elles sont référencées dans le HTML ou directement requêtées avec `fetch` ou les XHR.

  - Que les importer dans le JS retourne leur URL résolue (ce comportement peut être redéfini si vous avez un plugin `enforce: 'pre'` qui gère ce type de ressource différemment).

  La liste par défaut des types de ressources peut être retrouvée [ici](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts).

  **Exemple :**

  ```js
  export default defineConfig({
    assetsInclude: ['**/*.gltf']
  })
  ```

### logLevel

- **Type :** `'info' | 'warn' | 'error' | 'silent'`

  Ajuste le niveau de verbosité de la sortie console. `'info'` par défaut.

### clearScreen

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Définissez cette option à `false` pour empêcher Vite de vider l’écran du terminal lorsqu’il logge certains messages. En ligne de commande, utilisez `--clearScreen false`.

### envDir

- **Type :** `string`
- **Valeur par défaut :** `root`

  Le répertoire à partir duquel les fichiers `.env` sont chargés. Cela peut être un chemin absolu, ou un chemin relatif à la racine du projet.

  Voir [cette section](/docs/guide/env-and-mode#fichiers-env) pour plus d’informations sur les fichiers d’environnement.

### envPrefix

- **Type :** `string | string[]`
- **Valeur par défaut :** `VITE_`

  Les variables d’environnement qui commencent par l’`envPrefix` seront exposées au code source client par le biais d’`import.meta.env`.

  :::warning NOTE DE SÉCURITÉ
  Vous ne devriez pas définir `envPrefix` à `''`, car cela exposera toutes vos variables d’environnement et causera une fuite d’informations sensibles. Vite retournera une erreur dans ce cas.
  :::

## Options du serveur

### server.host

- **Type :** `string | boolean`
- **Valeur par défaut :** `'127.0.0.1'`

  Spécifie de quelles adresses IP le serveur doit accepter les requêtes.
  Définissez cette option à `0.0.0.0` ou à `true` pour écouter depuis toutes les adresses, y compris celles du réseau local ou public.

  Ceci est aussi possible via l’interface en ligne de commande avec `--host 0.0.0.0` ou simplement `--host`.

### server.port

- **Type :** `number`
- **Valeur par défaut :** `3000`

  Spécifie le port serveur. Notez que si le port est déjà utilisé, Vite utilisera automatiquement le prochain port disponible, alors il est possible que ce ne soit pas le port sur lequel le serveur écoute in fine.

### server.strictPort

- **Type :** `boolean`

  Définissez cette option à `true` pour stopper l’exécution si le port est déjà utilisé, plutôt que d’utiliser automatiquement le prochain port disponible.

### server.https

- **Type :** `boolean | https.ServerOptions`

  Active TLS + HTTP/2. Notez que si l’[option `server.proxy`](#server-proxy) est également utilisée, seul TLS sera activé.

  La valeur peut aussi être un [objet d’options](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) qui sera passé à `https.createServer()`.

### server.open

- **Type :** `boolean | string`

  Définit si l’application doit s’ouvrir automatiquement dans le navigateur au démarrage du serveur. Quand la valeur est une chaîne de caractères, elle sera traitée comme l’URL à ouvrir. Si vous souhaitez ouvrir le serveur à l’aide d’un navigateur spécifique, vous pouvez définir la variable d’environnement `process.env.BROWSER` (par exemple `firefox`). Voir le [package `open`](https://github.com/sindresorhus/open#app) pour plus de détails.

  **Exemple :**

  ```js
  export default defineConfig({
    server: {
      open: '/docs/index.html'
    }
  })
  ```

### server.proxy

- **Type :** `Record<string, string | ProxyOptions>`

  Configure des règles de proxy pour le serveur de développement. Attend un objet contenant des paires `{ clé: valeurs }`. Si la clé commence par `^`, elle sera interprétée comme une `RegExp` (expression régulière). L’option `configure` peut être utilisée pour accéder à l’instance de proxy.

  Utilise le [package `http-proxy`](https://github.com/http-party/node-http-proxy). La liste complète des options est à retrouver [ici](https://github.com/http-party/node-http-proxy#options).

  **Exemple :**

  ```js
  export default defineConfig({
    server: {
      proxy: {
        // avec une simple chaîne
        '/foo': 'http://localhost:4567',
        // avec des options
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // avec une expression régulière
        '^/fallback/.*': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fallback/, '')
        },
        // utilisation de l’instance de proxy
        '/api': {
          target: 'http://jsonplaceholder.typicode.com',
          changeOrigin: true,
          configure: (proxy, options) => {
            // proxy sera une instance de `http-proxy`
          }
        },
        // proxifier websockets ou socket.io
        '/socket.io': {
          target: 'ws://localhost:3000',
          ws: true
        }
      }
    }
  })
  ```

### server.cors

- **Type :** `boolean | CorsOptions`

  Configure le CORS pour le serveur de développement. Par défaut, il est activé et autorise toutes les origines. Passez un [objet d’options](https://github.com/expressjs/cors) pour définir plus finement son comportement ou `false` pour le désactiver.

### server.force

- **Type :** `boolean`
- **Voir aussi :** [Pré-bundler des dépendances](/docs/guide/dep-pre-bundling)

  Définissez cette option à `true` pour forcer le pré-bundling des dépendances.

### server.hmr

- **Type :** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

  Désactive ou configure la connexion de rafraîchissement des modules à la volée (_HMR_) (dans les cas où le websocket HMR doit utiliser une adresse différente de celle du serveur HTTP).

  Définissez `server.hmr.overlay` à `false` pour désactiver l’overlay d’erreur serveur.

  `clientPort` est une option avancée qui remplace le port uniquement côté client, vous permettant de servir le websocket sur un port différent que celui sur lequel le cherche le client. Elle est utile si vous utilisez un proxy SSL devant votre serveur de développement.

  Lorsque vous utilisez `server.middlewareMode` ou `server.https`, assigner votre serveur HTTP(S) à `server.hmr.server` traitera les requêtes de connexion HMR à travers votre serveur. Cela peut être utile si vous utilisez des certificats auto-signés ou si vous voulez exposer Vite sur le réseau sur un seul port.

### server.watch

- **Type :** `object`

  Options de watcher à passer à [chokidar](https://github.com/paulmillr/chokidar#api).

  Lorsque vous exécutez Vite sur Windows Subsystem for Linux (WSL) 2, si le dossier projet se trouve sur un système de fichiers Windows, vous devrez définir cette option à `{ usePolling: true }`. Cela est dû à une [limitation de WSL2](https://github.com/microsoft/WSL/issues/4739) relative aux systèmes de fichiers Windows.

  Le watcher serveur Vite ignore les répertoires `.git/` et `node_modules/` par défaut. Si vous souhaitez watcher un package dans `node_modules/`, vous pouvez passer un pattern glob négatif à `server.watch.ignored` comme suit :

  ```js
  export default defineConfig({
    server: {
      watch: {
        ignored: ['!**/node_modules/your-package-name/**']
      }
    },
    // Le package watché doit être exclu de l’optimisation afin qu’il puisse
    // apparaître dans le graphe de dépendances et déclencher le
    // rafraîchissement à la volée
    optimizeDeps: {
      exclude: ['your-package-name']
    }
  })
  ```

### server.middlewareMode

- **Type :** `'ssr' | 'html'`

  Crée le serveur Vite en mode middleware (sans serveur HTTP).

  - `'ssr'` désactivera la logique servant le HTML de Vite et vous devrez servir `index.html` manuellement.
  - `'html'` activera la logique servant le HTML de Vite.

- **Voir aussi :** [SSR - Paramétrer le serveur de développement](/docs/guide/ssr#parametrer-le-serveur-de-developpement)

- **Exemple :**

  ```js
  const express = require('express')
  const { createServer: createViteServer } = require('vite')

  async function createServer() {
    const app = express()

    // créer le serveur Vite en mode middleware
    const vite = await createViteServer({
      server: { middlewareMode: 'ssr' }
    })
    // utiliser l’instance de connexion de Vite comme middleware
    app.use(vite.middlewares)

    app.use('*', async (req, res) => {
      // si `middlewareMode` est `'ssr'`, `index.html` doit être servi ici
      // si `middlewareMode` est `'html'`, il n’y a pas besoin de servir
      // `index.html` car Vite le fera
    })
  }

  createServer()
  ```

### server.fs.strict

- **Type :** `boolean`
- **Valeur par défaut :** `true` (activé par défaut depuis Vite 2.7)

  Empêche de servir des fichiers situés hors de la racine de l’espace de travail (_workspace_).

### server.fs.allow

- **Type :** `string[]`

  Restreint les fichiers pouvant être servis via `/@fs/`. Quand `server.fs.strict` est définie à `true`, accéder à des fichiers hors de cette liste de répertoires qui ne sont pas importés par un fichier autorisé donnera une 403.

  Par défaut, Vite cherchera successivement dans les dossiers parents de la [racine du projet](/docs/guide/#index-html-et-racine-du-projet) un éventuel espace de travail (_workspace_) et l’utilisera pour savoir ce qu’il peut servir ou non. Un espace de travail valide remplit l’une des conditions suivantes, et si aucun espace de travail n’est trouvé Vite se rabattra sur la racine du projet.

  - un fichier `package.json` contenu dans le dossier comporte un champ `workspaces`
  - le dossier contient l’un des fichiers suivants :
    - `lerna.json`
    - `pnpm-workspace.yaml`

  Cette option accepte un chemin spécifiant la racine d’un espace de travail personnalisé. Cela peut être un chemin absolu ou un chemin relatif à la [racine du projet](/docs/guide/#index-html-et-racine-du-projet). Par exemple :

  ```js
  export default defineConfig({
    server: {
      fs: {
        // permet de servir des fichiers se trouvant dans le dossier parent de
        // la racine du projet
        allow: ['..']
      }
    }
  })
  ```

  Quand `server.fs.allow` est spécifiée, la détection automatique de la racine de l’espace de travail est désactivée. Pour plutôt étendre le comportement de base, une fonction `searchForWorkspaceRoot` est exposée :

  ```js
  import { defineConfig, searchForWorkspaceRoot } from 'vite'

  export default defineConfig({
    server: {
      fs: {
        allow: [
          // recherche automatiquement un espace de travail parmi les dossiers
          // parents et autorise de servir les fichiers qu’il contient
          searchForWorkspaceRoot(process.cwd()),
          // un autre dossier dont Vite peut servir les fichiers
          '/chemin/spécifique/autorisé'
        ]
      }
    }
  })
  ```

### server.fs.deny

- **Expérimental**
- **Type :** `string[]`

  Liste de fichiers sensibles ne pouvant pas être servis par le serveur de développement de Vite.

  Cette liste est `['.env', '.env.*', '*.{pem,crt}']` par défaut.

### server.origin

- **Type :** `string`

  Définit l’origine des URLs de ressources générés pour le développement.

  ```js
  export default defineConfig({
    server: {
      origin: 'http://127.0.0.1:8080/'
    }
  })
  ```

## Options de compilation

### build.target

- **Type :** `string | string[]`
- **Valeur par défaut :** `'modules'`
- **Voir aussi :** [Compatibilité navigateur](/docs/guide/build#compatibilite-navigateur)

  Cible de compatibilité navigateur du bundle final. La valeur par défaut est spécifique à Vite (`'modules'`), et correspond aux [navigateurs supportant les modules ES](https://caniuse.com/es6-module).

  Une autre valeur spécifique est `'esnext'`. Elle suppose que les imports dynamiques sont supportés et transpilera aussi peu que possible :

  - Si l’option [`build.minify`](#build-minify) est à `'terser'`, `'esnext'` sera interprété comme `'es2019'`.
  - Sinon, aucune transpilation ne sera effectuée.

  La transformation est réalisée à l’aide d’esbuild et la valeur doit être une [option target d’esbuild](https://esbuild.github.io/api/#target) valide. Les valeurs spécifiées peuvent être soit une version d’ECMAScript (par exemple `es2015`), une version de navigateur (par exemple `chrome58`), ou un array de plusieurs cibles comme celles-ci.

  Notez que la compilation échouera s’il y a des fonctionnalités qui ne peuvent pas être transpilées par esbuild. Voir la [documentation d’esbuild](https://esbuild.github.io/content-types/#javascript) pour de plus amples détails.

### build.polyfillModulePreload

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Définit si le [polyfill de module preload](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) doit être injecté automatiquement.

  Si cette option est définie à `true`, le polyfill est automatiquement injecté au module proxy de chaque entrée `index.html`. Si la compilation est configurée pour utiliser une entrée spécifique non-HTML à l’aide de `build.rollupOptions.input`, alors il faut importer manuellement le polyfill dans ladite entrée :

  ```js
  import 'vite/modulepreload-polyfill'
  ```

  Note : le polyfill ne sera **pas** appliqué en [mode librairie](/docs/guide/build#mode-librairie). Si vous devez supporter des navigateurs sans import dynamique natif, vous devriez probablement éviter de l’utiliser pour votre librairie.

### build.outDir

- **Type :** `string`
- **Valeur par défaut :** `dist`

  Spécifie le répertoire de sortie (par rapport à la [racine du projet](/docs/guide/#index-html-et-racine-du-projet)).

### build.assetsDir

- **Type :** `string`
- **Valeur par défaut :** `assets`

  Spécifie le répertoire où mettre les ressources générées (par rapport à `build.outDir`).

### build.assetsInlineLimit

- **Type :** `number`
- **Valeur par défaut :** `4096` (4kO)

  Les ressources importées ou référencées qui sont plus petites que cette limite seront passées en tant qu’URLs base64 pour éviter de multiplier les requêtes HTTP. Définissez cette valeur à `0` pour désactiver totalement ce méchanisme.

  ::: tip Note
  Si vous spécifiez `build.lib`, `build.assetsInlineLimit` sera ignorée et les ressources seront toujours converties, peu importe la taille du fichier.
  :::

### build.cssCodeSplit

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Définit si le code CSS doit être fractionné (_code splitting_) ou non. Lorsque cette option est active, le CSS importé dans des morceaux (_chunks_) asynchrones y sera associé et sera inséré quand le morceau est chargé.

  Si elle n’est pas active, le CSS de tout le projet sera extrait dans un unique fichier CSS.

  ::: tip Note
  Si vous spécifiez `build.lib`, `build.cssCodeSplit` sera `false` par défaut.
  :::

### build.cssTarget

- **Type :** `string | string[]`
- **Valeur par défaut :** la même que [`build.target`](/docs/config/#build-target)

  Cette option permet de définir une cible de compatibilité navigateur pour la minification du CSS qui diffère de celle utilisée pour la transpilation JavaScript.

  Elle ne devrait être utilisée que lorsque vous visez un navigateur non-mainstream.
  Un exemple est la WebView de l’application Android WeChat, qui supporte le JavaScript moderne mais pas la [notation  hexadécimale `#RGBA` dans le CSS](https://developer.mozilla.org/fr/docs/Web/CSS/color_value#les_couleurs_rgb).
  Dans ce cas, vous devrez définir `build.cssTarget` à `chrome61` pour éviter que Vite ne transforme les couleurs `rgba()` en notation hexadécimale `#RGBA`.

### build.sourcemap

- **Type :** `boolean | 'inline' | 'hidden'`
- **Valeur par défaut :** `false`

  Définit si et comment des sourcemaps doivent être générées en production. Si cette option est à `true`, un fichier de sourcemap séparé sera créé. Si elle est à `'inline'`, la sourcemap sera ajoutée comme URI de données. `'hidden'` aura le même effet que `true` à la différence que les commentaires seront retirés.

### build.rollupOptions

- **Type :** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  Permet de modifier directement les options de Rollup. Les options possibles sont les mêmes que celles qui peuvent être exportées d’un fichier de configuration Rollup et elles seront fusionnées avec les options Rollup internes de Vite. Voir la [documentation des options de Rollup](https://rollupjs.org/guide/en/#big-list-of-options) pour plus de détails.

### build.commonjsOptions

- **Type :** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

  Les options à passer à [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs).

### build.dynamicImportVarsOptions

- **Type :** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)

  Les options à passer à [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars).

### build.lib

- **Type :** `{ entry: string, name?: string, formats?: ('es' | 'cjs' | 'umd' | 'iife')[], fileName?: string | ((format: ModuleFormat) => string) }`
- **Voir aussi :** [Mode librairie](/docs/guide/build#mode-librairie)

  Active le mode librairie. `entry` est requise puisque la librairie ne peut utiliser de HTML comme entrée. `name` est la variable globale qui sera exposée et est requise quand `formats` contient `'umd'` ou `'iife'`. Les `formats` par défaut sont `['es', 'umd']`. `fileName` est le nom du fichier de package en sortie, par défaut il s’agit du champ `name` du package.json. Il peut aussi être défini comme une fonction prenant le `format` comme argument.

### build.manifest

- **Type :** `boolean | string`
- **Valeur par défaut :** `false`
- **Voir aussi :** [Intégration du back-end](/docs/guide/backend-integration)

  Quand cette option est à `true`, la compilation générera également un fichier `manifest.json` contenant un mapping entre les noms de fichiers de ressources non-hashés et leurs versions hashées, qui peut ensuite être utilisé par un framework serveur afin de rendre les bons liens de ressources. Si la valeur est une chaîne de caractères, elle sera utilisée comme nom pour le fichier du manifeste.

### build.ssrManifest

- **Type :** `boolean | string`
- **Valeur par défaut :** `false`
- **Voir aussi :** [Rendu côté serveur (SSR)](/docs/guide/ssr)

  Quand cette option est à `true`, la compilation générera également un manifeste de rendu côté serveur permettant de déterminer les liens de style ainsi que les directives de pré-chargement (_preload directives_) des ressources en production. Si la valeur est une chaîne de caractères, elle sera utilisée comme nom pour le fichier du manifeste.

### build.ssr

- **Type :** `boolean | string`
- **Valeur par défaut :** `undefined`
- **Voir aussi :** [Rendu côté serveur (SSR)](/docs/guide/ssr)

  Définit si la compilation doit être orientée vers un rendu côté serveur. La valeur peut être une chaîne spécifiant directement l’entrée de rendu côté serveur, ou `true`, ce qui requiert de spécifier l’entrée de rendu côté serveur à l’aide de `rollupOptions.input`.

### build.minify

- **Type :** `boolean | 'terser' | 'esbuild'`
- **Valeur par défaut :** `'esbuild'`

  Définissez cette option à `false` pour désactiver la minification, ou spécifiez le minifieur qui doit être utilisé. Le minifieur par défaut est [esbuild](https://github.com/evanw/esbuild), qui est 20 à 40 fois plus rapide que terser mais compresse entre 1 et 2 % moins bien. Vous pouvez voir les [Benchmarks](https://github.com/privatenumber/minification-benchmarks).

  Notez que cette option n’est pas disponible si vous utilisez le formet `'es'` en mode librairie.

### build.terserOptions

- **Type :** `TerserOptions`

  Les [options de minification](https://terser.org/docs/api-reference#minify-options) à passer à Terser.

### build.write

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Définissez cette option à `false` pour empêcher de stocker le bundle sur le disque. Cette option est surtout utilisée dans le contexte des [appels programmatiques à `build()`](/docs/guide/api-javascript#build) où le bundle doit encore passer par une phase de polissage avant de pouvoir être stocké.

### build.emptyOutDir

- **Type :** `boolean`
- **Valeur par défaut :** `true` si `outDir` est dans `root`

  Par défaut, Vite videra le `outDir` lors de la compilation s’il se trouve dans la racine projet. Il émettra un avertissement si `outDir` est en dehors de la racine projet pour empêcher de retirer accidentellement des fichiers importants. Vous pouvez définir explicitement cette option pour retirer l’avertissement. Elle est également disponible avec l’interface en ligne de commande en tant que `--emptyOutDir`.

### build.reportCompressedSize

- **Type :** `boolean`
- **Valeur par défaut :** `true`

  Active ou désactive le rapport de la taille compressée avec gzip. Compresser de gros fichiers peut être lent, alors désactiver cette option pourrait améliorer les performances dans le cadre de gros projets.

### build.chunkSizeWarningLimit

- **Type :** `number`
- **Valeur par défaut :** `500`

  Limite pour les avertissements de taille des morceaux (_chunks_) (en kO).

### build.watch

- **Type :** [`WatcherOptions`](https://rollupjs.org/guide/en/#watch-options)`| null`
- **Valeur par défaut :** `null`

  Définissez cette option à `{}` pour activer l'observateur de fichier de Rollup. Cette option est surtout utile dans des contextes où les plugins sont build-only ou pour les process d’intégration.

## Options de l’aperçu (_preview_)

### preview.host

- **Type :** `string | boolean`
- **Valeur par défaut :** [`server.host`](#server_host)

  Spécifie de quelles adresses IP le serveur doit accepter les requêtes.
  Définissez cette option à `0.0.0.0` ou à `true` pour écouter depuis toutes les adresses, y compris celles du réseau local ou public.

  Ceci est aussi possible via l’interface en ligne de commande avec `--host 0.0.0.0` ou simplement `--host`.

### preview.port

- **Type :** `number`
- **Valeur par défaut :** `4173`

  Spécifie le port serveur. Notez que si le port est déjà utilisé, Vite utilisera automatiquement le prochain port disponible, alors il est possible que ce ne soit pas le port sur lequel le serveur écoute in fine.

  **Exemple :**

  ```js
  export default defineConfig({
    server: {
      port: 3030
    },
    preview: {
      port: 8080
    }
  })
  ```

### preview.strictPort

- **Type :** `boolean`
- **Valeur par défaut :** [`server.strictPort`](#server_strictport)

  Définissez cette option à `true` pour stopper l’exécution si le port est déjà utilisé, plutôt que d’utiliser automatiquement le prochain port disponible.

### preview.https

- **Type :** `boolean | https.ServerOptions`
- **Valeur par défaut :** [`server.https`](#server_https)

  Active TLS + HTTP/2. Notez que si l’[option `server.proxy`](#server-proxy) est également utilisée, seul TLS sera activé.

  La valeur peut aussi être un [objet d’options](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) qui sera passé à `https.createServer()`.

### preview.open

- **Type:** `boolean | string`
- **Default:** [`server.open`](#server_open)

  Définit si l’application doit s’ouvrir automatiquement dans le navigateur au démarrage du serveur. Quand la valeur est une chaîne de caractères, elle sera traitée comme l’URL à ouvrir. Si vous souhaitez ouvrir le serveur à l’aide d’un navigateur spécifique, vous pouvez définir la variable d’environnement `process.env.BROWSER` (par exemple `firefox`). Voir [le package `open`](https://github.com/sindresorhus/open#app) pour plus de détails.

### preview.proxy

- **Type :** `Record<string, string | ProxyOptions>`
- **Valeur par défaut :** [`server.proxy`](#server_proxy)

  Configure des règles de proxy pour le serveur de développement. Attend un objet contenant des paires `{ clé: valeurs }`. Si la clé commence par `^`, elle sera interprétée comme une `RegExp` (expression régulière). L’option `configure` peut être utilisée pour accéder à l’instance de proxy.

  Utilise [le package `http-proxy`](https://github.com/http-party/node-http-proxy). La liste complète des options est à retrouver [ici](https://github.com/http-party/node-http-proxy#options).

### preview.cors

- **Type :** `boolean | CorsOptions`
- **Valeur par défaut :** [`server.cors`](#server_proxy)

  Configure le CORS pour le serveur de développement. Par défaut, il est activé et autorise toutes les origines. Passez un [objet d’options](https://github.com/expressjs/cors) pour définir plus finement son comportement ou `false` pour le désactiver.

## Options d’optimisation des dépendances

- **Voir aussi :** [Pré-bundler des dépendances](/docs/guide/dep-pre-bundling)

### optimizeDeps.entries

- **Type :** `string | string[]`

  Par défaut, Vite crawlera votre `index.html` pour détecter des dépendances à pré-bundler. Si `build.rollupOptions.input` est spécifié, Vite crawlera ces points d’entrée à la place.

  Si ni l’un ni l’autre de ces comportements ne vous convient, vous pouvez spécifier des entrées à l’aide de cette option — la valeur doit être un [motif fast-glob](https://github.com/mrmlnc/fast-glob#basic-syntax) ou un array de motifs relatifs à la racine du projet. Ceci remplacera complétement le mécanisme par défaut.

### optimizeDeps.exclude

- **Type :** `string[]`

  Les dépendances à exclure du pré-bundling.

  :::warning CommonJS
  Les dépendances CommonJS ne devraient pas être exclues de l’optimisation. Si une dépendance ESM est exclue de l’optimisation, mais a elle-même une dépendance CommonJS, la dépendance CommonJS doit être ajoutée à `optimizeDeps.include`. Exemple :

  ```js
  export default defineConfig({
    optimizeDeps: {
      include: ['esm-dep > cjs-dep']
    }
  })
  ```

  :::

### optimizeDeps.include

- **Type :** `string[]`

  Par défaut, les packages liés (_linked packages_) qui ne se trouvent pas dans `node_modules` ne sont pas pré-bundlés. Utilisez cette option pour forcer un package lié à être pré-bundlé.

### optimizeDeps.esbuildOptions

- **Type :** [`EsbuildBuildOptions`](https://esbuild.github.io/api/#simple-options)

  Définit les options à passer à esbuild pendant la phase de scan et d’optimisation des dépendances.

  Certaines options sont ignorées puisque les modifier empêcherait la compatibilité avec l’optimisation des dépendances de Vite.

  - `external` est ignorée, utilisez plutôt l’option `optimizeDeps.exclude` de Vite
  - `plugins` est fusionné avec le plugin de dépendance de Vite
  - `keepNames` a la priorité sur l’option dépréciée `optimizeDeps.keepNames`

## Options de rendu côté serveur (_SSR_)

:::warning Expérimental
Il est possibles que les options relatives au rendu côté serveur soient légèrement modifiées dans des versions mineures.
:::

- **Voir aussi :** [Externalisation](/docs/guide/ssr#externalisation)

### ssr.external

- **Type :** `string[]`

  Force des dépendances à être externalisées pour le rendu côté serveur.

### ssr.noExternal

- **Type :** `string | RegExp | (string | RegExp)[] | true`

  Empêche les dépendances listées d’être externalisées pour le rendu côté serveur. Si cette option est définie à `true`, aucune dépendance ne sera externalisée.

### ssr.target

- **Type :** `'node' | 'webworker'`
- **Valeur par défaut :** `node`

  Environnement ciblé pour la compilation côté serveur.

## Options du worker

### worker.format

- **Type :** `'es' | 'iife'`
- **Valeur par défaut :** `iife`

  Format du bundle du worker.

### worker.plugins

- **Type :** [`(Plugin | Plugin[])[]`](#plugins)

  Liste des plugins Vite qui s’appliquent pour le bundle du worker.

### worker.rollupOptions

- **Type :** [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  Options Rollup pour le bundle du worker.
