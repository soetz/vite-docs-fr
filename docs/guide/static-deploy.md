# Déployer un site statique

Les guides suivants partent du principe que les affirmations suivantes sont vraies :

- Vous utilisez l’emplacement de sortie par défaut (`dist`). Cet emplacement [peut être modifié par l’option `build.outDir`](/docs/config/#build-outdir), et vous devrez adapter les instructions de ces guides si c’est votre cas.
- Vous utilisez npm. Vous pouvez utiliser les commandes équivalentes pour lancer les scripts si vous utilisez Yarn ou d’autres gestionnaires de paquets.
- Vite est installé comme dépendance locale dans votre projet, et les scripts npm suivants sont configurés :

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Il est important de noter que `vite preview` est fait pour prévisualiser la compilation localement et pas pour être un serveur de production.

::: tip NOTE
Ces guides fournissent des instructions pour effectuer un déploiement statique de votre site Vite. Vite propose également un support expérimental du rendu côté serveur (_server side rendering_). Le rendu côté serveur fait référence aux frameworks front-end qui supportent le fait d’exécuter une application dans Node.js, qui font un pré-rendu en HTML, et qui l’« hydratent » côté client en bout de course. Allez voir le [guide du rendu côté serveur](./ssr) pour en savoir plus sur cette fonctionnalité. Autrement, si vous souhaitez intégrer votre application à un framework côté serveur classique, allez plutôt voir le [guide d’intégration du back-end](./backend-integration).
:::

## Compiler l’application

Vous pouvez lancer la commande `npm run build` pour compiler l’application.

```bash
$ npm run build
```

Par défaut, la sortie de compilation sera placée dans `dist`. Vous pouvez déployer ce dossier `dist` à l’aide de la plateforme de votre choix.

### Tester l’application localement

Une fois que vous avez compilé l’application, vous pouvez la tester localement avec la commande `npm run preview`.

```bash
$ npm run build
$ npm run preview
```

La commande `vite preview` va démarrer un serveur web statique local qui sert les fichiers du dossier `dist` sur `http://localhost:4173`. C’est un moyen facile de vérifier que la compilation de production fonctionne en local.

Vous pouvez configurer le port du serveur en passant l’option `--port` comme argument.

```json
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Maintenant le script `preview` lancera le serveur à `http://localhost:8080`.

## GitHub Pages

1. Définissez la bonne `base` dans `vite.config.js`.

   Si vous déployez sur `https://<NOM D’UTILISATEUR>.github.io/`, vous pouvez omettre `base` puisque la valeur par défaut est `'/'`.

   Si vous dépolyez sur `https://<NOM D’UTILISATEUR>.github.io/<DÉPÔT>/`, par exemple si l’adresse de votre dépôt est `https://github.com/<NOM D’UTILISATEUR>/<DÉPÔT>`, alors définissez `base` à `'/<DÉPÔT>/'`.

2. Dans votre projet, créez un fichier `deploy.sh` avec le contenu suivant (les lignes mises en évidence doivent être décommentées si nécessaire), et lancez-le pour déployer :

   ```bash{13,20,23}
   #!/usr/bin/env sh

   # annuler s’il y a une erreur
   set -e

   # compilation
   npm run build

   # naviguer au répertoire de sortie de compilation
   cd dist

   # si vous déployez vers un domaine personnalisé
   # echo 'www.example.com' > CNAME

   git init
   git checkout -b main
   git add -A
   git commit -m 'deploy'

   # si vous déployez vers https://<NOM D’UTILISATEUR>.github.io
   # git push -f git@github.com:<NOM D’UTILISATEUR>/<USERNAME>.github.io.git main

   # si vous déployez vers https://<NOM D’UTILISATEUR>.github.io/<DÉPÔT>
   # git push -f git@github.com:<NOM D’UTILISATEUR>/<DÉPÔT>.git main:gh-pages

   cd -
   ```

::: tip
Vous pouvez aussi lancer le script ci-dessus dans votre configuration CI pour déployer automatiquement à chaque fois que vous poussez.
:::

### GitHub Pages et Travis CI

1. Définissez la bonne `base` dans `vite.config.js`.

   Si vous déployez sur `https://<NOM D’UTILISATEUR>.github.io/`, vous pouvez omettre `base` puisque la valeur par défaut est `'/'`.

   Si vous dépolyez sur `https://<NOM D’UTILISATEUR>.github.io/<DÉPÔT>/`, par exemple si l’adresse de votre dépôt est `https://github.com/<NOM D’UTILISATEUR>/<DÉPÔT>`, alors définissez `base` à `'/<DÉPÔT>/'`.

2. Créez un fichier nommé `.travis.yml` à la racine de votre projet.

3. Lancez `npm install` localement et faites un commit du lockfile généré (`package-lock.json`).

4. Utilisez le provider de déploiements de GitHub Pages, et suivez la [documentation de Travis CI](https://docs.travis-ci.com/user/deployment/pages/).

   ```yaml
   language: node_js
   node_js:
     - lts/*
   install:
     - npm ci
   script:
     - npm run build
   deploy:
     provider: pages
     skip_cleanup: true
     local_dir: dist
     # un jeton GitHub permettant à Travis de pousser du code sur votre dépôt
     # configurez-le dans les paramètres Travis de votre dépôt, en tant que
     # variable sécurisée
     github_token: $GITHUB_TOKEN
     keep_history: true
     on:
       branch: main
   ```

## GitLab Pages et GitLab CI

1. Définissez la bonne `base` dans `vite.config.js`.

   Si vous déployez sur `https://<NOM D’UTILISATEUR ou GROUPE>.gitlab.io/`, vous pouvez omettre `base` puisque la valeur par défaut est `'/'`.

   Si vous dépolyez sur `https://<NOM D’UTILISATEUR ou GROUPE>.gitlab.io/<DÉPÔT>/`, par exemple si l’adresse de votre dépôt est `https://gitlab.com/<NOM D’UTILISATEUR>/<DÉPÔT>`, alors définissez `base` à `'/<DÉPÔT>/'`.

2. Créez un fichier nommé `.gitlab-ci.yml` à la racine de votre projet avec le contenu ci-dessous. Cela va compiler et déployer votre site chaque fois que vous en modifiez le contenu :

   ```yaml
   image: node:16.5.0
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## Netlify

1. Installez l’[interface en ligne de commande de Netlify](https://cli.netlify.com/).
2. Créez un nouveau site avec `ntl init`.
3. Déployez avec `ntl deploy`.

```bash
# Installer l’interface en ligne de commande de Netlify
$ npm install -g netlify-cli

# Créer un nouveau site sur Netlify
$ ntl init

# Déployer sur une URL de pré-visualisation unique
$ ntl deploy
```

L’interface en ligne de commande Netlify vous donnera une URL de pré-visualisation pour que vous puissiez vérifier le résultat. Lorsque vous êtes prêt(e) à mettre en production, utilisez le signal `prod` :

```bash
# Déployer le site en production
$ ntl deploy --prod
```

## Google Firebase

1. Assurez-vous que vous ayez les [firebase-tools](https://www.npmjs.com/package/firebase-tools) d’installés.

2. Créez `firebase.json` et `.firebaserc` à la racine de votre projet avec le contenu suivant :

   `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

   `.firebaserc`:

   ```js
   {
     "projects": {
       "default": "<VOTRE ID FIREBASE>"
     }
   }
   ```

3. Après avoir lancé `npm run build`, dépolyez à l’aide de la commande `firebase deploy`.

## Surge

1. Installez [surge](https://www.npmjs.com/package/surge) si ce n’est pas déjà fait.

2. Lancez `npm run build`.

3. Déployez sur surge en tapant `surge dist`.

Vous pouvez aussi déployer sur un [domaine personnalisé](http://surge.sh/help/adding-a-custom-domain) en ajoutant `surge dist votredomaine.com`.

## Heroku

1. Installez [l’interface en ligne de commande d’Heroku](https://devcenter.heroku.com/articles/heroku-cli).

2. Créez un compte Heroku sur [cette page](https://signup.heroku.com).

3. Lancez `heroku login` et entrez vos identifiants de connexion Heroku :

   ```bash
   $ heroku login
   ```

4. Créez un fichier nommé `static.json` à la racine de votre projet avec le contenu suivant :

   `static.json`:

   ```json
   {
     "root": "./dist"
   }
   ```

   C’est la configuration de votre site ; apprenez-en plus sur [heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static).

5. Configurez votre git Heroku distant :

   ```bash
   # changement de version
   $ git init
   $ git add .
   $ git commit -m "Mon site prêt à déployer."

   # créez une nouvelle application avec le nom spécifié
   $ heroku apps:create example

   # mettez en place buildpack pour un site statique
   $ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
   ```

6. Déployez votre site :

   ```bash
   # publiez le site
   $ git push heroku main

   # ouvrez un navigateur pour voir la version Dashboard d’Heroku CI
   $ heroku open
   ```

## Vercel

### Vercel CLI

1. Installez [Vercel CLI](https://vercel.com/cli) et lancez `vercel` pour déployer.
2. Vercel détectera que vous utilisez Vite et utilisera les bons paramètres pour votre déploiement.
3. Votre application est déployée ! (par exemple [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel for Git

1. Poussez votre code sur le dépôt git (GitHub, GitLab, BitBucket).
2. [Importez votre projet Vite](https://vercel.com/new) dans Vercel.
3. Vercel détectera que vous utilisez Vite et utilisera les bons paramètres pour votre déploiement.
4. Votre application est déployée ! (par exemple [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

Après que votre projet ait été importé et déployé, chaque fois que vous pousserez, un [déploiement de prévisualisation](https://vercel.com/docs/concepts/deployments/environments#preview) sera généré, et tous les changements faits sur la branche de production (le plus souvent « main ») donneront lieu à [déploiement de production](https://vercel.com/docs/concepts/deployments/environments#production).

## Azure Static Web Apps

Vous pouvez déployer votre application Vite rapidement avec le service Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps). Vous aurez besoin :

- D’un compte Azure et d’une clé de souscription. Vous pouvez créer un [compte Azure gratuitement ici](https://azure.microsoft.com/free).
- Que le code de votre application soit poussé sur [GitHub](https://github.com).
- De l’[extension SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) pour [Visual Studio Code](https://code.visualstudio.com).

Installez l’extension sur VS Code et naviguez à la racine de votre application. Ouvrez l’extension, connectez-vous à Azure, et cliquez sur le signe « + » pour créer une nouvelle Static Web App. On vous demandera quelle clé de souscription utiliser.

Suivez les instructions de l’extension pour donner un nom à votre application, choisissez un preset de framework, et donnez la racine de l’application (le plus souvent `/`) ainsi que l’emplacement des fichiers compilés `/dist`. Une action GitHub sera créée dans votre dépôt dans un dossier `.github`.

L’action déploiera votre application (vous pouvez suivre la progression dans l’onglet Actions de votre dépôt) et, lorsque le process réussit, vous permettra de voir votre application à l’adresse fournie en cliquant sur le bouton « Browse Website » de la fenêtre de progression de l’extension, qui apparaît une fois que l’action GitHub s’est exécutée.
