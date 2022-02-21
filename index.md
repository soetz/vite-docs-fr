---
home: true
heroImage: /logo.svg
actionText: Démarrer
actionLink: /guide/

altActionText: En savoir plus
altActionLink: /guide/why

features:
  - title: 💡 Démarrage instantané du serveur
    details: Les fichiers sont servis instantanément sous la forme de modules ESM ! Il n’y a pas besoin de builder.
  - title: ⚡️ Rafraîchissement des modules ultra rapide
    details: Pendant le développement, les modules sont remplacés rapidement peu importe la taille de l’app.
  - title: 🛠️ Riche en fonctionnalités
    details: Support inclus pour Typescript, JSX, CSS, et bien d’autres.
  - title: 📦 Build optimisé
    details: Le build se fait grâce à Rollup, pré-configuré et avec le support du multi-page et du mode librairie.
  - title: 🔩 Interface universelle de plugins
    details: Interface de plugins basée sur Rollup et partagée entre développement et build.
  - title: 🔑 APIs typées
    details: APIs programmatiques flexibles avec définition TypeScript de tous les types.
footer: Licence MIT | Copyright © 2019-aujourd’hui Evan You & les contributeurs à Vite
---

<script setup>
import SponsorsGroup from './.vitepress/theme/SponsorsGroup.vue'
</script>

<h3 style="text-align:center;color:#999">Sponsors</h3>

<SponsorsGroup tier="platinum" placement="landing" />

<SponsorsGroup tier="gold" placement="landing" />

<p style="text-align:center;margin-bottom:3em">
  <a style="color: #999;font-size:.9em;" href="https://github.com/sponsors/yyx990803" target="_blank" rel="noopener">Devenez sponsor sur GitHub</a>
</p>
