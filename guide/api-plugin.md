# API pour plugin

Les plugins Vite étendent la très bonne interface pour plugin de Rollup avec quelques options spécifiques à Vite. L’intérêt est que vous pouvez créer un seul plugin et qu’il fonctionnera à la fois en développement et pour le build.

**Il est recommandé de lire [la documentation des plugins Rollup](https://rollupjs.org/guide/en/#plugin-development) (en anglais) avant ce qui suit.**

## Créer un plugin

Vite s’efforce de permettre l’utilisation des patterns les plus courants sans qu’il n’y ait besoin de plugin, alors avant d’en faire un nouveau assurez-vous d’avoir bien lu le [guide des fonctionnalités](/guide/features) pour savoir si votre besoin n’est pas déjà couvert. Vérifiez aussi parmis les plugins de la communauté, à la fois sous la forme de [plugins Rollup compatibles](https://github.com/rollup/awesome) ou de [plugins spécifiques à Vite](https://github.com/vitejs/awesome-vite#plugins).

Lorsque vous créez un plugin, vous pouvez le mettre inline dans votre `vite.config.js`. Il n’y a pas spécialement besoin de créer un nouveau package. Une fois que vous constatez qu’un plugin a été utile pour l’un de vos projets, vous pouvez envisager de le partager pour aider d’autres personnes [dans l’écosystème](https://chat.vitejs.dev).

::: tip
Si vous apprenez, débuggez, ou écrivez des plugins nous recommandons d’inclure [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) à votre projet. Il vous permet d’inspecter les états intermédiaires des plugins Vite. Après l’avoir installé, vous pouvez aller voir `localhost:3000/__inspect/` pour inspecter les modules et les transformations de votre projet. Les instructions d’installation se trouvent dans la [documentation de vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect).
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## Conventions

Si le plugin n’utilise pas de hook spécifique à Vite et peut être implémenté en tant que [plugin Rollup compatible](#compatibilite-des-plugins-rollup), alors il est recommandé d’utiliser les [conventions de nommage des plugins Rollup](https://rollupjs.org/guide/en/#conventions) :

- Les plugins doivent avoir un nom clair avec un préfixe `rollup-plugin-`.
- Les `keywords` du package.json doivent inclure `rollup-plugin` et `vite-plugin`.

Cela permet que le plugin soit aussi utilisable par des projets basés sur Rollup ou WMR.

Pour les plugins uniquement compatibles avec Vite :

- Les plugins doivent avoir un nom clair avec un préfixe `vite-plugin-`.
- Les `keywords` du package.json doivent inclure `vite-plugin`.
- La documentation du plugin doit inclure une section expliquant pourquoi le plugin est uniquement compatible avec Vite (par exemple, parce qu’il utilise un hook spécifique à Vite).

Si votre plugin ne fonctionne qu’avec un framework en particulier, son nom doit faire partie du préfixe :

- `vite-plugin-vue-` pour les plugins Vue
- `vite-plugin-react-` pour les plugins React
- `vite-plugin-svelte-` pour les plugins Svelte

Voir aussi la [convention pour les modules virtuels](#convention-pour-les-modules-virtuels).

## Configuration des plugins

Les utilisateurs ajouteront les plugins aux `devDependencies` du projet et les configureront en utilisant l’option `plugins`.

```js
// vite.config.js
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()]
})
```

Les plugins falsy seront ignorés, ce qui peut être utilisé pour activer ou désactiver des plugins.

`plugins` accepte aussi des presets tels que plusieurs plugins dans un seul élément. C’est pratique lorsque des fonctionnalités complexes (comme l’intégration d’un framework) sont implémentées à l’aide de plusieurs plugins. La liste sera aplatie par Vite.

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()]
})
```

## Exemples simples

:::tip
C’est une convention répandue de créer des plugins Vite/Rollup à l’aide d’une fonction fabrique (_factory_) qui retourne l’objet plugin. La fonction peut accepter des options qui permettent aux utilisateurs de configurer le comportement du plugin.
:::

### Transformer les types de fichiers custom

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null // fournissez une sourcemap si possible
        }
      }
    }
  }
}
```

### Importer un fichier virtuel

Voir l’exemple de la [section suivante](#convention-pour-les-modules-virtuels).

## Convention pour les modules virtuels

Les modules virtuels sont un procédé utile qui permet de passer des informations aux fichiers source au moment du build avec une syntaxe d’import de module ES normale.

```js
export default function myPlugin() {
  const virtualModuleId = '@my-virtual-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // requis, sera utilisé pour les avertissements et les
                       // erreurs
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    }
  }
}
```

Ce qui permet d’importer le module en JavaScript :

```js
import { msg } from '@my-virtual-module'

console.log(msg)
```

La convention de Vite pour les modules virtuels est de préfixer le chemin visible par l’utilisateur par `virtual:`. Si possible le nom du plugin devrait être utilisé comme un namespace pour éviter d’entrer en conflit avec les autres plugins de l’écosystème. Par exemple, `vite-plugin-posts` pourrait demander aux utilisateurs d’importer un module virtuel `virtual:posts` ou `virtual:posts/helpers` pour obtenir des informations au moment du build. En interne, les plugins qui utilisent des modules virtuels doivent préfixer l’identifiant par `\0` lorsqu’ils résolvent l’identifiant (c’est une convention de l’écosystème Rollup). Cela évite que d’autres plugins essayent de traiter le même identifiant (comme la résolution des nœuds), et les fonctionnalités intégrées à Vite comme les sourcemaps peuvent se servir de cette information pour différencier les modules virtuels des fichiers classiques. `\0` n’est pas un caractère autorisé dans les URLs d’import alors nous devons le remplacer pendant l’analyse de l’import. Dans le navigateur, un identifiant virtuel `\0{id}` sera encodé sous la forme `/@id/__x00__{id}` pour le développement. Cet identifiant sera à nouveau décodé avant d’entrer dans la pipeline de plugins, alors cette mécanique n’est pas visible par les hooks de plugins.

Notez que les modules directement tirés d’un vrai fichier, comme c’est le cas d’un module de script dans un composant à fichier unique (_SFC_) (un composant à fichier unique .vue ou .svelte par exemple) n’ont pas besoin de suivre cette convention. Les composants à fichier unique génèrent en général une série de sous-modules lorsqu’ils sont traités mais le code de ceux-ci peut-être relié au système de fichiers. Utiliser `\0` pour ces sous-modules empêcherait les sourcemaps de fonctionner correctement.

## Hooks universels

Pendant le développement, le serveur de Vite crée un conteneur de plugin qui invoque les [hooks de build de Rollup](https://rollupjs.org/guide/en/#build-hooks) de la même façon que le fait Rollup.

Les hooks suivants sont appelés une fois lors du démarrage du serveur :

- [`options`](https://rollupjs.org/guide/en/#options)
- [`buildStart`](https://rollupjs.org/guide/en/#buildstart)

Les hooks suivants sont appelés à chaque requête de module entrante :

- [`resolveId`](https://rollupjs.org/guide/en/#resolveid)
- [`load`](https://rollupjs.org/guide/en/#load)
- [`transform`](https://rollupjs.org/guide/en/#transform)

Les hooks suivants sont appelés quand le serveur se ferme :

- [`buildEnd`](https://rollupjs.org/guide/en/#buildend)
- [`closeBundle`](https://rollupjs.org/guide/en/#closebundle)

Notez que le [hook `moduleParsed`](https://rollupjs.org/guide/en/#moduleparsed) n’est **pas** appelé pendant le développement, parce que Vite évite de parser lorsque cela requiert tout un arbre de la syntaxe abstraite (_AST_) pour des raisons de performance.

Les [hooks de génération de l’output](https://rollupjs.org/guide/en/#output-generation-hooks) (sauf `closeBundle`) ne sont **pas** appelés durant le développement. Vous pouvez partir du principe que le serveur de développement de Vite appelle seulement `rollup.rollup()` et pas `bundle.generate()`.

## Hooks spécifiques à Vite

Les plugins Vite peuvent aussi fournir des hooks qui servent uniquement pour Vite. Ces hooks sont ignorés par Rollup.

### `config`

- **Type :** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **Genre :** `asynchrone`, `séquentiel`

  Modifie la configuration de Vite avant qu’elle ne soit résolue. Le hook reçoit la configuration brute de l’utilisateur (les options de l’interface en ligne de commande fusionnées avec le fichier de configuration) et l’environnement de configuration courant qui expose le `mode` et la `command`. Il peut retourner un objet de configuration incomplet qui sera fusionné avec la configuration existante, ou directement muter la configuration (si la fusion par défaut ne permet pas d’atteindre le résultat souhaité).

  **Exemple :**

  ```js
  // retourne une configuration incomplète (recommandé)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      alias: {
        foo: 'bar'
      }
    })
  })

  // mute directement la configuration (à utiliser seulement si la fusion ne
  // convient pas)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = __dirname
      }
    }
  })
  ```

  ::: warning Note
  Les plugins utilisateur sont résolus avant que ce hook ne soit exécuté alors injecter d’autres plugins dans le hook `config` n’aura aucun effet.
  :::

### `configResolved`

- **Type :** `(config: ResolvedConfig) => void | Promise<void>`
- **Genre :** `asynchrone`, `parallèle`

  Appelé après que la configuration de Vite ne soit résolue. Utilisez ce hook pour lire et stocker la configuration résolue. Il est aussi utile quand le plugin doit faire quelque chose de différent selon la commande utilisée.

  **Exemple :**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // stocker la configuration résolue
        config = resolvedConfig
      },

      // utiliser la configuration stockée dans un autre hook
      transform(code, id) {
        if (config.command === 'serve') {
          // développement : plugin invoqué par le serveur de développement
        } else {
          // build : plugin invoqué par Rollup
        }
      }
    }
  }
  ```

  Notez que la valeur de `command` est `serve` en développement (sur l’interface en ligne de commande `vite`, `vite dev` et `vite serve` sont des alias).

### `configureServer`

- **Type :** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **Genre :** `asynchrone`, `séquentiel`
- **Voir aussi :** [ViteDevServer](./api-javascript#vitedevserver)

  Utilisez ce hook pour configurer le serveur de développement. Le cas d’usage le plus courant est d’ajouter des middlewares spécifiques à l’application [connect](https://github.com/senchalabs/connect) interne :

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // manipuler les requêtes…
      })
    }
  })
  ```

  **Injecter des middlewares après-coup**

  Le hook `configureServer` est appelé avant que les middlewares internes ne soient installés, alors les middlewares spécifiques s’exécuteront avant les middlewares internes par défaut. Si vous voulez injecter un middleware **après** les middlewares internes, vous pouvez retourner une fonction dans `configureServer`, qui sera appelée après que les middlewares internes soient installés :

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // retourne un hook qui est appelé après que les middlewares internes
      // soient installés
      return () => {
        server.middlewares.use((req, res, next) => {
          // manipuler les requêtes…
        })
      }
    }
  })
  ```

  **Stocker l’accès au serveur**

  Dans certaines cas, d’autres hooks de plugins peuvent avoir besoin d’accéder à l’instance du serveur de développement (par exemple pour accéder au serveur web socket, au watcher du système de fichiers, ou au graphe des modules). Ce hook peut aussi être utilisé pour stocker l’instance du serveur et s’en servir dans d’autres hooks :

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // utiliser le serveur…
        }
      }
    }
  }
  ```

  Notez que `configureServer` n’est pas appelé au moment du build de production alors vos autres hooks doivent gérer le cas où l’instance de serveur est absente.

### `transformIndexHtml`

- **Type :** `IndexHtmlTransformHook | { enforce?: 'pre' | 'post', transform: IndexHtmlTransformHook }`
- **Genre :** `asynchrone`, `séquentiel`

  Hook dédié au fait de transformer `index.html`. Le hook reçoit le HTML actuel sous la forme d’une chaîne de caractères et un contexte de transformation. Le contexte expose l’instance du [`ViteDevServer`](./api-javascript#vitedevserver) pendant le développement, et expose le bundle de sortie de Rollup pendant le build.

  Le hook peut être asynchrone et retourne un des formats suivants :

  - Chaîne de caractères HTML transformée.
  - Une liste d’objets décrivant des éléments (`{ balise, attributs, enfants }`) à injecter dans le HTML existant. Chaque élément peut aussi spécifier où il doit être injecté (par défaut il est ajouté à la fin de `<head>`).
  - Un objet contenant les deux (`{ html, éléments }`).

  **Exemple basique :**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`
        )
      }
    }
  }
  ```

  **Signature complète du hook :**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    }
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * par défaut : 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

### `handleHotUpdate`

- **Type :** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`

  Gère le remplacement des modules à la volée (_HMR_). Le hook reçoit un objet de contexte avec la signature suivante :

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` est une liste des modules affectés par le fichier modifié. C’est une liste car un fichier unique peut correspondre à plusieurs modules (comme les composants à fichier unique par exemple).

  - `read` est une fonction de lecture asynchrone qui retourne le contenu du fichier. Elle est fournie car sur certains systèmes, le callback lorsqu’un fichier est modifié peut être déclenché trop rapidement (avant que l’éditeur ne finisse de se mettre à jour) et utiliser `fs.readFile` directement retournera un contenu vide. La fonction read permet de normaliser ce comportement.

  Le hook peut choisir de :

  - Filtrer et réduire la liste des modules affectés pour que le remplacement des modules à la volée soit plus précis.

  - Retourner une liste vide et faire le remplacement de façon complétement custom en envoyant des évènements au client :

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    Le code client doit utiliser le handler correspondant à l’aide de l’[API du rafraîchissement des modules](./api-hmr) (qui peut être injecté par le hook `transform` du même plugin) :

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // faire le remplacement custom
      })
    }
    ```

## Ordre du plugin

Un plugin Vite peut également spécifier une propriété `enforce` (à la manière des loaders webpack) pour ajuster son ordre dans la liste. La valeur d’`enforce` peut être soit `"pre"` soit `"post"`. Les plugins résolus seront traités dans l’ordre suivant :

- Alias.
- Plugins utilisateur avec `enforce: 'pre'`.
- Plugins internes à Vite.
- Plugins utilisateur sans valeur pour enforce.
- Plugins de build de Vite.
- Plugins utilisateur avec `enforce: 'post'`.
- Plugins de build finaux de Vite (minification, manifeste, reporting).

## Application conditionnelle

Par défaut les plugins sont invoqués à la fois pour serve et build. Dans les cas où un plugin ne doit être appliqué conditionnellement que pour serve ou build, utilisez la propriété `apply` pour seulement l’invoquer durant `'build'` ou `'serve'` :

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build' // ou 'serve'
  }
}
```

Un fonction peut aussi être utilisée, pour plus de contrôle :

```js
apply(config, { command }) {
  // appliquer seulement pour le build et pas pour le rendu côté serveur
  return command === 'build' && !config.build.ssr
}
```

## Compatibilité des plugins Rollup

Une bonne quantité de plugins Rollup fonctionnera directement comme plugin Vite (par exemple `@rollup/plugin-alias` ou `@rollup/plugin-json`), mais pas tous, puisque certains hooks de plugin n’ont pas de sens dans le contexte d’un serveur de développement sans bundling.

En général, tant qu’un plugin Rollup respecte les critères suivants il devrait fonctionner comme plugin Vite :

- Il n’utilise pas le hook [`moduleParsed`](https://rollupjs.org/guide/en/#moduleparsed).
- Sa phase de bundling et sa phase d’output sont découplées.

Si un plugin Rollup n’a de sens que pour la phase de build, alors il peut être spécifié sous `build.rollupOptions.plugins`.

Vous pouvez aussi agrémenter un plugin Rollup existant de propriétés propres à Vite :

```js
// vite.config.js
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build'
    }
  ]
})
```

Lisez la [liste des plugins Rollup compatibles avec Vite](https://vite-rollup-plugins.patak.dev) pour plus d’informations sur les plugins officiels Rollup et pour des instructions d’utilisation (en anglais).


## Normalisation des chemins

Vite normalise les chemins lorsqu’il résout les identifiants de manière à utiliser les séparateurs POSIX ( / ) tout en préservant le volume sur Windows. D’un autre côté, Rollup garde les chemins résolus intacts par défaut, alors les identifiants résolus ont des séparateurs win32 ( \\ ) sur Windows. Cependant, les plugins Rollup utilisent la [fonction utilitaire `normalizePath`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) de `@rollup/pluginutils`, qui convertit les séparateurs au format POSIX avant de faire des comparaisons. Cela signifie que lorsque ces plugins sont utilisés dans Vite, les patterns de configuration `include`, `exclude` et similaires peuvent faire de la comparaison avec les identifiants résolus.

Donc les plugins Vite, lorsqu’ils comparent des chemins avec des identifiants résolus, doivent impérativement normaliser les chemins de manière à ce qu’ils utilisent des séparateurs POSIX. Une fonction utilitaire `normalizePath` équivalente est exportée par le module `vite`.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```
