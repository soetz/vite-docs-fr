# API JavaScript

Les APIs JavaScript de Vite sont complétement typées, et il est recommandé d’utiliser TypeScript ou d’activer la vérification des types JS dans VSCode pour profiter d’IntelliSense et de la validation.

## `createServer`

**Signature de type :**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Exemple d’utilisation :**

```js
const { createServer } = require('vite')

;(async () => {
  const server = await createServer({
    // n’importe quelles options de configuration valides, ainsi que `mode` et
    // `configFile`
    configFile: false,
    root: __dirname,
    server: {
      port: 1337
    }
  })
  await server.listen()

  server.printUrls()
})()
```

## `InlineConfig`

L’interface `InlineConfig` étend `UserConfig` avec des propriétés supplémentaires :

- `configFile` : spécifie le fichier de configuration à utiliser. S’il n’est pas fourni, Vite essaiera de le résoudre depuis la racine projet. Définissez-la à `false` pour désactiver la résolution automatique.
- `envFile` : définissez-la à `false` pour désactiver la prise en charge des fichiers `.env`.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * L’objet de configuration Vite résolu.
   */
  config: ResolvedConfig
  /**
   * Une instance d’application connect,
   * - peut être utilisée pour attacher des middlewares custom au serveur de
   *   développement.
   * - peut aussi être utilisée comme fonction handler d’un serveur HTTP custom
   *   ou comme middleware d’un framework Node.js de style connect.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Instance native du serveur HTTP Node.
   * Sera null en mode middleware.
   */
  httpServer: http.Server | null
  /**
   * Instance du watcher Chokidar.
   * https://github.com/paulmillr/chokidar#api
   */
  watcher: FSWatcher
  /**
   * Serveur web socket avec une méthode `send(payload)`.
   */
  ws: WebSocketServer
  /**
   * Conteneur de plugin Rollup qui peut lancer des hooks de plugins pour un
   * fichier donné.
   */
  pluginContainer: PluginContainer
  /**
   * Le graphe des modules stockant les relations d’import, les correspondances
   * entre URLs et fichiers, et l’état du remplacement des modules à la volée.
   */
  moduleGraph: ModuleGraph
  /**
   * Résoudre, charger et transformer programmatiquement une URL et recevoir le
   * résultat sans passer par la pipeline de requête HTTP.
   */
  transformRequest(
    url: string,
    options?: TransformOptions
  ): Promise<TransformResult | null>
  /**
   * Appliquer les transformations du HTML internes à Vite ainsi que les
   * transformations HTML des plugins.
   */
  transformIndexHtml(url: string, html: string): Promise<string>
  /**
   * Charger une URL donnée en tant que module instancié pour le rendu côté
   * serveur.
   */
  ssrLoadModule(
    url: string,
    options?: { isolated?: boolean }
  ): Promise<Record<string, any>>
  /**
   * Corriger la stacktrace des erreurs en rendu côté serveur.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Démarrer le serveur.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Relancer le serveur.
   *
   * @param forceOptimize - force l’optimisateur à refaire le bundling, à la
   * façon du signal --force de l’interface en ligne de commande
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Arrête le serveur.
   */
  close(): Promise<void>
}
```

## `build`

**Signature de type :**

```ts
async function build(
  inlineConfig?: InlineConfig
): Promise<RollupOutput | RollupOutput[]>
```

**Exemple d’utilisation :**

```js
const path = require('path')
const { build } = require('vite')

;(async () => {
  await build({
    root: path.resolve(__dirname, './project'),
    base: '/foo/',
    build: {
      rollupOptions: {
        // ...
      }
    }
  })
})()
```

## `preview`

**Expérimental**

**Signature de type :**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Exemple d’utilisation :**

```js
const { preview } = require('vite')

;(async () => {
  const previewServer = await preview({
    // n’importe quelles options de configuration valides, ainsi que `mode` et
    // `configFile`
    preview: {
      port: 8080,
      open: true
    }
  })

  previewServer.printUrls()
})()
```

## `resolveConfig`

**Signature de type :**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode?: string
): Promise<ResolvedConfig>
```

La valeur de `command` est `serve` en développement (dans l’interface en ligne de commande, `vite`, `vite dev`, et `vite serve` sont des alias).

## `transformWithEsbuild`

**Signature de type :**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object
): Promise<ESBuildTransformResult>
```
