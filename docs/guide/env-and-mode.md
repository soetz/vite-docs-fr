# Variables d’environnement et modes

## Variables d’environnement

Vite expose des variables d’environnement via l’objet spécial **`import.meta.env`**. Quelques variables de base sont disponibles dans tous les cas :

- **`import.meta.env.MODE`**: {string} le [mode](#modes) avec lequel l’application est exécutée.

- **`import.meta.env.BASE_URL`**: {string} la base de l’URL sur laquelle l’application est servie. Elle est déterminée par l’[option de configuration `base`](/config/#base).

- **`import.meta.env.PROD`**: {boolean} si l’application est exécutée en production.

- **`import.meta.env.DEV`**: {boolean} si l’application est exécutée en développement (c’est toujours le contraire d’`import.meta.env.PROD`).

- **`import.meta.env.SSR`**: {boolean} si l’application est exécutée [côté serveur](./ssr.md#logique-conditionnelle).

### Remplacement en production

En production, ces variables d’environnement sont **remplacées statiquement**. Il est donc nécessaire de toujours les référencer en utilisant la chaîne de caractères statique entière. Par exemple, les accès dynamiques à l’aide de la clé comme `import.meta.env[clé]` ne fonctionneront pas.

Ces chaînes seront aussi remplacées lorsqu’elles apparaîssent dans des chaînes JavaScript ou des templates Vue. C’est rare, mais il se peut que ce ne soit pas voulu. Vous aurez alors des erreurs comme `Missing Semicolon` ou `Unexpected token`, par exemple quand `{{ '"process.env.' + 'NODE_ENV"' }}` est transformé en `""development": "`. Il y a des moyens de contourner ce comportement :

- Pour les chaînes de caractères JavaScript, vous pouvez mettre un caractère unicode espace insécable sans largeur au milieu, par exemple avec `'import.meta\u200b.env.MODE'`.

- Pour les templates Vue ou tout autre HTML qui est compilé en chaînes de caractères JavaScript, vous pouvez utiliser la [balise `<wbr>`](https://developer.mozilla.org/fr/docs/Web/HTML/Element/wbr), par exemple avec `import.meta.<wbr>env.MODE`.

## Fichiers `.env`

Vite utilise [dotenv](https://github.com/motdotla/dotenv) pour charger des variables d’environnement depuis les fichiers suivants de votre [répertoire d’environnement](/config/#envdir) :

```
.env              # chargé dans tous les cas
.env.local        # chargé dans tous les cas, ignoré par git
.env.[mode]       # chargé seulement dans le mode spécifié
.env.[mode].local # chargé seulement dans le mode spécifié, ignoré par git
```

:::tip Priorité de chargement de l’environnement

Un fichier d’environnement pour un mode spécifique (par exemple `.env.production`) aura la priorité par rapport à fichier générique (comme `.env`).

En plus de ça, les variables d’environnement qui existent déjà au moment où Vite est exécuté ont une encore plus grande priorité et ne seront pas remplacées par les fichiers `.env`. Si vous exécutez `VITE_SOME_KEY=123 vite build` par exemple.

Les fichiers `.env` sont chargés au démarrage de Vite. Redémarrez le serveur après avoir fait des modifications.
:::

Les variables d’environnement chargées sont aussi exposées au code source client via `import.meta.env`.

Pour éviter que des variables d’environnement ne fuitent accidentellement dans le client, seules les variables ayant le préfixe `VITE_` sont exposées à votre code traité par Vite. Par exemple, dans le fichier suivant :

```
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

seule `VITE_SOME_KEY` sera exposée à votre code source client (en tant que `import.meta.env.VITE_SOME_KEY`), `DB_PASSWORD` ne le sera pas.

```js
console.log(import.meta.env.VITE_SOME_KEY) // 123
console.log(import.meta.env.DB_PASSWORD) // undefined
```

Si vous voulez customiser le préfixe des variables d’environnement, utilisez l’option [envPrefix](/config/index#envprefix).

:::warning NOTES DE SÉCURITÉ

- Les fichiers `.env.*.local` sont faits pour n’être présents qu’en local et peuvent contenir des variables sensibles. Vous devriez ajouter `.local` à votre `.gitignore` pour éviter qu’ils ne soient suivis par git.

- Puisque n’importe quelle variable exposée à votre code source Vite finira dans le bundle client, les variables `VITE_*` ne devraient _pas_ contenir d’informations sensibles.
  :::

### IntelliSense pour TypeScript

Par défaut, Vite fournit les définitions de types pour `import.meta.env` dans [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Si vous définissez des variables d’environnement supplémentaires dans des fichiers `.env.<MODE>`, vous pourriez vouloir bénéficier du typage des variables d’environnement préfixées par `VITE_`.

Pour ce faire, vous pouvez créer un fichier `env.d.ts` dans le répertoire `src` et surcharger `ImportMetaEnv` comme suit :

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // plus de variables d’environnement…
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Si votre code repose sur des types d’environnements navigateurs tels que [DOM](https://github.com/microsoft/TypeScript/blob/main/lib/lib.dom.d.ts) ou [WebWorker](https://github.com/microsoft/TypeScript/blob/main/lib/lib.webworker.d.ts), vous pouvez modifier le champ [lib](https://www.typescriptlang.org/tsconfig#lib) de `tsconfig.json`.

```json
{
  "lib": ["WebWorker"]
}
```

## Modes

Par défaut, le serveur de développement (commande `dev`) exécute Vite en mode `development` et la commande `build` en mode `production`.

Cela signifie que lorsque vous lancez `vite build`, les variables d’environnement de `.env.production` seront chargées si ce fichier existe :

```
# .env.production
VITE_APP_TITLE=Mon Application
```

Dans votre application, vous pouvez rendre le titre en utilisant `import.meta.env.VITE_APP_TITLE`.

Cependant, il est important de comprendre que le **mode** est un concept plus large que simplement développement ou production. Un exemple typique est que vous pourriez vouloir disposer d’un mode « staging » qui aurait un comportement similaire à la production, mais avec des variables d’environnement légèrement différentes de celle-ci.

Vous pouvez surcharger le mode utilisé par défaut pour une commande en passant l’option `--mode` en ligne de commande. Par exemple, si vous souhaitez compiler votre app pour notre mode staging hypothétique :

```bash
vite build --mode staging
```

Et pour obtenir le comportement souhaité, il nous faut un fichier `.env.staging` :

```
# .env.staging
NODE_ENV=production
VITE_APP_TITLE=Mon Application (staging)
```

Votre application en staging devrait avoir un comportement similaire à la production, mais afficher un titre différent.
