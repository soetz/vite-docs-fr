// @ts-check

const pkg = require('../package.json')

/**
 * @type {import('vitepress').UserConfig}
 */
 module.exports = {
  title: 'Vite',
  lang: 'fr',
  description: 'Le tooling front-end nouvelle génération.',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],
  themeConfig: {
    repo: pkg.repository,
    logo: '/logo.svg',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Suggérer une modification sur cette page',

    // TODO: French search
    algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Configuration', link: '/config/' },
      { text: 'Plugins', link: '/plugins/' },
      {
        text: 'Liens',
        items: [
          {
            text: 'Twitter',
            link: 'https://twitter.com/vite_js'
          },
          {
            text: 'Serveur Discord',
            link: 'https://chat.vitejs.dev'
          },
          {
            text: 'Awesome Vite',
            link: 'https://github.com/vitejs/awesome-vite'
          },
          {
            text: 'Communauté DEV.to',
            link: 'https://dev.to/t/vite'
          },
          {
            text: 'Compatibilité des plugins Rollup',
            link: 'https://vite-rollup-plugins.patak.dev/'
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md'
          }
        ]
      },
      {
        text: 'Langues',
        items: [
          {
            text: 'English',
            link: 'https://vitejs.dev'
          },
          {
            text: '简体中文',
            link: 'https://cn.vitejs.dev'
          },
          {
            text: '日本語',
            link: 'https://ja.vitejs.dev'
          }
        ]
      }
    ],

    sidebar: {
      '/config/': 'auto',
      '/plugins': 'auto',
      // catch-all fallback
      '/': [
        {
          text: 'Guide',
          children: [
            {
              text: 'Pourquoi utiliser Vite ?',
              link: '/guide/why'
            },
            {
              text: 'Démarrer',
              link: '/guide/'
            },
            {
              text: 'Fonctionnalités',
              link: '/guide/features'
            },
            {
              text: 'Utiliser des plugins',
              link: '/guide/using-plugins'
            },
            {
              text: 'Pré-bundler des dépendances',
              link: '/guide/dep-pre-bundling'
            },
            {
              text: 'Gestion des ressources statiques',
              link: '/guide/assets'
            },
            {
              text: 'Build de production',
              link: '/guide/build'
            },
            {
              text: 'Déployer un site statique',
              link: '/guide/static-deploy'
            },
            {
              text: 'Variables d’environnement et modes',
              link: '/guide/env-and-mode'
            },
            {
              text: 'Rendu côté serveur (SSR)',
              link: '/guide/ssr'
            },
            {
              text: 'Intégration du back-end',
              link: '/guide/backend-integration'
            },
            {
              text: 'Comparaisons',
              link: '/guide/comparisons'
            },
            {
              text: 'Migration depuis la v1',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'APIs',
          children: [
            {
              text: 'API pour plugin',
              link: '/guide/api-plugin'
            },
            {
              text: 'API du rafraîchissement des modules à la volée (HMR)',
              link: '/guide/api-hmr'
            },
            {
              text: 'API JavaScript',
              link: '/guide/api-javascript'
            },
            {
              text: 'Référentiel de la configuration',
              link: '/config/'
            }
          ]
        }
      ]
    }
  },
}
