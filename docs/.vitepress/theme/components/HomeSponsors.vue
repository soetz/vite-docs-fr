<script setup lang="ts">
import { VPHomeSponsors } from 'vitepress/theme'
import { useSponsor } from '../composables/sponsor'
const { data } = useSponsor()
</script>

<template>
  <VPHomeSponsors
    v-if="data"
    message="Vite est gratuit et open source, rendu possible grâce à nos merveilleux sponsors."
    action-text="Devenez sponsor"
    action-link="https://github.com/sponsors/yyx990803"
    :data="data"
  />
</template>
