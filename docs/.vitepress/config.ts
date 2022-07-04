import { defineConfig } from 'vitepress'

const ogDescription = 'Le tooling frontend nouvelle génération'
const ogImage = 'https://main.vitejs.dev/og-image.png'
const ogTitle = 'Vite'
const ogUrl = 'https://fr.vitejs.dev'

export default defineConfig({
  lang: 'fr-FR',
  title: 'Vite',
  description: 'Le tooling frontend nouvelle génération',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'twitter:description', content: ogDescription }],
    ['meta', { property: 'twitter:title', content: ogTitle }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:image', content: ogImage }],
    ['meta', { property: 'twitter:url', content: ogUrl }]
  ],

  vue: {
    reactivityTransform: true
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/vite/edit/main/docs/:path',
      text: 'Suggérer une modification sur cette page'
    },

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vitejs.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' }
    ],

    // TODO: French search
    algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev'
    },

    localeLinks: {
      text: 'Français',
      items: [
        { text: 'English', link: 'https://main.vitejs.dev' },
        { text: '简体中文', link: 'https://cn.vitejs.dev' },
        { text: '日本語', link: 'https://ja.vitejs.dev' },
        { text: 'Español', link: 'https://es.vitejs.dev' },
      ]
    },

    footer: {
      message: 'Publication sous licence MIT',
      copyright: 'Copyright © 2019-aujourd’hui Evan You & les contributeurs de Vite'
    },

    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Configuration', link: '/config/', activeMatch: '/config/' },
      { text: 'Plugins', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'Liens',
        items: [
          {
            text: 'Twitter',
            link: 'https://twitter.com/vite_js'
          },
          {
            text: 'Discord Chat',
            link: 'https://chat.vitejs.dev'
          },
          {
            text: 'Awesome Vite',
            link: 'https://github.com/vitejs/awesome-vite'
          },
          {
            text: 'DEV Community',
            link: 'https://dev.to/t/vite'
          },
          {
            text: 'Rollup Plugins Compat',
            link: 'https://vite-rollup-plugins.patak.dev/'
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md'
          }
        ]
      },
      {
        text: 'v3 (next)',
        items: [
          {
            text: 'v2.x (stable)',
            link: 'https://v2.vitejs.dev'
          }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            {
              text: 'Pourquoi utiliser Vite',
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
              text: 'Pré-bundling des dépendances',
              link: '/guide/dep-pre-bundling'
            },
            {
              text: 'Gestion des ressources statiques',
              link: '/guide/assets'
            },
            {
              text: 'Compilation de production',
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
              text: 'Migration depuis la v2',
              link: '/guide/migration'
            }
          ]
        },
        {
          text: 'APIs',
          items: [
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
      ],
      '/config/': [
        {
          text: 'Configuration',
          items: [
            {
              text: 'Configurer Vite',
              link: '/config/'
            },
            {
              text: 'Options communes',
              link: '/config/shared-options'
            },
            {
              text: 'Options du serveur',
              link: '/config/server-options'
            },
            {
              text: 'Options de compilation',
              link: '/config/build-options'
            },
            {
              text: 'Options de l’aperçu (preview)',
              link: '/config/preview-options'
            },
            {
              text: 'Options d’optimisation des dépendances',
              link: '/config/dep-optimization-options'
            },
            {
              text: 'Options de rendu côté serveur (SSR)',
              link: '/config/ssr-options'
            },
            {
              text: 'Options du worker',
              link: '/config/worker-options'
            }
          ]
        }
      ]
    }
  }
})
