# Démarrer

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Vue d’ensemble

Vite (prononcé comme en français<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>) est un outil de compilation qui vise à proposer une expérience de développement plus rapide et légère pour les projets web modernes. Il se découpe en deux grandes parties :

- Un serveur de développement qui propose de [nombreuses fonctionnalités](./features) à travers les [modules ES natifs](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules), comme par exemple un [rafraîchissement des modules à la volée (_HMR_)](./features#rafraichissement-des-modules-a-la-volee-hmr) ultra rapide.

- Une commande de compilation qui bundle votre code à l’aide de [Rollup](https://rollupjs.org), qui est pré-configuré pour optimiser grandement la taille des ressources statiques en production.

Vite est « _opinionated_ » et propose certains comportements par défaut qui conviendront dans la plupart des cas, et il est aussi possible de l’étendre grâce à son [API pour plugin](./api-plugin) et son [API JavaScript](./api-javascript).

Vous pouvez en apprendre plus sur les raisons qui motivent le projet sur la page [Pourquoi utiliser Vite ?](./why).

## Support navigateur

- La configuration par défaut cible les navigateurs qui supportent à la fois les [modules ES natifs à travers les balises script](https://caniuse.com/es6-module) et l’[import dynamique de modules ES natifs](https://caniuse.com/es6-module-dynamic-import). Les navigateurs antérieurs peuvent être supportés à l’aide du plugin officiel [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) — voir la page [Compilation en production](./build) pour plus de détails.

## Essayer Vite en ligne

Vous pouvez essayer Vite en ligne sur [StackBlitz](https://vite.new/). Le site exécute une configuration de compilation basée sur Vite directement dans le navigateur, alors l’expérience est quasiment la même qu’en local, sans avoir besoin d’installer quoi que ce soit sur votre machine. Vous pouvez naviguer sur `vite.new/{template}` pour utiliser un framework.

Les templates supportés sont :

|             JavaScript              |                TypeScript                 |
| :---------------------------------: | :---------------------------------------: |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [react](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)   |
|  [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|     [lit](https://vite.new/lit)     |     [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |

## Démarrer votre premier projet Vite

::: tip Note de compatibilité
Vite requiert [Node.js](https://nodejs.org/en/) avec une version ⩾ 14.18.0. Ceci dit, certains templates requièrent une version plus récente. Votre gestionnaire de paquets devrait vous prévenir.
:::

Avec NPM :

```bash
$ npm create vite@latest
```

Avec Yarn :

```bash
$ yarn create vite
```

Avec PNPM :

```bash
$ pnpm create vite
```

Et suivez les instructions (en anglais) !

Vous pouvez également spécifier directement le nom du projet et le template que vous souhaitez utiliser avec des options de commande supplémentaires. Par exemple, pour démarrer un projet Vite + Vue, lancez :

```bash
# npm 6.x
npm create vite@latest my-vue-app --template vue

# Pour npm à partir de la v7,
# un double-tiret supplémentaire est nécessaire :
npm create vite@latest my-vue-app -- --template vue

# Yarn
yarn create vite my-vue-app --template vue

# pnpm
pnpm create vite my-vue-app -- --template vue
```

Voir [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) pour plus de détails sur chaque template supporté : `vanilla`, `vanilla-ts`, `vue`, `vue-ts`, `react`, `react-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`.

## Templates de la communauté

create-vite est un outil qui vous permet de démarrer un projet rapidement à partir d’un template basique pour les frameworks les plus populaires. Allez voir du côté d’Awesome Vite si vous cherchez [des templates de la communauté](https://github.com/vitejs/awesome-vite#templates) qui incluent d’autres outils ou qui ciblent d’autres frameworks. Vous pouvez utiliser un outil comme [degit](https://github.com/Rich-Harris/degit) pour démarrer votre projet avec l’un des templates.

```bash
npx degit user/project my-project
cd my-project

npm install
npm run dev
```

Si le projet utilise la branche `main` comme branche par défaut, ajoutez `#main` au nom du dépôt

```bash
npx degit user/project#main my-project
```

## `index.html` et racine du projet

Vous l’aurez peut-être remarqué, dans un projet Vite, `index.html` est au premier plan au lieu d’être caché au fin fond de `public`. C’est intentionnel : pendant le développement Vite est un serveur, et `index.html` est le point d’entrée vers votre application.

Vite traite `index.html` comme du code source et comme faisant partie intégrante du graphe de modules. Il résout les `<script type="module" src="...">` qui renvoient vers votre code source JavaScript. Même les `<script type="module">` contenant directement du code et le CSS référencé à l’aide de `<link href>` profitent de fonctionnalités de Vite. Ajoutons que les URLs dans `index.html` voient leur base automatiquement réécrite, ce qui évite de devoir utiliser des placeholders du type `%PUBLIC_URL%`.

À la manière des serveurs HTTP statiques, Vite a une notion de « dossier racine » d’où sont servis vos fichiers. Nous le désignerons par `<racine>` dans le reste de cette documentation. Les URLs absolues de votre code source seront résolues en utilisant la racine du projet comme base, alors vous pouvez écrire votre code comme si vous utilisiez un serveur de fichiers statiques normal (mais en bien plus puissant !). Vite est aussi capable de manipuler des dépendances situées hors de la racine, ce qui le rend utilisable même dans une configuration monorepo.

Vite supporte aussi les [applications multi-page](./build#application-multi-pages) comportant plusieurs points d’entrée `.html`.

#### Spécifier une autre racine

Lancer `vite` démarrera le serveur de développement en utilisant le dossier actuel comme racine. Vous pouvez spécifier une autre racine à l’aide de `vite serve un/sous/dossier`.

## Interface en ligne de commande

Dans un projet dans lequel Vite est installé, vous pouvez utiliser le binaire `vite` dans vos scrpits npm, ou le lancer directement avec `npx vite`. Les scripts de base d’une application Vite ressemblent à ça :

<!-- prettier-ignore -->
```json
{
  "scripts": {
    "dev": "vite", // démarre le serveur de développement
                   // alias : `vite dev`, `vite serve`
    "build": "vite build",    // effectue la compilation de production
    "preview": "vite preview" // prévisualise la compilation de production
                              // en local
  }
}
```

Des options de ligne de commande supplémentaires comme `--port` ou `--https` sont disponibles. Vous pouvez en voir la liste en lançant `npx vite --help` dans votre projet.

## Utiliser des commits inédits

Si vous voulez tester les dernières fonctionnalités sans attendre de nouvelle version, vous devrez cloner le [dépôt vite](https://github.com/vitejs/vite) sur votre machine, le compiler et le lier (_link_) vous-même ([pnpm](https://pnpm.io/) doit être installé) :

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # Ici vous pouvez utiliser le gestionnaire
                   # de paquets de votre choix
```

Ensuite allez dans votre projet basé sur Vite et lancez `pnpm link --global vite` (ou bien le gestionnaire de paquets que vous avez utilisé pour lier `vite` globalement). Vous pouvez maintenant redémarrer le serveur de développement pour être à la pointe !

## Communauté

Si vous avez une question ou si vous avez besoin d’aide, la communauté est à votre disposition sur [Discord](https://chat.vitejs.dev) et dans l’[onglet Discussions de GitHub](https://github.com/vitejs/vite/discussions).
