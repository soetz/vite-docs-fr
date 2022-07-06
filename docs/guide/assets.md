# Gestion des ressources statiques

- Voir aussi : [Chemin public de base](./build#chemin-public-de-base)
- Voir aussi : [option de configuration `assetsInclude`](/config/#assetsinclude)

## Importer une ressource en tant qu’URL

Importer une ressource statique retournera l’URL publique résolue où elle est servie :

```js
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Par exemple, `imgUrl` sera `/img.png` pendant le développement, et deviendra `/assets/img.2d8efhg.png` lors de la compilation en production.

Le comportement est similaire au `file-loader` de webpack. La différence est que l’import peut utiliser au choix un chemin absolu (par rapport à la racine du projet pendant le développement) ou un chemin relatif.

- Les références `url()` dans le CSS sont traitées de la même façon.

- Si vous utilisez le plugin Vue, les références à des ressources dans le template d’un composant à fichier unique (_SFC_) sont convertis en imports.

- Les types de fichiers les plus courants pour les images, les medias, ou les polices de caractères sont détectés automatiquement comme étant des ressources. Vous pouvez étendre la liste interne avec l’[option `assetsInclude`](/config/#assetsinclude).

- Les ressources référencées sont incluses au graphe des ressources de compilation, se voient assigner un nom de fichier haché, et peuvent être transformées par des plugins d’optimisation.

- Les ressources plus petites (en octets) que l’[option `assetsInlineLimit`](/config/#build-assetsinlinelimit) seront mises inline comme URLs de données base64.

### Imports URL explicites

Les ressources qui ne sont pas incluses dans la liste interne ou dans `assetsInclude` peuvent être importées en tant qu’URL explicitement en utilisant le suffixe `?url`. C’est utile pour importer des [paint worklets Houdini](https://houdini.how/usage), par exemple.

```js
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Importer une ressource en tant que chaîne de caractères

Les ressources peuvent être importées en tant que chaînes de caractères à l’aide du suffixe `?raw`.

```js
import shaderString from './shader.glsl?raw'
```

### Importer un script en tant que worker

Les scripts peuvent être importés en tant que web workers à l’aide des suffixes `?worker` et `?sharedworker`.

```js
// sera inclus à un morceau (chunk) différent en production
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js
// worker partagé
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js
// mis inline en chaînes de caractères base64
import InlineWorker from './shader.js?worker&inline'
```

Lisez la [section Web workers](features.md#web-workers) pour plus de détails.

## Le répertoire `public`

Si vous avez des ressources :

- qui ne sont jamais référencées dans le code source (par exemple `robots.txt`),
- qui doivent garder exactement le même nom de fichier (sans hachage),
- … ou tout simplement que vous ne voulez pas avoir à importer comme ressource pour accéder à leur URL,

alors vous pouvez les placer dans le répertoire spécial `public` à la racine de votre projet. Les ressources dans ce répertoire seront servies à la racine `/` pendant le développement, et copiées à la racine du répertoire `dist` telles quelles lors de la compilation.

Le répertoire par défaut est `<racine>/public`, mais cela peut-être modifié à l’aide de l’[option `publicDir`](/config/#publicdir).

Notez que :

- Vous devriez toujours référencer les ressources de `public` avec des chemins absolus. Par exemple, `public/icon.png` devrait être référencé dans le code source en tant que `/icon.png`.
- Les ressources de `public` ne peuvent pas être importées dans le JavaScript.

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/import.meta) est une fonctionnalité native des modules ES qui expose l’URL du module courant. En la combinant avec le [constructeur de l’interface URL](https://developer.mozilla.org/fr/docs/Web/API/URL) native, on peut obtenir l’URL complète et résolue d’une ressource statique en utilisant un chemin relatif depuis un module JavaScript :

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Cela fonctionne nativement avec les navigateurs modernes — en fait, Vite n’a pas du tout besoin de traiter ce code pour le développement !

Ce pattern fonctionne aussi avec une URL dynamique usant d’un gabarit de texte (_template literal_) :

```js
function getImageUrl(name) {
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Pendant la compilation de production, Vite fera les transformations nécessaires pour que les URLs pointent toujours au bon endroit même après le bundling et le hachage des ressources. Cependant, la chaîne de caractères de l’URL doit être statique afin de pouvoir être analysée, sinon le code sera laissé tel quel, ce qui peut causer des erreurs à l’exécution si `build.target` ne supporte pas `import.meta.url`.

```js
// Vite ne transformera pas ce qui suit
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: warning Ne fonctionne pas avec le rendu côté serveur (_SSR_)
Ce pattern ne fonctionnera pas si vous utilisez Vite pour du rendu côté serveur, parce qu’`import.meta.url` a une sémantique différente dans le navigateur et dans Node.js. Le bundle serveur ne peut de toute façon pas déterminer l’URL cliente en amont.
:::

::: warning `target` doit être configuré à `es2020` minimum
Ce pattern ne fonctionnera pas si [build.target](/config/#build-target) ou [optimizeDeps.esbuildOptions.target](/config/#optimizedeps-esbuildoptions) sont définis sur une valeur inférieure à `es2020`.
:::
