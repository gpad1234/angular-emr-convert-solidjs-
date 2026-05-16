<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white/90 border-b border-gray-200 z-40">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div class="w-10"></div>
        <h1 class="text-base font-semibold text-gray-800 tracking-tight">{{ title || 'Diabetes EMR' }}</h1>
        <div class="w-10"></div>
      </div>
    </header>
    <main class="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
      <slot />
    </main>
    <NavBar />
  </div>
</template>

<script setup>
import NavBar from './NavBar.vue'
defineProps({ title: String })
</script>
