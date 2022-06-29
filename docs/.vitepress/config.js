import { defineConfig } from 'vitepress'

const ogDescription = 'Next Generation Frontend Tooling'
const ogImage = 'https://fr.vitejs.dev/og-image.png'
const ogTitle = 'Vite'
const ogUrl = 'https://fr.vitejs.dev'

export default defineConfig({
  title: 'Vite',
  description: 'Le tooling front-end nouvelle génération.',
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

    // TODO: What is that ?
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
      copyright: 'Copyright © 2019-aujourd\'hui Evan You & les contributeurs de Vite'
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
              text: 'Pré-bundler des dépendances',
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
              text: 'Migration depuis la v1',
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
          text: 'Config',
          items: [
            {
              text: 'Configuring Vite',
              link: '/config/'
            },
            {
              text: 'Shared Options',
              link: '/config/shared-options'
            },
            {
              text: 'Server Options',
              link: '/config/server-options'
            },
            {
              text: 'Build Options',
              link: '/config/build-options'
            },
            {
              text: 'Preview Options',
              link: '/config/preview-options'
            },
            {
              text: 'Dep Optimization Options',
              link: '/config/dep-optimization-options'
            },
            {
              text: 'SSR Options',
              link: '/config/ssr-options'
            },
            {
              text: 'Worker Options',
              link: '/config/worker-options'
            }
          ]
        }
      ]
    }
  }
})
