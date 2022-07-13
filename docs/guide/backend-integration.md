# Intégration du back-end

:::tip Note
Si vous souhaitez servir le HTML à l’aide d’un back-end traditionnel (par exemple Rails ou Laravel) mais utiliser Vite pour servir les ressources, allez voir les intégrations listées par [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Si vous avez besoin d’une intégration particulière, vous pouvez suivre ce guide pour la configurer manuellement.
:::

1. Dans votre configuration Vite, configurez l’entrée et activez le manifeste de compilation :

   ```js
   // vite.config.js
   export default defineConfig({
     build: {
       // génère le manifest.json dans outDir
       manifest: true,
       rollupOptions: {
         // remplace l’entrée .html par défaut
         input: '/path/to/main.js'
       }
     }
   })
   ```

   Si vous n’avez pas désactivé le [polyfill de module preload](/config/#build-polyfillmodulepreload), vous devrez aussi l’importer dans votre entrée

   ```js
   // ajoutez au début de votre entrée d’application
   import 'vite/modulepreload-polyfill'
   ```

2. Pour le développement, injectez ce qui suit dans le template HTML de votre serveur (remplacez `http://localhost:5173` par l’URL locale sur laquelle Vite est exposé) :

   ```html
   <!-- si en mode développement -->
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Pour servir correctement les assets, vous avez deux possibilités :

   - Assurez-vous que le serveur est configuré pour proxyfier les requêtes pour des ressources statiques vers le serveur Vite
   - Définissez [`server.origin`](/config/#server-origin) afin que les URLs de ressources générées soient résolues à l’aide de l’URL du serveur back-end plutôt qu’un chemin relatif

   Ceci est requis pour que les ressources telles que les images soient chargées correctement.

   Notez que si vous utilisez React avec `@vitejs/plugin-react`, vous devrez aussi ajouter ceci avant le script ci-dessus, puisque le plugin ne peut pas modifier le HTML que vous servez :

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Pour la production : après que vous ayez lancé `vite build`, un fichier `manifest.json` sera généré en plus des autres fichiers de ressources. Un fichier de manifeste ressemble à ceci :

   ```json
   {
     "main.js": {
       "file": "assets/main.4889e940.js",
       "src": "main.js",
       "isEntry": true,
       "dynamicImports": ["views/foo.js"],
       "css": ["assets/main.b82dbe22.css"],
       "assets": ["assets/asset.0ab0f9cd.png"]
     },
     "views/foo.js": {
       "file": "assets/foo.869aea0d.js",
       "src": "views/foo.js",
       "isDynamicEntry": true,
       "imports": ["_shared.83069a53.js"]
     },
     "_shared.83069a53.js": {
       "file": "assets/shared.83069a53.js"
     }
   }
   ```

   - Le manifeste a une structure au format `Record<nom, morceau>`.
   - Pour les morceaux (_chunks_) d’entrée et les morceaux dynamiques, la clé est le chemin relatif de la source depuis la racine projet.
   - Pour les morceaux qui ne sont pas d’entrée, la clé est le nom de base du fichier généré préfixé par `_`.
   - Les morceaux contiendront des informations sur leurs imports statiques et dynamiques (les deux sont des clés qui renvoient vers le morceau correspondant dans le manifeste), et aussi sur le CSS qui leur est associé (s’il y en a).

   Vous pouvez utiliser ce fichier pour rendre des liens ou des directives de pré-chargement (_preload directives_) de fichiers hachés (note : la syntaxe ci-dessous est pour l’exemple, remplacez-la par votre langage de templating côté serveur) :

   ```html
   <!-- si en mode production -->
   <link rel="stylesheet" href="/assets/{{ manifest['main.js'].css }}" />
   <script type="module" src="/assets/{{ manifest['main.js'].file }}"></script>
   ```
