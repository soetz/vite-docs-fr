# Rendu côté serveur (_SSR_)

:::warning Expérimental
Le support du rendu côté serveur est toujours expérimental et vous risquez de rencontrer des bugs et des cas d’usages non supportés. Utilisez-le en connaissance de cause.
:::

:::tip Note
Le rendu côté serveur fait référence aux frameworks front-end (par exemple React, Preact, Vue ou Svelte) qui supportent le fait d’exécuter l’application dans Node.js, qui génére un pré-rendu en HTML, et qui l’« hydratent » côté client en bout de course. Si vous souhaitez intégrer votre application à un framework côté serveur classique, allez plutôt voir le [guide d’intégration du back-end](./backend-integration).

Le guide qui suit part également du principe que vous avez déjà un peu d’expérience avec le rendu côté serveur du framework de votre choix, et ne se concentre que sur les détails d’intégration spécifiques à Vite.
:::

:::warning API bas-niveau
Ceci est une API bas-niveau plutôt faite pour les auteurs de librairies et de frameworks. Si votre but est de créer une application, allez d’abord voir les plugins et outils plus haut-niveau de la [section SSR d’Awesome Vite](https://github.com/vitejs/awesome-vite#ssr). Ceci étant dit, beaucoup d’applications fonctionnent bien tout en étant basées sur l’API bas-niveau de Vite.
:::

:::tip Aide
Si vous avez des questions, le [Discord de Vite a un channel #ssr](https://discord.gg/PkbxgzPhJv) sur lequel la communauté est susceptible de vous aider (en anglais de préférence).
:::

## Exemples de projets

Vite intègre le support du rendu côté serveur (_SSR_). Le playground de Vite propose des exemples de configurations de rendu côté serveur pour Vue 3 et React, qui peuvent servir de référence pour ce guide :

- [Vue 3](https://github.com/vitejs/vite/tree/main/playground/ssr-vue)
- [React](https://github.com/vitejs/vite/tree/main/playground/ssr-react)

## Structure de la source

Une application reposant sur le rendu côté serveur aura typiquement la structure de fichiers suivante :

```
- index.html
- server.js # serveur principal de l’application
- src/
  - main.js # exporte du code qui n’est pas lié à un environnement
            # en particulier
  - entry-client.js # monte l’application sur un élément de DOM
  - entry-server.js # fait le rendu de l’application à l’aide de l’API
                    # de rendu côté serveur du framework
```

L’`index.html` devra référencer `entry-client.js` et inclure un placeholder là où les balises rendues côté serveur devront être insérées :

```html
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Vous pouvez utiliser le placeholder que vous voulez à la place de `<!--ssr-outlet-->`, tant qu’il peut être remplacé avec précision.

## Logique conditionnelle

Si vous devez faire usage de logique conditionnelle entre rendu côté serveur et client, vous pouvez utiliser

```js
if (import.meta.env.SSR) {
  // … logique uniquement côté serveur
}
```

Cette variable est remplacée statiquement lors de la compilation, ce qui signifie que le code des branches inutilisées pourra être éliminé (_tree-shaking_).

## Paramétrer le serveur de développement

Lorsque vous développez une application reposant sur le rendu côté serveur, il est probable que vous souhaitiez garder le contrôle complet sur votre serveur principal et découpler Vite de l’environnement de production. Il est donc recommandé d’utiliser Vite en mode middleware. Voici un exemple avec [express](https://expressjs.com/) :

**server.js**

```js{17-20}
import fs from 'fs'
import path from 'path'
import express from 'express'
import {createServer as createViteServer} from 'vite'

async function createServer() {
  const app = express()

  // créer le serveur Vite en mode middleware et configure le type
  // d’application sur 'custom', ce qui désactive la logique de service du
  // HTML de Vite et laisse le serveur prendre le contrôle
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // utiliser l’instance connect de Vite comme middleware
  // si vous utilisez votre propre routeur express (express.Router()), vous
  // devriez utiliser router.use
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // servir index.html - nous verrons ça plus tard
  })

  app.listen(5173)
}

createServer()
```

Ici, `vite` est une instance de [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` est une instance de [Connect](https://github.com/senchalabs/connect) pouvant être utilisée comme middleware dans n’importe quel framework Node.js compatible avec connect.

L’étape suivante consiste à implémenter le code servant le HTML rendu par le serveur sur `*` :

```js
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. lire index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. appliquer les transformations HTML de Vite. cela injecte le
    //    client de rafraîchissement des modules à la volée (HMR client) de
    //    Vite et applique les transformations HTML des plugins Vite, par
    //    exemple les préambules globaux de @vitejs/plugin-react.
    template = await vite.transformIndexHtml(url, template)

    // 3. charger l’entrée serveur. vite.ssrLoadModule transforme
    //    automatiquement votre code source au format modules ES pour qu’il
    //    soit utilisable dans Node.js ! Aucun bundling n’est nécessaire,
    //    et l’invalidation fournie est efficace, à la manière du
    //    rafraîchissement des modules à la volée.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. rendre le HTML de l’application. cela part du principe que la
    //    fonction `render` exportée par entry-server.js fait appel aux
    //    bonnes APIs de rendu côté serveur du framework, comme par exemple
    //    ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. injecter le HTML rendu par l’application dans le template.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. renvoyer le HTML rendu.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // si une erreur est signalée, on laisse Vite réécrire la stacktrace
    // afin que l’erreur pointe bien sur le code source problématique.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Le script `dev` de `package.json` devrait également être modifié pour plutôt utiliser le script serveur :

```diff
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Compilation en production

Pour mettre en production un projet usant du rendu côté serveur, on doit :

1. Produire une compilation du client normale, et
2. Produire une compilation de rendu côté serveur, qui peut être chargée directement par `require()` afin que l’on n’ait pas besoin de repasser dans le `ssrLoadModule` de Vite.

Les scripts de `package.json` ressembleront à ça :

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js "
  }
}
```

Notez que le signal `--ssr` indique qu’il s’agit d’une compilation de rendu côté serveur. Il devrait également indiquer l’entrée de rendu côté serveur.

Ensuite, dans `server.js`, on doit ajouter de la logique spécifique à la production en se référant à `{{ 'process.env.' + 'NODE_ENV' }}` :

- Au lieu de lire le `index.html` racine, utilisez plutôt `dist/client/index.html` comme template, puisqu’il contient les bons liens vers les ressources pour la compilation client.

- Au lieu d’`await vite.ssrLoadModule('/src/entry-server.js')`, utilisez plutôt `import('./dist/server/entry-server.js')` (ce fichier est le résultat de la compilation de rendu côté serveur).

- Déplacez la création et tous les usages du serveur de développement `vite` derrière des branches conditionnelles spécifiques au développement, et ajoutez des middlewares servant les fichiers statiques de `dist/client`.

Référez-vous aux démonstrations pour [Vue](https://github.com/vitejs/vite/tree/main/playground/ssr-vue) et [React](https://github.com/vitejs/vite/tree/main/playground/ssr-react) si vous avez besoin d’un exemple de configuration qui fonctionne.

## Générer les directives de pré-chargement (_preload directives_)

`vite build` supporte le signal `--ssrManifest` qui générera un fichier `ssr-manifest.json` dans le répertoire de sortie de la compilation:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Le script ci-dessus générera désormais un fichier `dist/client/ssr-manifest.json` pour la compilation client — oui, le manifeste de rendu côté serveur est généré depuis la compilation client car nous voulons associer les identifiants de modules aux fichiers clients. Le manifeste contient des associations entre les identifiants de modules et les morceaux (_chunks_) ou les fichiers de ressources correspondants.

Pour exploiter le manifeste, les frameworks doivent fournir un moyen de collecter les identifiants des modules des composants qui ont été utilisés durant le rendu côté serveur.

`@vitejs/plugin-vue` intègre ce processus et inscrit automatiquement les identifiants des modules utilisés pour les composants sur le contexte de rendu côté serveur de Vue associé :

```js
// src/entry-server.js
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules est maintenant une liste des identifiants de modules qui ont
// été utilisés durant le rendu
```

Dans la branche de production de `server.js` on doit lire et passer le manifeste à la fonction `render` exportée par `src/entry-server.js`. Cela fournit suffisamment d’informations pour rendre des directives de pré-chargement pour les fichiers utilisés par les routes asynchrones ! Voir la [source de la démonstration](https://github.com/vitejs/vite/blob/main/playground/ssr-vue/src/entry-server.js) pour un exemple complet.

## Pré-rendu / génération côté serveur (_SSG_)

Si les routes et les données requises pour certaines routes sont connues à l’avance, on peut pré-rendre ces routes en HTML statique en usant de la même logique que pour le rendu côté serveur de production. Cela peut-être considéré comme une forme de génération côté serveur (_SSG_). Voir [le script de pré-rendu de démonstration](https://github.com/vitejs/vite/blob/main/playground/ssr-vue/prerender.js) pour un exemple qui fonctionne.

## Externalisation

De nombreuses dépendances fournissent à la fois des fichiers de modules ES et CommonJS. Une dépendance fournissant une compilation au format CommonJS peut être « externalisée » de la transformation et du système de modules du rendu côté serveur de Vite lorsque le rendu côté serveur est utilisé, afin de rendre à la fois le serveur de développement et la compilation plus rapides. Par exemple, plutôte que de tirer la version modules ES de React et d’ensuite la re-transformer pour qu’elle soit compatible avec Node.js, il est plus efficace de simplement `require('react')`. Cela raccourcit aussi grandement la durée de compilation de rendu côté serveur.

Vite réalise l’externalisation du rendu côté serveur automatiquement selon les heuristiques suivantes :

- Si le point d’entrée de module ES résolu et son point d’entrée par défaut pour Node sont différents, le point d’entrée pour Node est probablement une compilation CommonJS qui peut être externalisé. Par exemple, `vue` sera externalisé automatiquement car il fournit à la fois une compilation en module ES et une compilation en CommonJS.

- Sinon, Vite regardera si le point d’entrée du package contient de la syntaxe de modules ES valide — si ce n’est pas le cas, le package est probablement au format CommonJS et sera externalisé. Par exemple, `react-dom` sera externalisé automatiquement car il ne spécifie qu’une entrée et qu’elle est au format CommonJS.

Si les heuristiques mènent à des erreurs, vous pouvez ajuster manuellement l’externalisation du rendu côté serveur à l’aide des options de configuration `ssr.external` et `ssr.noExternal`.

Dans le futur, ces heuristiques seront sans doute améliorées et vérifieront si le projet a le `type: "module"` d’activé, afin que Vite puisse aussi externaliser les dépendances qui fournissent des compilation ESM compatibles avec Node en les important avec des `import()` dynamiques pendant le rendu côté serveur.

:::warning Gérer les alias
Si vous avez configuré des alias qui redirigent un package vers un autre, vous devriez sûrement plutôt faire des alias des véritables packages `node_modules` afin que cela fonctionne aussi pour les dépendances externalisées pour le rendu côté serveur. [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias) et [pnpm](https://pnpm.js.org/en/aliases) supportent tous deux les alias via le préfixe `npm:`.
:::

## Logique de plugin spécifique au rendu côté serveur

Certains frameworks comme Vue ou Svelte compilent leurs composants dans des formats différents suivant si le contexte est client ou rendu côté serveur. Pour supporter les transformations conditionnelles, Vite passe une propriété `ssr` supplémentaire à l’objet `options` des hooks de plugin suivants :

- `resolveId`
- `load`
- `transform`

**Exemple :**

```js
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // faire des transformations spécifiques au rendu côté serveur…
      }
    }
  }
}
```

L’objet options de `load` et `transform` est optionnel, Rollup ne l’utilise pas pour le moment mais pourrait étendre ces hooks avec des metadata supplémentaires dans le futur.

:::tip Note
Avant Vite 2.7, cette information était passée aux hooks de plugin à l’aide d’un paramètre positionnel `ssr` au lieu de l’objet `options`. Tous les frameworks et plugins les plus populaires sont à jour mais il est possible que vous tombiez sur de vieux posts qui ne le sont pas et qui utilisent l’ancienne API.
:::

## Cible de rendu côté serveur

La cible par défaut de la compilation de rendu côté serveur est un environnement Node, mais vous pouvez également exécuter le serveur dans un web worker. La résolution de l’entrée du package diffère selon la plateforme. Vous pouvez configurer la cible pour qu’elle soit un web worker en définissant `ssr.target` sur `'webworker'`.

## Bundle de rendu côté serveur

Dans certains cas, comme lorsque le runtime est `webworker`, il se peut que vous souhaitiez que votre compilation de rendu côté serveur soit bundlée en un seul fichier JavaScript. Vous pouvez obtenir ce comportement en définissant `ssr.noExternal` à `true`. Cela aura deux effets :

- Toutes les dépendances seront traitées comme `noExternal`
- Une erreur sera déclenchée si une fonctionnalité intégrée à Node.js est importée

## Interface de commande Vite

Les commandes `$ vite dev` et `$ vite preview` peuvent aussi être utilisées pour les applications usant du rendu côté serveur. Vous pouvez ajouter vos middlewares de rendu côté serveur au serveur de développement avec [`configureServer`](/guide/api-plugin#configureserver), et au serveur de preview avec [`configurePreviewServer`](/guide/api-plugin#configurepreviewserver).

:::tip Note
Utilisez un hook post pour que votre middleware de rendu côté serveur s’exécute _après_ les middlewares de Vite.
:::
