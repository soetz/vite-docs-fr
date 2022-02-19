---
home: true
heroImage: /logo.svg
actionText: Démarrer
actionLink: /guide/

altActionText: En savoir plus
altActionLink: /guide/why

features:
  - title: 💡 Démarrage instantané du serveur
    details: Les fichiers sont servis instantanément sous la forme de modules ESM ! Il n’y a pas besoin de compiler.
  - title: ⚡️ Rafraîchissement des modules ultra rapide
    details: Pendant le développement, les modules sont remplacés rapidement peu importe la taille de l’app.
  - title: 🛠️ Riche en fonctionnalités
    details: Support inclus pour Typescript, JSX, CSS, et bien d’autres.
  - title: 📦 Compilation optimisée
    details: La compilation se fait grâce à Rollup, pré-configuré et avec le support du multi-page et du mode librairie.
  - title: 🔩 Interface universelle de plugins
    details: Interface de plugins basée sur Rollup et partagée entre développement et compilation.
  - title: 🔑 APIs typées
    details: APIs programmatiques flexibles avec définition TypeScript de tous les types.
footer: Licence MIT | Copyright © 2019-aujourd’hui Evan You & les contributeurs à Vite
---

<div class="frontpage sponsors">
  <h2>Sponsors</h2>
  <div class="platinum-sponsors">
    <a v-for="{ href, src, name, id } of sponsors.filter(s => s.tier === 'platinum')" :href="href" target="_blank" rel="noopener" aria-label="sponsor-img">
      <img :src="src" :alt="name" :id="`sponsor-${id}`">
    </a>
  </div>
  <div class="gold-sponsors">
    <a v-for="{ href, src, name, id } of sponsors.filter(s => s.tier !== 'platinum')" :href="href" target="_blank" rel="noopener" aria-label="sponsor-img">
      <img :src="src" :alt="name" :id="`sponsor-${id}`">
    </a>
  </div>
  <a href="https://github.com/sponsors/yyx990803" target="_blank" rel="noopener">Devenez sponsor sur GitHub</a>
</div>

<script setup>
import sponsors from './.vitepress/theme/sponsors.json'
</script>
