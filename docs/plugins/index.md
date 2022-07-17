# Plugins

:::tip NOTE
Vite tente de supporter les patterns de développement web les plus courants sans qu’il n’y ait besoin de plugins. Avant de partir à la recherche d’un plugin Vite ou Rollup qui soit compatible, faites un tour sur le [guide des fonctionnalités](../guide/features.md). Souvent, les cas où un plugin serait nécessaire pour un projet Rollup sont déjà couverts par Vite.
:::

Allez voir la page [Utiliser des plugins](../guide/using-plugins.md) pour savoir comment utiliser des plugins.

## Plugins officiels

### [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

- Permet le support des composants à fichier unique (_single file components_) pour Vue 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)

- Permet le support du JSX pour Vue 3 (à l’aide des [transformations Babel dédiées](https://github.com/vuejs/jsx-next)).

### [@vitejs/plugin-react](https://github.com/vitejs/vite/tree/main/packages/plugin-react)

- Permet le support tout-en-un de React.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Permet le support des navigateurs anciens pour le build de production.

## Plugins de la communauté

Allez voir du côté d’[awesome-vite](https://github.com/vitejs/awesome-vite#plugins) – vous pouvez également faire une PR pour ajouter vos plugins à la liste.

## Plugins Rollup

Les [plugins Vite](../guide/api-plugin) sont une extension de l’interface pour plugins de Rollup. Allez voir la [section Compatibilité des plugins Rollup](../guide/api-plugin#compatibilite-des-plugins-rollup) pour plus d’informations.
